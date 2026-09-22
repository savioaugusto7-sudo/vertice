"use client";

import React from "react";
import {
  LayoutDashboard,
  Wallet,
  List,
  Plus,
  TrendingDown,
  TrendingUp,
  Shield,
} from "lucide-react";
import { useFinance, TabType } from "@/context/VerticeContext";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  onOpenNewTx: () => void;
}

export function MobileNav({ onOpenNewTx }: MobileNavProps) {
  const { activeTab, setActiveTab, debts } = useFinance();

  const navButtons: { id: TabType; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "dashboard", label: "Início", icon: LayoutDashboard },
    { id: "contas", label: "Contas", icon: Wallet },
    { id: "extrato", label: "Extrato", icon: List },
    { id: "dividas", label: "Dívidas", icon: TrendingDown, badge: debts.length },
    { id: "investimentos", label: "Ativos", icon: TrendingUp },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 lg:hidden px-3 py-1.5 safe-area-inset-bottom shadow-2xl flex items-center justify-between">
      {navButtons.slice(0, 2).map((b) => {
        const Icon = b.icon;
        const isActive = activeTab === b.id;
        return (
          <button
            key={b.id}
            type="button"
            onClick={() => setActiveTab(b.id)}
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-1 transition-all rounded-xl",
              isActive ? "text-violet-600 font-bold" : "text-slate-500 hover:text-slate-800"
            )}
          >
            <div className={cn("p-1 rounded-xl transition", isActive && "bg-violet-100/70")}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{b.label}</span>
          </button>
        );
      })}

      {/* Botão Central Rápido de Nova Transação */}
      <div className="flex-1 flex justify-center -mt-5">
        <button
          type="button"
          onClick={onOpenNewTx}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 hover:scale-105 active:scale-95 transition"
          aria-label="Nova Transação"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {navButtons.slice(2).map((b) => {
        const Icon = b.icon;
        const isActive = activeTab === b.id;
        return (
          <button
            key={b.id}
            type="button"
            onClick={() => setActiveTab(b.id)}
            className={cn(
              "relative flex flex-col items-center justify-center flex-1 py-1 transition-all rounded-xl",
              isActive ? "text-violet-600 font-bold" : "text-slate-500 hover:text-slate-800"
            )}
          >
            <div className={cn("p-1 rounded-xl transition", isActive && "bg-violet-100/70")}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{b.label}</span>
            {b.badge && b.badge > 0 ? (
              <span className="absolute top-0.5 right-3 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {b.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
