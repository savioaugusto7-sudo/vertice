import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findUserByEmail, verifyPassword, updateUserPassword } from "@/lib/authStore";

const SESSION_COOKIE_NAME = "vertice_session_v1";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return NextResponse.json({ error: "Sessão não autorizada." }, { status: 401 });
  }

  try {
    const sessionData = JSON.parse(Buffer.from(sessionToken, "base64url").toString("utf-8"));
    const email = sessionData.user?.email;
    if (!email) {
      return NextResponse.json({ error: "Usuário inválido." }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Informe a senha atual e a nova senha." }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "A nova senha deve ter no mínimo 6 caracteres." }, { status: 400 });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const isCurrentValid = verifyPassword(currentPassword, user.passwordHash, user.salt);
    if (!isCurrentValid) {
      return NextResponse.json({ error: "A senha atual informada está incorreta." }, { status: 401 });
    }

    updateUserPassword(email, newPassword);

    return NextResponse.json({
      success: true,
      message: "Senha Mestre alterada com sucesso.",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Erro ao alterar senha." }, { status: 500 });
  }
}
