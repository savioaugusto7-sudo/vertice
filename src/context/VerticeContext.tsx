"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { encryptData, decryptData } from "@/lib/crypto";
import {
  Account,
  Transaction,
  Category,
  Budget,
  Debt,
  Investment,
  Alert,
  AutoRule,
  MonthlySummary,
  EconomicIndicators,
  MarketQuote,
} from "@/types";
import {
  calcularPlanoDividas,
  calcularPatrimonioLiquido,
  calcularReservaEmergencia,
  calcularRentabilidadeCarteira,
  isWithinMonth,
  getCurrentMonth,
} from "@/lib/finance";
import type { DebtPlan } from "@/types";

// ─── Categorias ───────────────────────────────────────────────────────────────

export const CATEGORIES: Category[] = [
  // Receitas
  { id: "cat-salario",     name: "Salário",           group: "receita",      color: "#10b981", icon: "Briefcase",   isIncome: true },
  { id: "cat-freelance",   name: "Freelance",         group: "receita",      color: "#34d399", icon: "Laptop",      isIncome: true },
  { id: "cat-rend-invest", name: "Rend. Investimento",group: "receita",      color: "#6ee7b7", icon: "TrendingUp",  isIncome: true },
  // Moradia
  { id: "cat-aluguel",     name: "Aluguel",           group: "moradia",      color: "#3b82f6", icon: "Home",        isIncome: false },
  { id: "cat-condominio",  name: "Condomínio",        group: "moradia",      color: "#60a5fa", icon: "Building",    isIncome: false },
  { id: "cat-energia",     name: "Energia Elétrica",  group: "moradia",      color: "#fbbf24", icon: "Zap",         isIncome: false },
  { id: "cat-agua",        name: "Água e Esgoto",     group: "moradia",      color: "#38bdf8", icon: "Droplets",    isIncome: false },
  { id: "cat-internet",    name: "Internet/TV",        group: "moradia",      color: "#818cf8", icon: "Wifi",        isIncome: false },
  // Alimentação
  { id: "cat-mercado",     name: "Supermercado",      group: "alimentacao",  color: "#f97316", icon: "ShoppingCart", isIncome: false },
  { id: "cat-restaurante", name: "Restaurante",       group: "alimentacao",  color: "#fb923c", icon: "Utensils",    isIncome: false },
  { id: "cat-delivery",    name: "Delivery",          group: "alimentacao",  color: "#fdba74", icon: "Package",     isIncome: false },
  // Transporte
  { id: "cat-combustivel", name: "Combustível",       group: "transporte",   color: "#ef4444", icon: "Car",         isIncome: false },
  { id: "cat-uber",        name: "Uber / Táxi",       group: "transporte",   color: "#f87171", icon: "MapPin",      isIncome: false },
  { id: "cat-financiamento",name:"Financiamento",     group: "transporte",   color: "#fca5a5", icon: "Car",         isIncome: false },
  // Saúde
  { id: "cat-plano-saude", name: "Plano de Saúde",   group: "saude",        color: "#a855f7", icon: "Heart",       isIncome: false },
  { id: "cat-farmacia",    name: "Farmácia",          group: "saude",        color: "#c084fc", icon: "Pill",        isIncome: false },
  // Lazer
  { id: "cat-streaming",   name: "Streaming",         group: "assinaturas",  color: "#ec4899", icon: "Play",        isIncome: false },
  { id: "cat-lazer",       name: "Lazer & Entretenimento", group: "lazer",  color: "#f472b6", icon: "Smile",       isIncome: false },
  // Financeiro
  { id: "cat-juros",       name: "Juros / Dívidas",   group: "financeiro",   color: "#dc2626", icon: "Percent",     isIncome: false },
  { id: "cat-tarifa",      name: "Tarifas Bancárias", group: "financeiro",   color: "#b91c1c", icon: "Receipt",     isIncome: false },
  // Outros
  { id: "cat-educacao",    name: "Educação",          group: "educacao",     color: "#0ea5e9", icon: "BookOpen",    isIncome: false },
  { id: "cat-outros",      name: "Outros",            group: "outros",       color: "#94a3b8", icon: "MoreHorizontal", isIncome: false },
];

// ─── Dados de Demonstração (Opcionais) ────────────────────────────────────────

const DEMO_ACCOUNTS: Account[] = [
  {
    id: "acc-nubank-cc",
    name: "Nubank — Conta Corrente",
    bank: "Nubank",
    type: "corrente",
    balance: 3420.0,
    color: "#8b5cf6",
    iconName: "Wallet",
    status: "ativa",
    lastSync: new Date().toISOString(),
  },
  {
    id: "acc-nubank-cartao",
    name: "Nubank — Cartão de Crédito",
    bank: "Nubank",
    type: "cartao_credito",
    balance: -1840.0, // Fatura atual
    limit: 8000,
    color: "#7c3aed",
    iconName: "CreditCard",
    status: "ativa",
    dueDate: 10,
    closingDate: 3,
    lastSync: new Date().toISOString(),
  },
  {
    id: "acc-inter-invest",
    name: "Inter — Conta Investimento",
    bank: "Banco Inter",
    type: "investimento",
    balance: 12500.0,
    color: "#f97316",
    iconName: "TrendingUp",
    status: "ativa",
    lastSync: new Date().toISOString(),
  },
  {
    id: "acc-dinheiro",
    name: "Carteira — Dinheiro",
    bank: "Dinheiro",
    type: "dinheiro",
    balance: 450.0,
    color: "#10b981",
    iconName: "Banknote",
    status: "ativa",
  },
];

