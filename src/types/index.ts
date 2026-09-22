// ─── Contas ──────────────────────────────────────────────────────────────────

export type AccountType =
  | "corrente"
  | "poupanca"
  | "cartao_credito"
  | "investimento"
  | "dinheiro"
  | "outro";

export type AccountStatus = "ativa" | "inativa";

export interface Account {
  id: string;
  name: string;
  bank: string;
  type: AccountType;
  balance: number; // Saldo atual. Para cartão de crédito: valor da fatura atual (negativo = deve)
  limit?: number; // Para cartões de crédito
  color: string; // Cor de identificação visual
  iconName: string;
  status: AccountStatus;
  lastSync?: string; // ISO timestamp
  dueDate?: number; // Para cartão: dia de vencimento da fatura (1-31)
  closingDate?: number; // Para cartão: dia do fechamento da fatura (1-31)
  pluggyItemId?: string; // ID do Item Pluggy conectado
  pluggyAccountId?: string; // ID da Conta na Pluggy
}

// ─── Transações ──────────────────────────────────────────────────────────────

export type TransactionType = "receita" | "despesa" | "transferencia";

export interface Transaction {
  id: string;
  accountId: string;
  date: string; // ISO date string
  description: string; // Descrição original (ex: "NUBANK *IFOOD")
  amount: number; // Positivo = receita, negativo = despesa
  type: TransactionType;
  categoryId: string;
  notes?: string;
  isPending?: boolean;
  ofxId?: string; // ID original do arquivo OFX para deduplicação
  isRecurring?: boolean;
  autoRuleId?: string; // ID da regra que categorizou automaticamente
}

// ─── Categorias ───────────────────────────────────────────────────────────────

export type CategoryGroup =
  | "moradia"
  | "alimentacao"
  | "transporte"
  | "saude"
  | "lazer"
  | "vestuario"
  | "educacao"
  | "financeiro"
  | "assinaturas"
  | "receita"
  | "outros";

export interface Category {
  id: string;
  name: string;
  group: CategoryGroup;
  color: string;
  icon: string;
  isIncome: boolean;
}

// ─── Orçamento ───────────────────────────────────────────────────────────────

export interface Budget {
  id: string;
  categoryId: string;
  monthlyLimit: number;
  month: string; // "2026-09"
}

// ─── Dívidas ─────────────────────────────────────────────────────────────────

export type DebtType =
  | "cartao_credito"
  | "emprestimo_pessoal"
  | "financiamento"
  | "cheque_especial"
  | "consignado"
  | "outro";

export interface Debt {
  id: string;
  name: string;
  creditor: string;
  type: DebtType;
  currentBalance: number; // Saldo devedor atual
  originalAmount: number; // Valor original da dívida
  interestRateMonthly: number; // Taxa de juros mensal em decimal (ex: 0.0149 = 1.49% a.m.)
  minimumPayment: number; // Parcela mínima/atual
  remainingInstallments: number;
  totalInstallments: number;
  color: string;
  iconName: string;
}

// Resultado do cálculo de amortização mês a mês
export interface AmortizationMonth {
  month: number; // Número do mês (1, 2, 3...)
  monthLabel: string; // Ex: "Out/2026"
  totalPayment: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
  debtId: string;
  debtName: string;
}

export interface DebtPlan {
  strategy: "snowball" | "avalanche";
  monthsToPayoff: number;
  totalInterestPaid: number;
  totalPaid: number;
  schedule: AmortizationMonth[];
  interestSavingsVsMinimum: number;
  monthsSavedVsMinimum: number;
}

// ─── Investimentos ────────────────────────────────────────────────────────────

export type InvestmentType =
  | "renda_fixa"
  | "tesouro_direto"
  | "fii"
  | "acao"
  | "cdb"
  | "lci_lca"
  | "cripto"
  | "previdencia"
  | "outro";

export interface Investment {
  id: string;
  name: string;
  ticker?: string; // Ticker B3 (ex: "MXRF11", "VALE3")
  type: InvestmentType;
  broker: string;
  quantity?: number; // Quantidade de cotas/ações
  averagePrice?: number; // Preço médio de compra
  currentPrice?: number; // Preço atual (alimentado via BrasilAPI)
  investedAmount: number; // Total investido
  currentValue: number; // Valor atual
  incomeRate?: number; // % CDI, IPCA+X, etc. (para RF)
  maturityDate?: string; // Data de vencimento (para RF)
  color: string;
  iconName: string;
}

// ─── Alertas ──────────────────────────────────────────────────────────────────

export type AlertSeverity = "critico" | "atencao" | "informacao";
export type AlertCategory =
  | "fatura"
  | "orcamento"
  | "divida"
  | "investimento"
  | "reserva"
  | "transacao"
  | "dica";

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  category: AlertCategory;
  date: string;
  isDismissed: boolean;
  actionLabel?: string;
  actionTab?: string; // Qual aba abrir ao clicar na ação
  relatedId?: string; // ID de conta, dívida, investimento ou transação relacionada
}

// ─── Regras de Auto-Categorização ────────────────────────────────────────────

export interface AutoRule {
  id: string;
  pattern: string; // Texto a buscar na descrição da transação (case-insensitive)
  categoryId: string;
  accountId?: string; // Se null, aplica a todas as contas
  createdAt: string;
  appliedCount: number;
}

// ─── Métricas de Resumo ───────────────────────────────────────────────────────

export interface MonthlySummary {
  month: string; // "2026-09"
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  byCategory: {
    categoryId: string;
    categoryName: string;
    total: number;
    percentage: number;
    color: string;
  }[];
}

// ─── Plano de Desendividamento ────────────────────────────────────────────────

export interface AmortizationMonth {
  month: number;
  monthLabel: string;
  totalPayment: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
  debtId: string;
  debtName: string;
}

export interface DebtPlan {
  strategy: "snowball" | "avalanche";
  monthsToPayoff: number;
  totalInterestPaid: number;
  totalPaid: number;
  schedule: AmortizationMonth[];
  interestSavingsVsMinimum: number;
  monthsSavedVsMinimum: number;
}

// ─── Indicadores e Mercado (Fase 2) ──────────────────────────────────────────

export interface EconomicIndicators {
  selic: number; // ex: 10.75
  cdi: number; // ex: 10.65
  ipca12m: number; // ex: 4.24
  lastUpdated: string;
}

export interface MarketQuote {
  ticker: string; // ex: "VALE3", "MXRF11"
  name?: string;
  price: number;
  changePercent: number; // ex: +1.25 ou -0.42
  updatedAt: string;
}

// ─── Importação de Extratos (Fase 2) ─────────────────────────────────────────

export interface ImportPreviewItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  isDuplicate: boolean;
  selected: boolean;
  raw?: string;
}

// ─── Simulação de Aporte Extraordinário (Fase 2) ───────────────────────────────

export interface ExtraPayoffSimulation {
  debtId: string;
  debtName: string;
  aporteAmount: number;
  originalMonths: number;
  newMonths: number;
  monthsSaved: number;
  originalInterest: number;
  newInterest: number;
  interestSaved: number;
}


