"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/VerticeContext";
import { X, TrendingUp, Check } from "lucide-react";
import { InvestmentType } from "@/types";

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INV_TYPES: { type: InvestmentType; label: string }[] = [
  { type: "tesouro_direto", label: "Tesouro Direto (Selic / IPCA)" },
  { type: "cdb", label: "CDB / Renda Fixa Bancária" },
  { type: "lci_lca", label: "LCI / LCA (Isento de IR)" },
  { type: "fii", label: "FII (Fundo Imobiliário)" },
  { type: "acao", label: "Ação (B3)" },
  { type: "cripto", label: "Criptoativo" },
  { type: "renda_fixa", label: "Fundo / Renda Fixa" },
  { type: "previdencia", label: "Previdência Privada" },
  { type: "outro", label: "Outro Ativo" },
];

export function InvestmentModal({ isOpen, onClose }: InvestmentModalProps) {
  const { addInvestment, accounts } = useFinance();

  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [type, setType] = useState<InvestmentType>("tesouro_direto");
  const [investedStr, setInvestedStr] = useState("");
  const [currentValStr, setCurrentValStr] = useState("");
  const [quantityStr, setQuantityStr] = useState("");
  const [institution, setInstitution] = useState(accounts.find((a) => a.type === "investimento")?.bank || "Banco Inter");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const invested = parseFloat(investedStr.replace(/\./g, "").replace(",", "."));
    const currentVal = currentValStr
      ? parseFloat(currentValStr.replace(/\./g, "").replace(",", "."))
      : invested;
    const qty = quantityStr ? parseFloat(quantityStr.replace(",", ".")) : undefined;

    if (!name.trim() || isNaN(invested) || invested <= 0) return;

    addInvestment({
      name: name.trim(),
      ticker: ticker.trim().toUpperCase() || undefined,
      type,
      broker: institution.trim() || "Corretora",
      investedAmount: invested,
      currentValue: isNaN(currentVal) ? invested : currentVal,
      quantity: qty,
      currentPrice: qty && qty > 0 ? (isNaN(currentVal) ? invested : currentVal) / qty : undefined,
      incomeRate: type === "cdb" ? 110 : undefined,
      color: type === "fii" ? "#f59e0b" : type === "acao" ? "#ef4444" : "#10b981",
      iconName: "TrendingUp",
    });


    onClose();
    setName("");
    setTicker("");
    setInvestedStr("");
    setCurrentValStr("");
    setQuantityStr("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Adicionar Investimento</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Acompanhe rentabilidade e cotações da sua carteira
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
          {/* Tipo de Ativo */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Classe de Ativo *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as InvestmentType)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
            >
              {INV_TYPES.map((t) => (
                <option key={t.type} value={t.type}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Nome e Ticker */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Nome do Ativo *
              </label>
              <input
                type="text"
                placeholder="ex: Tesouro Selic 2029"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Ticker / Código B3 (opcional)
              </label>
              <input
                type="text"
                placeholder="ex: VALE3, MXRF11"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white uppercase"
              />
            </div>
          </div>

          {/* Valor Investido e Valor Atual */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Valor Investido (R$) *
              </label>
              <input
                type="text"
                placeholder="5.000,00"
                value={investedStr}
                onChange={(e) => setInvestedStr(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Valor Atual (R$)
              </label>
              <input
                type="text"
                placeholder="Igual se em branco"
                value={currentValStr}
                onChange={(e) => setCurrentValStr(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white font-semibold"
              />
            </div>
          </div>

          {/* Quantidade e Instituição */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Quantidade de Cotas/Ações
              </label>
              <input
                type="text"
                placeholder="ex: 100"
                value={quantityStr}
                onChange={(e) => setQuantityStr(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Corretora / Banco
              </label>
              <input
                type="text"
                placeholder="ex: XP, Inter, NuInvest"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
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
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/20 transition"
            >
              <Check className="w-4 h-4" /> Salvar Ativo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
