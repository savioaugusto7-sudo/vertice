"use client";

import React from "react";
import {
  LayoutDashboard,
  Network,
  AlertTriangle,
  GitCompare,
  CalendarCheck,
  Zap,
  ShieldCheck,
  Building,
} from "lucide-react";
import { useVertice } from "@/context/VerticeContext";
import { cn } from "@/lib/utils";

export type TabType =
  | "cockpit"
  | "integracoes"
  | "pendencias"
  | "conciliacao"
  | "fechamento"
  | "regras";

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile,
}: SidebarProps) {
  const { pendingIssues, monthlyClosing } = useVertice();
  const openIssuesCount = pendingIssues.filter((p) => p.status === "aberta").length;

  const navItems = [
    {
      id: "cockpit" as TabType,
      label: "Cockpit Geral",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "integracoes" as TabType,
      label: "Central de Integrações",
      icon: Network,
      badge: "5 Fontes",
      badgeColor: "bg-slate-100 text-slate-700 border border-slate-200",
    },
    {
      id: "conciliacao" as TabType,
      label: "Motor de Conciliação",
      icon: GitCompare,
      badge: "4-Vias",
      badgeColor: "bg-blue-50 text-blue-700 border border-blue-200",
    },
    {
      id: "pendencias" as TabType,
      label: "Central de Pendências",
      icon: AlertTriangle,
      badge: openIssuesCount > 0 ? `${openIssuesCount}` : null,
      badgeColor: "bg-amber-100 text-amber-900 border border-amber-300 font-bold",
    },
    {
      id: "fechamento" as TabType,
      label: "Fechamento Contábil",
      icon: CalendarCheck,
      badge: `${monthlyClosing.readinessPercent}%`,
      badgeColor:
        monthlyClosing.readinessPercent === 100
          ? "bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold"
          : "bg-slate-100 text-slate-800 border border-slate-300 font-bold",
    },
    {
      id: "regras" as TabType,
      label: "Automações & Regras",
      icon: Zap,
      badge: "IA",
      badgeColor: "bg-purple-50 text-purple-700 border border-purple-200",
    },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/30 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 text-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-xs",
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Logo */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center font-black text-white text-lg tracking-tighter shadow-xs">
              ▲
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-slate-950">
                  VÉRTICE
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  INSTITUTIONAL
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Camada Contábil Integrada
              </p>
            </div>
          </div>
        </div>

        {/* Company Active Header */}
        <div className="px-4 py-3 mx-4 my-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Empresa Titular
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Ativa
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900 truncate mt-0.5">
            Vértice Café & Bistrô Ltda
          </p>
          <p className="text-xs text-slate-500 font-mono">
            CNPJ: 34.128.992/0001-04
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Painéis Executivos
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpenMobile(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                  isActive
                    ? "bg-slate-900 text-white font-semibold shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-700"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "text-[11px] px-2 py-0.5 rounded-md font-semibold",
                      isActive ? "bg-slate-800 text-slate-200" : item.badgeColor
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Executive Directive Banner */}
        <div className="p-4 m-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 text-slate-900 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Premissa de Operação
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Zero digitação manual. Cruzamento automático via Alterdata, Open Finance e SEFAZ.
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between bg-slate-50/50">
          <span>Competência</span>
          <span className="font-bold text-slate-900">Agosto/2026</span>
        </div>
      </aside>
    </>
  );
}