const DEMO_TRANSACTIONS: Transaction[] = [
  // Setembro 2026
  { id: "t-001", accountId: "acc-nubank-cc",    date: "2026-09-20", description: "PIX REC - PAGAMENTO SALARIO", amount:  6500.00, type: "receita",   categoryId: "cat-salario",     notes: "" },
  { id: "t-002", accountId: "acc-nubank-cc",    date: "2026-09-19", description: "ALUGUEL — IMOBILIARIA CENTRO", amount: -1800.00, type: "despesa",   categoryId: "cat-aluguel",     notes: "" },
  { id: "t-003", accountId: "acc-nubank-cc",    date: "2026-09-18", description: "PIX ENV - CONDOMINIO", amount:   -450.00, type: "despesa",   categoryId: "cat-condominio",  notes: "" },
  { id: "t-004", accountId: "acc-nubank-cc",    date: "2026-09-17", description: "NUBANK *IFOOD", amount:    -64.90, type: "despesa",   categoryId: "cat-delivery",    notes: "" },
  { id: "t-005", accountId: "acc-nubank-cc",    date: "2026-09-16", description: "NUBANK *IFOOD", amount:    -38.50, type: "despesa",   categoryId: "cat-delivery",    notes: "" },
  { id: "t-006", accountId: "acc-nubank-cartao",date: "2026-09-15", description: "SUPERMERCADO EXTRA",           amount:   -487.20, type: "despesa",   categoryId: "cat-mercado",     notes: "" },
  { id: "t-007", accountId: "acc-nubank-cartao",date: "2026-09-14", description: "POSTO IPIRANGA",              amount:   -210.00, type: "despesa",   categoryId: "cat-combustivel", notes: "" },
  { id: "t-008", accountId: "acc-nubank-cartao",date: "2026-09-13", description: "NETFLIX.COM",                 amount:    -39.90, type: "despesa",   categoryId: "cat-streaming",   notes: "" },
  { id: "t-009", accountId: "acc-nubank-cartao",date: "2026-09-13", description: "SPOTIFY",                     amount:    -21.90, type: "despesa",   categoryId: "cat-streaming",   notes: "" },
  { id: "t-010", accountId: "acc-nubank-cartao",date: "2026-09-12", description: "FARMACIA PANVEL",             amount:    -89.40, type: "despesa",   categoryId: "cat-farmacia",    notes: "" },
  { id: "t-011", accountId: "acc-nubank-cc",    date: "2026-09-12", description: "SANTANDER FINANC. AUTO",      amount:   -890.00, type: "despesa",   categoryId: "cat-financiamento",notes: "" },
  { id: "t-012", accountId: "acc-nubank-cc",    date: "2026-09-11", description: "ENEL DISTRIBUICAO",          amount:   -198.70, type: "despesa",   categoryId: "cat-energia",     notes: "" },
  { id: "t-013", accountId: "acc-nubank-cc",    date: "2026-09-10", description: "VIVO FIBRA INTERNET",         amount:    -99.90, type: "despesa",   categoryId: "cat-internet",    notes: "" },
  { id: "t-014", accountId: "acc-nubank-cartao",date: "2026-09-08", description: "RESTAURANTE BONSAI",         amount:    -76.00, type: "despesa",   categoryId: "cat-restaurante", notes: "" },
  { id: "t-015", accountId: "acc-nubank-cc",    date: "2026-09-07", description: "CAIXA ECO CRÉDITO PESSOAL",  amount:   -540.00, type: "despesa",   categoryId: "cat-juros",       notes: "" },
  { id: "t-016", accountId: "acc-nubank-cc",    date: "2026-09-05", description: "PIX REC - FREELA SITE",       amount:  1200.00, type: "receita",   categoryId: "cat-freelance",   notes: "" },
  { id: "t-017", accountId: "acc-nubank-cartao",date: "2026-09-04", description: "UBER *VIAGEM",               amount:    -28.90, type: "despesa",   categoryId: "cat-uber",        notes: "" },
  { id: "t-018", accountId: "acc-nubank-cartao",date: "2026-09-03", description: "SARAIVA LIVROS",             amount:    -89.00, type: "despesa",   categoryId: "cat-educacao",    notes: "" },
  { id: "t-019", accountId: "acc-nubank-cc",    date: "2026-09-02", description: "UNIMED PLANO SAUDE",         amount:   -380.00, type: "despesa",   categoryId: "cat-plano-saude", notes: "" },
  { id: "t-020", accountId: "acc-inter-invest", date: "2026-09-01", description: "REND. TESOURO SELIC",        amount:    105.20, type: "receita",   categoryId: "cat-rend-invest", notes: "" },
  // Agosto 2026
  { id: "t-021", accountId: "acc-nubank-cc",    date: "2026-08-20", description: "PIX REC - PAGAMENTO SALARIO", amount:  6500.00, type: "receita",   categoryId: "cat-salario",     notes: "" },
  { id: "t-022", accountId: "acc-nubank-cc",    date: "2026-08-19", description: "ALUGUEL — IMOBILIARIA CENTRO", amount: -1800.00, type: "despesa",   categoryId: "cat-aluguel",     notes: "" },
  { id: "t-023", accountId: "acc-nubank-cartao",date: "2026-08-15", description: "SUPERMERCADO EXTRA",           amount:   -512.00, type: "despesa",   categoryId: "cat-mercado",     notes: "" },
  { id: "t-024", accountId: "acc-nubank-cc",    date: "2026-08-12", description: "SANTANDER FINANC. AUTO",      amount:   -890.00, type: "despesa",   categoryId: "cat-financiamento",notes: "" },
  { id: "t-025", accountId: "acc-nubank-cc",    date: "2026-08-11", description: "ENEL DISTRIBUICAO",          amount:   -201.40, type: "despesa",   categoryId: "cat-energia",     notes: "" },
  { id: "t-026", accountId: "acc-nubank-cc",    date: "2026-08-07", description: "CAIXA ECO CRÉDITO PESSOAL",  amount:   -540.00, type: "despesa",   categoryId: "cat-juros",       notes: "" },
  { id: "t-027", accountId: "acc-nubank-cc",    date: "2026-08-05", description: "PIX REC - FREELA LOGO",       amount:    800.00, type: "receita",   categoryId: "cat-freelance",   notes: "" },
  { id: "t-028", accountId: "acc-inter-invest", date: "2026-08-01", description: "REND. TESOURO SELIC",        amount:    102.80, type: "receita",   categoryId: "cat-rend-invest", notes: "" },
  // Julho 2026
  { id: "t-029", accountId: "acc-nubank-cc",    date: "2026-07-20", description: "PIX REC - PAGAMENTO SALARIO", amount:  6500.00, type: "receita",   categoryId: "cat-salario",     notes: "" },
  { id: "t-030", accountId: "acc-nubank-cc",    date: "2026-07-19", description: "ALUGUEL — IMOBILIARIA CENTRO", amount: -1800.00, type: "despesa",   categoryId: "cat-aluguel",     notes: "" },
  { id: "t-031", accountId: "acc-nubank-cartao",date: "2026-07-15", description: "SUPERMERCADO EXTRA",           amount:   -498.00, type: "despesa",   categoryId: "cat-mercado",     notes: "" },
  { id: "t-032", accountId: "acc-nubank-cc",    date: "2026-07-07", description: "CAIXA ECO CRÉDITO PESSOAL",  amount:   -540.00, type: "despesa",   categoryId: "cat-juros",       notes: "" },
  { id: "t-033", accountId: "acc-inter-invest", date: "2026-07-01", description: "REND. TESOURO SELIC",        amount:    100.50, type: "receita",   categoryId: "cat-rend-invest", notes: "" },
];

