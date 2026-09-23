import {
  Debt,
  DebtPlan,
  AmortizationMonth,
  Investment,
  Account,
  Transaction,
  ExtraPayoffSimulation,
} from "@/types";

// ─── Formatadores ─────────────────────────────────────────────────────────────

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals).replace(".", ",")}%`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString + (dateString.length === 10 ? "T12:00:00" : ""));
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString + (dateString.length === 10 ? "T12:00:00" : ""));
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export function formatMonthLabel(isoMonth: string): string {
  const [year, month] = isoMonth.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "2-digit" })
    .format(date)
    .replace(" de ", "/")
    .replace(".", "");
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ─── Cálculos de Dívida ───────────────────────────────────────────────────────

/**
 * Retorna a taxa de juros anual a partir da taxa mensal.
 * Taxa mensal em decimal (ex: 0.0149 para 1.49% a.m.)
 */
export function monthlyToAnnualRate(monthly: number): number {
  return (Math.pow(1 + monthly, 12) - 1) * 100;
}

/**
 * Calcula o total de juros que ainda será pago nas parcelas mínimas.
 */
export function calcularJurosTotaisMinimos(debt: Debt): number {
  let saldo = debt.currentBalance;
  let totalJuros = 0;
  const maxIter = 600; // segurança: máx 50 anos
  let i = 0;
  while (saldo > 0.01 && i < maxIter) {
    const juros = saldo * debt.interestRateMonthly;
    const pagamento = Math.min(debt.minimumPayment, saldo + juros);
    totalJuros += juros;
    saldo = saldo + juros - pagamento;
    i++;
  }
  return totalJuros;
}

/**
 * Motor de cálculo do Plano de Desendividamento.
 * Estratégia 'snowball': menor saldo primeiro (motivação psicológica).
 * Estratégia 'avalanche': maior juro primeiro (ótimo matemático).
 *
 * @param debts Lista de dívidas
 * @param strategy Estratégia escolhida
 * @param extraMonthly Valor extra disponível por mês além das parcelas mínimas
 */
export function calcularPlanoDividas(
  debts: Debt[],
  strategy: "snowball" | "avalanche",
  extraMonthly: number = 0
): DebtPlan {
  if (debts.length === 0) {
    return {
      strategy,
      monthsToPayoff: 0,
      totalInterestPaid: 0,
      totalPaid: 0,
      schedule: [],
      interestSavingsVsMinimum: 0,
      monthsSavedVsMinimum: 0,
    };
  }

  // Estado mutável de cada dívida durante a simulação
  type DebtState = {
    id: string;
    name: string;
    balance: number;
    rate: number;
    minPayment: number;
    paid: boolean;
  };

  const states: DebtState[] = debts.map((d) => ({
    id: d.id,
    name: d.name,
    balance: d.currentBalance,
    rate: d.interestRateMonthly,
    minPayment: d.minimumPayment,
    paid: false,
  }));

  // Ordenação pelo foco da estratégia
  const sortStates = (arr: DebtState[]) => {
    const active = arr.filter((s) => !s.paid);
    if (strategy === "snowball") {
      active.sort((a, b) => a.balance - b.balance);
    } else {
      active.sort((a, b) => b.rate - a.rate);
    }
    return active;
  };

  const schedule: AmortizationMonth[] = [];
  let totalInterestPaid = 0;
  let totalPaid = 0;
  let month = 0;
  const maxMonths = 600;

  // Calcular juros sem estratégia (só mínimo) para comparação
  const jurosMinimos = debts.reduce(
    (acc, d) => acc + calcularJurosTotaisMinimos(d),
    0
  );

  const startDate = new Date();

  while (states.some((s) => !s.paid) && month < maxMonths) {
    month++;
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + month - 1);
    const monthLabel = new Intl.DateTimeFormat("pt-BR", {
      month: "short",
      year: "2-digit",
    })
      .format(date)
      .replace(" de ", "/")
      .replace(".", "");

    // Total disponível neste mês
    const totalMinimum = states
      .filter((s) => !s.paid)
      .reduce((acc, s) => acc + s.minPayment, 0);
    let extraAvailable = extraMonthly;

    // Determinar a dívida foco (primeira da ordenação)
    const sorted = sortStates(states);
    const focusId = sorted.length > 0 ? sorted[0].id : null;

    // Pagar mínimo em todas + extra na dívida foco
    for (const state of states) {
      if (state.paid) continue;

      const juros = state.balance * state.rate;
      totalInterestPaid += juros;
      const disponivel =
        state.id === focusId
          ? state.minPayment + extraAvailable
          : state.minPayment;

      const pagamento = Math.min(disponivel, state.balance + juros);
      const principal = pagamento - juros;

      if (state.id === focusId) {
        extraAvailable = Math.max(0, pagamento - state.minPayment - juros + principal);
      }

      totalPaid += pagamento;
      state.balance = Math.max(0, state.balance + juros - pagamento);

      schedule.push({
        month,
        monthLabel,
        totalPayment: pagamento,
        principalPaid: principal,
        interestPaid: juros,
        remainingBalance: state.balance,
        debtId: state.id,
        debtName: state.name,
      });

      if (state.balance < 0.01) {
        state.paid = true;
        state.balance = 0;
        // Libera o mínimo da dívida quitada para as próximas
        extraAvailable += state.minPayment;
      }
    }
  }

  // Calcular meses com apenas mínimo para comparação
  let monthsMin = 0;
  const minStates: DebtState[] = debts.map((d) => ({
    id: d.id,
    name: d.name,
    balance: d.currentBalance,
    rate: d.interestRateMonthly,
    minPayment: d.minimumPayment,
    paid: false,
  }));
  while (minStates.some((s) => !s.paid) && monthsMin < maxMonths) {
    monthsMin++;
    for (const state of minStates) {
      if (state.paid) continue;
      const juros = state.balance * state.rate;
      const pagamento = Math.min(state.minPayment, state.balance + juros);
      state.balance = Math.max(0, state.balance + juros - pagamento);
      if (state.balance < 0.01) {
        state.paid = true;
        state.balance = 0;
      }
    }
  }

  return {
    strategy,
    monthsToPayoff: month,
    totalInterestPaid,
    totalPaid,
    schedule,
    interestSavingsVsMinimum: Math.max(0, jurosMinimos - totalInterestPaid),
    monthsSavedVsMinimum: Math.max(0, monthsMin - month),
  };
}

// ─── Cálculos de Patrimônio ───────────────────────────────────────────────────

export function calcularPatrimonioLiquido(
  accounts: Account[],
  investments: Investment[],
  debts: Debt[]
): { ativo: number; passivo: number; liquido: number } {
  const totalContas = accounts
    .filter((a) => a.type !== "cartao_credito")
    .reduce((acc, a) => acc + a.balance, 0);

  const totalInvestimentos = investments.reduce(
    (acc, i) => acc + i.currentValue,
    0
  );

  const ativo = totalContas + totalInvestimentos;
  const passivo = debts.reduce((acc, d) => acc + d.currentBalance, 0);
  const liquido = ativo - passivo;

  return { ativo, passivo, liquido };
}

export function calcularReservaEmergencia(
  accounts: Account[],
  monthlyExpenses: number
): { current: number; target: number; targetMonths: number; percent: number } {
  const targetMonths = 6;
  const target = monthlyExpenses * targetMonths;
  const current = accounts
    .filter(
      (a) =>
        a.type === "corrente" ||
        a.type === "poupanca" ||
        a.type === "dinheiro"
    )
    .reduce((acc, a) => acc + a.balance, 0);
  const percent = Math.min(100, (current / target) * 100);
  return { current, target, targetMonths, percent };
}

// ─── Parser de OFX ────────────────────────────────────────────────────────────

export interface OFXTransaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  type: "DEBIT" | "CREDIT" | "OTHER";
}

export function extractOFXAccountInfo(content: string): { bank?: string; accountId?: string } {
  const singleTagPattern = (tag: string) =>
    new RegExp(`<${tag}>([^<\\n]+)`, "i");
  const org = singleTagPattern("ORG").exec(content)?.[1]?.trim() || "";
  const bankId = singleTagPattern("BANKID").exec(content)?.[1]?.trim() || "";
  const acctId = singleTagPattern("ACCTID").exec(content)?.[1]?.trim() || "";

  let detectedBank = org;
  if (!detectedBank && bankId) {
    if (bankId === "336" || bankId === "0336") detectedBank = "C6 Bank";
    else if (bankId === "260" || bankId === "0260") detectedBank = "Nubank";
    else if (bankId === "077" || bankId === "77") detectedBank = "Banco Inter";
    else if (bankId === "341" || bankId === "0341") detectedBank = "Itaú";
    else if (bankId === "237" || bankId === "0237") detectedBank = "Bradesco";
    else if (bankId === "001" || bankId === "1") detectedBank = "Banco do Brasil";
    else if (bankId === "033" || bankId === "33") detectedBank = "Santander";
  }

  if (!detectedBank) {
    const upper = content.toUpperCase();
    if (upper.includes("C6 BANK") || upper.includes("C6BANK")) detectedBank = "C6 Bank";
    else if (upper.includes("NUBANK")) detectedBank = "Nubank";
    else if (upper.includes("BANCO INTER") || upper.includes("INTER DTVM")) detectedBank = "Banco Inter";
    else if (upper.includes("ITAU")) detectedBank = "Itaú";
    else if (upper.includes("BRADESCO")) detectedBank = "Bradesco";
    else if (upper.includes("SANTANDER")) detectedBank = "Santander";
  }

  return {
    bank: detectedBank || undefined,
    accountId: acctId || undefined,
  };
}

export function parseOFX(content: string): OFXTransaction[] {
  const transactions: OFXTransaction[] = [];

  // Extrai os blocos STMTTRN (compatível com OFX 1.x SGML e 2.x XML)
  const stmtPattern =
    /<STMTTRN>([\s\S]*?)<\/STMTTRN>|<STMTTRN>([\s\S]*?)(?=<STMTTRN>|<\/BANKTRANLIST>)/gi;
  const singleTagPattern = (tag: string) =>
    new RegExp(`<${tag}>([^<\\n]+)`, "i");

  let match: RegExpExecArray | null;
  while ((match = stmtPattern.exec(content)) !== null) {
    const block = match[1] || match[2] || "";

    const trntype = (singleTagPattern("TRNTYPE").exec(block)?.[1] ?? "").trim();
    const dtposted = (singleTagPattern("DTPOSTED").exec(block)?.[1] ?? "").trim();
    const trnamt = (singleTagPattern("TRNAMT").exec(block)?.[1] ?? "0").trim();
    const fitid = (singleTagPattern("FITID").exec(block)?.[1] ?? `ofx-${Date.now()}-${Math.random()}`).trim();
    const memo = (singleTagPattern("MEMO").exec(block)?.[1] ?? "").trim();
    const name = (singleTagPattern("NAME").exec(block)?.[1] ?? "").trim();

    if (!dtposted) continue;

    // Formata data OFX (YYYYMMDD ou YYYYMMDDHHMMSS) para ISO
    const year = dtposted.substring(0, 4);
    const month = dtposted.substring(4, 6);
    const day = dtposted.substring(6, 8);
    const isoDate = `${year}-${month}-${day}`;

    const amount = parseFloat(trnamt.replace(",", ".")) || 0;
    const type: OFXTransaction["type"] =
      trntype === "DEBIT" || amount < 0
        ? "DEBIT"
        : trntype === "CREDIT" || amount > 0
        ? "CREDIT"
        : "OTHER";

    transactions.push({
      id: fitid,
      date: isoDate,
      amount,
      description: memo || name || "Transação importada",
      type,
    });
  }

  return transactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

// ─── Cálculos de Investimento ─────────────────────────────────────────────────

export function calcularRentabilidadeCarteira(
  investments: Investment[]
): { totalInvestido: number; valorAtual: number; ganho: number; percentual: number } {
  const totalInvestido = investments.reduce((acc, i) => acc + i.investedAmount, 0);
  const valorAtual = investments.reduce((acc, i) => acc + i.currentValue, 0);
  const ganho = valorAtual - totalInvestido;
  const percentual = totalInvestido > 0 ? (ganho / totalInvestido) * 100 : 0;
  return { totalInvestido, valorAtual, ganho, percentual };
}

// ─── Utilitários ─────────────────────────────────────────────────────────────

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function getMonthRange(isoMonth: string): { start: string; end: string } {
  const [year, month] = isoMonth.split("-").map(Number);
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;
  return { start, end };
}

export function isWithinMonth(dateString: string, isoMonth: string): boolean {
  const { start, end } = getMonthRange(isoMonth);
  return dateString >= start && dateString <= end;
}

// ─── Parser de CSV Bancário (Fase 2) ──────────────────────────────────────────

export function parseCSV(content: string): OFXTransaction[] {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return [];

  // Detecta separador (; ou ,)
  const firstLine = lines[0];
  const separator = (firstLine.match(/;/g) || []).length >= (firstLine.match(/,/g) || []).length ? ";" : ",";

  const headers = firstLine
    .split(separator)
    .map((h) => h.replace(/^["']|["']$/g, "").trim().toLowerCase());

  // Encontra índices de Data, Descrição e Valor
  const dateIdx = headers.findIndex((h) => h.includes("data") || h.includes("date") || h === "dt");
  const descIdx = headers.findIndex(
    (h) =>
      h.includes("descri") ||
      h.includes("historico") ||
      h.includes("histórico") ||
      h.includes("memo") ||
      h.includes("estabelecimento") ||
      h.includes("title")
  );
  const valIdx = headers.findIndex((h) => h.includes("valor") || h.includes("amount") || h.includes("total"));
  const debitIdx = headers.findIndex((h) => h.includes("debito") || h.includes("débito"));
  const creditIdx = headers.findIndex((h) => h.includes("credito") || h.includes("crédito"));

  const transactions: OFXTransaction[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawCols = lines[i].split(separator).map((c) => c.replace(/^["']|["']$/g, "").trim());
    if (rawCols.length < 2) continue;

    // Data
    const rawDate = dateIdx >= 0 ? rawCols[dateIdx] : rawCols[0];
    let isoDate = "";
    if (rawDate.includes("/")) {
      const parts = rawDate.split("/");
      if (parts.length === 3) {
        const day = parts[0].padStart(2, "0");
        const month = parts[1].padStart(2, "0");
        const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        isoDate = `${year}-${month}-${day}`;
      }
    } else if (rawDate.includes("-")) {
      const parts = rawDate.split("-");
      if (parts[0].length === 4) {
        isoDate = rawDate.substring(0, 10);
      } else if (parts.length === 3) {
        isoDate = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      }
    }

    if (!isoDate) continue;

    // Descrição
    const description =
      descIdx >= 0 && rawCols[descIdx]
        ? rawCols[descIdx]
        : rawCols.find((c, idx) => idx !== dateIdx && isNaN(parseFloat(c.replace(",", ".")))) || "Transação Importada";

    // Valor
    let amount = 0;
    if (valIdx >= 0 && rawCols[valIdx]) {
      const rawVal = rawCols[valIdx].replace(/\./g, "").replace(",", ".");
      amount = parseFloat(rawVal) || 0;
    } else if (debitIdx >= 0 && rawCols[debitIdx] && parseFloat(rawCols[debitIdx].replace(",", "."))) {
      const d = parseFloat(rawCols[debitIdx].replace(/\./g, "").replace(",", ".")) || 0;
      amount = -Math.abs(d);
    } else if (creditIdx >= 0 && rawCols[creditIdx] && parseFloat(rawCols[creditIdx].replace(",", "."))) {
      const c = parseFloat(rawCols[creditIdx].replace(/\./g, "").replace(",", ".")) || 0;
      amount = Math.abs(c);
    } else {
      // Tenta achar primeira coluna numérica
      const numCol = rawCols.find((c) => {
        const parsed = parseFloat(c.replace(/\./g, "").replace(",", "."));
        return !isNaN(parsed) && parsed !== 0;
      });
      if (numCol) {
        amount = parseFloat(numCol.replace(/\./g, "").replace(",", ".")) || 0;
      }
    }

    if (amount === 0 && !description) continue;

    const type: OFXTransaction["type"] = amount < 0 ? "DEBIT" : "CREDIT";

    transactions.push({
      id: `csv-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
      date: isoDate,
      description,
      amount,
      type,
    });
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// ─── Deduplicação Inteligente (Fase 2) ─────────────────────────────────────────

