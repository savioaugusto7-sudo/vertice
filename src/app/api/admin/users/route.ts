import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

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

// Armazenamento inicial de usuários do sistema
let systemUsers: SystemUser[] = [
  {
    id: "usr_admin_1",
    name: "Sávio Augusto",
    email: "savio@vertice.app",
    role: "admin",
    status: "ativo",
    authMethod: "Passkey (FIDO2)",
    createdAt: "2026-09-01T10:00:00Z",
    lastLogin: new Date().toISOString(),
  },
  {
    id: "usr_finance_2",
    name: "Consultor Financeiro",
    email: "consultoria@vertice.app",
    role: "user",
    status: "ativo",
    authMethod: "Magic Link + 2FA",
    createdAt: "2026-09-15T14:30:00Z",
    lastLogin: "2026-09-20T18:45:00Z",
  },
];

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`admin_get_${ip}`, { windowMs: 60000, max: 60 });
  if (!rateLimit.success) {
    return NextResponse.json({ error: "Limite de requisições excedido" }, { status: 429 });
  }

  return NextResponse.json({
    success: true,
    users: systemUsers,
    total: systemUsers.length,
    activeCount: systemUsers.filter((u) => u.status === "ativo").length,
    adminCount: systemUsers.filter((u) => u.role === "admin").length,
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
    const { name, email, role } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Nome e e-mail são obrigatórios para convidar um usuário" },
        { status: 400 }
      );
    }

    const existing = systemUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return NextResponse.json(
        { error: "Já existe um usuário cadastrado com este e-mail" },
        { status: 409 }
      );
    }

    const newUser: SystemUser = {
      id: `usr_${Date.now()}`,
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      role: role === "admin" ? "admin" : "user",
      status: "ativo",
      authMethod: "Pendente (Convite Enviado)",
      createdAt: new Date().toISOString(),
      lastLogin: "Nunca acessou",
    };

    systemUsers.push(newUser);

    return NextResponse.json({
      success: true,
      user: newUser,
      message: `Usuário ${newUser.name} cadastrado com sucesso.`,
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

    const user = systemUsers.find((u) => u.id === id);
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Não permitir bloquear o próprio admin principal
    if (user.id === "usr_admin_1" && status === "bloqueado") {
      return NextResponse.json(
        { error: "Não é permitido bloquear a conta do administrador principal" },
        { status: 400 }
      );
    }

    if (role && (role === "admin" || role === "user")) {
      user.role = role;
    }

    if (status && (status === "ativo" || status === "bloqueado")) {
      user.status = status;
    }

    return NextResponse.json({
      success: true,
      user,
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

    const index = systemUsers.findIndex((u) => u.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const deletedUser = systemUsers.splice(index, 1)[0];

    return NextResponse.json({
      success: true,
      message: `Usuário ${deletedUser.name} excluído do sistema em conformidade com a LGPD.`,
    });
  } catch (err) {
    return NextResponse.json({ error: "Erro ao excluir usuário", details: String(err) }, { status: 500 });
  }
}