const DEMO_DEBTS: Debt[] = [
  {
    id: "debt-santander",
    name: "Financiamento Volkswagen Polo",
    creditor: "Santander Auto",
    type: "financiamento",
    currentBalance: 24800.0,
    originalAmount: 35000.0,
    interestRateMonthly: 0.0149, // 1.49% a.m.
    minimumPayment: 890.0,
    remainingInstallments: 36,
    totalInstallments: 48,
    color: "#ef4444",
    iconName: "Car",
  },
  {
    id: "debt-caixa",
    name: "Crédito Pessoal Caixa",
    creditor: "Caixa Econômica Federal",
    type: "emprestimo_pessoal",
    currentBalance: 8200.0,
    originalAmount: 12000.0,
    interestRateMonthly: 0.021, // 2.10% a.m.
    minimumPayment: 540.0,
    remainingInstallments: 18,
    totalInstallments: 24,
    color: "#f97316",
    iconName: "Building",
  },
  {
    id: "debt-nubank-cartao",
    name: "Fatura Nubank (rotativo)",
    creditor: "Nubank",
    type: "cartao_credito",
    currentBalance: 1840.0,
    originalAmount: 1840.0,
    interestRateMonthly: 0.035, // 3.5% a.m. (crédito rotativo)
    minimumPayment: 184.0,
    remainingInstallments: 12,
    totalInstallments: 12,
    color: "#8b5cf6",
    iconName: "CreditCard",
  },
];

const DEMO_INVESTMENTS: Investment[] = [
  {
    id: "inv-tesouro",
    name: "Tesouro Selic 2029",
    type: "tesouro_direto",
    broker: "Banco Inter",
    investedAmount: 12000.0,
    currentValue: 12500.0,
    incomeRate: 110, // % CDI
    maturityDate: "2029-03-01",
    color: "#10b981",
    iconName: "Shield",
  },
  {
    id: "inv-mxrf11",
    name: "MXRF11 — Maxi Renda FII",
    ticker: "MXRF11",
    type: "fii",
    broker: "Banco Inter",
    quantity: 50,
    averagePrice: 9.5,
    currentPrice: 9.8,
    investedAmount: 475.0,
    currentValue: 490.0,
    color: "#3b82f6",
    iconName: "Building2",
  },
  {
    id: "inv-vale3",
    name: "VALE3 — Vale S.A.",
    ticker: "VALE3",
    type: "acao",
    broker: "Banco Inter",
    quantity: 10,
    averagePrice: 60.0,
    currentPrice: 56.2,
    investedAmount: 600.0,
    currentValue: 562.0,
    color: "#f59e0b",
    iconName: "BarChart",
  },
];

