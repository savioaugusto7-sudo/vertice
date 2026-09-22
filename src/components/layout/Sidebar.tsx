"use client";

import React from "react";
import {
  LayoutDashboard,
  Wallet,
  List,
  Bell,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useFinance, TabType } from "@/context/VerticeContext";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export function Sidebar({ isOpenMobile, setIsOpenMobile }: SidebarProps) {
  const { activeTab, setActiveTab, alerts, debts, sessionUser } = useFinance();

  const activeAlerts = alerts.filter((a) => !a.isDismissed).length;
  const criticalAlerts = alerts.filter(
    (a) => !a.isDismissed && a.severity === "critico"
  ).length;

  const navItems: {
    id: TabType;
    label: string;
    icon: React.ElementType;
    badge?: string | null;
    badgeColor?: string;
  }[] = [
    {
      id: "dashboard",
      label: "Visão Geral",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "contas",
      label: "Minhas Contas",
      icon: Wallet,
      badge: null,
    },
    {
      id: "extrato",
      label: "Extrato Unificado",
      icon: List,
      badge: null,
    },
    {
      id: "alertas",
      label: "Alertas",
      icon: Bell,
      badge: activeAlerts > 0 ? String(activeAlerts) : null,
      badgeColor: criticalAlerts > 0
        ? "bg-red-100 text-red-800 border border-red-300 font-bold"
        : "bg-amber-100 text-amber-900 border border-amber-300 font-bold",
    },
    {
      id: "dividas",
      label: "Desendividamento",
      icon: TrendingDown,
      badge: debts.length > 0 ? String(debts.length) : null,
      badgeColor: "bg-rose-100 text-rose-800 border border-rose-300 font-bold",
    },
    {
      id: "investimentos",
      label: "Investimentos",
      icon: TrendingUp,
      badge: null,
    },
  ];

  const handleNav = (tab: TabType) => {
    setActiveTab(tab);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-slate-200 flex flex-col shadow-lg transition-transform duration-300 ease-in-out",
          isOpenMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-sm">V</span>
            </div>
            <div>
              <span className="font-black text-slate-900 text-base tracking-tight">
                Vértice
              </span>
              <p className="text-xs text-slate-500 font-medium leading-none mt-0.5">
                Finanças Pessoais
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNav(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group",
                      isActive
                        ? "bg-violet-50 text-violet-700 shadow-xs"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4.5 h-4.5 shrink-0 transition-colors",
                        isActive
                          ? "text-violet-600"
                          : "text-slate-400 group-hover:text-slate-600"
                      )}
                    />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          "text-xs px-1.5 py-0.5 rounded-md",
                          item.badgeColor ??
                            "bg-slate-100 text-slate-700 border border-slate-200"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer Textual - Sem Avatar */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          <div className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-900 truncate">
                {sessionUser ? sessionUser.name : "Sávio Augusto"}
              </p>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold uppercase tracking-wider">
                {sessionUser?.role === "admin" ? "Admin" : "Titular"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {sessionUser?.email || "savio@vertice.app"}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
