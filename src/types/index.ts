export type SourceType =
  | "alterdata"
  | "banco_itau"
  | "stone_card"
  | "sefaz_nfe"
  | "ponto_secullum"
  | "upload_ofx"
  | "manual";

export interface SourceMetadata {
  source: SourceType;
  sourceName: string;
  sourceId: string;
  syncBatchId: string;
  syncTimestamp: string;
  trustScore: number; // 0.0 to 1.0 (1.0 = 100% automated reliable source)
  rawPayload?: Record<string, unknown>;
}

export interface ConnectorLog {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  message: string;
  recordsAffected?: number;
}

export interface Connector {
  id: string;
  code: string;
  name: string;
  category: "erp" | "banco" | "adquirente" | "fiscal" | "trabalhista";
  description: string;
  status: "connected" | "syncing" | "error" | "disconnected";
  lastSync: string;
  nextSync: string;
  importedCount: number;
  sentCount: number;
  errorCount: number;
  pendingCount: number;
  iconName: string;
  endpointUrl?: string;
  authType: string;
  logs: ConnectorLog[];
}

export interface ReconciliationChain {
  id: string;
  competence: string;
  status: "fully_conciled" | "partially_conciled" | "divergent" | "pending";
  date: string;
  customerOrVendor: string;
  description: string;
  
  // 4 Vias
  alterdata?: {
    saleId: string;
    date: string;
    amount: number;
    paymentMethod: string;
    status: string;
  };
  fiscal?: {
    nfeNumber: string;
    danfeKey: string;
    issueDate: string;
    amount: number;
    status: "autorizada" | "cancelada" | "pendente";
  };
  card?: {
    nsu: string;
    acquirer: string;
    brand: string;
    grossAmount: number;
    feeAmount: number;
    netAmount: number;
    settlementDate: string;
  };
  bank?: {
    transactionId: string;
    bankName: string;
    entryDate: string;
    creditedAmount: number;
    account: string;
    conciled: boolean;
  };
  
  divergenceReason?: string;
}

export interface PendingIssue {
  id: string;
  title: string;
  category: "bancario" | "fiscal" | "cartao" | "trabalhista" | "documental";
  severity: "critico" | "atencao" | "sugestao";
  description: string;
  date: string;
  amount?: number;
  suggestedAction: string;
  actionLabel: string;
  source: SourceType;
  status: "aberta" | "resolvida";
  ruleToLearn?: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  category: "financeiro" | "fiscal" | "cartao" | "trabalhista" | "documental";
  status: "ok" | "warning" | "pending";
  details: string;
  autoVerified: boolean;
}

export interface MonthlyClosing {
  competence: string;
  readinessPercent: number;
  statusText: string;
  checklist: ChecklistItem[];
  stats: {
    totalRevenue: number;
    totalExpenses: number;
    reconciledCount: number;
    pendingCount: number;
    documentsCount: number;
  };
  packages: {
    financial: { title: string; count: number; ready: boolean; size: string };
    fiscal: { title: string; count: number; ready: boolean; size: string };
    labor: { title: string; count: number; ready: boolean; size: string };
    assets: { title: string; count: number; ready: boolean; size: string };
    documents: { title: string; count: number; ready: boolean; size: string };
  };
}
