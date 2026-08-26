"use client";

import React, { useState } from "react";
import { useVertice } from "@/context/VerticeContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ReconciliationChain } from "@/types";
import { SourceBadge } from "@/components/common/SourceBadge";
import {
  CheckCircle2,
  AlertTriangle,
  Database,
  FileCheck,
  CreditCard,
  Building2,
  Sparkles,
  Search,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ConciliacaoView() {
  const { reconciliations, autoReconcileAll } = useVertice();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "fully_conciled" | "partially_conciled">("all");
  const [selectedChain, setSelectedChain] = useState<ReconciliationChain>(reconciliations[0]);

  const filteredReconciliations = reconciliations.filter((item) => {
    const matchesSearch =
      item.customerOrVendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner with 4-Way Flow Explanation */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-slate-700" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Algoritmo Multi-Fontes
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900">
              Motor de Conciliação em 4 Vias
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              O Vértice cruza a <strong>Venda do Alterdata</strong>, a <strong>Nota Fiscal da SEFAZ</strong>, as <strong>Taxas MDR da Stone</strong> e o <strong>Crédito Bancário Itaú</strong> em tempo real, sem necessidade de digitação humana.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={autoReconcileAll}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Executar Varredura 4-Vias</span>
            </button>
          </div>
        </div>

        {/* 4-Way Visual Chain Example Card */}
        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-3 block">
            Exemplo de Cruzamento Automatizado (Trilha de Auditoria Integral)
          </span>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            {/* Step 1: Alterdata */}
            <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-700" /> 1. Alterdata ERP
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                  Venda
                </span>
              </div>
              <p className="font-mono text-base font-extrabold text-slate-950">R$ 500,00</p>
              <p className="text-slate-500 text-[11px] mt-0.5">VD-2026-10492 • Stone</p>
            </div>

            {/* Step 2: Fiscal */}
            <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-blue-700" /> 2. SEFAZ / DF-e
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                  Fiscal
                </span>
              </div>
              <p className="font-mono text-base font-extrabold text-slate-950">R$ 500,00</p>
              <p className="text-slate-500 text-[11px] mt-0.5">NFC-e 49201 • Autorizada</p>
            </div>

            {/* Step 3: Card */}
            <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-teal-700" /> 3. Stone Adquirente
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                  MDR Tax
                </span>
              </div>
              <p className="font-mono text-base font-extrabold text-slate-950">
                R$ 485,00 <span className="text-xs text-rose-700 font-normal">(-R$ 15,00)</span>
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">Taxa 3.0% • NSU 992140</p>
            </div>

            {/* Step 4: Bank */}
            <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-700" /> 4. Banco Itaú
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                  Liquidado
                </span>
              </div>
              <p className="font-mono text-base font-extrabold text-emerald-800">R$ 485,00</p>
              <p className="text-slate-500 text-[11px] mt-0.5">Crédito D-0 • Conciliado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, documento ou valor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-slate-900 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
              filterStatus === "all"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            Todas ({reconciliations.length})
          </button>
          <button
            onClick={() => setFilterStatus("fully_conciled")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
              filterStatus === "fully_conciled"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            100% Conciliadas
          </button>
          <button
            onClick={() => setFilterStatus("partially_conciled")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
              filterStatus === "partially_conciled"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            Com Pendência
          </button>
        </div>
      </div>

      {/* List of Reconciliations */}
      <div className="space-y-3">
        {filteredReconciliations.map((item) => {
          const isSelected = selectedChain.id === item.id;

          return (
            <div
              key={item.id}
              onClick={() => setSelectedChain(item)}
              className={cn(
                "p-5 rounded-xl border transition-all cursor-pointer bg-white",
                isSelected
                  ? "border-slate-900 shadow-md ring-1 ring-slate-900"
                  : "border-slate-200 hover:border-slate-300"
              )}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-3.5">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {formatDate(item.date)}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">
                      {item.customerOrVendor}
                    </h3>
                    {item.status === "fully_conciled" ? (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        Conciliação Completa
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                        Aguardando Liquidação
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold block">
                      Valor Total
                    </span>
                    <span className="text-lg font-mono font-black text-slate-950">
                      {formatCurrency(
                        item.alterdata?.amount ||
                          item.fiscal?.amount ||
                          item.bank?.creditedAmount ||
                          0
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Pills Flow in row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-xs">
                {/* Alterdata */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">
                      Alterdata ERP
                    </span>
                    <span className="font-mono text-slate-900 text-xs font-bold truncate block">
                      {item.alterdata ? `${item.alterdata.saleId}` : "—"}
                    </span>
                  </div>
                </div>

                {/* Fiscal */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-blue-700 shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">
                      SEFAZ / Fiscal
                    </span>
                    <span className="font-mono text-slate-900 text-xs font-bold truncate block">
                      {item.fiscal ? `${item.fiscal.nfeNumber}` : "—"}
                    </span>
                  </div>
                </div>

                {/* Card */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-teal-700 shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">
                      Adquirente Stone
                    </span>
                    <span className="font-mono text-slate-900 text-xs font-bold truncate block">
                      {item.card ? `Líquido ${formatCurrency(item.card.netAmount)}` : "—"}
                    </span>
                  </div>
                </div>

                {/* Bank */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-700 shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">
                      Itaú Open Finance
                    </span>
                    <span className="font-mono text-slate-900 text-xs font-bold truncate block">
                      {item.bank ? `Creditado ${formatCurrency(item.bank.creditedAmount)}` : "Aguardando"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
