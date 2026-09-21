"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/VerticeContext";
import { formatCurrency, monthlyToAnnualRate } from "@/lib/finance";
import { cn } from "@/lib/utils";
import {
  AlertTriangle, Bell, CheckCircle2, Info, X, ChevronRight,
  ShieldAlert, CreditCard, TrendingDown, Lightbulb, Shield,
} from "lucide-react";
import { Alert } from "@/types";

const SEVERITY_CONFIG = {
  critico: {
    label: "Crítico",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    badgeBg: "bg-red-100 text-red-800 border-red-300",
    icon: ShieldAlert,
    dot: "bg-red-500",
  },
  atencao: {
    label: "Atenção",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    badgeBg: "bg-amber-100 text-amber-800 border-amber-300",
    icon: AlertTriangle,
    dot: "bg-amber-500",
  },
  informacao: {
    label: "Informação",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    badgeBg: "bg-blue-100 text-blue-800 border-blue-300",
    icon: Info,
    dot: "bg-blue-400",
  },
};

const CATEGORY_ICON = {
  fatura: CreditCard,
  orcamento: AlertTriangle,
  divida: TrendingDown,
  investimento: Lightbulb,
  reserva: Shield,
  transacao: Bell,
  dica: Lightbulb,
};

export function AlertasView() {
  const { alerts, dismissAlert, setActiveTab } = useFinance();
  const [filter, setFilter] = useState<"all" | "critico" | "atencao" | "informacao">("all");

  const active = alerts.filter((a) => !a.isDismissed);
  const dismissed = alerts.filter((a) => a.isDismissed);

  const filtered = active.filter((a) => filter === "all" || a.severity === filter);

  const criticalCount = active.filter((a) => a.severity === "critico").length;
  const attentionCount = active.filter((a) => a.severity === "atencao").length;
  const infoCount = active.filter((a) => a.severity === "informacao").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900">Central de Alertas</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {active.length === 0 ? "Tudo em ordem! Nenhum alerta ativo." : `${active.length} alerta${active.length !== 1 ? "s" : ""} ativo${active.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        {active.length === 0 && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-bold text-emerald-700">Financeiro saudável 🎉</span>
          </div>
        )}
      </div>

      {/* Contadores por severidade */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { severity: "critico", label: "Críticos", count: criticalCount, color: "text-red-700", bg: "bg-red-50 border-red-200" },
          { severity: "atencao", label: "Atenção", count: attentionCount, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
          { severity: "informacao", label: "Informações", count: infoCount, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
        ].map((s) => (
          <button
            key={s.severity}
            onClick={() => setFilter(filter === s.severity ? "all" : s.severity as any)}
            className={cn(
              "rounded-2xl border p-4 shadow-xs text-left transition-all hover:scale-105",
              s.bg,
              filter === s.severity && "ring-2 ring-offset-1",
              filter === s.severity && s.severity === "critico" && "ring-red-500",
              filter === s.severity && s.severity === "atencao" && "ring-amber-500",
              filter === s.severity && s.severity === "informacao" && "ring-blue-400",
            )}
          >
            <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            <p className={cn("text-3xl font-black mt-1", s.color)}>{s.count}</p>
          </button>
        ))}
      </div>

      {/* Filtro de tipo */}
      {active.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Filtrar:</span>
          {(["all", "critico", "atencao", "informacao"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors",
                filter === f
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              )}
            >
              {f === "all" ? "Todos" : f === "critico" ? "Crítico" : f === "atencao" ? "Atenção" : "Info"}
            </button>
          ))}
        </div>
      )}

      {/* Lista de alertas */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 shadow-xs">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Sem alertas nessa categoria.</p>
          </div>
        ) : (
          filtered.map((alert) => <AlertCard key={alert.id} alert={alert} onDismiss={dismissAlert} onAction={setActiveTab} />)
        )}
      </div>

      {/* Alertas dispensados */}
      {dismissed.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-400 mb-3">Dispensados ({dismissed.length})</p>
          <div className="space-y-2 opacity-50">
            {dismissed.map((alert) => (
              <div key={alert.id} className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3">
                <X className="w-4 h-4 text-slate-400 shrink-0" />
                <p className="text-xs text-slate-500 flex-1 truncate">{alert.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AlertCard({
  alert,
  onDismiss,
  onAction,
}: {
  alert: Alert;
  onDismiss: (id: string) => void;
  onAction: (tab: any) => void;
}) {
  const cfg = SEVERITY_CONFIG[alert.severity];
  const CatIcon = CATEGORY_ICON[alert.category] ?? Bell;
  const SevIcon = cfg.icon;

  return (
    <div className={cn("rounded-2xl border p-5 shadow-xs transition-all", cfg.bg)}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", cfg.bg.split(" ")[0])}>
          <SevIcon className={cn("w-5 h-5", cfg.color)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className={cn("text-sm font-bold", cfg.color)}>{alert.title}</h3>
            <span className={cn("text-xs px-2 py-0.5 rounded-md border font-semibold", cfg.badgeBg)}>
              {cfg.label}
            </span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{alert.description}</p>

          {/* Actions */}
          {alert.actionLabel && alert.actionTab && (
            <button
              onClick={() => onAction(alert.actionTab)}
              className={cn(
                "mt-3 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors",
                cfg.badgeBg
              )}
            >
              {alert.actionLabel}
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Dismiss */}
        <button
          onClick={() => onDismiss(alert.id)}
          className="text-slate-400 hover:text-slate-700 transition-colors mt-0.5 shrink-0"
          title="Dispensar alerta"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
