"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Connector,
  ReconciliationChain,
  PendingIssue,
  MonthlyClosing,
} from "@/types";

interface VerticeContextType {
  selectedCompetence: string;
  setSelectedCompetence: (comp: string) => void;
  connectors: Connector[];
  reconciliations: ReconciliationChain[];
  pendingIssues: PendingIssue[];
  monthlyClosing: MonthlyClosing;
  isSyncingAny: boolean;
  triggerSync: (connectorId: string) => Promise<void>;
  resolveIssue: (issueId: string) => void;
  autoReconcileAll: () => void;
  learnedRules: Array<{ id: string; pattern: string; targetCategory: string; date: string }>;
  systemNotifications: Array<{ id: string; text: string; time: string; type: "info" | "success" | "warn" }>;
}

const initialConnectors: Connector[] = [
  {
    id: "conn-alterdata",
    code: "ALTERDATA_BPE",
    name: "Alterdata ERP (Pack & Bimer)",
    category: "erp",
    description: "Sincronização bidirecional de Vendas, Clientes, Produtos, Fornecedores e Documentos Fiscais.",
    status: "connected",
    lastSync: "2026-08-26T18:42:00",
    nextSync: "2026-08-26T21:42:00",
    importedCount: 1420,
    sentCount: 312,
    errorCount: 0,
    pendingCount: 2,
    iconName: "Database",
    endpointUrl: "https://api.alterdata.com.br/v2/integration/vertice-hub",
    authType: "OAuth2 / Token JWT",
    logs: [
      {
        id: "l-1",
        timestamp: "2026-08-26T18:42:00",
        level: "success",
        message: "Sincronização incremental: 48 vendas e 42 NF-e importadas com sucesso.",
        recordsAffected: 90,
      },
      {
        id: "l-2",
        timestamp: "2026-08-26T15:42:00",
        level: "info",
        message: "Verificação de plano de contas contábil: 100% alinhado.",
      },
    ],
  },
  {
    id: "conn-itau",
    code: "OPEN_FINANCE_ITAU",
    name: "Banco Itaú (Open Finance Brasil)",
    category: "banco",
    description: "Extrato bancário contínuo, conciliação de débitos/créditos, liquidação de boletos e tarifas.",
    status: "connected",
    lastSync: "2026-08-26T18:45:00",
    nextSync: "2026-08-26T19:45:00",
    importedCount: 890,
    sentCount: 0,
    errorCount: 0,
    pendingCount: 1,
    iconName: "Building2",
    endpointUrl: "https://api.itau.com.br/open-banking/v1/accounts",
    authType: "mTLS + Open Finance Consent",
    logs: [
      {
        id: "l-3",
        timestamp: "2026-08-26T18:45:00",
        level: "success",
        message: "Extrato D-0 recebido: 14 novas movimentações bancárias processadas.",
        recordsAffected: 14,
      },
    ],
  },
  {
    id: "conn-stone",
    code: "ADQUIRENTE_STONE",
    name: "Stone Adquirente (Maquininhas & E-commerce)",
    category: "adquirente",
    description: "Importação de transações brutas, apuração automática de taxa MDR e liquidação líquida na conta.",
    status: "connected",
    lastSync: "2026-08-26T18:40:00",
    nextSync: "2026-08-26T19:40:00",
    importedCount: 2310,
    sentCount: 0,
    errorCount: 0,
    pendingCount: 0,
    iconName: "CreditCard",
    endpointUrl: "https://api.stone.com.br/v1/settlements",
    authType: "API Key (Webhook Active)",
    logs: [
      {
        id: "l-4",
        timestamp: "2026-08-26T18:40:00",
        level: "success",
        message: "Lote de liquidação de cartões processado. Taxas MDR segregadas para DRE.",
        recordsAffected: 62,
      },
    ],
  },
  {
    id: "conn-sefaz",
    code: "FISCAL_SEFAZ",
    name: "SEFAZ / Prefeituras (NFe & NFSe)",
    category: "fiscal",
    description: "Monitoramento de Notas Fiscais emitidas e recebidas (DF-e) com download automático de XMLs.",
    status: "connected",
    lastSync: "2026-08-26T18:30:00",
    nextSync: "2026-08-26T20:30:00",
    importedCount: 654,
    sentCount: 0,
    errorCount: 0,
    pendingCount: 1,
    iconName: "FileCheck",
    endpointUrl: "https://dfe-portal.svrs.rs.gov.br/ws/NfeDistribuicaoDFe",
    authType: "Certificado Digital A1",
    logs: [
      {
        id: "l-5",
        timestamp: "2026-08-26T18:30:00",
        level: "success",
        message: "Consulta SEFAZ DF-e: 3 novas NF-e de entrada localizadas e manifestadas.",
        recordsAffected: 3,
      },
    ],
  },
  {
    id: "conn-secullum",
    code: "PONTO_SECULLUM",
    name: "Sistema de Ponto & Folha",
    category: "trabalhista",
    description: "Espelho de ponto, horas extras, adicionais noturnos e fechamento de folha de pagamento.",
    status: "connected",
    lastSync: "2026-08-26T17:15:00",
    nextSync: "2026-08-27T08:00:00",
    importedCount: 38,
    sentCount: 0,
    errorCount: 0,
    pendingCount: 0,
    iconName: "Clock",
    endpointUrl: "https://api.secullum.com.br/v2/pontoweb",
    authType: "Bearer Token",
    logs: [
      {
        id: "l-6",
        timestamp: "2026-08-26T17:15:00",
        level: "success",
        message: "Espelho de ponto importado para 38 colaboradores. Ausências justificadas.",
      },
    ],
  },
];