const INITIAL_AUTO_RULES: AutoRule[] = [
  { id: "rule-1", pattern: "IFOOD",         categoryId: "cat-delivery",    createdAt: "2026-08-01", appliedCount: 8 },
  { id: "rule-2", pattern: "NETFLIX",       categoryId: "cat-streaming",   createdAt: "2026-08-01", appliedCount: 2 },
  { id: "rule-3", pattern: "ENEL",          categoryId: "cat-energia",     createdAt: "2026-08-01", appliedCount: 3 },
  { id: "rule-4", pattern: "SPOTIFY",       categoryId: "cat-streaming",   createdAt: "2026-08-01", appliedCount: 2 },
  { id: "rule-5", pattern: "POSTO",         categoryId: "cat-combustivel", createdAt: "2026-08-01", appliedCount: 4 },
];

// ─── Context Type ─────────────────────────────────────────────────────────────

interface FinanceContextType {
  // Dados
  accounts: Account[];
  transactions: Transaction[];
  debts: Debt[];
  investments: Investment[];
  budgets: Budget[];
  alerts: Alert[];
  autoRules: AutoRule[];
  categories: Category[];

  // Ações — Contas
  addAccount: (account: Omit<Account, "id"> & { id?: string }) => string;
  updateAccount: (id: string, patch: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  // Ações — Transações
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  addTransactions: (transactions: Omit<Transaction, "id">[]) => void;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Ações — Dívidas
  addDebt: (debt: Omit<Debt, "id">) => void;
  updateDebt: (id: string, patch: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;

  // Ações — Investimentos
  addInvestment: (inv: Omit<Investment, "id">) => void;
  updateInvestment: (id: string, patch: Partial<Investment>) => void;
  deleteInvestment: (id: string) => void;

  // Ações — Alertas
  dismissAlert: (id: string) => void;

  // Ações — Regras
  addAutoRule: (rule: Omit<AutoRule, "id" | "appliedCount" | "createdAt">) => void;

  // Persistência e Backup (Fase 2)
  exportBackup: () => string;
  importBackup: (jsonContent: string) => boolean;
  resetToMock: () => void;
  loadDemoData: () => void;
  resetToClean: () => void;
  isLoaded: boolean;

  // Indicadores de Mercado (Fase 2)
  economicIndicators: EconomicIndicators | null;
  marketQuotes: MarketQuote[];
  syncMarketData: () => Promise<void>;
  isMarketLoading: boolean;

  // Desendividamento
  debtStrategy: "snowball" | "avalanche";
  setDebtStrategy: (s: "snowball" | "avalanche") => void;
  debtExtraMonthly: number;
  setDebtExtraMonthly: (v: number) => void;
  debtPlan: DebtPlan;
  debtPlanAlt: DebtPlan; // Plano alternativo (outra estratégia) para comparação

  // Métricas derivadas
  patrimonioLiquido: number;
  patrimonioAtivo: number;
  patrimonioPassivo: number;
  saldoDisponivelTotal: number;
  totalDividas: number;
  totalInvestimentos: number;
  currentMonthSummary: MonthlySummary;
  last6MonthsSummary: MonthlySummary[];
  reservaEmergencia: { current: number; target: number; targetMonths: number; percent: number };

  // Segurança & LGPD
  isEncryptedStorage: boolean;
  purgeAllUserData: () => Promise<void>;
  sessionUser: { id: string; name: string; email: string; role?: string } | null;
  authMethod: string | null;
  authChecked: boolean;
  checkSession: () => Promise<void>;
  setSession: (user: { id: string; name: string; email: string; role?: string }, method: string) => void;
  logout: () => Promise<void>;

  showAdminModal: boolean;
  setShowAdminModal: (open: boolean) => void;
  // Navegação
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// ─── Tabs ─────────────────────────────────────────────────────────────────────

export type TabType =
  | "dashboard"
  | "contas"
  | "extrato"
  | "alertas"
  | "dividas"
  | "investimentos";

// ─── Provider ─────────────────────────────────────────────────────────────────

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  // Inicialização LIMPA para entrada em produção real
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [autoRules, setAutoRules] = useState<AutoRule[]>(INITIAL_AUTO_RULES);
  const [debtStrategy, setDebtStrategy] = useState<"snowball" | "avalanche">("avalanche");
  const [debtExtraMonthly, setDebtExtraMonthly] = useState<number>(500);
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);

  // Mercado & Indicadores (Fase 2)
  const [economicIndicators, setEconomicIndicators] = useState<EconomicIndicators | null>({
    selic: 10.75,
    cdi: 10.65,
    ipca12m: 4.24,
    lastUpdated: new Date().toISOString(),
  });
  const [marketQuotes, setMarketQuotes] = useState<MarketQuote[]>([]);
  const [isMarketLoading, setIsMarketLoading] = useState<boolean>(false);

  // Segurança, Criptografia e Autenticação
  const [isEncryptedStorage] = useState<boolean>(true);
  const [sessionUser, setSessionUser] = useState<{ id: string; name: string; email: string; role?: string } | null>(null);
  const [authMethod, setAuthMethod] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  const STORAGE_KEY = "vertice_finance_data_v2";

  // Verificar sessão HttpOnly no backend
  const checkSession = async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setSessionUser(data.user);
          setAuthMethod(data.method || "Senha Mestre (PBKDF2)");
          return;
        }
      }
    } catch {
      // offline fallback
    } finally {
      setAuthChecked(true);
    }
    setSessionUser(null);
    setAuthMethod(null);
  };

  const setSession = (user: { id: string; name: string; email: string; role?: string }, method: string) => {
    setSessionUser(user);
    setAuthMethod(method);
    setAuthChecked(true);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
    } catch {}
    setSessionUser(null);
    setAuthMethod(null);
  };

  // Bloqueio automático por inatividade de 15 minutos (Padrão Bancário)
  useEffect(() => {
    if (!sessionUser) return;
    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        logout();
      }, 15 * 60 * 1000);
    };

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    events.forEach((ev) => window.addEventListener(ev, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
  }, [sessionUser]);

  // LGPD Art. 18: Direito ao Esquecimento / Eliminação Completa de Dados
  const purgeAllUserData = async () => {
    // 1. Revoga na Pluggy quaisquer conexões ativas
    for (const acc of accounts) {
      if (acc.pluggyItemId) {
        try {
          await fetch("/api/pluggy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "delete_item", itemId: acc.pluggyItemId }),
          });
        } catch (e) {
          console.warn("Falha ao revogar item Pluggy:", e);
        }
      }
    }
    // 2. Limpa dados locais (todas as versões)
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("vertice_finance_data_v1");
    }
    // 3. Encerra sessão segura
    await logout();
    // 4. Zera o estado da aplicação
    setAccounts([]);
    setTransactions([]);
    setDebts([]);
    setInvestments([]);
    setBudgets([]);
    setAutoRules([]);
  };

  // Hidratação LocalStorage com Criptografia Zero-Knowledge
  useEffect(() => {
    checkSession();
    try {
      if (typeof window !== "undefined") {
        // Limpa versão v1 legada com dados fictícios anteriores
        if (localStorage.getItem("vertice_finance_data_v1")) {
          localStorage.removeItem("vertice_finance_data_v1");
        }

        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          decryptData(stored)
            .then((parsed) => {
              if (parsed) {
                // Detecção de mock legado (ex: 'Nubank Conta' ou ID acc-1): purga para iniciar limpo
                const isLegacyMock = Array.isArray(parsed.accounts) && parsed.accounts.some((a: any) => a.id === "acc-1" || a.name === "Nubank Conta");
                if (isLegacyMock) {
                  localStorage.removeItem(STORAGE_KEY);
                  setAccounts([]);
                  setTransactions([]);
                  setDebts([]);
                  setInvestments([]);
                  return;
                }

                if (Array.isArray(parsed.accounts)) setAccounts(parsed.accounts);
                if (Array.isArray(parsed.transactions)) setTransactions(parsed.transactions);
                if (Array.isArray(parsed.debts)) setDebts(parsed.debts);
                if (Array.isArray(parsed.investments)) setInvestments(parsed.investments);
                if (Array.isArray(parsed.budgets)) setBudgets(parsed.budgets);
                if (Array.isArray(parsed.autoRules)) setAutoRules(parsed.autoRules);
                if (parsed.debtStrategy === "snowball" || parsed.debtStrategy === "avalanche") {
                  setDebtStrategy(parsed.debtStrategy);
                }
                if (typeof parsed.debtExtraMonthly === "number") {
                  setDebtExtraMonthly(parsed.debtExtraMonthly);
                }
              }
            })
            .catch((e) => console.warn("Erro ao decifrar dados locais:", e))
            .finally(() => setIsLoaded(true));
        } else {
          setIsLoaded(true);
        }
      }
    } catch (e) {
      console.warn("Aviso ao recuperar dados do localStorage:", e);
      setIsLoaded(true);
    }
  }, []);

  // Salvamento contínuo em LocalStorage com Cifragem AES-256-GCM
  useEffect(() => {
    if (!isLoaded) return;
    try {
      if (typeof window !== "undefined") {
        const payload = {
          accounts,
          transactions,
          debts,
          investments,
          budgets,
          autoRules,
          debtStrategy,
          debtExtraMonthly,
          updatedAt: new Date().toISOString(),
        };
        encryptData(payload).then((encrypted) => {
          localStorage.setItem(STORAGE_KEY, encrypted);
        });
      }
    } catch (e) {
      console.warn("Aviso ao gravar no localStorage cifrado:", e);
    }
  }, [
    isLoaded,
    accounts,
    transactions,
    debts,
    investments,
    budgets,
    autoRules,
    debtStrategy,
    debtExtraMonthly,
  ]);

  // Sincronização de Cotações com a API de Mercado (Fase 2)
  const syncMarketData = async () => {
    setIsMarketLoading(true);
    try {
      const res = await fetch("/api/market");
      if (res.ok) {
        const data = await res.json();
        if (data.indicators) setEconomicIndicators(data.indicators);
        if (Array.isArray(data.quotes)) {
          setMarketQuotes(data.quotes);
          // Atualiza cotações atuais nos investimentos se o ticker bater
          const quoteMap = new Map<string, MarketQuote>(
            data.quotes.map((q: MarketQuote) => [q.ticker.toUpperCase(), q])
          );
          setInvestments((prev) =>
            prev.map((inv) => {
              if (inv.ticker && quoteMap.has(inv.ticker.toUpperCase())) {
                const quote = quoteMap.get(inv.ticker.toUpperCase())!;
                const newPrice = quote.price;
                const newCurrentVal = inv.quantity ? inv.quantity * newPrice : inv.currentValue;
                return {
                  ...inv,
                  currentValue: newCurrentVal,
                  notes: `Cotação atualizada: R$ ${newPrice.toFixed(2)} (${quote.changePercent >= 0 ? "+" : ""}${quote.changePercent.toFixed(2)}%)`,
                };
              }
              return inv;
            })
          );
        }
      }
    } catch (e) {
      console.warn("Falha ao sincronizar dados de mercado:", e);
    } finally {
      setIsMarketLoading(false);
    }
  };

  useEffect(() => {
    syncMarketData();
  }, []);

  // ─── Métricas Derivadas ────────────────────────────────────────────────────

  const { ativo, passivo, liquido } = useMemo(
    () => calcularPatrimonioLiquido(accounts, investments, debts),
    [accounts, investments, debts]
  );

  const saldoDisponivelTotal = useMemo(
    () =>
      accounts
        .filter((a) => a.type !== "cartao_credito" && a.type !== "investimento")
        .reduce((acc, a) => acc + a.balance, 0),
    [accounts]
  );

  const totalDividas = useMemo(
    () => debts.reduce((acc, d) => acc + d.currentBalance, 0),
    [debts]
  );

  const totalInvestimentos = useMemo(
    () => investments.reduce((acc, i) => acc + i.currentValue, 0),
    [investments]
  );

  // Resumo do mês selecionado
  const currentMonthSummary = useMemo((): MonthlySummary => {
    const monthTxs = transactions.filter((t) =>
      isWithinMonth(t.date, selectedMonth)
    );
    const totalIncome = monthTxs
      .filter((t) => t.amount > 0)
      .reduce((acc, t) => acc + t.amount, 0);
    const totalExpenses = Math.abs(
      monthTxs.filter((t) => t.amount < 0).reduce((acc, t) => acc + t.amount, 0)
    );

    // Agrupamento por categoria
    const catTotals: Record<string, number> = {};
    monthTxs
      .filter((t) => t.amount < 0)
      .forEach((t) => {
        catTotals[t.categoryId] = (catTotals[t.categoryId] || 0) + Math.abs(t.amount);
      });

    const byCategory = Object.entries(catTotals)
      .map(([categoryId, total]) => {
        const cat = CATEGORIES.find((c) => c.id === categoryId);
        return {
          categoryId,
          categoryName: cat?.name ?? "Outros",
          total,
          percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0,
          color: cat?.color ?? "#94a3b8",
        };
      })
      .sort((a, b) => b.total - a.total);

    return {
      month: selectedMonth,
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      byCategory,
    };
  }, [transactions, selectedMonth]);

  // Últimos 6 meses para gráficos de tendência
  const last6MonthsSummary = useMemo((): MonthlySummary[] => {
    const result: MonthlySummary[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const monthTxs = transactions.filter((t) => isWithinMonth(t.date, month));
      const totalIncome = monthTxs.filter((t) => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
      const totalExpenses = Math.abs(monthTxs.filter((t) => t.amount < 0).reduce((acc, t) => acc + t.amount, 0));
      result.push({
        month,
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        byCategory: [],
      });
    }
    return result;
  }, [transactions]);

  // Reserva de emergência baseada nas despesas médias dos últimos 3 meses
  const reservaEmergencia = useMemo(() => {
    const avgExpenses =
      last6MonthsSummary.slice(-3).reduce((acc, m) => acc + m.totalExpenses, 0) / 3 || 3000;
    return calcularReservaEmergencia(accounts, avgExpenses);
  }, [accounts, last6MonthsSummary]);

  // Planos de desendividamento
  const debtPlan = useMemo(
    () => calcularPlanoDividas(debts, debtStrategy, debtExtraMonthly),
    [debts, debtStrategy, debtExtraMonthly]
  );
  const debtPlanAlt = useMemo(
    () =>
      calcularPlanoDividas(
        debts,
        debtStrategy === "snowball" ? "avalanche" : "snowball",
        debtExtraMonthly
      ),
    [debts, debtStrategy, debtExtraMonthly]
  );

  // ─── Alertas Automáticos ────────────────────────────────────────────────────

  useEffect(() => {
    const newAlerts: Alert[] = [];

    // Alerta: Fatura do cartão vencendo
    accounts.filter((a) => a.type === "cartao_credito").forEach((a) => {
      if (a.dueDate && a.balance < 0) {
        const today = new Date().getDate();
        const daysUntilDue = a.dueDate >= today ? a.dueDate - today : 30 - today + a.dueDate;
        if (daysUntilDue <= 7) {
          newAlerts.push({
            id: `alert-due-${a.id}`,
            title: `Fatura ${a.name} vence em ${daysUntilDue} dia${daysUntilDue !== 1 ? "s" : ""}`,
            description: `Valor da fatura: R$ ${Math.abs(a.balance).toFixed(2).replace(".", ",")}. Pague antes do dia ${a.dueDate} para evitar juros rotativos de 3,5% a.m.`,
            severity: daysUntilDue <= 3 ? "critico" : "atencao",
            category: "fatura",
            date: new Date().toISOString().split("T")[0],
            isDismissed: false,
            actionLabel: "Ver Extrato",
            actionTab: "extrato",
            relatedId: a.id,
          });
        }
      }
    });

    // Alerta: Reserva de emergência abaixo de 100%
    if (reservaEmergencia.percent < 100) {
      newAlerts.push({
        id: "alert-reserva",
        title: "Reserva de Emergência incompleta",
        description: `Você tem ${reservaEmergencia.percent.toFixed(0)}% da reserva ideal (${reservaEmergencia.targetMonths} meses de despesas). Faltam R$ ${(reservaEmergencia.target - reservaEmergencia.current).toFixed(2).replace(".", ",")} para estar protegido.`,
        severity: reservaEmergencia.percent < 50 ? "critico" : "atencao",
        category: "reserva",
        date: new Date().toISOString().split("T")[0],
        isDismissed: false,
        actionLabel: "Ver Investimentos",
        actionTab: "investimentos",
      });
    }

    // Alerta: Dívida com juro alto
    const highInterestDebt = debts.find((d) => d.interestRateMonthly >= 0.03);
    if (highInterestDebt) {
      newAlerts.push({
        id: `alert-highdebt-${highInterestDebt.id}`,
        title: `Juros altos em "${highInterestDebt.name}"`,
        description: `Taxa de ${(highInterestDebt.interestRateMonthly * 100).toFixed(2).replace(".", ",")}% a.m. (${(Math.pow(1 + highInterestDebt.interestRateMonthly, 12) - 1) * 100 > 0 ? ((Math.pow(1 + highInterestDebt.interestRateMonthly, 12) - 1) * 100).toFixed(1).replace(".", ",") : "?"}% a.a.). Esta é a dívida mais cara — priorize no plano de desendividamento.`,
        severity: "critico",
        category: "divida",
        date: new Date().toISOString().split("T")[0],
        isDismissed: false,
        actionLabel: "Ver Plano",
        actionTab: "dividas",
        relatedId: highInterestDebt.id,
      });
    }

    // Alerta: Dica de diversificação de investimentos
    const { calcularRentabilidadeCarteira: _ } = { calcularRentabilidadeCarteira };
    const rfValue = investments
      .filter((i) => i.type === "tesouro_direto" || i.type === "renda_fixa" || i.type === "cdb")
      .reduce((acc, i) => acc + i.currentValue, 0);
    const totalInv = investments.reduce((acc, i) => acc + i.currentValue, 0);
    const rfPercent = totalInv > 0 ? (rfValue / totalInv) * 100 : 0;
    if (rfPercent > 80 && totalInv > 5000) {
      newAlerts.push({
        id: "alert-diversificacao",
        title: "Carteira concentrada em Renda Fixa",
        description: `${rfPercent.toFixed(0)}% do seu portfólio está em renda fixa. Considere diversificar com FIIs ou ações para melhorar a rentabilidade no longo prazo.`,
        severity: "informacao",
        category: "investimento",
        date: new Date().toISOString().split("T")[0],
        isDismissed: false,
        actionLabel: "Ver Carteira",
        actionTab: "investimentos",
      });
    }

    setAlerts((prev) => {
      const dismissedIds = new Set(prev.filter((a) => a.isDismissed).map((a) => a.id));
      return newAlerts.map((a) => ({
        ...a,
        isDismissed: dismissedIds.has(a.id),
      }));
    });
  }, [accounts, debts, investments, reservaEmergencia]);

  // ─── Ações ────────────────────────────────────────────────────────────────

  const addAccount = (account: Omit<Account, "id"> & { id?: string }): string => {
    const newId = account.id || `acc-${Date.now()}`;
    setAccounts((prev) => [
      ...prev,
      { ...account, id: newId },
    ]);
    return newId;
  };

  const updateAccount = (id: string, patch: Partial<Account>) => {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  // ─── Ações — Transações ───────────────────────────────────────────────────

  const addTransaction = (tx: Omit<Transaction, "id">) => {
    const newId = `t-manual-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const categoryId = applyAutoRules(tx.description, autoRules) ?? tx.categoryId;
    const created: Transaction = {
      ...tx,
      id: newId,
      categoryId,
    };

    setTransactions((prev) => [created, ...prev]);

    // Atualiza saldo da conta correspondente
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === tx.accountId) {
          return {
            ...acc,
            balance: acc.balance + tx.amount,
            lastSync: new Date().toISOString(),
          };
        }
        return acc;
      })
    );
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (tx) {
      // Reverte o saldo na conta
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === tx.accountId) {
            return {
              ...acc,
              balance: acc.balance - tx.amount,
            };
          }
          return acc;
        })
      );
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    setTransactions((prev) => prev.filter((t) => t.accountId !== id));
  };

  const deleteInvestment = (id: string) => {
    setInvestments((prev) => prev.filter((i) => i.id !== id));
  };

  const addTransactions = (newTxs: Omit<Transaction, "id">[]) => {
    const withIds = newTxs.map((t) => ({
      ...t,
      id: `t-import-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      categoryId: applyAutoRules(t.description, autoRules) ?? t.categoryId,
    }));
    setTransactions((prev) => {
      const existingIds = new Set(prev.map((t) => t.ofxId).filter(Boolean));
      const filtered = withIds.filter(
        (t) => !t.ofxId || !existingIds.has(t.ofxId)
      );

      // Atualiza saldo das contas baseado nas transações importadas
      if (filtered.length > 0) {
        const deltaByAccount: Record<string, number> = {};
        for (const tx of filtered) {
          deltaByAccount[tx.accountId] = (deltaByAccount[tx.accountId] || 0) + tx.amount;
        }

        setAccounts((prevAccounts) =>
          prevAccounts.map((acc) => {
            if (deltaByAccount[acc.id] !== undefined) {
              return {
                ...acc,
                balance: acc.balance + deltaByAccount[acc.id],
                lastSync: new Date().toISOString(),
              };
            }
            return acc;
          })
        );
      }

      return [...prev, ...filtered].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    });
  };

  const updateTransaction = (id: string, patch: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
    );
  };

  const addDebt = (debt: Omit<Debt, "id">) => {
    setDebts((prev) => [...prev, { ...debt, id: `debt-${Date.now()}` }]);
  };

  const updateDebt = (id: string, patch: Partial<Debt>) => {
    setDebts((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  };

  const deleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  const addInvestment = (inv: Omit<Investment, "id">) => {
    setInvestments((prev) => [...prev, { ...inv, id: `inv-${Date.now()}` }]);
  };

  const updateInvestment = (id: string, patch: Partial<Investment>) => {
    setInvestments((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...patch } : i))
    );
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isDismissed: true } : a))
    );
  };

  const addAutoRule = (rule: Omit<AutoRule, "id" | "appliedCount" | "createdAt">) => {
    const newRule: AutoRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      appliedCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setAutoRules((prev) => [...prev, newRule]);
    // Retroativamente categoriza transações existentes
    setTransactions((prev) =>
      prev.map((t) => {
        if (
          t.description.toLowerCase().includes(rule.pattern.toLowerCase()) &&
          (!rule.accountId || t.accountId === rule.accountId)
        ) {
          return { ...t, categoryId: rule.categoryId, autoRuleId: newRule.id };
        }
        return t;
      })
    );
  };

  // ─── Backup e Restauração (Fase 2) ─────────────────────────────────────────

  const exportBackup = (): string => {
    const data = {
      verticeVersion: "2.0",
      exportDate: new Date().toISOString(),
      accounts,
      transactions,
      debts,
      investments,
      budgets,
      autoRules,
      debtStrategy,
      debtExtraMonthly,
    };
    return JSON.stringify(data, null, 2);
  };

  const importBackup = (jsonContent: string): boolean => {
    try {
      const parsed = JSON.parse(jsonContent);
      if (Array.isArray(parsed.accounts)) setAccounts(parsed.accounts);
      if (Array.isArray(parsed.transactions)) setTransactions(parsed.transactions);
      if (Array.isArray(parsed.debts)) setDebts(parsed.debts);
      if (Array.isArray(parsed.investments)) setInvestments(parsed.investments);
      if (Array.isArray(parsed.budgets)) setBudgets(parsed.budgets);
      if (Array.isArray(parsed.autoRules)) setAutoRules(parsed.autoRules);
      if (parsed.debtStrategy) setDebtStrategy(parsed.debtStrategy);
      if (typeof parsed.debtExtraMonthly === "number") setDebtExtraMonthly(parsed.debtExtraMonthly);
      return true;
    } catch {
      return false;
    }
  };

  const loadDemoData = () => {
    setAccounts(DEMO_ACCOUNTS);
    setTransactions(DEMO_TRANSACTIONS);
    setDebts(DEMO_DEBTS);
    setInvestments(DEMO_INVESTMENTS);
  };

  const resetToClean = () => {
    setAccounts([]);
    setTransactions([]);
    setDebts([]);
    setInvestments([]);
    setBudgets([]);
    setAutoRules([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const resetToMock = loadDemoData;

  return (
    <FinanceContext.Provider
      value={{
        accounts,
        transactions,
        debts,
        investments,
        budgets,
        alerts,
        autoRules,
        categories: CATEGORIES,
        addAccount,
        updateAccount,
        deleteAccount,
        addTransaction,
        addTransactions,
        updateTransaction,
        deleteTransaction,
        addDebt,
        updateDebt,
        deleteDebt,
        addInvestment,
        updateInvestment,
        deleteInvestment,
        dismissAlert,
        addAutoRule,
        debtStrategy,
        setDebtStrategy,
        debtExtraMonthly,
        setDebtExtraMonthly,
        debtPlan,
        debtPlanAlt,
        patrimonioLiquido: liquido,
        patrimonioAtivo: ativo,
        patrimonioPassivo: passivo,
        saldoDisponivelTotal,
        totalDividas,
        totalInvestimentos,
        currentMonthSummary,
        last6MonthsSummary,
        reservaEmergencia,
        activeTab,
        setActiveTab,
        selectedMonth,
        setSelectedMonth,
        exportBackup,
        importBackup,
        resetToMock,
        loadDemoData,
        resetToClean,
        isLoaded,
        economicIndicators,
        marketQuotes,
        syncMarketData,
        isMarketLoading,
        isEncryptedStorage,
        purgeAllUserData,
        sessionUser,
        authMethod,
        authChecked,
        checkSession,
        setSession,
        logout,
        showAdminModal,
        setShowAdminModal,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}

// Mantém retrocompatibilidade com qualquer import antigo de useVertice
export const useVertice = useFinance;
export const VerticeProvider = FinanceProvider;

// ─── Utilitário interno ───────────────────────────────────────────────────────

function applyAutoRules(description: string, rules: AutoRule[]): string | null {
  const desc = description.toLowerCase();
  for (const rule of rules) {
    if (desc.includes(rule.pattern.toLowerCase())) {
      return rule.categoryId;
    }
  }
  return null;
}
