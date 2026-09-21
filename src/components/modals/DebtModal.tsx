"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/VerticeContext";
import { X, TrendingDown, Check } from "lucide-react";
import { DebtType } from "@/types";

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEBT_TYPES: { type: DebtType; label: string }[] = [
  { type: "financiamento", label: "Financiamento" },
  { type: "emprestimo_pessoal", label: "Empréstimo Pessoal" },
  { type: "cartao_credito", label: "Cartão de Crédito" },
  { type: "cheque_especial", label: "Cheque Especial" },
  { type: "consignado", label: "Empréstimo Consignado" },
  { type: "outro", label: "Outro Tipo de Dívida" },
];

export function DebtModal({ isOpen, onClose }: DebtModalProps) {
  const { addDebt } = useFinance();

  const [name, setName] = useState("");
  const [creditor, setCreditor] = useState("");
  const [balanceStr, setBalanceStr] = useState("");
  const [rateStr, setRateStr] = useState("1.50");
  const [paymentStr, setPaymentStr] = useState("");
  const [type, setType] = useState<DebtType>("emprestimo_pessoal");
  const [months, setMonths] = useState("24");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const balance = parseFloat(balanceStr.replace(/\./g, "").replace(",", "."));
    const rateMonthly = parseFloat(rateStr.replace(",", ".")) / 100;
    const minPayment = parseFloat(paymentStr.replace(/\./g, "").replace(",", "."));
    const totalMonths = parseInt(months) || 12;

    if (!name.trim() || isNaN(balance) || balance <= 0 || isNaN(rateMonthly)) return;

    addDebt({
      name: name.trim(),
      creditor: creditor.trim() || "Credor",
      originalAmount: balance,
      currentBalance: balance,
      interestRateMonthly: rateMonthly,
      minimumPayment: isNaN(minPayment) || minPayment <= 0 ? Math.round(balance / totalMonths + balance * rateMonthly) : minPayment,
      totalInstallments: totalMonths,
      remainingInstallments: totalMonths,
      type,
      color: type === "cartao_credito" ? "#f43f5e" : type === "financiamento" ? "#3b82f6" : "#f59e0b",
      iconName: "TrendingDown",
    });


    onClose();
    setName("");
    setCreditor("");
    setBalanceStr("");
    setRateStr("1.50");
    setPaymentStr("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 dark:bg-rose-950/50 rounded-xl text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Cadastrar Dívida</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Adicione empréstimos, financiamentos ou cartões para otimizar amortização
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nome e Credor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Nome da Dívida *
              </label>
              <input
                type="text"
                placeholder="ex: Financiamento HB20"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Banco / Credor *
              </label>
              <input
                type="text"
                placeholder="ex: Santander, Caixa, Nubank"
                value={creditor}
                onChange={(e) => setCreditor(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none dark:text-white"
              />
            </div>
          </div>

          {/* Tipo de Dívida */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Tipo
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as DebtType)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none dark:text-white"
            >
              {DEBT_TYPES.map((dt) => (
                <option key={dt.type} value={dt.type}>
                  {dt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Saldo Devedor Atual */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Saldo Devedor Atual (R$) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">R$</span>
              <input
                type="text"
                placeholder="10.000,00"
                value={balanceStr}
                onChange={(e) => setBalanceStr(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 text-lg font-bold bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none dark:text-white"
              />
            </div>
          </div>

          {/* Taxa de Juros, Parcela Mínima e Meses */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Juros (% a.m.) *
              </label>
              <input
                type="text"
                placeholder="1.49"
                value={rateStr}
                onChange={(e) => setRateStr(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Parcela (R$)
              </label>
              <input
                type="text"
                placeholder="ex: 550,00"
                value={paymentStr}
                onChange={(e) => setPaymentStr(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Meses
              </label>
              <input
                type="number"
                min="1"
                max="360"
                value={months}
                onChange={(e) => setMonths(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none dark:text-white"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-lg shadow-rose-500/20 transition"
            >
              <Check className="w-4 h-4" /> Salvar Dívida
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