const initialReconciliations: ReconciliationChain[] = [
  {
    id: "rec-8801",
    competence: "2026-08",
    status: "fully_conciled",
    date: "2026-08-26",
    customerOrVendor: "Distribuidora Minas Express Ltda",
    description: "Venda PDV Balcão - Faturamento e Recebimento Via Cartão de Crédito",
    alterdata: {
      saleId: "VD-2026-10492",
      date: "2026-08-26 14:10",
      amount: 500.0,
      paymentMethod: "Cartão Crédito Stone",
      status: "Finalizada",
    },
    fiscal: {
      nfeNumber: "NFC-e 49201",
      danfeKey: "35260812345678000190650010000492011004829104",
      issueDate: "2026-08-26 14:11",
      amount: 500.0,
      status: "autorizada",
    },
    card: {
      nsu: "STONE-992140",
      acquirer: "Stone Pagamentos",
      brand: "Mastercard",
      grossAmount: 500.0,
      feeAmount: 15.0,
      netAmount: 485.0,
      settlementDate: "2026-08-26",
    },
    bank: {
      transactionId: "ITAU-CRED-881920",
      bankName: "Itaú Unibanco (Ag 0492 / CC 99120-1)",
      entryDate: "2026-08-26 16:30",
      creditedAmount: 485.0,
      account: "Conta Principal",
      conciled: true,
    },
  },
  {
    id: "rec-8802",
    competence: "2026-08",
    status: "fully_conciled",
    date: "2026-08-26",
    customerOrVendor: "Supermercados Horizonte S.A.",
    description: "Fornecimento de Mercadorias - Pedido Corporativo",
    alterdata: {
      saleId: "VD-2026-10493",
      date: "2026-08-26 11:30",
      amount: 4250.0,
      paymentMethod: "PIX PJ Banco Itaú",
      status: "Finalizada",
    },
    fiscal: {
      nfeNumber: "NF-e 8812",
      danfeKey: "35260812345678000190550010000088121009182736",
      issueDate: "2026-08-26 11:32",
      amount: 4250.0,
      status: "autorizada",
    },
    bank: {
      transactionId: "ITAU-PIX-391829",
      bankName: "Itaú Unibanco",
      entryDate: "2026-08-26 11:35",
      creditedAmount: 4250.0,
      account: "Conta Principal",
      conciled: true,
    },
  },
  {
    id: "rec-8803",
    competence: "2026-08",
    status: "partially_conciled",
    date: "2026-08-25",
    customerOrVendor: "TechSol Consultoria & TI",
    description: "Prestação de Serviços de Manutenção de Servidores e Infraestrutura",
    alterdata: {
      saleId: "CP-2026-4421",
      date: "2026-08-25",
      amount: 1200.0,
      paymentMethod: "Transferência TED",
      status: "Conta a Pagar",
    },
    fiscal: {
      nfeNumber: "NFS-e 3192",
      danfeKey: "PREF-SP-2026-NFS-3192",
      issueDate: "2026-08-25",
      amount: 1200.0,
      status: "autorizada",
    },
    divergenceReason: "Comprovante bancário aguardando liquidação no extrato Itaú D+1.",
  },
  {
    id: "rec-8804",
    competence: "2026-08",
    status: "fully_conciled",
    date: "2026-08-25",
    customerOrVendor: "Auto Posto Alvorada Ltda",
    description: "Abastecimento Frota de Entregas - Combustível",
    fiscal: {
      nfeNumber: "NF-e 6672",
      danfeKey: "35260899887766000112550010000066721004123891",
      issueDate: "2026-08-25",
      amount: 340.0,
      status: "autorizada",
    },
    bank: {
      transactionId: "ITAU-DEB-7712",
      bankName: "Itaú Unibanco",
      entryDate: "2026-08-25 18:20",
      creditedAmount: -340.0,
      account: "Conta Principal",
      conciled: true,
    },
  },
];

