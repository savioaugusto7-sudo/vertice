import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import {
  getStoredUsers,
  createStoredUser,
  findUserByEmail,
  findUserById,
  deleteStoredUser,
  updateStoredUser,
  StoredUser,
} from "@/lib/authStore";

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  status: "ativo" | "bloqueado" | "pendente";
  authMethod: string;
  createdAt: string;
  lastLogin: string;
}

function mapStoredToSystemUser(u: StoredUser): SystemUser {
  const isLocked = u.lockedUntil && Date.now() < u.lockedUntil;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: isLocked ? "bloqueado" : "ativo",
    authMethod: u.webauthnCredentials && u.webauthnCredentials.length > 0
      ? "Windows Hello (FIDO2)"
      : "Senha Mestre (PBKDF2)",
    createdAt: u.createdAt,
    lastLogin: u.lastLogin || "Nunca acessou",
  };
}

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`admin_get_${ip}`, { windowMs: 60000, max: 60 });
  if (!rateLimit.success) {
    return NextResponse.json({ error: "Limite de requisições excedido" }, { status: 429 });
  }

  const stored = getStoredUsers();
  const users = stored.map(mapStoredToSystemUser);

  return NextResponse.json({
    success: true,
    users,
    total: users.length,
    activeCount: users.filter((u) => u.status === "ativo").length,
    adminCount: users.filter((u) => u.role === "admin").length,
  });
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`admin_post_${ip}`, { windowMs: 60000, max: 20 });
  if (!rateLimit.success) {
    return NextResponse.json({ error: "Muitas requisições administrativas" }, { status: 429 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { name, email, role, password } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Nome e e-mail são obrigatórios para cadastrar um usuário" },
        { status: 400 }
      );
    }

    const emailNorm = String(email).trim().toLowerCase();
    const existing = findUserByEmail(emailNorm);
    if (existing) {
      return NextResponse.json(
        { error: "Já existe um usuário cadastrado com este e-mail" },
        { status: 409 }
      );
    }

    const rawPassword = password && String(password).length >= 6 ? String(password) : "vertice123";

    const newUser = createStoredUser({
      name: String(name).trim(),
      email: emailNorm,
      role: role === "admin" ? "admin" : "user",
      password: rawPassword,
    });

    const systemUser = mapStoredToSystemUser(newUser);

    return NextResponse.json({
      success: true,
      user: systemUser,
      initialPassword: rawPassword,
      message: `Usuário ${newUser.name} cadastrado com sucesso com senha de acesso.`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Falha ao criar usuário", details: String(err) },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { id, role, status } = body;

    const user = findUserById(id);
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    if (user.id === "usr_admin_1" && status === "bloqueado") {
      return NextResponse.json(
        { error: "Não é permitido bloquear a conta do administrador principal" },
        { status: 400 }
      );
    }

    if (role && (role === "admin" || role === "user")) {
      user.role = role;
    }

    if (status === "bloqueado") {
      user.lockedUntil = Date.now() + 24 * 60 * 60 * 1000;
    } else if (status === "ativo") {
      user.lockedUntil = undefined;
      user.failedAttempts = 0;
    }

    const updated = mapStoredToSystemUser(user);

    return NextResponse.json({
      success: true,
      user: updated,
      message: "Usuário atualizado com sucesso.",
    });
  } catch (err) {
    return NextResponse.json({ error: "Erro ao atualizar usuário", details: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID do usuário é obrigatório" }, { status: 400 });
    }

    if (id === "usr_admin_1") {
      return NextResponse.json(
        { error: "A conta do administrador principal não pode ser excluída" },
        { status: 400 }
      );
    }

    const user = findUserById(id);
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    deleteStoredUser(id);

    return NextResponse.json({
      success: true,
      message: `Usuário ${user.name} excluído do sistema em conformidade com a LGPD.`,
    });
  } catch (err) {
    return NextResponse.json({ error: "Erro ao excluir usuário", details: String(err) }, { status: 500 });
  }
}