export function detectDuplicates(
  newItems: { date: string; amount: number; description: string; id?: string }[],
  existing: Transaction[]
): Set<string> {
  const duplicates = new Set<string>();

  // Cria mapas de identificação rápida
  const existingOfxIds = new Set(existing.map((t) => t.ofxId).filter(Boolean));
  const existingSignatures = new Set(
    existing.map(
      (t) => `${t.date}|${t.amount.toFixed(2)}|${t.description.toLowerCase().trim().slice(0, 20)}`
    )
  );

  for (const item of newItems) {
    if (item.id && existingOfxIds.has(item.id)) {
      duplicates.add(item.id);
      continue;
    }

    const sig = `${item.date}|${item.amount.toFixed(2)}|${item.description.toLowerCase().trim().slice(0, 20)}`;
    if (existingSignatures.has(sig)) {
      if (item.id) duplicates.add(item.id);
    }
  }

  return duplicates;
}

// ─── Simulador de Aporte Extraordinário (Fase 2) ───────────────────────────────

export function simularAporteExtraordinario(
  debt: Debt,
  aporteAmount: number
): ExtraPayoffSimulation {
  const originalBalance = debt.currentBalance;
  const rate = debt.interestRateMonthly;
  const minPayment = debt.minimumPayment;

  // 1. Simula sem aporte
  let saldoOrig = originalBalance;
  let monthsOrig = 0;
  let totalInterestOrig = 0;
  while (saldoOrig > 0.01 && monthsOrig < 600) {
    const interest = saldoOrig * rate;
    const payment = Math.min(minPayment, saldoOrig + interest);
    totalInterestOrig += interest;
    saldoOrig = saldoOrig + interest - payment;
    monthsOrig++;
  }

  // 2. Simula com aporte imediato
  let saldoNew = Math.max(0, originalBalance - aporteAmount);
  let monthsNew = 0;
  let totalInterestNew = 0;
  if (saldoNew > 0.01) {
    while (saldoNew > 0.01 && monthsNew < 600) {
      const interest = saldoNew * rate;
      const payment = Math.min(minPayment, saldoNew + interest);
      totalInterestNew += interest;
      saldoNew = saldoNew + interest - payment;
      monthsNew++;
    }
  }

  return {
    debtId: debt.id,
    debtName: debt.name,
    aporteAmount,
    originalMonths: monthsOrig,
    newMonths: monthsNew,
    monthsSaved: Math.max(0, monthsOrig - monthsNew),
    originalInterest: totalInterestOrig,
    newInterest: totalInterestNew,
    interestSaved: Math.max(0, totalInterestOrig - totalInterestNew),
  };
}
