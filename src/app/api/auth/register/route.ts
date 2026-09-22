import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { findUserByEmail, createStoredUser, getStoredUsers } from "@/lib/authStore";

const SESSION_COOKIE_NAME = "vertice_session_v1";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`register_${ip}`, { windowMs: 15 * 60 * 1000, max: 10 });
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Muitas tentativas de cadastro a partir deste IP. Aguarde alguns minutos." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { name, email, password } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Por favor, informe seu nome completo (mínimo 2 letras)." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Por favor, informe um endereço de e-mail válido." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve conter no mínimo 6 caracteres." },
        { status: 400 }
      );
    }

    const emailNorm = email.trim().toLowerCase();
    const existing = findUserByEmail(emailNorm);
    if (existing) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado. Faça login ou use outro e-mail." },
        { status: 409 }
      );
    }

    // Se o e-mail contém "savio" ou se não há administradores ativos, atribui role "admin"
    const storedUsers = getStoredUsers();
    const isFirstOrSavio = emailNorm.includes("savio") || !storedUsers.some((u) => u.role === "admin");
    const role = isFirstOrSavio ? "admin" : "user";

    const newUser = createStoredUser({
      name,
      email: emailNorm,
      role,
      password,
    });

    // Cria token com validade de 24 horas e loga automaticamente
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    const sessionPayload = {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      method: "Cadastro Real (PBKDF2)",
      exp: expiresAt,
      createdAt: Date.now(),
    };

    const token = Buffer.from(JSON.stringify(sessionPayload)).toString("base64url");
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return NextResponse.json({
      success: true,
      user: sessionPayload.user,
      method: sessionPayload.method,
      message: `Conta criada com sucesso! Bem-vindo, ${newUser.name}.`,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Falha ao processar cadastro." },
      { status: 500 }
    );
  }
}
