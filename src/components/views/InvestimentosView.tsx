"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/VerticeContext";
import { formatCurrency, calcularRentabilidadeCarteira } from "@/lib/finance";
import { cn } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, Shield, BarChart2, Building2,
  Bitcoin, DollarSign, Award, Lightbulb, ArrowUpRight, ArrowDownRight,
  Plus, Trash2, RefreshCw, Sparkles, Activity
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Investment } from "@/types";
import { InvestmentModal } from "@/components/modals/InvestmentModal";

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  tesouro_direto: { label: "Tesouro Direto",  color: "#10b981", icon: Shield },
  renda_fixa:     { label: "Renda Fixa",      color: "#3b82f6", icon: Shield },
  cdb:            { label: "CDB",              color: "#06b6d4", icon: DollarSign },
  lci_lca:        { label: "LCI / LCA",       color: "#8b5cf6", icon: Shield },
  fii:            { label: "FII",              color: "#f59e0b", icon: Building2 },
  acao:           { label: "Ação",             color: "#ef4444", icon: BarChart2 },
  cripto:         { label: "Cripto",           color: "#f97316", icon: Bitcoin },
  previdencia:    { label: "Previdência",      color: "#a855f7", icon: Shield },
  outro:          { label: "Outro",            color: "#94a3b8", icon: DollarSign },
};

