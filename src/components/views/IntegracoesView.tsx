"use client";

import React, { useState } from "react";
import { useVertice } from "@/context/VerticeContext";
import { formatDateTime } from "@/lib/utils";
import { Connector } from "@/types";
import {
  Database,
  Building2,
  CreditCard,
  FileCheck,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Shield,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function IntegracoesView() {
  const { connectors, triggerSync, isSyncingAny } = useVertice();
  const [selectedConnector, setSelectedConnector] = useState<Connector>(connectors[0]);
  const [activeTabSub, setActiveTabSub] = useState<"visao" | "logs" | "endpoints">("visao");

  const getConnectorIcon = (name: string) => {
    switch (name) {
      case "Database":
        return Database;
      case "Building2":
        return Building2;
      case "CreditCard":
        return CreditCard;
      case "FileCheck":
        return FileCheck;
      default:
        return Clock;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Hub de Conectores Ativo
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Central de Integrações e Fontes Confiáveis
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Arquitetura desacoplada de ingestão de dados em tempo real para eliminação de digitação manual.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs text-slate-700">
            <span className="text-slate-500">Total Importados:</span>{" "}
            <strong className="text-slate-950 font-mono font-bold">
              {connectors.reduce((acc, c) => acc + c.importedCount, 0).toLocaleString("pt-BR")}
            </strong>
          </div>
        </div>
      </div>

      {/* Grid of Connectors (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {connectors.map((c) => {
          const Icon = getConnectorIcon(c.iconName);
          const isSelected = selectedConnector.id === c.id;

          return (
            <div
              key={c.id}
              onClick={() => setSelectedConnector(c)}
              className={cn(
                "p-5 rounded-xl border transition-all cursor-pointer relative bg-white",
                isSelected
                  ? "border-slate-900 shadow-md ring-1 ring-slate-900"
                  : "border-slate-200 hover:border-slate-300 hover:shadow-xs"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2.5 rounded-lg border",
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      {c.name}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {c.code}
                    </span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  Ativo
                </span>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 mb-4 h-8 leading-relaxed">
                {c.description}
              </p>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-lg bg-slate-50 border border-slate-200/80 text-center mb-4">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                    Importados
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-900">
                    {c.importedCount}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                    Enviados
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700">
                    {c.sentCount}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                    Erros
                  </span>
                  <span
                    className={cn(
                      "text-xs font-mono font-bold",
                      c.errorCount > 0 ? "text-rose-600" : "text-emerald-700"
                    )}
                  >
                    {c.errorCount}
                  </span>
                </div>
              </div>

              {/* Sync Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <span>
                  Última Sync:{" "}
                  <strong className="text-slate-900">
                    {new Date(c.lastSync).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </strong>
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerSync(c.id);
                  }}
                  disabled={c.status === "syncing" || isSyncingAny}
                  className="flex items-center gap-1 text-slate-900 hover:text-slate-700 font-bold transition-colors disabled:opacity-50"
                >
                  <RefreshCw
                    className={cn(
                      "w-3 h-3 text-slate-700",
                      c.status === "syncing" && "animate-spin"
                    )}
                  />
                  <span>
                    {c.status === "syncing" ? "Sincronizando..." : "Sincronizar"}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Connector Detailed Drawer */}
      {selectedConnector && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
          {/* Connector Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-900 border border-slate-200">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedConnector.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                    {selectedConnector.code}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Autenticação: {selectedConnector.authType} • Endpoint:{" "}
                  <code className="text-slate-800 font-mono">
                    {selectedConnector.endpointUrl}
                  </code>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => triggerSync(selectedConnector.id)}
                disabled={selectedConnector.status === "syncing" || isSyncingAny}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw
                  className={cn(
                    "w-3.5 h-3.5",
                    selectedConnector.status === "syncing" && "animate-spin"
                  )}
                />
                <span>
                  {selectedConnector.status === "syncing"
                    ? "Sincronizando..."
                    : "Forçar Reprocessamento Manual"}
                </span>
              </button>
            </div>
          </div>

          {/* Subtabs */}
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <button
              onClick={() => setActiveTabSub("visao")}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                activeTabSub === "visao"
                  ? "bg-slate-100 text-slate-900 border border-slate-200"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              Mapeamento de Dados Sincronizados
            </button>
            <button
              onClick={() => setActiveTabSub("logs")}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5",
                activeTabSub === "logs"
                  ? "bg-slate-100 text-slate-900 border border-slate-200"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <Terminal className="w-3.5 h-3.5" />
              Logs de Execução ({selectedConnector.logs.length})
            </button>
            <button
              onClick={() => setActiveTabSub("endpoints")}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5",
                activeTabSub === "endpoints"
                  ? "bg-slate-100 text-slate-900 border border-slate-200"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <Shield className="w-3.5 h-3.5" />
              Contrato de API & Conexão
            </button>
          </div>

          {/* Tab 1: Mapeamento */}
          {activeTabSub === "visao" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  Entidades Consultadas
                </span>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    Vendas PDV e Faturamento
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    Clientes & Fornecedores (CNPJ/CPF)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    Notas Fiscais de Saída (XML/Chave)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    Plano de Contas Contábil
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  Entidades Enviadas de Volta
                </span>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <ArrowUpRight className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                    Status de Conciliação Bancária
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowUpRight className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                    Ajuste de Taxas MDR de Cartão
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowUpRight className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                    Confirmação de Liquidação D-0
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  Frequência & Gatilhos
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  • <strong>Webhooks em tempo real</strong> a cada nova venda ou cancelamento.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  • <strong>Polling incremental</strong> a cada 3 horas para integridade de dados.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  • <strong>Rastreabilidade</strong> com ID de batch em cada transação.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Logs */}
          {activeTabSub === "logs" && (
            <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs space-y-2.5 max-h-64 overflow-y-auto">
              {selectedConnector.logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 pb-2 border-b border-slate-800 text-slate-300"
                >
                  <span className="text-slate-400 shrink-0">
                    {formatDateTime(log.timestamp)}
                  </span>
                  <span
                    className={cn(
                      "px-1.5 py-0.2 rounded text-[10px] uppercase font-bold shrink-0",
                      log.level === "success"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : log.level === "warn"
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-blue-500/20 text-blue-300"
                    )}
                  >
                    {log.level}
                  </span>
                  <span className="flex-1">{log.message}</span>
                  {log.recordsAffected && (
                    <span className="text-emerald-400 font-bold shrink-0">
                      +{log.recordsAffected} registros
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Endpoints */}
          {activeTabSub === "endpoints" && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-2.5">
              <div className="text-slate-500">
                # Contratos de API do Conector:
              </div>
              <div className="p-2 rounded bg-white border border-slate-200 text-slate-900 font-semibold">
                GET /api/v2/sales?competence=2026-08&status=closed
              </div>
              <div className="p-2 rounded bg-white border border-slate-200 text-slate-900 font-semibold">
                GET /api/v2/invoices/outgoing?since=2026-08-26T00:00:00Z
              </div>
              <div className="p-2 rounded bg-white border border-slate-200 text-slate-900 font-semibold">
                POST /api/v2/reconciliation/status-update (Batch Sync)
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
