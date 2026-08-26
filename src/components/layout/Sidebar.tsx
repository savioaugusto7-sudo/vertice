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
  ArrowUpRight,
  BookOpen,
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
      badge: "5 Ativas",
      badgeColor: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    },
    {
      id: "conciliacao" as TabType,
      label: "Motor de Conciliação",
      icon: GitCompare,
      badge: "4-Vias",
      badgeColor: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
    },
    {
      id: "pendencias" as TabType,
      label: "Central de Pendências",
      icon: AlertTriangle,
      badge: openIssuesCount > 0 ? `${openIssuesCount}` : null,
      badgeColor: "bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold",
    },
    {
      id: "fechamento" as TabType,
      label: "Fechamento Contábil",
      icon: CalendarCheck,
      badge: `${monthlyClosing.readinessPercent}%`,
      badgeColor:
        monthlyClosing.readinessPercent === 100
          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold"
          : "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold",
    },
    {
      id: "regras" as TabType,
      label: "Automações & Regras",
      icon: Zap,
      badge: "IA",
      badgeColor: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Logo */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-black text-slate-950 text-xl tracking-tighter">
              ▲
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  VÉRTICE
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  HUB
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Camada Contábil Inteligente
              </p>
            </div>
          </div>
        </div>

        {/* Company Active Header */}
        <div className="px-5 py-3 mx-4 my-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Empresa Conectada
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-sm font-semibold text-white truncate mt-0.5">
            Vértice Café & Bistrô Ltda
          </p>
          <p className="text-xs text-slate-400 font-mono">
            CNPJ: 34.128.992/0001-04
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navegação Principal
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
                  "w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-150 group",
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-colors",
                      isActive
                        ? "text-emerald-400"
                        : "text-slate-400 group-hover:text-slate-200"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium",
                      item.badgeColor || "bg-slate-800 text-slate-300"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Directive Principle Box */}
        <div className="p-4 m-3 rounded-xl bg-gradient-to-b from-slate-800/90 to-slate-800/40 border border-slate-700/60">
          <div className="flex items-center gap-2 text-emerald-400 mb-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Princípio Fundamental
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Input zero do usuário quando a informação puder ser obtida de uma fonte confiável.
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>Competência Atual</span>
          <span className="font-semibold text-emerald-400">Agosto/2026</span>
        </div>
      </aside>
    </>
  );
}
