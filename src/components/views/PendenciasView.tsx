"use client";

import React, { useState } from "react";
import { useVertice } from "@/context/VerticeContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SourceBadge } from "@/components/common/SourceBadge";
import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Zap,
  Filter,
  Check,
  Building2,
  FileCheck,
  CreditCard,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function PendenciasView() {
  const { pendingIssues, resolveIssue, autoReconcileAll } = useVertice();
  const [filterSeverity, setFilterSeverity] = useState<"all" | "critico" | "atencao" | "sugestao">("all");

  const filteredIssues = pendingIssues.filter((p) => {
    if (filterSeverity === "all") return true;
    return p.severity === filterSeverity;
  });

  const openCount = pendingIssues.filter((p) => p.status === "aberta").length;
  const resolvedCount = pendingIssues.filter((p) => p.status === "resolvida").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Detector de Exceções & IA Contábil
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Central de Pendências Inteligente
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            O usuário não precisa caçar inconsistências em extratos ou notas. O Vértice isola apenas o que exige validação humana e sugere a resolução imediata.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {openCount > 0 ? (
            <button
              onClick={autoReconcileAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Zap className="w-4 h-4" />
              <span>Resolver Todas com 1 Clique</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Todas as pendências sanadas!</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterSeverity("all")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all",
              filterSeverity === "all"
                ? "bg-slate-800 text-emerald-400 border border-slate-700"
                : "text-slate-400 hover:text-white"
            )}
          >
            Todas ({pendingIssues.length})
          </button>
          <button
            onClick={() => setFilterSeverity("critico")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all",
              filterSeverity === "critico"
                ? "bg-slate-800 text-rose-400 border border-slate-700"
                : "text-slate-400 hover:text-white"
            )}
          >
            Críticas
          </button>
          <button
            onClick={() => setFilterSeverity("atencao")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all",
              filterSeverity === "atencao"
                ? "bg-slate-800 text-amber-400 border border-slate-700"
                : "text-slate-400 hover:text-white"
            )}
          >
            Atenção
          </button>
          <button
            onClick={() => setFilterSeverity("sugestao")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all",
              filterSeverity === "sugestao"
                ? "bg-slate-800 text-blue-400 border border-slate-700"
                : "text-slate-400 hover:text-white"
            )}
          >
            Sugestões
          </button>
        </div>

        <div className="text-xs text-slate-400">
          <strong className="text-white font-mono">{openCount}</strong> abertas •{" "}
          <strong className="text-emerald-400 font-mono">{resolvedCount}</strong> resolvidas
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {filteredIssues.map((issue) => {
          const isResolved = issue.status === "resolvida";

          return (
            <div
              key={issue.id}
              className={cn(
                "p-6 rounded-3xl border transition-all duration-300",
                isResolved
                  ? "bg-slate-950/40 border-slate-800/50 opacity-60"
                  : issue.severity === "critico"
                  ? "bg-slate-900/90 border-rose-500/30 hover:border-rose-500/50"
                  : issue.severity === "atencao"
                  ? "bg-slate-900/90 border-amber-500/30 hover:border-amber-500/50"
                  : "bg-slate-900/90 border-blue-500/30 hover:border-blue-500/50"
              )}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                {/* Left side info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {formatDate(issue.date)}
                    </span>
                    <SourceBadge source={issue.source} size="sm" />
                    {issue.severity === "critico" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        Crítico
                      </span>
                    )}
                    {issue.severity === "atencao" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Atenção
                      </span>
                    )}
                    {issue.severity === "sugestao" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        Sugestão
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white">
                    {issue.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {issue.description}
                  </p>

                  {/* AI Resolution Box */}
                  <div className="mt-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-bold text-emerald-400 block">
                        Ação Sugerida pelo Sistema:
                      </span>
                      <p className="text-slate-300 mt-0.5">
                        {issue.suggestedAction}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right side Action */}
                <div className="flex flex-col items-start lg:items-end gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  {issue.amount !== undefined && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        Valor Envolvido
                      </span>
                      <span className="text-base font-mono font-black text-white">
                        {formatCurrency(issue.amount)}
                      </span>
                    </div>
                  )}

                  {!isResolved ? (
                    <button
                      onClick={() => resolveIssue(issue.id)}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{issue.actionLabel}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Resolvida & Memorizada</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
