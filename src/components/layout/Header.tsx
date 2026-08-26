"use client";

import React, { useState } from "react";
import {
  Menu,
  Bell,
  RefreshCw,
  Sparkles,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { useVertice } from "@/context/VerticeContext";
import { TabType } from "./Sidebar";
import { cn } from "@/lib/utils";

interface HeaderProps {
  activeTab: TabType;
  setIsOpenMobile: (open: boolean) => void;
  setActiveTab: (tab: TabType) => void;
}

export function Header({ activeTab, setIsOpenMobile, setActiveTab }: HeaderProps) {
  const {
    selectedCompetence,
    setSelectedCompetence,
    monthlyClosing,
    pendingIssues,
    isSyncingAny,
    systemNotifications,
    triggerSync,
    connectors,
  } = useVertice();

  const [showNotifications, setShowNotifications] = useState(false);
  const openIssuesCount = pendingIssues.filter((p) => p.status === "aberta").length;

  const handleSyncAll = () => {
    connectors.forEach((c) => {
      triggerSync(c.id);
    });
  };

  const getTabTitle = (tab: TabType) => {
    switch (tab) {
      case "cockpit":
        return {
          title: "Cockpit Geral & Prontidão Contábil",
          subtitle: "Painel de controle executivo entre operação da empresa e contabilidade.",
        };
      case "integracoes":
        return {
          title: "Central de Integrações & Fontes Confiáveis",
          subtitle: "Conectores diretos com Alterdata ERP, Bancos, Adquirentes e SEFAZ.",
        };
      case "conciliacao":
        return {
          title: "Motor de Conciliação em 4 Vias",
          subtitle: "Conferência cruzada: Alterdata ↔ NF-e ↔ Cartão ↔ Extrato Bancário.",
        };
      case "pendencias":
        return {
          title: "Central de Pendências & Exceções",
          subtitle: "Identificação cirúrgica do que necessita de validação humana.",
        };
      case "fechamento":
        return {
          title: "Fechamento Contábil Mensal & Pacote",
          subtitle: "Checklist de integridade e consolidação dos 5 blocos auditáveis.",
        };
      case "regras":
        return {
          title: "Inteligência Contábil & Regras de Automação",
          subtitle: "Redução progressiva de esforço operacional com aprendizado contínuo.",
        };
    }
  };

  const currentTabInfo = getTabTitle(activeTab);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-2xs">
      {/* Left: Mobile toggle + Breadcrumb / Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsOpenMobile(true)}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
          aria-label="Abrir navegação"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <span>Vértice</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">{currentTabInfo.title.split("&")[0]}</span>
          </div>
          <h1 className="text-base lg:text-lg font-extrabold text-slate-900 tracking-tight">
            {currentTabInfo.title}
          </h1>
        </div>
      </div>

      {/* Right: Competence Selector + Quick Sync + Notification */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Competence Selector */}
        <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-xs text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-medium hidden sm:inline text-slate-500">Competência:</span>
          <select
            value={selectedCompetence}
            onChange={(e) => setSelectedCompetence(e.target.value)}
            className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
          >
            <option value="Agosto / 2026">Agosto / 2026</option>
            <option value="Julho / 2026">Julho / 2026</option>
            <option value="Junho / 2026">Junho / 2026</option>
          </select>
        </div>

        {/* Readiness Badge */}
        <button
          onClick={() => setActiveTab("fechamento")}
          className={cn(
            "hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all",
            monthlyClosing.readinessPercent === 100
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
              : "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200"
          )}
        >
          {monthlyClosing.readinessPercent === 100 ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-slate-700" />
          )}
          <span>{monthlyClosing.readinessPercent}% Fechamento Pronto</span>
        </button>

        {/* Sync Button */}
        <button
          onClick={handleSyncAll}
          disabled={isSyncingAny}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50"
          title="Executar sincronização das 5 fontes"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isSyncingAny && "animate-spin")} />
          <span className="hidden sm:inline">
            {isSyncingAny ? "Sincronizando..." : "Sincronizar Fontes"}
          </span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {openIssuesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white font-black text-[10px] flex items-center justify-center">
                {openIssuesCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white border border-slate-200 shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-bold text-sm text-slate-900">Histórico de Eventos</span>
                <span className="text-[11px] text-slate-500 font-semibold">Feed em Tempo Real</span>
              </div>
              <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
                {systemNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-start gap-2.5"
                  >
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full mt-1.5 shrink-0",
                        n.type === "success"
                          ? "bg-emerald-600"
                          : n.type === "warn"
                          ? "bg-amber-600"
                          : "bg-blue-600"
                      )}
                    />
                    <div className="flex-1">
                      <p className="text-slate-800">{n.text}</p>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                        Hoje às {n.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
