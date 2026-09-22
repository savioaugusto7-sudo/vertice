import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  findUserByEmail,
  getWebauthnChallenge,
  registerWebauthnCredential,
} from "@/lib/authStore";

const SESSION_COOKIE_NAME = "vertice_session_v1";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, credential, isRegistration } = body;

    const userEmail = email || "savio@vertice.app";
    const user = findUserByEmail(userEmail);
    if (!user) {
      return NextResponse.json({ error: "Usuário não localizado." }, { status: 404 });
    }

    const sessionKey = userEmail.toLowerCase().trim();
    const savedChallenge = getWebauthnChallenge(sessionKey) || getWebauthnChallenge("global_challenge");

    if (!savedChallenge) {
      return NextResponse.json({ error: "Desafio WebAuthn expirado. Tente novamente." }, { status: 400 });
    }

    if (!credential || !credential.id) {
      return NextResponse.json({ error: "Credencial biométrica não fornecida ou inválida." }, { status: 400 });
    }

    if (isRegistration) {
      // Registra a chave pública no usuário
      registerWebauthnCredential(userEmail, {
        id: credential.id,
        publicKey: credential.response?.publicKey || credential.id,
        counter: 1,
      });
    }

    // Cria token com validade de 24 horas
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    const sessionPayload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      method: "Windows Hello / FIDO2",
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
      sessionExpiresAt: new Date(expiresAt).toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Falha ao verificar biometria." }, { status: 500 });
  }
}