const initialPendingIssues: PendingIssue[] = [
  {
    id: "pend-1",
    title: "Transação Bancária Itaú sem Categoria Contábil Identificada",
    category: "bancario",
    severity: "atencao",
    description: "Débito de R$ 89,50 no extrato Itaú com descrição 'TAR MANUT CTA COBRANCA'. O sistema sugere classificar como 'Despesas Bancárias (Conta 3.1.2.04)'.",
    date: "2026-08-26",
    amount: 89.5,
    suggestedAction: "Aplicar Regra Automática: 'TAR MANUT CTA' -> Despesas Bancárias",
    actionLabel: "Classificar & Criar Regra",
    source: "banco_itau",
    status: "aberta",
    ruleToLearn: "TAR MANUT CTA -> Despesas Bancárias",
  },
  {
    id: "pend-2",
    title: "NF-e de Entrada #9410 (Embalagens Express) sem Comprovante Anexo",
    category: "fiscal",
    severity: "critico",
    description: "Nota fiscal de R$ 1.840,00 importada via SEFAZ com vencimento em 24/08. Boleto foi pago, mas o comprovante PDF não foi vinculado automaticamente.",
    date: "2026-08-25",
    amount: 1840.0,
    suggestedAction: "Vincular automaticamente ao débito TED Itaú de R$ 1.840,00 de 24/08",
    actionLabel: "Auto-Vincular Transação",
    source: "sefaz_nfe",
    status: "aberta",
  },
  {
    id: "pend-3",
    title: "Divergência de Taxa MDR Stone na Venda Alterdata #10488",
    category: "cartao",
    severity: "sugestao",
    description: "Alterdata provisionou taxa de 2.80% (R$ 8,40), mas a Stone liquidou com taxa contratual de 2.95% (R$ 8,85). Diferença de R$ 0,45 apurada para ajuste no DRE.",
    date: "2026-08-25",
    amount: 0.45,
    suggestedAction: "Ajustar provisionamento de taxa e atualizar tabela de taxas no Alterdata",
    actionLabel: "Ajustar Lançamento",
    source: "stone_card",
    status: "aberta",
  },
];

