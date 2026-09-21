"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/VerticeContext";
import { formatCurrency, formatDateShort, formatMonthLabel } from "@/lib/finance";
import { cn } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, Wallet, AlertTriangle,
  ArrowUpRight, ArrowDownRight, ShieldCheck, Flame,
  ChevronRight, Banknote, Plus, Upload, Activity, Sparkles
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { TransactionModal } from "@/components/modals/TransactionModal";
import { ImportModal } from "@/components/modals/ImportModal";

export function DashboardView() {
  const {
    patrimonioLiquido, patrimonioAtivo, patrimonioPassivo,
    saldoDisponivelTotal, totalDividas, totalInvestimentos,
    currentMonthSummary, last6MonthsSummary, reservaEmergencia,
    accounts, transactions, alerts, setActiveTab,
    economicIndicators,
  } = useFinance();

  const [showTxModal, setShowTxModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const isPositive = patrimonioLiquido >= 0;
  const activeAlerts = alerts.filter((a) => !a.isDismissed).slice(0, 3);
  const recentTxs = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const barData = last6MonthsSummary.map((m) => ({
    name: formatMonthLabel(m.month),
    Receitas: Math.round(m.totalIncome),
    Despesas: Math.round(m.totalExpenses),
  }));

  const pieData = currentMonthSummary.byCategory
    .slice(0, 6)
    .map((c) => ({ name: c.categoryName, value: Math.round(c.total), color: c.color }));

  const RADIAN = Math.PI / 180;
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.06) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ─── Ticker de Indicadores Macroeconômicos & Ações Rápidas (Fase 2) ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 text-xs overflow-x-auto py-1">
          <div className="flex items-center gap-1.5 font-bold text-emerald-400 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Indicadores BCB:</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300 shrink-0 font-medium">
            <span>Selic: <strong className="text-white">{economicIndicators?.selic ?? 10.75}% a.a.</strong></span>
            <span>CDI: <strong className="text-white">{economicIndicators?.cdi ?? 10.65}% a.a.</strong></span>
            <span>IPCA (12m): <strong className="text-white">{economicIndicators?.ipca12m ?? 4.24}%</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition"
          >
            <Upload className="w-3.5 h-3.5 text-blue-300" />
            <span>Importar Extrato</span>
          </button>
          <button
            onClick={() => setShowTxModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Transação</span>
          </button>
        </div>
      </div>
      {/* ─── Hero: Patrimônio Líquido ─── */}
      <div className={cn(
        "rounded-2xl border p-6 lg:p-8 bg-white shadow-xs transition-all",
        isPositive ? "border-emerald-200" : "border-rose-200"
      )}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-violet-50 text-violet-700 border border-violet-200">
                Patrimônio Líquido
              </span>
              <span className={cn(
                "text-xs font-bold px-2.5 py-0.5 rounded-md border flex items-center gap-1",
                isPositive ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-rose-800 border-rose-200"
              )}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isPositive ? "Ativo > Passivo" : "Dívidas > Ativos"}
              </span>
            </div>
            <h2 className={cn(
              "text-3xl lg:text-4xl font-black tracking-tight",
              isPositive ? "text-emerald-700" : "text-rose-600"
            )}>
              {formatCurrency(patrimonioLiquido)}
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xl">
              {isPositive
                ? "Seus ativos superam suas dívidas. Continue investindo e eliminando passivos para acelerar a construção de riqueza."
                : "Suas dívidas ainda superam seus ativos. O Plano de Desendividamento vai te mostrar o caminho mais rápido para virar o jogo."}
            </p>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-3 shrink-0 w-full lg:w-auto lg:min-w-72">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <p className="text-xs text-slate-500 font-medium mb-1">Ativos Totais</p>
              <p className="text-base font-black text-slate-900">{formatCurrency(patrimonioAtivo)}</p>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5">
              <p className="text-xs text-rose-600 font-medium mb-1">Passivos Totais</p>
              <p className="text-base font-black text-rose-700">{formatCurrency(patrimonioPassivo)}</p>
            </div>
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-3.5">
              <p className="text-xs text-violet-600 font-medium mb-1">Investimentos</p>
              <p className="text-base font-black text-violet-700">{formatCurrency(totalInvestimentos)}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <p className="text-xs text-slate-500 font-medium mb-1">Saldo Disponível</p>
              <p className="text-base font-black text-slate-900">{formatCurrency(saldoDisponivelTotal)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4 KPIs do Mês ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Receitas do Mês",
            value: formatCurrency(currentMonthSummary.totalIncome),
            icon: ArrowUpRight,
            color: "text-emerald-600",
            bg: "bg-emerald-50 border-emerald-200",
            iconBg: "bg-emerald-100",
          },
          {
            label: "Despesas do Mês",
            value: formatCurrency(currentMonthSummary.totalExpenses),
            icon: ArrowDownRight,
            color: "text-rose-600",
            bg: "bg-rose-50 border-rose-200",
            iconBg: "bg-rose-100",
          },
          {
            label: "Saldo Livre",
            value: formatCurrency(currentMonthSummary.balance),
            icon: Banknote,
            color: currentMonthSummary.balance >= 0 ? "text-slate-900" : "text-rose-600",
            bg: "bg-white border-slate-200",
            iconBg: "bg-slate-100",
          },
          {
            label: "Total de Dívidas",
            value: formatCurrency(totalDividas),
            icon: Flame,
            color: "text-rose-700",
            bg: "bg-rose-50 border-rose-200",
            iconBg: "bg-rose-100",
          },
        ].map((kpi) => (
          <div key={kpi.label} className={cn("rounded-2xl border p-4 bg-white shadow-xs flex gap-3 items-start", kpi.bg.split(" ")[1])}>
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", kpi.iconBg)}>
              <kpi.icon className={cn("w-5 h-5", kpi.color)} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">{kpi.label}</p>
              <p className={cn("text-lg font-black mt-0.5", kpi.color)}>{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Gráficos ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Barras: Receitas vs Despesas */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Receitas × Despesas (6 meses)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                formatter={(v: unknown) => formatCurrency(v as number)}
              />
              <Bar dataKey="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Rosca: Gastos por Categoria */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Gastos por Categoria (mês)</h3>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-sm text-slate-400">Nenhum gasto registrado neste mês.</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  dataKey="value" labelLine={false} label={renderCustomLabel}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Tooltip formatter={(v: unknown) => formatCurrency(v as number)} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ─── Bottom Row: Transações + Alertas + Reserva ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Últimas Transações */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Últimas Transações</h3>
            <button onClick={() => setActiveTab("extrato")} className="text-xs font-semibold text-violet-600 hover:text-violet-800 flex items-center gap-1 transition-colors">
              Ver todas <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <ul className="divide-y divide-slate-50">
            {recentTxs.map((tx) => {
              const acc = accounts.find((a) => a.id === tx.accountId);
              return (
                <li key={tx.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center text-lg shrink-0",
                    tx.amount > 0 ? "bg-emerald-50" : "bg-rose-50"
                  )}>
                    {tx.amount > 0 ? "↑" : "↓"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{tx.description}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{acc?.name ?? "—"} · {formatDateShort(tx.date)}</p>
                  </div>
                  <span className={cn(
                    "text-sm font-bold shrink-0",
                    tx.amount > 0 ? "text-emerald-600" : "text-slate-900"
                  )}>
                    {tx.amount > 0 ? "+" : ""}
                    {formatCurrency(tx.amount)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Reserva + Alertas */}
        <div className="flex flex-col gap-4">
          {/* Reserva de Emergência */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Reserva de Emergência</h3>
            </div>
            <div className="flex justify-between text-xs text-slate-600 mb-1.5">
              <span>{formatCurrency(reservaEmergencia.current)}</span>
              <span className="font-bold">{reservaEmergencia.percent.toFixed(0)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  reservaEmergencia.percent >= 100 ? "bg-emerald-500" :
                  reservaEmergencia.percent >= 50 ? "bg-amber-400" : "bg-rose-500"
                )}
                style={{ width: `${Math.min(100, reservaEmergencia.percent)}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">
              Meta: {formatCurrency(reservaEmergencia.target)} ({reservaEmergencia.targetMonths} meses)
            </p>
          </div>

          {/* Alertas Rápidos */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex-1">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Alertas</h3>
              <button onClick={() => setActiveTab("alertas")} className="text-xs font-semibold text-violet-600 hover:text-violet-800 flex items-center gap-1 transition-colors">
                Ver todos <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <ul className="divide-y divide-slate-50">
              {activeAlerts.length === 0 ? (
                <li className="px-5 py-6 text-center text-sm text-slate-400">Nenhum alerta ativo 🎉</li>
              ) : (
                activeAlerts.map((alert) => (
                  <li key={alert.id} className="flex items-start gap-3 px-5 py-3.5">
                    <AlertTriangle className={cn(
                      "w-4 h-4 mt-0.5 shrink-0",
                      alert.severity === "critico" ? "text-red-500" :
                      alert.severity === "atencao" ? "text-amber-500" : "text-blue-400"
                    )} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{alert.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{alert.description}</p>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>

      <TransactionModal
        isOpen={showTxModal}
        onClose={() => setShowTxModal(false)}
      />
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </div>
  );
}

