"use client";

import React, { useState } from "react";
import { useVertice } from "@/context/VerticeContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SourceBadge } from "@/components/common/SourceBadge";
import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  Zap,
  Check,
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
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Detector de Exceções & IA Contábil
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Central de Pendências Inteligente
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            O usuário não precisa caçar inconsistências em extratos ou notas. O Vértice isola apenas o que exige validação humana e sugere a resolução imediata.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {openCount > 0 ? (
            <button
              onClick={autoReconcileAll}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Resolver Todas com 1 Clique</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
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
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
              filterSeverity === "all"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            Todas ({pendingIssues.length})
          </button>
          <button
            onClick={() => setFilterSeverity("critico")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
              filterSeverity === "critico"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            Críticas
          </button>
          <button
            onClick={() => setFilterSeverity("atencao")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
              filterSeverity === "atencao"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            Atenção
          </button>
          <button
            onClick={() => setFilterSeverity("sugestao")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
              filterSeverity === "sugestao"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            Sugestões
          </button>
        </div>

        <div className="text-xs text-slate-500">
          <strong className="text-slate-900 font-mono">{openCount}</strong> abertas •{" "}
          <strong className="text-emerald-700 font-mono">{resolvedCount}</strong> resolvidas
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-3.5">
        {filteredIssues.map((issue) => {
          const isResolved = issue.status === "resolvida";

          return (
            <div
              key={issue.id}
              className={cn(
                "p-5 rounded-xl border transition-all duration-200 bg-white",
                isResolved
                  ? "opacity-60 bg-slate-50 border-slate-200"
                  : issue.severity === "critico"
                  ? "border-rose-300 shadow-xs ring-1 ring-rose-100"
                  : issue.severity === "atencao"
                  ? "border-amber-300 shadow-xs ring-1 ring-amber-100"
                  : "border-slate-200 shadow-xs"
              )}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                {/* Left side info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {formatDate(issue.date)}
                    </span>
                    <SourceBadge source={issue.source} size="sm" />
                    {issue.severity === "critico" && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                        Crítico
                      </span>
                    )}
                    {issue.severity === "atencao" && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                        Atenção
                      </span>
                    )}
                    {issue.severity === "sugestao" && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        Sugestão
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {issue.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {issue.description}
                  </p>

                  {/* AI Resolution Box */}
                  <div className="mt-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 block">
                        Ação Sugerida pelo Sistema:
                      </span>
                      <p className="text-slate-700 mt-0.5">
                        {issue.suggestedAction}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right side Action */}
                <div className="flex flex-col items-start lg:items-end gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  {issue.amount !== undefined && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                        Valor Envolvido
                      </span>
                      <span className="text-base font-mono font-black text-slate-950">
                        {formatCurrency(issue.amount)}
                      </span>
                    </div>
                  )}

                  {!isResolved ? (
                    <button
                      onClick={() => resolveIssue(issue.id)}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs shadow-xs transition-all"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{issue.actionLabel}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
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