const initialMonthlyClosing: MonthlyClosing = {
  competence: "Agosto / 2026",
  readinessPercent: 88,
  statusText: "88% — Pronto com 3 pendências menores para revisão",
  stats: {
    totalRevenue: 248900.0,
    totalExpenses: 164200.0,
    reconciledCount: 342,
    pendingCount: 3,
    documentsCount: 418,
  },
  checklist: [
    {
      id: "chk-1",
      title: "Extratos Bancários 100% Conciliados (Itaú / Open Finance)",
      category: "financeiro",
      status: "warning",
      details: "1 lançamento bancário pendente de classificação automática.",
      autoVerified: true,
    },
    {
      id: "chk-2",
      title: "Liquidações de Cartões & Apuração de Taxas MDR (Stone)",
      category: "cartao",
      status: "ok",
      details: "Todas as vendas em cartão liquidadas e confrontadas com o banco.",
      autoVerified: true,
    },
    {
      id: "chk-3",
      title: "Notas Fiscais de Saída x Vendas Alterdata",
      category: "fiscal",
      status: "ok",
      details: "100% das vendas emitiram NFC-e / NF-e com autorização na SEFAZ.",
      autoVerified: true,
    },
    {
      id: "chk-4",
      title: "Notas Fiscais de Entrada x Comprovantes de Pagamento",
      category: "fiscal",
      status: "warning",
      details: "1 NF-e com vinculação de comprovante sugerida.",
      autoVerified: true,
    },
    {
      id: "chk-5",
      title: "Espelho de Ponto & Provisão de Folha Trabalhista",
      category: "trabalhista",
      status: "ok",
      details: "38 colaboradores processados. Horas extras integradas ao fechamento.",
      autoVerified: true,
    },
    {
      id: "chk-6",
      title: "Guias de Tributos & Comprovantes (DARF / FGTS / Simples)",
      category: "documental",
      status: "ok",
      details: "Documentação apurada e pronta para envio à contabilidade.",
      autoVerified: true,
    },
  ],
  packages: {
    financial: { title: "Bloco Financeiro Consolidado (Razão, Extratos, DRE)", count: 890, ready: true, size: "4.2 MB" },
    fiscal: { title: "Bloco Fiscal (XMLs de Entrada/Saída, SPED, DANFEs)", count: 654, ready: true, size: "12.8 MB" },
    labor: { title: "Bloco Trabalhista (Espelhos de Ponto, Folha, GPS)", count: 38, ready: true, size: "1.1 MB" },
    assets: { title: "Bloco Patrimonial (Bens Ativos, Depreciações)", count: 14, ready: true, size: "420 KB" },
    documents: { title: "Bloco Documental (Comprovantes, Contratos, Extratos)", count: 418, ready: true, size: "28.5 MB" },
  },
};

const VerticeContext = createContext<VerticeContextType | undefined>(undefined);

