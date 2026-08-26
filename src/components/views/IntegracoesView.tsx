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
  Activity,
  Terminal,
  Shield,
  ExternalLink,
  SlidersHorizontal,
  Layers,
  ArrowDownLeft,
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
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Hub de Conectores Ativo
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Central de Integrações e Fontes Confiáveis
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Arquitetura desacoplada de ingestão de dados em tempo real para eliminação de digitação manual.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800/80 border border-slate-700/60 px-3 py-2 rounded-xl text-xs text-slate-300">
            <span className="text-slate-400">Total Importados:</span>{" "}
            <strong className="text-white font-mono">
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
                "p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group",
                isSelected
                  ? "bg-slate-800/90 border-emerald-500/50 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/30"
                  : "bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-3 rounded-xl border",
                      isSelected
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-slate-800 text-slate-300 border-slate-700"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">
                      {c.name}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {c.code}
                    </span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Conectado
                </span>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 mb-4 h-8">
                {c.description}
              </p>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-center mb-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Importados
                  </span>
                  <span className="text-xs font-mono font-bold text-white">
                    {c.importedCount}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Enviados
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {c.sentCount}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Erros
                  </span>
                  <span
                    className={cn(
                      "text-xs font-mono font-bold",
                      c.errorCount > 0 ? "text-rose-400" : "text-emerald-400"
                    )}
                  >
                    {c.errorCount}
                  </span>
                </div>
              </div>

              {/* Sync Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <span>
                  Última Sync:{" "}
                  <strong className="text-slate-300">
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
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors disabled:opacity-50"
                >
                  <RefreshCw
                    className={cn(
                      "w-3 h-3",
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

      {/* Selected Connector Detailed Drawer / Inspector */}
      {selectedConnector && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          {/* Connector Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">
                    {selectedConnector.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
                    {selectedConnector.code}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Autenticação: {selectedConnector.authType} • Endpoint:{" "}
                  <code className="text-slate-300 font-mono">
                    {selectedConnector.endpointUrl}
                  </code>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => triggerSync(selectedConnector.id)}
                disabled={selectedConnector.status === "syncing" || isSyncingAny}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw
                  className={cn(
                    "w-3.5 h-3.5",
                    selectedConnector.status === "syncing" && "animate-spin"
                  )}
                />
                <span>
                  {selectedConnector.status === "syncing"
                    ? "Executando Sincronização..."
                    : "Forçar Reprocessamento Manual"}
                </span>
              </button>
            </div>
          </div>

          {/* Subtabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTabSub("visao")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                activeTabSub === "visao"
                  ? "bg-slate-800 text-emerald-400 border border-slate-700"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Mapeamento de Dados Sincronizados
            </button>
            <button
              onClick={() => setActiveTabSub("logs")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
                activeTabSub === "logs"
                  ? "bg-slate-800 text-emerald-400 border border-slate-700"
                  : "text-slate-400 hover:text-white"
              )}
            >
              <Terminal className="w-3.5 h-3.5" />
              Logs de Execução ({selectedConnector.logs.length})
            </button>
            <button
              onClick={() => setActiveTabSub("endpoints")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
                activeTabSub === "endpoints"
                  ? "bg-slate-800 text-emerald-400 border border-slate-700"
                  : "text-slate-400 hover:text-white"
              )}
            >
              <Shield className="w-3.5 h-3.5" />
              Contrato de API & Conexão
            </button>
          </div>

          {/* Tab 1: Visão & Mapeamento de Dados */}
          {activeTabSub === "visao" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Entidades Consultadas
                </span>
                <ul className="space-y-1 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Vendas PDV e Faturamento
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Clientes & Fornecedores (CNPJ/CPF)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Notas Fiscais de Saída (XML/Chave)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Plano de Contas Contábil
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  Entidades Enviadas de Volta
                </span>
                <ul className="space-y-1 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
                    Status de Conciliação Bancária
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
                    Ajuste de Taxas MDR de Cartão
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
                    Confirmação de Liquidação D-0
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                  Frequência & Gatilhos
                </span>
                <p className="text-xs text-slate-300">
                  • <strong>Webhooks em tempo real</strong> a cada nova venda ou cancelamento.
                </p>
                <p className="text-xs text-slate-300">
                  • <strong>Polling incremental</strong> a cada 3 horas para integridade de dados.
                </p>
                <p className="text-xs text-slate-300">
                  • <strong>Rastreabilidade</strong> com ID de batch em cada transação.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Logs */}
          {activeTabSub === "logs" && (
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 font-mono text-xs space-y-2.5 max-h-64 overflow-y-auto">
              {selectedConnector.logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 text-slate-300 pb-2 border-b border-slate-900"
                >
                  <span className="text-slate-400 shrink-0">
                    {formatDateTime(log.timestamp)}
                  </span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] uppercase font-bold shrink-0",
                      log.level === "success"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : log.level === "warn"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-blue-500/20 text-blue-400"
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

          {/* Tab 3: Endpoints & API Contract */}
          {activeTabSub === "endpoints" && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-3">
              <div className="text-slate-400">
                # Documentação técnica e rotas consumidas pelo conector:
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-emerald-400">
                GET /api/v2/sales?competence=2026-08&status=closed
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-blue-400">
                GET /api/v2/invoices/outgoing?since=2026-08-26T00:00:00Z
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-purple-400">
                POST /api/v2/reconciliation/status-update (Batch Sync)
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
