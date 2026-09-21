import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action, bank } = body;

    const clientId = process.env.PLUGGY_CLIENT_ID;
    const clientSecret = process.env.PLUGGY_CLIENT_SECRET;

    // Se as credenciais reais estiverem configuradas, conecta com a Pluggy
    if (clientId && clientSecret && action === "create_connect_token") {
      const authRes = await fetch("https://api.pluggy.ai/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, clientSecret }),
      });
      if (authRes.ok) {
        const authData = await authRes.json();
        const tokenRes = await fetch("https://api.pluggy.ai/connect_token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": authData.apiKey,
          },
        });
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          return NextResponse.json({
            mode: "live",
            connectToken: tokenData.accessToken,
          });
        }
      }
    }

    // Modo Sandbox / Demonstração Open Finance interativo
    const selectedBank = bank || "Nubank";
    const mockAccounts: Record<string, { name: string; balance: number; type: string; color: string }> = {
      Nubank: {
        name: "Nubank Open Finance",
        balance: 4180.5,
        type: "corrente",
        color: "#8b5cf6",
      },
      "Banco Inter": {
        name: "Inter Conta Digital",
        balance: 2350.0,
        type: "corrente",
        color: "#f97316",
      },
      Itaú: {
        name: "Itaú Uniclass",
        balance: 6290.75,
        type: "corrente",
        color: "#003d7a",
      },
      Bradesco: {
        name: "Bradesco Prime",
        balance: 1840.2,
        type: "corrente",
        color: "#cc0000",
      },
    };

    const targetAccount = mockAccounts[selectedBank] || mockAccounts["Nubank"];

    const now = new Date();
    const isoToday = now.toISOString().split("T")[0];

    return NextResponse.json({
      mode: "sandbox",
      status: "connected",
      message: `Conexão Open Finance via Sandbox com ${selectedBank} autorizada com sucesso!`,
      account: {
        id: `acc-open-${Date.now()}`,
        name: targetAccount.name,
        bank: selectedBank,
        type: targetAccount.type,
        balance: targetAccount.balance,
        color: targetAccount.color,
        iconName: "Wallet",
        status: "ativa",
        lastSync: new Date().toISOString(),
      },
      sampleTransactions: [
        {
          date: isoToday,
          description: `Transferência PIX Recebida - ${selectedBank}`,
          amount: 850.0,
          type: "receita",
          categoryId: "cat-salario",
        },
        {
          date: isoToday,
          description: "Supermercado Pão de Açúcar",
          amount: -214.3,
          type: "despesa",
          categoryId: "cat-mercado",
        },
        {
          date: isoToday,
          description: "Posto Shell Combustível",
          amount: -150.0,
          type: "despesa",
          categoryId: "cat-combustivel",
        },
      ],
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Falha ao processar requisição Open Finance", details: String(error) },
      { status: 500 }
    );
  }
}
