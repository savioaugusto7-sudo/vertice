import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`sync_get_${ip}`, { windowMs: 60000, max: 30 });
  if (!rateLimit.success) {
    return NextResponse.json({ error: "Limite de sincronização excedido" }, { status: 429 });
  }

  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({
      cloudEnabled: false,
      message: "Supabase não configurado. Operando em modo de armazenamento local criptografado.",
    });
  }

  try {
    const { data, error } = await supabase
      .from("user_financial_vault")
      .select("*")
      .eq("user_id", "default_owner")
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return NextResponse.json({
      cloudEnabled: true,
      vault: data || null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Falha ao buscar cofre na nuvem", details: String(err) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`sync_post_${ip}`, { windowMs: 60000, max: 20 });
  if (!rateLimit.success) {
    return NextResponse.json({ error: "Muitas sincronizações consecutivas" }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const { encryptedData, iv, salt, version } = body;

  if (!encryptedData || !iv || !salt) {
    return NextResponse.json({ error: "Envelope criptográfico inválido" }, { status: 400 });
  }

  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({
      cloudEnabled: false,
      syncedLocally: true,
      message: "Envelope gravado localmente (Nuvem inativa).",
    });
  }

  try {
    const { data, error } = await supabase.from("user_financial_vault").upsert(
      {
        user_id: "default_owner",
        encrypted_data: encryptedData,
        iv: iv,
        salt: salt,
        version: version || 1,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) throw error;

    return NextResponse.json({
      success: true,
      cloudEnabled: true,
      updatedAt: new Date().toISOString(),
      message: "Cofre criptografado sincronizado na nuvem com sucesso!",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Erro ao sincronizar cofre com Supabase", details: String(err) },
      { status: 500 }
    );
  }
}
