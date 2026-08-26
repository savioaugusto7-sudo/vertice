"use client";

import React from "react";
import { useVertice } from "@/context/VerticeContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SourceBadge } from "@/components/common/SourceBadge";
import { TabType } from "../layout/Sidebar";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Building,
  FileSpreadsheet,
  ArrowUpRight,
  Sparkles,
  Layers,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CockpitViewProps {
  setActiveTab: (tab: TabType) => void;
}

export function CockpitView({ setActiveTab }: CockpitViewProps) {
  const { monthlyClosing, reconciliations, pendingIssues, autoReconcileAll } =
    useVertice();

  const openIssues = pendingIssues.filter((p) => p.status === "aberta");
  const is100Percent = monthlyClosing.readinessPercent === 100;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Executive Hero Banner */}
      <div
        className={cn(
          "rounded-2xl border p-6 lg:p-7 transition-all duration-300 shadow-xs bg-white",
          is100Percent ? "border-emerald-300" : "border-slate-200"
        )}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                Competência: {monthlyClosing.competence}
              </span>
              <span
                className={cn(
                  "px-2.5 py-0.5 rounded-md text-xs font-bold border flex items-center gap-1.5",
                  is100Percent
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-amber-50 text-amber-900 border-amber-200"
                )}
              >
                {is100Percent ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    100% Pronto para Envio à Contabilidade
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                    {openIssues.length} Pendências Requerem Validação
                  </>
                )}
              </span>
            </div>

            <h2 className="text-xl lg:text-2xl font-black text-slate-950 tracking-tight">
              {is100Percent
                ? "Informações Contábeis 100% Conciliadas e Consolidadas"
                : "Camada Contábil em Processamento: 88% de Prontidão"}
            </h2>

            <p className="text-xs lg:text-sm text-slate-600 leading-relaxed">
              {is100Percent
                ? "Todas as vendas do Alterdata, notas da SEFAZ, liquidações da Stone e extratos Itaú foram conferidos. O Pacote Contábil dos 5 blocos está pronto para download ou transmissão direta."
                : "O sistema efetuou a ingestão das fontes confiáveis e identificou 3 divergências menores (taxa de cartão, tarifa bancária e comprovante). Resolva com 1 clique para atingir 100%."}
            </p>
          </div>

          {/* Action & Readiness Gauge */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3.5 shrink-0">
            {/* Progress Gauge */}
            <div className="w-full sm:w-52 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>Índice de Prontidão</span>
                <span className="font-mono text-slate-950 font-black">
                  {monthlyClosing.readinessPercent}%
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-700"
                  style={{ width: `${monthlyClosing.readinessPercent}%` }}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {!is100Percent ? (
                <>
                  <button
                    onClick={() => setActiveTab("pendencias")}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-all active:scale-95"
                  >
                    <span>Ver {openIssues.length} Pendências</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={autoReconcileAll}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
                    title="Aplicar regras de automação em todas as pendências"
                  >
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Auto-Conciliar</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setActiveTab("fechamento")}
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Gerar Pacote Contábil Consolidado</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Faturamento Bruto</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-950 font-mono tracking-tight">
            {formatCurrency(monthlyClosing.stats.totalRevenue)}
          </p>
          <p className="text-xs text-slate-500 pt-1">
            <span className="font-semibold text-emerald-700">100%</span> via Alterdata & SEFAZ
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Lançamentos 4-Vias</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-950 font-mono tracking-tight">
            {monthlyClosing.stats.reconciledCount}{" "}
            <span className="text-sm font-normal text-slate-500">itens</span>
          </p>
          <p className="text-xs text-slate-500 pt-1">
            <span className="font-semibold text-blue-700">Zero</span> digitação manual
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Fontes Conectadas</span>
            <Layers className="w-4 h-4 text-slate-700" />
          </div>
          <p className="text-2xl font-black text-slate-950 font-mono tracking-tight">
            5 / 5{" "}
            <span className="text-sm font-normal text-slate-500">ativas</span>
          </p>
          <p className="text-xs text-slate-500 pt-1">
            Alterdata, Itaú, Stone, SEFAZ, Ponto
          </p>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Documentos Auditados</span>
            <FileSpreadsheet className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-950 font-mono tracking-tight">
            {monthlyClosing.stats.documentsCount}{" "}
            <span className="text-sm font-normal text-slate-500">arquivos</span>
          </p>
          <p className="text-xs text-slate-500 pt-1">
            XMLs, Extratos e Comprovantes
          </p>
        </div>
      </div>

      {/* Corporate Pipeline Flow */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-slate-700" />
              Pipeline de Informação Contábil
            </h3>
            <p className="text-xs text-slate-500">
              Fluxo contínuo e rastreável da operação até a entrega contábil.
            </p>
          </div>
          <button
            onClick={() => setActiveTab("conciliacao")}
            className="text-xs text-slate-900 font-bold hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            Ver Motor 4-Vias <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center">
            <span className="w-6 h-6 rounded-md bg-slate-900 text-white font-bold text-xs flex items-center justify-center mb-2">
              1
            </span>
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Operação Diária
            </span>
            <p className="text-xs text-slate-500 mt-1">
              Vendas PDV, Emissões NF-e e Maquininhas de Cartão.
            </p>
            <span className="mt-2.5 px-2 py-0.5 rounded bg-white text-[10px] text-slate-700 font-semibold border border-slate-200">
              Fontes Confiáveis
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center">
            <span className="w-6 h-6 rounded-md bg-slate-900 text-white font-bold text-xs flex items-center justify-center mb-2">
              2
            </span>
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Ingestão & Sincronização
            </span>
            <p className="text-xs text-slate-500 mt-1">
              Conectores capturam dados D-0 com carimbo de origem.
            </p>
            <span className="mt-2.5 px-2 py-0.5 rounded bg-white text-[10px] text-slate-700 font-semibold border border-slate-200">
              Zero Redigitação
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center">
            <span className="w-6 h-6 rounded-md bg-slate-900 text-white font-bold text-xs flex items-center justify-center mb-2">
              3
            </span>
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Conciliação 4-Vias
            </span>
            <p className="text-xs text-slate-500 mt-1">
              Cruzamento Alterdata ↔ NF-e ↔ Cartão ↔ Banco Itaú.
            </p>
            <span className="mt-2.5 px-2 py-0.5 rounded bg-white text-[10px] text-slate-700 font-semibold border border-slate-200">
              Exceções Isoladas
            </span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col items-center">
            <span className="w-6 h-6 rounded-md bg-emerald-700 text-white font-bold text-xs flex items-center justify-center mb-2">
              4
            </span>
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              Entrega Contábil
            </span>
            <p className="text-xs text-emerald-700 mt-1">
              Pacote contábil auditado nos 5 blocos fundamentais.
            </p>
            <span className="mt-2.5 px-2 py-0.5 rounded bg-emerald-100 text-[10px] text-emerald-800 font-bold border border-emerald-300">
              100% Auditável
            </span>
          </div>
        </div>
      </div>

      {/* Clean Table of Operations */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Últimas Operações Conciliadas com Rastreabilidade
            </h3>
            <p className="text-xs text-slate-500">
              Cada linha apresenta a trilha de proveniência e integridade contábil.
            </p>
          </div>
          <button
            onClick={() => setActiveTab("conciliacao")}
            className="text-xs text-slate-900 font-bold hover:underline"
          >
            Ver Todas ({reconciliations.length})
          </button>
        </div>

        <div className="space-y-2.5">
          {reconciliations.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {formatDate(item.date)}
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {item.customerOrVendor}
                  </span>
                  {item.status === "fully_conciled" ? (
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      100% Conciliado
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                      Parcial
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">{item.description}</p>
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {item.alterdata && <SourceBadge source="alterdata" size="sm" />}
                  {item.fiscal && <SourceBadge source="sefaz_nfe" size="sm" />}
                  {item.card && <SourceBadge source="stone_card" size="sm" />}
                  {item.bank && <SourceBadge source="banco_itau" size="sm" />}
                </div>
              </div>

              <div className="flex items-center justify-between lg:flex-col lg:items-end gap-0.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">
                  Valor Operação
                </span>
                <span className="text-base font-mono font-black text-slate-950">
                  {formatCurrency(
                    item.alterdata?.amount ||
                      item.fiscal?.amount ||
                      item.bank?.creditedAmount ||
                      0
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
