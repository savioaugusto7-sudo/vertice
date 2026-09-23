"use client";

import React, { useState, useMemo } from "react";
import { useFinance, CATEGORIES } from "@/context/VerticeContext";
import { formatCurrency, formatDate, isWithinMonth } from "@/lib/finance";
import { cn } from "@/lib/utils";
import {
  Search,
  Filter,
  Tag,
  ChevronDown,
  ChevronUp,
  Check,
  Plus,
  X,
  Download,
  Trash2,
  Wand2,
  Sparkles,
  Calendar,
  ArrowUpDown,
  SlidersHorizontal,
  Layers,
  AlertCircle,
  RotateCcw,
  Zap,
} from "lucide-react";
import { Transaction } from "@/types";
import { TransactionModal } from "@/components/modals/TransactionModal";

type SmartChip = "all" | "uncategorized" | "pix" | "mercado" | "transporte" | "maiores" | "recorrentes";
type TimeScope = "month" | "30days" | "90days" | "year" | "all";
type SortOption = "date_desc" | "date_asc" | "amount_desc" | "amount_asc" | "alpha";

const SMART_KEYWORDS = {
  pix: ["pix"],
  mercado: ["mercado", "super", "hiper", "horti", "aliment", "ifood", "padaria", "acougue", "feira", "assai", "carrefour", "pao de acucar", "mercearia", "atacad"],
  transporte: ["uber", "99", "posto", "combustivel", "gas", "shell", "ipiranga", "estac", "pedagio", "auto", "sem parar", "veloe"],
  recorrentes: ["spotify", "netflix", "prime", "assin", "seguro", "saude", "plano", "internet", "claro", "vivo", "tim", "mensalidade", "academia", "gympass", "apple", "google storage"],
};

