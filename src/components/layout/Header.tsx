"use client";

import React, { useState } from "react";
import {
  Menu,
  Bell,
  RefreshCw,
  Sparkles,
  ChevronDown,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
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
          subtitle: "Visão executiva em tempo real entre operação da empresa e contabilidade.",
        };
      case "integracoes":
        return {
          title: "Central de Integrações & Conectores",
          subtitle: "Conexões ativas com Alterdata, Bancos, Adquirentes e SEFAZ.",
        };
      case "conciliacao":
        return {
          title: "Motor de Conciliação em 4 Vias",
          subtitle: "Cruzamento automatizado: Alterdata ↔ Nota Fiscal ↔ Cartão ↔ Banco.",
        };
      case "pendencias":
        return {
          title: "Central de Pendências & Divergências",
          subtitle: "Identificação proativa do que necessita de intervenção ou validação humana.",
        };
      case "fechamento":
        return {
          title: "Fechamento Contábil Mensal & Pacote",
          subtitle: "Checklist automático e consolidação dos 5 blocos contábeis auditáveis.",
        };
      case "regras":
        return {
          title: "Inteligência Contábil & Regras Memorizadas",
          subtitle: "Redução progressiva do input manual com aprendizado contínuo.",
        };
    }
  };

  const currentTabInfo = getTabTitle(activeTab);

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Left: Mobile button + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsOpenMobile(true)}
          className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div>
          <h1 className="text-base lg:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            {currentTabInfo.title}
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block">
            {currentTabInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Competence Selector + Quick Sync + Notification Bell */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Competence Pill */}
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/70 px-3 py-1.5 rounded-xl text-xs text-slate-200">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-medium hidden sm:inline">Competência:</span>
          <select
            value={selectedCompetence}
            onChange={(e) => setSelectedCompetence(e.target.value)}
            className="bg-transparent font-semibold text-white focus:outline-none cursor-pointer"
          >
            <option value="Agosto / 2026" className="bg-slate-900">Agosto / 2026</option>
            <option value="Julho / 2026" className="bg-slate-900">Julho / 2026</option>
            <option value="Junho / 2026" className="bg-slate-900">Junho / 2026</option>
          </select>
        </div>

        {/* Readiness Pill Status */}
        <button
          onClick={() => setActiveTab("fechamento")}
          className={cn(
            "hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all",
            monthlyClosing.readinessPercent === 100
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
              : "bg-indigo-500/15 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/25"
          )}
        >
          {monthlyClosing.readinessPercent === 100 ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          )}
          <span>{monthlyClosing.readinessPercent}% Pronto p/ Contabilidade</span>
        </button>

        {/* Sync All Button */}
        <button
          onClick={handleSyncAll}
          disabled={isSyncingAny}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
          title="Buscar atualizações de todas as fontes confiáveis agora"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isSyncingAny && "animate-spin")} />
          <span className="hidden sm:inline">
            {isSyncingAny ? "Sincronizando Fontes..." : "Sincronizar Tudo"}
          </span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-slate-800/80 border border-slate-700/70 text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {openIssuesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                {openIssuesCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="font-bold text-sm text-white">Eventos & Sincronizações</span>
                <span className="text-[11px] text-emerald-400 font-semibold">Feed em Tempo Real</span>
              </div>
              <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
                {systemNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40 text-xs flex items-start gap-2.5"
                  >
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full mt-1.5 shrink-0",
                        n.type === "success"
                          ? "bg-emerald-400"
                          : n.type === "warn"
                          ? "bg-amber-400"
                          : "bg-blue-400"
                      )}
                    />
                    <div className="flex-1">
                      <p className="text-slate-200">{n.text}</p>
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
