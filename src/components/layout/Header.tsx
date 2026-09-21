"use client";

import React, { useState } from "react";
import { Menu, Bell, RefreshCw, ChevronLeft, ChevronRight, Plus, ShieldCheck, Database } from "lucide-react";
import { useFinance } from "@/context/VerticeContext";
import { cn, formatCurrency } from "@/lib/utils";
import { TransactionModal } from "@/components/modals/TransactionModal";
import { BackupModal } from "@/components/modals/BackupModal";

interface HeaderProps {
  setIsOpenMobile: (open: boolean) => void;
}

const TAB_INFO: Record<
  string,
  { title: string; subtitle: string }
> = {
  dashboard: {
    title: "Visão Geral & Patrimônio",
    subtitle: "Painel executivo do seu patrimônio líquido, fluxo mensal e saúde financeira.",
  },
  contas: {
    title: "Minhas Contas & Conexões",
    subtitle: "Gerencie bancos, cartões e importações de extrato OFX/CSV.",
  },
  extrato: {
    title: "Extrato Unificado",
    subtitle: "Todas as suas transações em um só lugar, com categorização inteligente.",
  },
  alertas: {
    title: "Central de Alertas",
    subtitle: "Avisos importantes sobre faturas, orçamentos e oportunidades financeiras.",
  },
  dividas: {
    title: "Plano de Desendividamento",
    subtitle: "Motor Snowball & Avalanche: calcule o caminho mais rápido para a liberdade financeira.",
  },
  investimentos: {
    title: "Carteira de Investimentos",
    subtitle: "Acompanhe seu patrimônio investido e receba indicativos baseados no seu perfil.",
  },
};

export function Header({ setIsOpenMobile }: HeaderProps) {
  const {
    activeTab,
    alerts,
    patrimonioLiquido,
    selectedMonth,
    setSelectedMonth,
    syncMarketData,
    isMarketLoading,
  } = useFinance();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);

  const activeAlerts = alerts.filter((a) => !a.isDismissed);
  const criticalCount = activeAlerts.filter((a) => a.severity === "critico").length;

  const tabInfo = TAB_INFO[activeTab] ?? TAB_INFO["dashboard"];

  // Navegar entre meses
  const navigateMonth = (direction: "prev" | "next") => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const date = new Date(year, month - 1 + (direction === "next" ? 1 : -1), 1);
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    setSelectedMonth(newMonth);
  };

  const monthLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(selectedMonth + "-15"));

  const isCurrentMonth =
    selectedMonth ===
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 lg:px-8 py-3 flex items-center justify-between gap-4 shadow-2xs">
      {/* Left: Mobile toggle + Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setIsOpenMobile(true)}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden shrink-0"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="text-violet-600 font-bold">Vértice</span>
            <span>/</span>
            <span className="text-slate-700 font-semibold truncate">
              {tabInfo.title.split("&")[0].trim()}
            </span>
          </div>
          <h1 className="text-sm lg:text-base font-extrabold text-slate-900 tracking-tight truncate">
            {tabInfo.title}
          </h1>
        </div>
      </div>

      {/* Center: Month selector (only on relevant tabs) */}
      {(activeTab === "dashboard" || activeTab === "extrato") && (
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5">
          <button
            onClick={() => navigateMonth("prev")}
            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-900 capitalize min-w-28 text-center">
            {monthLabel}
          </span>
          <button
            onClick={() => navigateMonth("next")}
            disabled={isCurrentMonth}
            className={cn(
              "w-6 h-6 flex items-center justify-center rounded-lg transition-colors",
              isCurrentMonth
                ? "text-slate-300 cursor-not-allowed"
                : "hover:bg-slate-200 text-slate-600"
            )}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Right: Patrimônio + Alerts */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Patrimônio Líquido Pill */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <span className="text-xs text-slate-500 font-medium">Patrimônio Líquido</span>
          <span
            className={cn(
              "text-sm font-black",
              patrimonioLiquido >= 0 ? "text-emerald-700" : "text-rose-600"
            )}
          >
            {formatCurrency(patrimonioLiquido)}
          </span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications((p) => !p)}
            className={cn(
              "relative p-2 rounded-xl border transition-all",
              activeAlerts.length > 0
                ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
            )}
            aria-label="Alertas"
          >
            <Bell className="w-4 h-4" />
            {activeAlerts.length > 0 && (
              <span
                className={cn(
                  "absolute -top-1 -right-1 w-4 h-4 text-xs font-black rounded-full flex items-center justify-center text-white",
                  criticalCount > 0 ? "bg-red-500" : "bg-amber-500"
                )}
              >
                {activeAlerts.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-bold text-slate-900">
                    Alertas Ativos ({activeAlerts.length})
                  </p>
                </div>
                <ul className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                  {activeAlerts.length === 0 ? (
                    <li className="px-4 py-6 text-center text-sm text-slate-500">
                      Nenhum alerta ativo 🎉
                    </li>
                  ) : (
                    activeAlerts.slice(0, 5).map((alert) => (
                      <li key={alert.id} className="px-4 py-3">
                        <div className="flex items-start gap-2.5">
                          <span
                            className={cn(
                              "w-2 h-2 rounded-full mt-1.5 shrink-0",
                              alert.severity === "critico"
                                ? "bg-red-500"
                                : alert.severity === "atencao"
                                ? "bg-amber-500"
                                : "bg-blue-400"
                            )}
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              {alert.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                              {alert.description}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
                {activeAlerts.length > 0 && (
                  <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
                    <button
                      className="text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors"
                      onClick={() => setShowNotifications(false)}
                    >
                      Ver todos os alertas →
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Backup / Dados Button */}
        <button
          onClick={() => setShowBackupModal(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
          title="Backup e Gerenciamento de Dados"
        >
          <Database className="w-3.5 h-3.5 text-slate-600" />
          <span>Dados</span>
        </button>

        {/* Quick Nova Transação Button */}
        <button
          onClick={() => setShowTxModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">Nova Transação</span>
        </button>

        {/* Sync indicator */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-xs font-bold text-emerald-700">Salvo Local</span>
        </div>
      </div>

      {/* Modais Globais */}
      <TransactionModal
        isOpen={showTxModal}
        onClose={() => setShowTxModal(false)}
      />
      <BackupModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
      />
    </header>
  );
}

