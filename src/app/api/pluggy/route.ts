import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

async function getPluggyApiKey(): Promise<string | null> {
  const clientId = process.env.PLUGGY_CLIENT_ID || process.env.ID_DO_CLIENTE_PLUGGY;
  const clientSecret = process.env.PLUGGY_CLIENT_SECRET;

  if (clientId && clientSecret) {
    try {
      const res = await fetch("https://api.pluggy.ai/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, clientSecret }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.apiKey) return data.apiKey;
      }
    } catch (e) {
      console.error("Erro ao autenticar com Pluggy /auth:", e);
    }
  }

  // Fallback para API Key direta se configurada
  return process.env.PLUGGY_API_KEY || process.env.CHAVE_API_PLUGGY || null;
}

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`get_${ip}`, { windowMs: 60000, max: 60 });
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Limite de requisições excedido. Tente novamente em breve." },
      { status: 429, headers: { "Retry-After": String(rateLimit.reset) } }
    );
  }

  const apiKey = await getPluggyApiKey();
  const hasClientId = Boolean(process.env.PLUGGY_CLIENT_ID || process.env.ID_DO_CLIENTE_PLUGGY);
  const hasClientSecret = Boolean(process.env.PLUGGY_CLIENT_SECRET);

  return NextResponse.json({
    configured: Boolean(apiKey),
    provider: "Pluggy Open Finance",
    hasCredentials: Boolean(hasClientId && hasClientSecret),
    security: {
      rateLimiting: "ativo",
      encryption: "TLS 1.3",
      readOnlyScope: true,
      lgpdCompliant: true,
    },
  });
}

