"use client";

import React, { useState, useMemo } from "react";
import { useFinance, CATEGORIES } from "@/context/VerticeContext";
import { formatCurrency, formatDate, isWithinMonth } from "@/lib/finance";
import { cn } from "@/lib/utils";
import { Search, Filter, Tag, ChevronDown, Check, Plus, X, Download, Trash2, Wand2 } from "lucide-react";
import { Transaction } from "@/types";
import { TransactionModal } from "@/components/modals/TransactionModal";

export function ExtratoView() {
  const {
    transactions,
    accounts,
    categories,
    selectedMonth,
    updateTransaction,
    deleteTransaction,
    addAutoRule,
    autoRules,
  } = useFinance();

  const [search, setSearch] = useState("");
  const [filterAccount, setFilterAccount] = useState("all");
  const [filterType, setFilterType] = useState<"all" | "receita" | "despesa">("all");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [newRulePattern, setNewRulePattern] = useState("");
  const [newRuleCategoryId, setNewRuleCategoryId] = useState("");
  const [showTxModal, setShowTxModal] = useState(false);

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => isWithinMonth(t.date, selectedMonth))
      .filter((t) => filterAccount === "all" || t.accountId === filterAccount)
      .filter((t) => filterType === "all" || t.type === filterType)
      .filter((t) =>
        !search || t.description.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, selectedMonth, filterAccount, filterType, search]);

  const totalIncome = filtered.filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.amount < 0).reduce((a, t) => a + t.amount, 0);

  const getCategoryById = (id: string) => CATEGORIES.find((c) => c.id === id);
  const getAccountById = (id: string) => accounts.find((a) => a.id === id);

  const handleCategoryChange = (txId: string, catId: string) => {
    updateTransaction(txId, { categoryId: catId });
  };

  const handleCreateRule = () => {
    if (!newRulePattern || !newRuleCategoryId) return;
    addAutoRule({ pattern: newRulePattern, categoryId: newRuleCategoryId });
    setNewRulePattern("");
    setNewRuleCategoryId("");
  };

  const handleExportCSV = () => {
    const headers = ["Data", "Descricao", "Conta", "Categoria", "Tipo", "Valor"];
    const rows = filtered.map((t) => {
      const acc = getAccountById(t.accountId)?.name || "";
      const cat = getCategoryById(t.categoryId)?.name || "";
      return [
        t.date,
        `"${t.description.replace(/"/g, '""')}"`,
        `"${acc}"`,
        `"${cat}"`,
        t.type,
        t.amount.toFixed(2),
      ].join(";");
    });
    const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `extrato-${selectedMonth}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  // Group by date for display
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filtered.forEach((t) => {
      if (!groups[t.date]) groups[t.date] = [];
      groups[t.date].push(t);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Resumo do período */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Receitas no período", value: totalIncome, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
          { label: "Despesas no período", value: Math.abs(totalExpense), color: "text-rose-700", bg: "bg-rose-50 border-rose-200" },
          { label: "Saldo do período", value: totalIncome + totalExpense, color: totalIncome + totalExpense >= 0 ? "text-slate-900" : "text-rose-600", bg: "bg-white border-slate-200" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-2xl border p-4 shadow-xs", s.bg)}>
            <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            <p className={cn("text-xl font-black mt-1", s.color)}>{formatCurrency(s.value)}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar transações..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <select
          value={filterAccount}
          onChange={(e) => setFilterAccount(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="all">Todas as contas</option>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-white">
          {(["all", "receita", "despesa"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setFilterType(v)}
              className={cn(
                "px-4 py-2.5 text-sm font-semibold transition-colors",
                filterType === v ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              {v === "all" ? "Todos" : v === "receita" ? "Receitas" : "Despesas"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition shadow-xs"
            title="Exportar transações filtradas em CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
          <button
            onClick={() => setShowTxModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Transação</span>
          </button>
        </div>
      </div>

      {/* Regras de Auto-categorização */}
      {autoRules.length > 0 && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-3.5 flex flex-wrap items-center gap-2">
          <Tag className="w-4 h-4 text-violet-600 shrink-0" />
          <span className="text-xs font-bold text-violet-700">Regras ativas:</span>
          {autoRules.slice(0, 4).map((r) => {
            const cat = CATEGORIES.find((c) => c.id === r.categoryId);
            return (
              <span key={r.id} className="text-xs bg-violet-100 text-violet-800 border border-violet-200 rounded-lg px-2 py-0.5 font-semibold">
                "{r.pattern}" → {cat?.name ?? "?"}
              </span>
            );
          })}
          {autoRules.length > 4 && <span className="text-xs text-violet-500">+{autoRules.length - 4} mais</span>}
        </div>
      )}

      <div className="flex gap-5">
        {/* Lista de Transações */}
        <div className="flex-1 min-w-0 space-y-4">
          {groupedByDate.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <p className="font-semibold">Nenhuma transação encontrada.</p>
              <p className="text-sm mt-1">Ajuste os filtros ou registre uma nova transação.</p>
            </div>
          ) : (
            groupedByDate.map(([date, txs]) => (
              <div key={date} className="space-y-1">
                <p className="text-xs font-bold text-slate-500 px-1">
                  {new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(new Date(date + "T12:00:00"))}
                </p>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-50 overflow-hidden">
                  {txs.map((tx) => {
                    const cat = getCategoryById(tx.categoryId);
                    const acc = getAccountById(tx.accountId);
                    const isSelected = selectedTx?.id === tx.id;
                    return (
                      <div
                        key={tx.id}
                        onClick={() => setSelectedTx(isSelected ? null : tx)}
                        className={cn(
                          "group w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer",
                          isSelected && "bg-violet-50"
                        )}
                      >
                        {/* Category pill */}
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-black"
                          style={{ background: cat?.color ?? "#94a3b8" }}
                        >
                          {cat?.name.charAt(0) ?? "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{tx.description}</p>
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                            <span className="truncate">{acc?.name ?? "—"}</span>
                            {cat && (
                              <>
                                <span>·</span>
                                <span
                                  className="px-1.5 py-0.5 rounded-md text-white text-xs font-semibold"
                                  style={{ background: cat.color }}
                                >
                                  {cat.name}
                                </span>
                              </>
                            )}
                            {tx.autoRuleId && <span className="text-violet-400 font-medium">• auto</span>}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={cn(
                            "text-sm font-bold",
                            tx.amount > 0 ? "text-emerald-600" : "text-slate-900"
                          )}>
                            {tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount)}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Excluir a transação "${tx.description}"?`)) {
                                deleteTransaction(tx.id);
                                if (selectedTx?.id === tx.id) setSelectedTx(null);
                              }
                            }}
                            className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Excluir transação"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>


        {/* Painel lateral de detalhes */}
        {selectedTx && (
          <div className="w-72 shrink-0 hidden lg:block">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sticky top-20 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Editar Transação</h3>
                <button onClick={() => setSelectedTx(null)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
              </div>

              <div className="space-y-0.5">
                <p className="text-xs text-slate-500">Descrição</p>
                <p className="text-sm font-semibold text-slate-900">{selectedTx.description}</p>
              </div>

              <div className="space-y-0.5">
                <p className="text-xs text-slate-500">Valor</p>
                <p className={cn("text-xl font-black", selectedTx.amount > 0 ? "text-emerald-600" : "text-slate-900")}>
                  {formatCurrency(selectedTx.amount)}
                </p>
              </div>

              {/* Categoria */}
              <div>
                <p className="text-xs font-bold text-slate-700 mb-1.5">Categoria</p>
                <div className="max-h-40 overflow-y-auto space-y-0.5 border border-slate-200 rounded-xl p-1">
                  {CATEGORIES.filter((c) => !c.isIncome || selectedTx.amount > 0).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleCategoryChange(selectedTx.id, c.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors",
                        selectedTx.categoryId === c.id ? "bg-violet-100 text-violet-800" : "hover:bg-slate-50 text-slate-700"
                      )}
                    >
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ background: c.color }} />
                      <span className="flex-1 text-left">{c.name}</span>
                      {selectedTx.categoryId === c.id && <Check className="w-3 h-3 text-violet-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Criar Regra */}
              <div>
                <p className="text-xs font-bold text-slate-700 mb-1.5">Criar Regra Automática</p>
                <input
                  type="text"
                  placeholder="Palavra-chave (ex: IFOOD)"
                  value={newRulePattern}
                  onChange={(e) => setNewRulePattern(e.target.value)}
                  defaultValue={selectedTx.description.split(" ")[0]}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-900 mb-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <select
                  value={newRuleCategoryId}
                  onChange={(e) => setNewRuleCategoryId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-900 mb-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">Selecione a categoria...</option>
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button
                  onClick={handleCreateRule}
                  disabled={!newRulePattern || !newRuleCategoryId}
                  className="w-full px-3 py-2 bg-violet-600 text-white rounded-lg text-xs font-bold hover:bg-violet-700 transition-colors disabled:opacity-50"
                >
                  Salvar Regra
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <TransactionModal
        isOpen={showTxModal}
        onClose={() => setShowTxModal(false)}
      />
    </div>
  );
}

