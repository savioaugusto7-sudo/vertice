import { NextResponse } from "next/server";
import crypto from "crypto";
import { saveWebauthnChallenge } from "@/lib/authStore";

export async function POST(request: Request) {
  try {
    const { email } = await request.json().catch(() => ({}));
    const challenge = crypto.randomBytes(32).toString("base64url");
    const sessionKey = email ? email.toLowerCase().trim() : "global_challenge";

    saveWebauthnChallenge(sessionKey, challenge);

    return NextResponse.json({
      challenge,
      rp: {
        name: "Vértice Finanças Pessoais",
      },
      user: {
        id: Buffer.from(email || "savio@vertice.app").toString("base64url"),
        name: email || "savio@vertice.app",
        displayName: "Sávio Augusto (Admin)",
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" }, // ES256
        { alg: -257, type: "public-key" }, // RS256
      ],
      timeout: 60000,
      attestation: "none",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Erro ao gerar desafio WebAuthn." }, { status: 500 });
  }
}