export async function POST(request: Request) {
  try {
    // 0. Hardening: Proteção contra Abuso & Rate Limiting
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`post_pluggy_${ip}`, { windowMs: 60000, max: 20 });
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Limite de requisições excedido por segurança (Rate Limit).",
          retryAfterSeconds: rateLimit.reset,
        },
        { status: 429, headers: { "Retry-After": String(rateLimit.reset) } }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { action, bank, itemId } = body;

    // Validação estrita de tipo de ação permitida
    const allowedActions = ["create_connect_token", "fetch_item_data", "delete_item", "sandbox_connect"];
    if (action && !allowedActions.includes(action)) {
      return NextResponse.json({ error: "Ação não permitida ou inválida" }, { status: 400 });
    }

    const apiKey = await getPluggyApiKey();

    // 1. GERAÇÃO DE CONNECT TOKEN (Para abrir o Widget Pluggy Connect)
    if (action === "create_connect_token") {
      if (!apiKey) {
        return NextResponse.json(
          { error: "Credenciais da Pluggy não configuradas em .env.local" },
          { status: 400 }
        );
      }

      const tokenRes = await fetch("https://api.pluggy.ai/connect_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
        body: JSON.stringify({
          options: {
            clientUserId: "vertice-user-local",
          },
        }),
      });

      if (!tokenRes.ok) {
        const errData = await tokenRes.text();
        return NextResponse.json(
          { error: "Erro ao gerar Connect Token na Pluggy", details: errData },
          { status: tokenRes.status }
        );
      }

      const tokenData = await tokenRes.json();
      return NextResponse.json({
        success: true,
        mode: "live",
        connectToken: tokenData.accessToken,
      });
    }

    // 2. SINCRONIZAR CONTAS E TRANSAÇÕES REAIS APÓS SUCESSO NO WIDGET
    if (action === "fetch_item_data" && itemId) {
      if (!apiKey) {
        return NextResponse.json(
          { error: "Credenciais da Pluggy não encontradas" },
          { status: 400 }
        );
      }

      // Buscar detalhes do Item (instituição conectada)
      let institutionName = "Instituição Financeira";
      let institutionColor = "#6366f1";
      try {
        const itemRes = await fetch(`https://api.pluggy.ai/items/${itemId}`, {
          headers: { "X-API-KEY": apiKey },
        });
        if (itemRes.ok) {
          const itemData = await itemRes.json();
          institutionName = itemData.connector?.name || institutionName;
          institutionColor = itemData.connector?.primaryColor || institutionColor;
        }
      } catch (err) {
        console.warn("Falha ao buscar item Pluggy:", err);
      }

      // Buscar Contas associadas ao Item
      const accountsRes = await fetch(`https://api.pluggy.ai/accounts?itemId=${itemId}`, {
        headers: { "X-API-KEY": apiKey },
      });

      if (!accountsRes.ok) {
        return NextResponse.json(
          { error: "Erro ao buscar contas na Pluggy", status: accountsRes.status },
          { status: accountsRes.status }
        );
      }

      const accountsData = await accountsRes.json();
      const rawAccounts = accountsData.results || [];

      const syncedAccounts: any[] = [];
      const syncedTransactions: any[] = [];

      for (const acc of rawAccounts) {
        let verticeType: "corrente" | "poupanca" | "cartao_credito" | "investimento" | "outro" = "corrente";
        if (acc.type === "CREDIT") verticeType = "cartao_credito";
        else if (acc.type === "INVESTMENT") verticeType = "investimento";
        else if (acc.subtype === "SAVINGS_ACCOUNT") verticeType = "poupanca";

        const localAccId = `acc-pluggy-${acc.id}`;
        const newAccount = {
          id: localAccId,
          name: acc.marketingName || acc.name || `${institutionName} (${verticeType})`,
          bank: institutionName,
          type: verticeType,
          balance: typeof acc.balance === "number" ? acc.balance : 0,
          color: institutionColor.startsWith("#") ? institutionColor : "#4f46e5",
          iconName: verticeType === "cartao_credito" ? "CreditCard" : "Wallet",
          status: "ativa",
          lastSync: new Date().toISOString(),
          pluggyItemId: itemId,
          pluggyAccountId: acc.id,
        };
        syncedAccounts.push(newAccount);

        // Buscar transações recentes desta conta
        try {
          const txRes = await fetch(
            `https://api.pluggy.ai/transactions?accountId=${acc.id}&pageSize=50`,
            {
              headers: { "X-API-KEY": apiKey },
            }
          );
          if (txRes.ok) {
            const txData = await txRes.json();
            const rawTxs = txData.results || [];
            for (const t of rawTxs) {
              const amount = Number(t.amount || 0);
              const txDate = t.date ? t.date.split("T")[0] : new Date().toISOString().split("T")[0];
              syncedTransactions.push({
                id: `tx-pluggy-${t.id}`,
                date: txDate,
                description: t.description || t.descriptionRaw || "Transação Pluggy",
                amount: Math.abs(amount) * (amount < 0 || t.type === "DEBIT" ? -1 : 1),
                type: amount >= 0 && t.type !== "DEBIT" ? "receita" : "despesa",
                categoryId: "cat-outros",
                accountId: localAccId,
              });
            }
          }
        } catch (txErr) {
          console.warn(`Falha ao buscar transações da conta ${acc.id}:`, txErr);
        }
      }

      return NextResponse.json({
        success: true,
        mode: "live",
        institution: institutionName,
        accounts: syncedAccounts,
        transactions: syncedTransactions,
      });
    }

    // 3. REVOGAÇÃO DE CONSENTIMENTO LGPD / BACEN (DELETE ITEM)
    if (action === "delete_item" && itemId) {
      if (apiKey && !itemId.startsWith("demo")) {
        try {
          await fetch(`https://api.pluggy.ai/items/${itemId}`, {
            method: "DELETE",
            headers: { "X-API-KEY": apiKey },
          });
        } catch (delErr) {
          console.warn("Aviso ao deletar item na Pluggy:", delErr);
        }
      }
      return NextResponse.json({
        success: true,
        message: "Consentimento revogado e conexão bancária desvinculada com sucesso.",
      });
    }

    // 4. MODO SANDBOX / DEMONSTRAÇÃO LOCAL RÁPIDA (FALLBACK)
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
      message: `Conexão Open Finance (Sandbox) com ${selectedBank} sincronizada com sucesso!`,
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