export function ExtratoView() {
  const {
    transactions,
    accounts,
    categories,
    selectedMonth,
    updateTransaction,
    deleteTransaction,
    batchCategorizeTransactions,
    addAutoRule,
    autoRules,
  } = useFinance();

  // Estados de Filtros Principais
  const [search, setSearch] = useState("");
  const [filterAccount, setFilterAccount] = useState("all");
  const [filterType, setFilterType] = useState<"all" | "receita" | "despesa">("all");
  const [timeScope, setTimeScope] = useState<TimeScope>("month");
  const [smartChip, setSmartChip] = useState<SmartChip>("all");

  // Filtros Avançados
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date_desc");

  // Paginação e Detalhes
  const [visibleLimit, setVisibleLimit] = useState(60);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [batchPattern, setBatchPattern] = useState("");
  const [batchCategory, setBatchCategory] = useState("");
  const [batchSuccessMsg, setBatchSuccessMsg] = useState<string | null>(null);
  const [showTxModal, setShowTxModal] = useState(false);

  // Helper para verificar datas relativas
  const now = useMemo(() => new Date(), []);

  // 1. Filtragem por Escopo Temporal (Base para métricas e chips)
  const timeFilteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (timeScope === "all") return true;

      if (timeScope === "month") {
        return isWithinMonth(t.date, selectedMonth);
      }

      const txDate = new Date(t.date + "T12:00:00");

      if (timeScope === "30days") {
        const diffDays = (now.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 30;
      }

      if (timeScope === "90days") {
        const diffDays = (now.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 90;
      }

      if (timeScope === "year") {
        const [yearStr] = selectedMonth.split("-");
        return t.date.startsWith(yearStr || String(now.getFullYear()));
      }

      return true;
    });
  }, [transactions, timeScope, selectedMonth, now]);

  // 2. Contadores em Tempo Real para os Smart Chips
  const chipCounts = useMemo(() => {
    let uncategorized = 0;
    let pix = 0;
    let mercado = 0;
    let transporte = 0;
    let maiores = 0;
    let recorrentes = 0;

    for (const t of timeFilteredTransactions) {
      const desc = t.description.toLowerCase();

      // Sem Categoria / Outros
      if (!t.categoryId || t.categoryId === "cat-outros") {
        uncategorized++;
      }

      // PIX
      if (desc.includes("pix")) {
        pix++;
      }

      // Mercado & Alimentação
      if (SMART_KEYWORDS.mercado.some((k) => desc.includes(k))) {
        mercado++;
      }

      // Transporte
      if (SMART_KEYWORDS.transporte.some((k) => desc.includes(k))) {
        transporte++;
      }

      // Maiores Gastos (> R$ 150)
      if (t.amount <= -150) {
        maiores++;
      }

      // Recorrentes
      if (SMART_KEYWORDS.recorrentes.some((k) => desc.includes(k))) {
        recorrentes++;
      }
    }

    return {
      all: timeFilteredTransactions.length,
      uncategorized,
      pix,
      mercado,
      transporte,
      maiores,
      recorrentes,
    };
  }, [timeFilteredTransactions]);

  // 3. Aplicação de Todos os Filtros e Ordenação
  const filtered = useMemo(() => {
    const minValNum = minValue ? parseFloat(minValue) : null;
    const maxValNum = maxValue ? parseFloat(maxValue) : null;

    const result = timeFilteredTransactions.filter((t) => {
      // Conta
      if (filterAccount !== "all" && t.accountId !== filterAccount) return false;

      // Tipo (receita/despesa)
      if (filterType !== "all" && t.type !== filterType) return false;

      // Categoria Avançada
      if (filterCategory !== "all" && t.categoryId !== filterCategory) return false;

      // Texto de Busca
      if (search) {
        const query = search.toLowerCase();
        const matchDesc = t.description.toLowerCase().includes(query);
        const matchMemo = t.notes?.toLowerCase().includes(query);
        if (!matchDesc && !matchMemo) return false;
      }

      // Faixa de Valores (compara valor absoluto ou real)
      const absAmount = Math.abs(t.amount);
      if (minValNum !== null && !isNaN(minValNum) && absAmount < minValNum) return false;
      if (maxValNum !== null && !isNaN(maxValNum) && absAmount > maxValNum) return false;

      // Smart Chip Ativo
      const desc = t.description.toLowerCase();
      if (smartChip === "uncategorized") {
        if (t.categoryId && t.categoryId !== "cat-outros") return false;
      } else if (smartChip === "pix") {
        if (!desc.includes("pix")) return false;
      } else if (smartChip === "mercado") {
        if (!SMART_KEYWORDS.mercado.some((k) => desc.includes(k))) return false;
      } else if (smartChip === "transporte") {
        if (!SMART_KEYWORDS.transporte.some((k) => desc.includes(k))) return false;
      } else if (smartChip === "maiores") {
        if (t.amount > -150) return false;
      } else if (smartChip === "recorrentes") {
        if (!SMART_KEYWORDS.recorrentes.some((k) => desc.includes(k))) return false;
      }

      return true;
    });

    // Ordenação
    return result.sort((a, b) => {
      if (sortBy === "date_desc") {
        return b.date.localeCompare(a.date) || b.id.localeCompare(a.id);
      }
      if (sortBy === "date_asc") {
        return a.date.localeCompare(b.date) || a.id.localeCompare(b.id);
      }
      if (sortBy === "amount_desc") {
        return Math.abs(b.amount) - Math.abs(a.amount);
      }
      if (sortBy === "amount_asc") {
        return Math.abs(a.amount) - Math.abs(b.amount);
      }
      if (sortBy === "alpha") {
        return a.description.localeCompare(b.description);
      }
      return 0;
    });
  }, [
    timeFilteredTransactions,
    filterAccount,
    filterType,
    filterCategory,
    search,
    minValue,
    maxValue,
    smartChip,
    sortBy,
  ]);

  // Métricas do conjunto filtrado
  const totalIncome = useMemo(
    () => filtered.filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0),
    [filtered]
  );
  const totalExpense = useMemo(
    () => filtered.filter((t) => t.amount < 0).reduce((a, t) => a + t.amount, 0),
    [filtered]
  );

  const getCategoryById = (id: string) => CATEGORIES.find((c) => c.id === id);
  const getAccountById = (id: string) => accounts.find((a) => a.id === id);

  const handleCategoryChange = (txId: string, catId: string) => {
    updateTransaction(txId, { categoryId: catId });
    if (selectedTx?.id === txId) {
      setSelectedTx((prev) => (prev ? { ...prev, categoryId: catId } : null));
    }
  };

  // Quando o usuário seleciona uma transação, pré-preenche o assistente em lote com a palavra-chave
  const handleSelectTx = (tx: Transaction) => {
    if (selectedTx?.id === tx.id) {
      setSelectedTx(null);
      setBatchPattern("");
      setBatchCategory("");
      setBatchSuccessMsg(null);
    } else {
      setSelectedTx(tx);
      // Extrai os primeiros 2 termos significativos
      const words = tx.description
        .replace(/[^a-zA-Z0-9À-ÿ\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2);
      const suggestedPattern = words.slice(0, 2).join(" ") || tx.description.slice(0, 12);
      setBatchPattern(suggestedPattern);
      setBatchCategory(tx.categoryId || "cat-alimentacao");
      setBatchSuccessMsg(null);
    }
  };

  // Contagem de quantas transações bateriam com o padrão digitado no assistente
  const batchMatchingCount = useMemo(() => {
    if (!batchPattern.trim()) return 0;
    const pat = batchPattern.toLowerCase().trim();
    return transactions.filter((t) => t.description.toLowerCase().includes(pat)).length;
  }, [transactions, batchPattern]);

  const handleApplyBatchCategorize = () => {
    if (!batchPattern.trim() || !batchCategory) return;
    const count = batchCategorizeTransactions(batchPattern, batchCategory);
    const catName = getCategoryById(batchCategory)?.name ?? "Categoria";
    setBatchSuccessMsg(`🎉 ${count} transações classificadas como "${catName}" e regra criada!`);
    setTimeout(() => setBatchSuccessMsg(null), 6000);
  };

  const handleResetFilters = () => {
    setSearch("");
    setFilterAccount("all");
    setFilterType("all");
    setSmartChip("all");
    setFilterCategory("all");
    setMinValue("");
    setMaxValue("");
    setSortBy("date_desc");
    setVisibleLimit(60);
  };

  const hasActiveFilters =
    search !== "" ||
    filterAccount !== "all" ||
    filterType !== "all" ||
    smartChip !== "all" ||
    filterCategory !== "all" ||
    minValue !== "" ||
    maxValue !== "" ||
    timeScope !== "month";

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
    link.setAttribute("download", `extrato-filtrado-${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  // Fatiamento por limitação de exibição (mantém React super veloz em 1.000+ linhas)
  const visibleTransactions = useMemo(() => {
    return filtered.slice(0, visibleLimit);
  }, [filtered, visibleLimit]);

  // Agrupamento por data para a lista visível
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    visibleTransactions.forEach((t) => {
      if (!groups[t.date]) groups[t.date] = [];
      groups[t.date].push(t);
    });
    return Object.entries(groups).sort(([a], [b]) => {
      if (sortBy === "date_asc") return a.localeCompare(b);
      return b.localeCompare(a);
    });
  }, [visibleTransactions, sortBy]);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* ── Barra Superior: Resumo e Escopo de Tempo ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-violet-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Período de Análise:</span>
          <div className="flex flex-wrap items-center gap-1">
            {[
              { id: "month", label: "Mês Vigente" },
              { id: "30days", label: "Últimos 30d" },
              { id: "90days", label: "Últimos 90d" },
              { id: "year", label: "Ano Todo" },
              { id: "all", label: "Todo o Histórico" },
            ].map((scope) => (
              <button
                key={scope.id}
                onClick={() => {
                  setTimeScope(scope.id as TimeScope);
                  setVisibleLimit(60);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  timeScope === scope.id
                    ? "bg-violet-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {scope.label}
              </button>
            ))}
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-2 ml-auto">
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold transition"
              title="Limpar todos os filtros"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar Filtros</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition shadow-xs"
            title="Exportar registros filtrados em planilha CSV"
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

      {/* ── Resumo Financeiro do Conjunto Filtrado ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border p-4 shadow-xs bg-emerald-50/80 border-emerald-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Receitas Filtradas
            </p>
            <p className="text-2xl font-black text-emerald-700 mt-1">{formatCurrency(totalIncome)}</p>
          </div>
          <span className="text-xs font-bold px-2 py-1 bg-white/70 text-emerald-700 rounded-lg border border-emerald-200">
            {filtered.filter((t) => t.amount > 0).length} itens
          </span>
        </div>

        <div className="rounded-2xl border p-4 shadow-xs bg-rose-50/80 border-rose-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-rose-800 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              Despesas Filtradas
            </p>
            <p className="text-2xl font-black text-rose-700 mt-1">{formatCurrency(Math.abs(totalExpense))}</p>
          </div>
          <span className="text-xs font-bold px-2 py-1 bg-white/70 text-rose-700 rounded-lg border border-rose-200">
            {filtered.filter((t) => t.amount < 0).length} itens
          </span>
        </div>

        <div className="rounded-2xl border p-4 shadow-xs bg-white border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold">Balanço do Período</p>
            <p
              className={cn(
                "text-2xl font-black mt-1",
                totalIncome + totalExpense >= 0 ? "text-slate-900" : "text-rose-600"
              )}
            >
              {formatCurrency(totalIncome + totalExpense)}
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
            {filtered.length} transações
          </span>
        </div>
      </div>

      {/* ── Chips Inteligentes com Contadores Rápidos ── */}
      <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80 space-y-2">
        <div className="flex items-center gap-2 px-1">
          <Sparkles className="w-4 h-4 text-violet-600" />
          <span className="text-xs font-bold text-slate-700">Filtros Inteligentes de 1-Clique:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "Todas", count: chipCounts.all, color: "hover:bg-slate-200" },
            {
              id: "uncategorized",
              label: "⚠️ Sem Categoria / Outros",
              count: chipCounts.uncategorized,
              badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
              highlight: chipCounts.uncategorized > 0,
            },
            { id: "pix", label: "⚡ PIX", count: chipCounts.pix },
            { id: "mercado", label: "🛒 Mercado & Alimentação", count: chipCounts.mercado },
            { id: "transporte", label: "🚗 Transporte", count: chipCounts.transporte },
            { id: "maiores", label: "💎 Maiores Gastos > R$ 150", count: chipCounts.maiores },
            { id: "recorrentes", label: "🔄 Recorrentes / Assinaturas", count: chipCounts.recorrentes },
          ].map((chip) => {
            const isActive = smartChip === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => {
                  setSmartChip(chip.id as SmartChip);
                  setVisibleLimit(60);
                }}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                  isActive
                    ? "bg-violet-600 border-violet-600 text-white shadow-xs"
                    : chip.highlight
                    ? "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                )}
              >
                <span>{chip.label}</span>
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-md text-[10px] font-black",
                    isActive
                      ? "bg-violet-800/80 text-violet-100"
                      : chip.badgeColor
                      ? chip.badgeColor
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Linha Principal de Filtros e Busca ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Campo de Busca */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por descrição, estabelecimento ou anotação..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisibleLimit(60);
            }}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-xs"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Conta Bancária */}
        <select
          value={filterAccount}
          onChange={(e) => {
            setFilterAccount(e.target.value);
            setVisibleLimit(60);
          }}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-xs font-medium"
        >
          <option value="all">Todas as contas ({accounts.length})</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        {/* Tipo: Receita / Despesa */}
        <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs">
          {(["all", "receita", "despesa"] as const).map((v) => (
            <button
              key={v}
              onClick={() => {
                setFilterType(v);
                setVisibleLimit(60);
              }}
              className={cn(
                "px-3.5 py-2.5 text-xs font-bold transition-colors",
                filterType === v ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              {v === "all" ? "Todos" : v === "receita" ? "Receitas" : "Despesas"}
            </button>
          ))}
        </div>

        {/* Ordenação */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="date_desc">Mais recentes</option>
            <option value="date_asc">Mais antigas</option>
            <option value="amount_desc">Maior valor</option>
            <option value="amount_asc">Menor valor</option>
            <option value="alpha">Descrição (A-Z)</option>
          </select>
        </div>

        {/* Botão de Filtros Avançados */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2.5 border rounded-xl text-xs font-bold transition shadow-xs",
            showAdvanced || filterCategory !== "all" || minValue || maxValue
              ? "bg-violet-50 border-violet-300 text-violet-700"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          )}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filtros Detalhados</span>
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* ── Painel Expansível de Filtros Avançados ── */}
      {showAdvanced && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Categoria Específica */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Categoria Específica</label>
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setVisibleLimit(60);
                }}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-violet-500"
              >
                <option value="all">Todas as categorias</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Faixa de Valores */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Faixa de Valor (R$)
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="number"
                  placeholder="Min (ex: 50)"
                  value={minValue}
                  onChange={(e) => setMinValue(e.target.value)}
                  className="w-32 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-violet-500"
                />
                <span className="text-slate-400 text-xs">até</span>
                <input
                  type="number"
                  placeholder="Max (ex: 500)"
                  value={maxValue}
                  onChange={(e) => setMaxValue(e.target.value)}
                  className="w-32 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-violet-500"
                />
                {/* Presets de valor */}
                <div className="flex items-center gap-1">
                  {[
                    { label: "< R$ 50", min: "", max: "50" },
                    { label: "R$ 50 - 200", min: "50", max: "200" },
                    { label: "> R$ 200", min: "200", max: "" },
                  ].map((p) => (
                    <button
                      key={p.label}
                      onClick={() => {
                        setMinValue(p.min);
                        setMaxValue(p.max);
                      }}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-[11px] font-semibold text-slate-600"
                    >
                      {p.label}
                    </button>
                  ))}
                  {(minValue || maxValue) && (
                    <button
                      onClick={() => {
                        setMinValue("");
                        setMaxValue("");
                      }}
                      className="text-xs text-rose-600 font-bold px-2 py-1 hover:underline"
                    >
                      Limpar valores
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Regras de Auto-categorização Ativas ── */}
      {autoRules.length > 0 && (
        <div className="bg-violet-50/70 border border-violet-200 rounded-2xl p-3 flex flex-wrap items-center gap-2 shadow-xs">
          <Tag className="w-4 h-4 text-violet-600 shrink-0" />
          <span className="text-xs font-bold text-violet-900">Regras Automáticas Ativas:</span>
          {autoRules.slice(0, 5).map((r) => {
            const cat = CATEGORIES.find((c) => c.id === r.categoryId);
            return (
              <span
                key={r.id}
                className="text-xs bg-white text-violet-900 border border-violet-200 rounded-lg px-2 py-0.5 font-semibold shadow-xs"
              >
                "{r.pattern}" → {cat?.name ?? "?"}
              </span>
            );
          })}
          {autoRules.length > 5 && (
            <span className="text-xs text-violet-600 font-bold">+{autoRules.length - 5} outras regras</span>
          )}
        </div>
      )}

      {/* ── Notificação de Sucesso em Massa ── */}
      {batchSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-bold px-4 py-3 rounded-2xl flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{batchSuccessMsg}</span>
        </div>
      )}

      {/* ── Lista de Transações e Painel Lateral ── */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Coluna Principal do Extrato */}
        <div className="flex-1 min-w-0 w-full space-y-4">
          {groupedByDate.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700 text-base">Nenhuma transação encontrada</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Não localizamos itens com os filtros atuais. Tente mudar o período temporal ou limpar a busca.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Redefinir Filtros
                </button>
              )}
            </div>
          ) : (
            groupedByDate.map(([date, txs]) => (
              <div key={date} className="space-y-1.5">
                <p className="text-xs font-bold text-slate-500 px-1 capitalize">
                  {new Intl.DateTimeFormat("pt-BR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                  }).format(new Date(date + "T12:00:00"))}
                </p>
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
                  {txs.map((tx) => {
                    const cat = getCategoryById(tx.categoryId);
                    const acc = getAccountById(tx.accountId);
                    const isSelected = selectedTx?.id === tx.id;
                    const isUncategorized = !tx.categoryId || tx.categoryId === "cat-outros";

                    return (
                      <div
                        key={tx.id}
                        onClick={() => handleSelectTx(tx)}
                        className={cn(
                          "group w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50/80 transition-colors text-left cursor-pointer",
                          isSelected && "bg-violet-50/80 ring-1 ring-inset ring-violet-300"
                        )}
                      >
                        {/* Ícone ou Cor da Categoria */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-black shadow-xs"
                          style={{ background: cat?.color ?? "#94a3b8" }}
                        >
                          {cat?.name ? cat.name.charAt(0).toUpperCase() : "?"}
                        </div>

                        {/* Detalhes da Descrição */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-900 truncate">{tx.description}</p>
                            {isUncategorized && (
                              <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                Sem Categoria
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-1.5">
                            <span className="truncate font-medium text-slate-500">{acc?.name ?? "Conta"}</span>
                            {cat && (
                              <>
                                <span>·</span>
                                <span
                                  className="px-2 py-0.5 rounded-md text-white text-[11px] font-semibold"
                                  style={{ background: cat.color }}
                                >
                                  {cat.name}
                                </span>
                              </>
                            )}
                            {tx.autoRuleId && (
                              <span className="text-violet-600 font-bold bg-violet-100 px-1.5 py-0.2 rounded text-[10px]">
                                auto
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Valor e Ações */}
                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={cn(
                              "text-sm font-extrabold tracking-tight",
                              tx.amount > 0 ? "text-emerald-600" : "text-slate-900"
                            )}
                          >
                            {tx.amount > 0 ? "+" : ""}
                            {formatCurrency(tx.amount)}
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

          {/* ── Paginação / Carregar Mais ── */}
          {filtered.length > visibleLimit && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <span className="text-xs text-slate-500 font-medium">
                Mostrando <strong className="text-slate-900">{visibleTransactions.length}</strong> de{" "}
                <strong className="text-slate-900">{filtered.length}</strong> transações
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVisibleLimit((prev) => prev + 60)}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  + Carregar mais 60
                </button>
                <button
                  onClick={() => setVisibleLimit(filtered.length)}
                  className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  Exibir todas ({filtered.length})
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Painel Lateral: Detalhes & Assistente de Classificação em Massa ── */}
        {selectedTx && (
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-5 sticky top-20 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5">
                  <Wand2 className="w-4 h-4 text-violet-600" />
                  <h3 className="text-sm font-bold text-slate-900">Editar Transação</h3>
                </div>
                <button
                  onClick={() => setSelectedTx(null)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Informações da Transação */}
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Descrição Original</p>
                <p className="text-sm font-bold text-slate-900 leading-snug">{selectedTx.description}</p>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500">Valor</p>
                  <p
                    className={cn(
                      "text-lg font-black",
                      selectedTx.amount > 0 ? "text-emerald-600" : "text-slate-900"
                    )}
                  >
                    {formatCurrency(selectedTx.amount)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-semibold text-slate-500">Data</p>
                  <p className="text-xs font-bold text-slate-700">{formatDate(selectedTx.date)}</p>
                </div>
              </div>

              {/* Categoria Individual */}
              <div>
                <p className="text-xs font-bold text-slate-700 mb-1.5">Classificação Desta Transação</p>
                <div className="max-h-40 overflow-y-auto space-y-1 border border-slate-200 rounded-xl p-1 bg-slate-50/50">
                  {CATEGORIES.filter((c) => !c.isIncome || selectedTx.amount > 0).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleCategoryChange(selectedTx.id, c.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                        selectedTx.categoryId === c.id
                          ? "bg-violet-600 text-white font-bold"
                          : "hover:bg-slate-100 text-slate-700"
                      )}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: selectedTx.categoryId === c.id ? "#ffffff" : c.color }}
                      />
                      <span className="flex-1 text-left truncate">{c.name}</span>
                      {selectedTx.categoryId === c.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* ⚡ Assistente de Categorização em Massa & Regra Automática */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-1.5 text-violet-700">
                  <Zap className="w-4 h-4 fill-violet-600 text-violet-600" />
                  <p className="text-xs font-black">Classificar em Lote (1-Clique)</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600">Palavra ou termo-chave:</label>
                  <input
                    type="text"
                    value={batchPattern}
                    onChange={(e) => setBatchPattern(e.target.value)}
                    placeholder="Ex: TRANSF PIX ou MERCEARIA"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-violet-500 font-semibold"
                  />
                  {batchPattern.trim() && (
                    <p className="text-[11px] text-violet-700 font-semibold">
                      ⚡ Encontradas <strong>{batchMatchingCount}</strong> transações com esse termo no histórico.
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600">Categorizar todas como:</label>
                  <select
                    value={batchCategory}
                    onChange={(e) => setBatchCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-violet-500 font-medium"
                  >
                    <option value="">Selecione uma categoria...</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleApplyBatchCategorize}
                  disabled={!batchPattern.trim() || !batchCategory || batchMatchingCount === 0}
                  className="w-full py-2.5 px-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>
                    Classificar {batchMatchingCount > 0 ? `todas as ${batchMatchingCount}` : ""} e Salvar Regra
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Transação Manual */}
      <TransactionModal isOpen={showTxModal} onClose={() => setShowTxModal(false)} />
    </div>
  );
}