export function VerticeProvider({ children }: { children: React.ReactNode }) {
  const [selectedCompetence, setSelectedCompetence] = useState("Agosto / 2026");
  const [connectors, setConnectors] = useState<Connector[]>(initialConnectors);
  const [reconciliations, setReconciliations] = useState<ReconciliationChain[]>(initialReconciliations);
  const [pendingIssues, setPendingIssues] = useState<PendingIssue[]>(initialPendingIssues);
  const [monthlyClosing, setMonthlyClosing] = useState<MonthlyClosing>(initialMonthlyClosing);
  const [isSyncingAny, setIsSyncingAny] = useState(false);
  const [learnedRules, setLearnedRules] = useState<Array<{ id: string; pattern: string; targetCategory: string; date: string }>>([
    { id: "r-1", pattern: "POSTO COMBUSTIVEL -> Despesas com Combustível", targetCategory: "Despesas com Frotas", date: "2026-08-20" },
    { id: "r-2", pattern: "ENEL DISTRIB -> Energia Elétrica", targetCategory: "Utilidades", date: "2026-08-15" },
  ]);
  const [systemNotifications, setSystemNotifications] = useState<Array<{ id: string; text: string; time: string; type: "info" | "success" | "warn" }>>([
    { id: "n-1", text: "Alterdata sincronizado com 48 novas vendas.", time: "18:42", type: "success" },
    { id: "n-2", text: "Open Finance Itaú atualizado: conciliação D-0 ativa.", time: "18:45", type: "info" },
  ]);

  // Recalculate readiness percent whenever pending issues change
  useEffect(() => {
    const openCount = pendingIssues.filter((p) => p.status === "aberta").length;
    let newPercent = 100;
    if (openCount === 3) newPercent = 88;
    else if (openCount === 2) newPercent = 92;
    else if (openCount === 1) newPercent = 96;
    else if (openCount === 0) newPercent = 100;

    setMonthlyClosing((prev) => ({
      ...prev,
      readinessPercent: newPercent,
      statusText:
        newPercent === 100
          ? "100% — Pacote Contábil 100% Conciliado e Pronto para a Contabilidade!"
          : `${newPercent}% — Existem ${openCount} pendência(s) com resolução sugerida`,
      checklist: prev.checklist.map((item) => {
        if (item.category === "financeiro" && openCount <= 2) {
          return { ...item, status: "ok", details: "Todos os lançamentos bancários conciliados automaticamente." };
        }
        if (item.category === "fiscal" && openCount <= 1) {
          return { ...item, status: "ok", details: "Todas as NF-e vinculadas a comprovantes bancários." };
        }
        return item;
      }),
      stats: {
        ...prev.stats,
        pendingCount: openCount,
      },
    }));
  }, [pendingIssues]);

  const triggerSync = async (connectorId: string) => {
    setIsSyncingAny(true);
    setConnectors((prev) =>
      prev.map((c) => (c.id === connectorId ? { ...c, status: "syncing" } : c))
    );

    // Simulate API roundtrip
    await new Promise((resolve) => setTimeout(resolve, 1400));

    const now = new Date().toISOString();
    setConnectors((prev) =>
      prev.map((c) => {
        if (c.id === connectorId) {
          const newLog = {
            id: `log-${Date.now()}`,
            timestamp: now,
            level: "success" as const,
            message: `Sincronização manual executada com sucesso. Dados mais recentes da fonte ${c.name} obtidos.`,
            recordsAffected: Math.floor(Math.random() * 15) + 5,
          };
          return {
            ...c,
            status: "connected",
            lastSync: now,
            importedCount: c.importedCount + (newLog.recordsAffected || 0),
            logs: [newLog, ...c.logs],
          };
        }
        return c;
      })
    );

    setIsSyncingAny(false);
    setSystemNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        text: `Conector sincronizado com sucesso: novos registros processados automaticamente.`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: "success",
      },
      ...prev,
    ]);
  };

  const resolveIssue = (issueId: string) => {
    const target = pendingIssues.find((p) => p.id === issueId);
    if (!target) return;

    setPendingIssues((prev) =>
      prev.map((p) => (p.id === issueId ? { ...p, status: "resolvida" } : p))
    );

    if (target.ruleToLearn) {
      setLearnedRules((prev) => [
        {
          id: `rule-${Date.now()}`,
          pattern: target.ruleToLearn!,
          targetCategory: "Despesas Bancárias (Conta 3.1.2.04)",
          date: new Date().toISOString().split("T")[0],
        },
        ...prev,
      ]);
    }

    setSystemNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        text: `Pendência resolvida: "${target.title}". Ação executada e regra contábil memorizada!`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: "success",
      },
      ...prev,
    ]);
  };

  const autoReconcileAll = () => {
    setPendingIssues((prev) => prev.map((p) => ({ ...p, status: "resolvida" })));
    setSystemNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        text: "Conciliação global executada: Todas as pendências foram sanadas com as fontes automáticas!",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: "success",
      },
      ...prev,
    ]);
  };

  return (
    <VerticeContext.Provider
      value={{
        selectedCompetence,
        setSelectedCompetence,
        connectors,
        reconciliations,
        pendingIssues,
        monthlyClosing,
        isSyncingAny,
        triggerSync,
        resolveIssue,
        autoReconcileAll,
        learnedRules,
        systemNotifications,
      }}
    >
      {children}
    </VerticeContext.Provider>
  );
}

export function useVertice() {
  const context = useContext(VerticeContext);
  if (!context) {
    throw new Error("useVertice must be used within a VerticeProvider");
  }
  return context;
}
