import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { findUserByEmail, verifyPassword } from "@/lib/authStore";

const SESSION_COOKIE_NAME = "vertice_session_v1";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`login_${ip}`, { windowMs: 15 * 60 * 1000, max: 15 });
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Muitas tentativas a partir deste IP. Bloqueio preventivo ativo por 15 minutos." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Por favor, informe e-mail e senha." },
        { status: 400 }
      );
    }

    const user = findUserByEmail(email);

    // Se o usuário não existir
    if (!user) {
      return NextResponse.json(
        { error: "E-mail ou senha incorretos." },
        { status: 401 }
      );
    }

    // Verifica bloqueio por excesso de tentativas incorretas
    if (user.lockedUntil && Date.now() < user.lockedUntil) {
      const remainingMinutes = Math.ceil((user.lockedUntil - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Conta temporariamente bloqueada por segurança. Aguarde ${remainingMinutes} minutos.` },
        { status: 403 }
      );
    }

    // Validação criptográfica com PBKDF2
    const isValid = verifyPassword(password, user.passwordHash, user.salt);

    if (!isValid) {
      user.failedAttempts = (user.failedAttempts || 0) + 1;
      if (user.failedAttempts >= 5) {
        user.lockedUntil = Date.now() + 15 * 60 * 1000;
        return NextResponse.json(
          { error: "Limite de 5 tentativas excedido. Conta bloqueada por 15 minutos." },
          { status: 403 }
        );
      }
      const attemptsLeft = 5 - user.failedAttempts;
      return NextResponse.json(
        { error: `Senha incorreta. Restam ${attemptsLeft} tentativa(s) antes do bloqueio temporário.` },
        { status: 401 }
      );
    }

    // Sucesso: reseta tentativas e registra último login
    user.failedAttempts = 0;
    user.lockedUntil = undefined;
    user.lastLogin = new Date().toISOString();

    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    const sessionPayload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      method: "Senha Mestre (PBKDF2)",
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
      maxAge: 60 * 60 * 24, // 24 horas
    });

    return NextResponse.json({
      success: true,
      user: sessionPayload.user,
      method: sessionPayload.method,
      sessionExpiresAt: new Date(expiresAt).toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Falha interna no processamento do login." },
      { status: 500 }
    );
  }
}
