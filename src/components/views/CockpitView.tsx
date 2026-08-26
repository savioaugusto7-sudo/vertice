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
} from "lucide-react";

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
      {/* Hero Readiness Banner */}
      <div
        className={`relative overflow-hidden rounded-3xl border p-6 lg:p-8 transition-all duration-300 ${
          is100Percent
            ? "bg-gradient-to-br from-emerald-950/80 via-slate-900 to-teal-950/70 border-emerald-500/40 shadow-xl shadow-emerald-500/5"
            : "bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-900 border-indigo-500/30 shadow-xl shadow-indigo-500/5"
        }`}
      >
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800/90 text-slate-200 border border-slate-700">
                Competência: {monthlyClosing.competence}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                  is100Percent
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                }`}
              >
                {is100Percent ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    100% Pronto para Contabilidade
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {openIssues.length} Pendências Necessitam Validação
                  </>
                )}
              </span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              {is100Percent
                ? "Sua empresa está com 100% das informações conciliadas!"
                : "Camada Contábil em Processamento: 88% de Prontidão"}
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              {is100Percent
                ? "Todas as vendas do Alterdata, notas da SEFAZ, liquidações da Stone e extratos Itaú foram conferidos e validados. O Pacote Contábil está consolidado e pronto para envio."
                : "O sistema coletou automaticamente as fontes e identificou divergências menores (taxa de cartão, classificação de tarifa bancária e comprovante). Resolva com 1 clique."}
            </p>
          </div>

          {/* Action Button & Gauge */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-4 shrink-0">
            {/* Progress Circular/Bar */}
            <div className="w-full sm:w-48 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60">
              <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                <span>Prontidão Contábil</span>
                <span className="text-emerald-400 font-mono">
                  {monthlyClosing.readinessPercent}%
                </span>
              </div>
              <div className="w-full bg-slate-700/60 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${monthlyClosing.readinessPercent}%` }}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {!is100Percent ? (
                <>
                  <button
                    onClick={() => setActiveTab("pendencias")}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                  >
                    <span>Ver {openIssues.length} Pendências</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={autoReconcileAll}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs transition-all"
                    title="Aplicar sugestões automáticas baseadas em regras confiáveis"
                  >
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>Auto-Conciliar Tudo</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setActiveTab("fechamento")}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/30 transition-all active:scale-95"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Gerar Pacote Contábil Consolidado</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Faturamento Integrado</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">
            {formatCurrency(monthlyClosing.stats.totalRevenue)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-emerald-400 font-semibold">100%</span>
            <span>via Alterdata & SEFAZ</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Conciliação 4-Vias</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">
            {monthlyClosing.stats.reconciledCount}{" "}
            <span className="text-sm font-normal text-slate-400">lançamentos</span>
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-blue-400 font-semibold">0 erro</span>
            <span>de digitação humana</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Fontes Conectadas</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">
            5 / 5{" "}
            <span className="text-sm font-normal text-slate-400">ativas</span>
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-emerald-400 font-semibold">Alterdata, Itaú, Stone, SEFAZ, Ponto</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Documentos Coletados</span>
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">
            {monthlyClosing.stats.documentsCount}{" "}
            <span className="text-sm font-normal text-slate-400">arquivos</span>
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <span>XMLs, DANFEs e Extratos</span>
          </div>
        </div>
      </div>

      {/* Informational Flow: Operação -> Conectores -> Validação -> Contabilidade */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Pipeline Contínuo: Operação da Empresa ➔ Contabilidade
            </h3>
            <p className="text-xs text-slate-400">
              Rastreabilidade de ponta a ponta sem redigitação de planilhas.
            </p>
          </div>
          <button
            onClick={() => setActiveTab("conciliacao")}
            className="text-xs text-emerald-400 font-semibold hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            Ver Motor 4-Vias <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Visual Pipeline Stages */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex flex-col items-center">
            <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center mb-2">
              1
            </span>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Operação Diária
            </span>
            <p className="text-[11px] text-slate-400 mt-1">
              Vendas PDV, Emissões NF-e, Maquininhas de Cartão e Folha.
            </p>
            <span className="mt-3 px-2 py-0.5 rounded bg-slate-700 text-[10px] text-emerald-300 font-medium">
              Fontes Confiáveis
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex flex-col items-center">
            <span className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center mb-2">
              2
            </span>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Ingestão & Sincronização
            </span>
            <p className="text-[11px] text-slate-400 mt-1">
              Conectores capturam dados em D-0 com carimbo de proveniência.
            </p>
            <span className="mt-3 px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-medium">
              Zero Digitação
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex flex-col items-center">
            <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center mb-2">
              3
            </span>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Conciliação 4-Vias
            </span>
            <p className="text-[11px] text-slate-400 mt-1">
              Cruzamento cruzado de Venda ↔ NF-e ↔ Cartão ↔ Banco Itaú.
            </p>
            <span className="mt-3 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-medium">
              Detecção de Exceções
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col items-center">
            <span className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center mb-2">
              4
            </span>
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              Entrega Contábil
            </span>
            <p className="text-[11px] text-slate-300 mt-1">
              Pacote contábil auditado, com DRE, XMLs e extratos integrados.
            </p>
            <span className="mt-3 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              100% Auditável
            </span>
          </div>
        </div>
      </div>

      {/* Live Sample Reconciled Feed */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">
              Últimas Operações Conciliadas com Rastreabilidade
            </h3>
            <p className="text-xs text-slate-400">
              Cada linha exibe a trilha de auditoria e a origem de cada dado.
            </p>
          </div>
          <button
            onClick={() => setActiveTab("conciliacao")}
            className="text-xs text-emerald-400 font-semibold hover:underline"
          >
            Ver Todas ({reconciliations.length})
          </button>
        </div>

        <div className="space-y-3">
          {reconciliations.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 hover:border-slate-600 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {formatDate(item.date)}
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {item.customerOrVendor}
                  </span>
                  {item.status === "fully_conciled" ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Conciliado 4-Vias
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                      Parcial
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">{item.description}</p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {item.alterdata && (
                    <SourceBadge source="alterdata" size="sm" />
                  )}
                  {item.fiscal && (
                    <SourceBadge source="sefaz_nfe" size="sm" />
                  )}
                  {item.card && (
                    <SourceBadge source="stone_card" size="sm" />
                  )}
                  {item.bank && (
                    <SourceBadge source="banco_itau" size="sm" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between lg:flex-col lg:items-end gap-1 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-700/50">
                <span className="text-xs text-slate-400">Valor Operação</span>
                <span className="text-base font-mono font-extrabold text-white">
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