export function InvestimentosView() {
  const {
    investments,
    totalInvestimentos,
    reservaEmergencia,
    debts,
    setActiveTab,
    deleteInvestment,
    economicIndicators,
    syncMarketData,
    isMarketLoading,
  } = useFinance();

  const [showInvModal, setShowInvModal] = useState(false);

  const { totalInvestido, valorAtual, ganho, percentual } = calcularRentabilidadeCarteira(investments);
  const isPositive = ganho >= 0;

  // Alocação por tipo para o gráfico
  const alocacaoByType = Object.entries(
    investments.reduce<Record<string, number>>((acc, inv) => {
      acc[inv.type] = (acc[inv.type] || 0) + inv.currentValue;
      return acc;
    }, {})
  ).map(([type, value]) => ({
    name: TYPE_CONFIG[type]?.label ?? type,
    value: Math.round(value),
    color: TYPE_CONFIG[type]?.color ?? "#94a3b8",
  }));

  // Indicativos inteligentes
  const totalInvestidos = investments.reduce((a, i) => a + i.currentValue, 0);
  const rfValue = investments
    .filter((i) => i.type === "tesouro_direto" || i.type === "renda_fixa" || i.type === "cdb" || i.type === "lci_lca")
    .reduce((acc, i) => acc + i.currentValue, 0);
  const rfPercent = totalInvestidos > 0 ? (rfValue / totalInvestidos) * 100 : 0;
  const reservaOk = reservaEmergencia.percent >= 100;
  const temDividasCaras = debts.some((d) => d.interestRateMonthly > 0.015);

  const daysToMaturity = (dateStr?: string) => {
    if (!dateStr) return null;
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const nearMaturity = investments.filter((i) => {
    const days = daysToMaturity(i.maturityDate);
    return days !== null && days <= 60 && days > 0;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ─── Ticker de Indicadores ao Vivo & Ações ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 text-xs overflow-x-auto py-1">
          <div className="flex items-center gap-1.5 font-bold text-emerald-400 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Mercado B3 & BCB:</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300 shrink-0 font-medium">
            <span>Selic: <strong className="text-white">{economicIndicators?.selic ?? 10.75}%</strong></span>
            <span>CDI: <strong className="text-white">{economicIndicators?.cdi ?? 10.65}%</strong></span>
            <span>IPCA: <strong className="text-white">{economicIndicators?.ipca12m ?? 4.24}%</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => syncMarketData()}
            disabled={isMarketLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition disabled:opacity-50"
            title="Sincronizar cotações com a B3"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 text-indigo-300", isMarketLoading && "animate-spin")} />
            <span>{isMarketLoading ? "Atualizando..." : "Atualizar Cotações"}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowInvModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Ativo</span>
          </button>
        </div>
      </div>

      {/* Hero: Patrimônio Investido */}
      <div className={cn(
        "bg-white rounded-2xl border p-6 shadow-xs",
        isPositive ? "border-emerald-200" : "border-rose-200"
      )}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-violet-50 text-violet-700 border border-violet-200">
              Carteira de Investimentos
            </span>
            <h2 className="text-3xl font-black text-slate-900">{formatCurrency(valorAtual)}</h2>
            <p className="text-sm text-slate-500">
              Investido: {formatCurrency(totalInvestido)} ·{" "}
              <span className={cn("font-bold", isPositive ? "text-emerald-700" : "text-rose-600")}>
                {isPositive ? "+" : ""}{formatCurrency(ganho)} ({isPositive ? "+" : ""}{percentual.toFixed(2).replace(".", ",")}%)
              </span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0 lg:min-w-64">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <p className="text-xs text-slate-500 font-medium">Total Investido</p>
              <p className="text-lg font-black text-slate-900">{formatCurrency(totalInvestido)}</p>
            </div>
            <div className={cn("border rounded-xl p-3.5", isPositive ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200")}>
              <p className={cn("text-xs font-medium", isPositive ? "text-emerald-600" : "text-rose-600")}>Ganho Total</p>
              <p className={cn("text-lg font-black", isPositive ? "text-emerald-700" : "text-rose-700")}>
                {isPositive ? "+" : ""}{formatCurrency(ganho)}
              </p>
            </div>
            <div className="col-span-2 bg-violet-50 border border-violet-200 rounded-xl p-3.5">
              <p className="text-xs text-violet-600 font-medium">Rentabilidade</p>
              <p className={cn("text-xl font-black mt-0.5", isPositive ? "text-violet-700" : "text-rose-600")}>
                {isPositive ? "+" : ""}{percentual.toFixed(2).replace(".", ",")}%
              </p>
            </div>
          </div>
        </div>
      </div>


      {/* Gráfico + Indicativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Alocação */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Alocação por Classe de Ativo</h3>
          {alocacaoByType.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-sm text-slate-400">Nenhum ativo cadastrado.</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={alocacaoByType} cx="50%" cy="50%" outerRadius={80} dataKey="value" labelLine={false}>
                  {alocacaoByType.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Tooltip formatter={(v: unknown) => formatCurrency(v as number)} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Indicativos Inteligentes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">Indicativos Personalizados</h3>
          </div>
          <ul className="space-y-3">
            {/* Reserva */}
            <li className={cn(
              "flex items-start gap-3 p-3 rounded-xl border text-sm",
              reservaOk ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
            )}>
              <Shield className={cn("w-4 h-4 mt-0.5 shrink-0", reservaOk ? "text-emerald-600" : "text-amber-600")} />
              <div>
                <p className={cn("font-bold text-xs", reservaOk ? "text-emerald-700" : "text-amber-700")}>
                  {reservaOk ? "✓ Reserva de Emergência completa" : "⚠ Reserva de Emergência incompleta"}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {reservaOk
                    ? "Você pode alocar novos recursos em investimentos com mais segurança."
                    : `Priorize completar a reserva antes de investir. Faltam ${formatCurrency(reservaEmergencia.target - reservaEmergencia.current)}.`}
                </p>
                {!reservaOk && (
                  <button
                    onClick={() => setActiveTab("alertas")}
                    className="text-xs font-bold text-amber-700 mt-1.5 hover:underline"
                  >
                    Ver alertas →
                  </button>
                )}
              </div>
            </li>

            {/* Dívidas caras */}
            {temDividasCaras && (
              <li className="flex items-start gap-3 p-3 rounded-xl border bg-rose-50 border-rose-200 text-sm">
                <TrendingDown className="w-4 h-4 mt-0.5 text-rose-600 shrink-0" />
                <div>
                  <p className="font-bold text-xs text-rose-700">Dívidas com juro superior ao CDI</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Algumas dívidas cobram mais do que qualquer investimento pode render. Considere antecipar o pagamento.
                  </p>
                  <button
                    onClick={() => setActiveTab("dividas")}
                    className="text-xs font-bold text-rose-700 mt-1.5 hover:underline"
                  >
                    Ver plano de desendividamento →
                  </button>
                </div>
              </li>
            )}

            {/* Concentração em RF */}
            {rfPercent > 80 && totalInvestidos > 5000 && (
              <li className="flex items-start gap-3 p-3 rounded-xl border bg-blue-50 border-blue-200 text-sm">
                <Award className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
                <div>
                  <p className="font-bold text-xs text-blue-700">{rfPercent.toFixed(0)}% em Renda Fixa</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Perfil conservador identificado. Considere diversificar com FIIs (rendimento mensal de dividendos) ou ETFs para ganhar exposição a renda variável com baixo esforço.
                  </p>
                </div>
              </li>
            )}

            {/* Vencimentos próximos */}
            {nearMaturity.length > 0 && (
              <li className="flex items-start gap-3 p-3 rounded-xl border bg-violet-50 border-violet-200 text-sm">
                <TrendingUp className="w-4 h-4 mt-0.5 text-violet-600 shrink-0" />
                <div>
                  <p className="font-bold text-xs text-violet-700">Vencimento próximo</p>
                  {nearMaturity.map((inv) => (
                    <p key={inv.id} className="text-xs text-slate-600 mt-0.5">
                      {inv.name} vence em {daysToMaturity(inv.maturityDate)} dias ({formatCurrency(inv.currentValue)}) — planeje o reinvestimento.
                    </p>
                  ))}
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Grid de Ativos */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3">Seus Ativos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {investments.map((inv) => (
            <InvestmentCard
              key={inv.id}
              investment={inv}
              onDelete={() => {
                if (confirm(`Tem certeza que deseja remover "${inv.name}" da sua carteira?`)) {
                  deleteInvestment(inv.id);
                }
              }}
            />
          ))}
        </div>
      </div>

      <InvestmentModal
        isOpen={showInvModal}
        onClose={() => setShowInvModal(false)}
      />
    </div>
  );
}

function InvestmentCard({
  investment: inv,
  onDelete,
}: {
  investment: Investment;
  onDelete?: () => void;
}) {
  const cfg = TYPE_CONFIG[inv.type] ?? TYPE_CONFIG.outro;
  const Icon = cfg.icon;
  const ganho = inv.currentValue - inv.investedAmount;
  const pct = inv.investedAmount > 0 ? (ganho / inv.investedAmount) * 100 : 0;
  const isUp = ganho >= 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-1.5" style={{ background: cfg.color }} />
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: cfg.color + "20" }}
            >
              <Icon className="w-4.5 h-4.5" style={{ color: cfg.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{inv.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className="text-xs px-1.5 py-0.5 rounded-md font-semibold text-white"
                  style={{ background: cfg.color }}
                >
                  {cfg.label}
                </span>
                {inv.ticker && <span className="text-xs text-slate-400 font-mono">{inv.ticker}</span>}
              </div>
            </div>
          </div>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0"
              title="Excluir ativo"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div>
          <p className="text-2xl font-black text-slate-900">{formatCurrency(inv.currentValue)}</p>
          <p className="text-xs text-slate-400 mt-0.5">Investido: {formatCurrency(inv.investedAmount)}</p>
        </div>

        <div className={cn(
          "flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border",
          isUp ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
        )}>
          {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {isUp ? "+" : ""}{formatCurrency(ganho)} ({isUp ? "+" : ""}{pct.toFixed(2).replace(".", ",")}%)
        </div>

        {inv.quantity && inv.currentPrice && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 rounded-lg p-2">
              <p className="text-slate-400">Qtd.</p>
              <p className="font-bold text-slate-900">{inv.quantity}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-2">
              <p className="text-slate-400">Preço atual</p>
              <p className="font-bold text-slate-900">{formatCurrency(inv.currentPrice)}</p>
            </div>
          </div>
        )}

        {inv.incomeRate && (
          <div className="text-xs bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5 font-semibold text-emerald-700">
            {inv.incomeRate}% CDI{inv.maturityDate && ` · vence ${new Intl.DateTimeFormat("pt-BR").format(new Date(inv.maturityDate))}`}
          </div>
        )}

        <p className="text-xs text-slate-400">{inv.broker}</p>
      </div>
    </div>
  );
}
