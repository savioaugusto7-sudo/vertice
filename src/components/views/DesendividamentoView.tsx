"use client";

import React, { useState, useMemo } from "react";
import { useFinance } from "@/context/VerticeContext";
import { formatCurrency, monthlyToAnnualRate, simularAporteExtraordinario } from "@/lib/finance";
import { cn } from "@/lib/utils";
import {
  TrendingDown, Flame, ToggleLeft, ToggleRight, Zap,
  Clock, DollarSign, ChevronDown, Plus, Trash2, Sparkles, Gift, CheckCircle2
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { Debt } from "@/types";
import { DebtModal } from "@/components/modals/DebtModal";

const DEBT_TYPE_LABEL: Record<string, string> = {
  cartao_credito: "Cartão de Crédito",
  cartao_rotativo: "Cartão Rotativo",
  emprestimo_pessoal: "Empréstimo Pessoal",
  financiamento: "Financiamento",
  financiamento_veiculo: "Financiamento Veicular",
  financiamento_imovel: "Financiamento Imobiliário",
  cheque_especial: "Cheque Especial",
  consignado: "Consignado",
  outro: "Outro",
};

export function DesendividamentoView() {
  const {
    debts,
    debtStrategy,
    setDebtStrategy,
    debtExtraMonthly,
    setDebtExtraMonthly,
    debtPlan,
    debtPlanAlt,
    deleteDebt,
    updateDebt,
  } = useFinance();

  const [showDebtModal, setShowDebtModal] = useState(false);
  const [selectedDebtIdForAporte, setSelectedDebtIdForAporte] = useState(debts[0]?.id || "");
  const [aporteStr, setAporteStr] = useState("2000");
  const [aporteSuccessMsg, setAporteSuccessMsg] = useState<string | null>(null);

  const totalDividas = debts.reduce((a, d) => a + d.currentBalance, 0);
  const totalMinimum = debts.reduce((a, d) => a + d.minimumPayment, 0);

  // Dívida selecionada para amortização extraordinária
  const selectedDebtForAporte = debts.find((d) => d.id === selectedDebtIdForAporte) || debts[0];
  const aporteAmount = parseFloat(aporteStr.replace(/\./g, "").replace(",", ".")) || 0;

  const aporteSimulation = useMemo(() => {
    if (!selectedDebtForAporte || aporteAmount <= 0) return null;
    return simularAporteExtraordinario(selectedDebtForAporte, aporteAmount);
  }, [selectedDebtForAporte, aporteAmount]);

  const handleApplyAporte = () => {
    if (!selectedDebtForAporte || aporteAmount <= 0) return;
    const newBal = Math.max(0, selectedDebtForAporte.currentBalance - aporteAmount);
    updateDebt(selectedDebtForAporte.id, { currentBalance: newBal });
    setAporteSuccessMsg(
      `Aporte de ${formatCurrency(aporteAmount)} aplicado na dívida "${selectedDebtForAporte.name}"! Saldo atualizado para ${formatCurrency(newBal)}.`
    );
    setTimeout(() => setAporteSuccessMsg(null), 5000);
  };

  // Dados para gráfico: saldo total por mês
  const chartData = useMemo(() => {
    // Agrupa o schedule por mês calculando saldo total restante
    const byMonth: Record<number, { month: number; monthLabel: string; saldo: number }> = {};
    const debtIds = debts.map((d) => d.id);

    // Pega o último saldo de cada dívida em cada mês
    for (const entry of debtPlan.schedule) {
      if (!byMonth[entry.month]) {
        byMonth[entry.month] = { month: entry.month, monthLabel: entry.monthLabel, saldo: 0 };
      }
    }

    // Para cada mês, soma o menor saldo restante de cada dívida no plano
    const lastBalanceByDebt: Record<string, number> = {};
    debts.forEach((d) => { lastBalanceByDebt[d.id] = d.currentBalance; });

    for (const entry of debtPlan.schedule) {
      lastBalanceByDebt[entry.debtId] = entry.remainingBalance;
      byMonth[entry.month].saldo = Object.values(lastBalanceByDebt).reduce((a, b) => a + b, 0);
    }

    return Object.values(byMonth)
      .sort((a, b) => a.month - b.month)
      .filter((_, i) => i % 2 === 0 || i === 0) // Mostra a cada 2 meses para não sobrecarregar
      .slice(0, 24);
  }, [debtPlan, debts]);

  // Tabela de plano mês a mês (primeiros 12 meses)
  const planTable = useMemo(() => {
    const byMonth: Record<number, { label: string; total: number; debts: { name: string; payment: number; remaining: number; color: string }[] }> = {};
    for (const entry of debtPlan.schedule) {
      if (!byMonth[entry.month]) byMonth[entry.month] = { label: entry.monthLabel, total: 0, debts: [] };
      const debt = debts.find((d) => d.id === entry.debtId);
      byMonth[entry.month].total += entry.totalPayment;
      byMonth[entry.month].debts.push({
        name: entry.debtName,
        payment: entry.totalPayment,
        remaining: entry.remainingBalance,
        color: debt?.color ?? "#94a3b8",
      });
    }
    return Object.entries(byMonth)
      .sort(([a], [b]) => Number(a) - Number(b))
      .slice(0, 12);
  }, [debtPlan, debts]);

  if (debts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
          <TrendingDown className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Você não tem dívidas cadastradas!</h2>
        <p className="text-sm text-slate-500 text-center max-w-sm">
          Parabéns! Quando tiver dívidas para gerenciar, cadastre-as aqui e o motor vai calcular o plano mais rápido para quitar tudo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero */}
      <div className="bg-white rounded-2xl border border-rose-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                <Flame className="w-3 h-3" /> Total de Dívidas
              </span>
              <button
                type="button"
                onClick={() => setShowDebtModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Dívida</span>
              </button>
            </div>
            <h2 className="text-3xl font-black text-rose-700">{formatCurrency(totalDividas)}</h2>
            <p className="text-sm text-slate-500">
              {debts.length} dívida{debts.length !== 1 ? "s" : ""} · Parcela mínima total: {formatCurrency(totalMinimum)}/mês
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0 lg:min-w-64">
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5">
              <p className="text-xs text-rose-600 font-medium">Quitação em</p>
              <p className="text-xl font-black text-rose-800 mt-0.5">{debtPlan.monthsToPayoff} meses</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
              <p className="text-xs text-amber-600 font-medium">Economia vs. mínimo</p>
              <p className="text-xl font-black text-amber-800 mt-0.5">{formatCurrency(debtPlan.interestSavingsVsMinimum)}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <p className="text-xs text-slate-500 font-medium">Total de juros</p>
              <p className="text-xl font-black text-slate-900 mt-0.5">{formatCurrency(debtPlan.totalInterestPaid)}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
              <p className="text-xs text-emerald-600 font-medium">Meses economizados</p>
              <p className="text-xl font-black text-emerald-800 mt-0.5">{debtPlan.monthsSavedVsMinimum} meses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="flex flex-wrap gap-4 items-start">
        {/* Estratégia */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex-1 min-w-64">
          <p className="text-xs font-bold text-slate-700 mb-3">Estratégia de Amortização</p>
          <div className="grid grid-cols-2 gap-2">
            {(["avalanche", "snowball"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setDebtStrategy(s)}
                className={cn(
                  "px-3 py-3 rounded-xl border text-xs font-bold transition-all text-left",
                  debtStrategy === s
                    ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                )}
              >
                <p className="font-black">{s === "avalanche" ? "🌊 Avalanche" : "⛄ Bola de Neve"}</p>
                <p className={cn("text-xs mt-0.5 font-medium", debtStrategy === s ? "text-violet-200" : "text-slate-500")}>
                  {s === "avalanche" ? "Menor juro total" : "Quitação motivadora"}
                </p>
              </button>
            ))}
          </div>

          {/* Comparativo */}
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
            <p className="text-xs text-slate-500 font-medium">Comparativo de estratégias:</p>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">{debtStrategy === "avalanche" ? "🌊 Avalanche" : "⛄ Bola de Neve"} (atual)</span>
              <span className="font-bold text-violet-700">{debtPlan.monthsToPayoff} meses · {formatCurrency(debtPlan.totalInterestPaid)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">{debtStrategy === "avalanche" ? "⛄ Bola de Neve" : "🌊 Avalanche"}</span>
              <span className="font-bold text-slate-500">{debtPlanAlt.monthsToPayoff} meses · {formatCurrency(debtPlanAlt.totalInterestPaid)}</span>
            </div>
          </div>
        </div>

        {/* Extra mensal */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex-1 min-w-64">
          <p className="text-xs font-bold text-slate-700 mb-1">Quanto posso pagar a mais por mês?</p>
          <p className="text-xs text-slate-500 mb-3">Além das parcelas mínimas ({formatCurrency(totalMinimum)}/mês)</p>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-black text-slate-900 w-20">{formatCurrency(debtExtraMonthly)}</span>
            <input
              type="range"
              min={0}
              max={3000}
              step={50}
              value={debtExtraMonthly}
              onChange={(e) => setDebtExtraMonthly(Number(e.target.value))}
              className="flex-1 accent-violet-600"
            />
          </div>
          <div className="flex gap-2">
            {[0, 200, 500, 1000].map((v) => (
              <button
                key={v}
                onClick={() => setDebtExtraMonthly(v)}
                className={cn(
                  "flex-1 py-1.5 rounded-lg border text-xs font-bold transition-colors",
                  debtExtraMonthly === v
                    ? "bg-violet-600 text-white border-violet-600"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-violet-50"
                )}
              >
                {v === 0 ? "R$0" : `+${v}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Simulador de Aporte Extraordinário (Fase 2) ─── */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 border border-emerald-500/30 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                Simulador de Aporte Extraordinário
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  13º Salário / Bônus / FGTS
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Veja o impacto de abater um valor pontual em qualquer dívida e quanto você economiza
              </p>
            </div>
          </div>
        </div>

        {aporteSuccessMsg && (
          <div className="flex items-center gap-2 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{aporteSuccessMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Qual dívida amortizar */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Dívida Alvo
            </label>
            <select
              value={selectedDebtIdForAporte}
              onChange={(e) => setSelectedDebtIdForAporte(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {debts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({formatCurrency(d.currentBalance)} · {(d.interestRateMonthly * 100).toFixed(2)}% a.m.)
                </option>
              ))}
            </select>
          </div>

          {/* Valor do Aporte */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Valor do Aporte (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-sm font-bold text-slate-400">R$</span>
              <input
                type="text"
                value={aporteStr}
                onChange={(e) => setAporteStr(e.target.value)}
                placeholder="2.000,00"
                className="w-full pl-10 pr-3 py-2 text-sm font-bold bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Botão de amortização */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleApplyAporte}
              disabled={!selectedDebtForAporte || aporteAmount <= 0}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Abater Saldo da Dívida</span>
            </button>
          </div>
        </div>

        {aporteSimulation && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Prazo Original</p>
              <p className="text-base font-bold text-slate-200">{aporteSimulation.originalMonths} meses</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Novo Prazo</p>
              <p className="text-base font-bold text-emerald-400">{aporteSimulation.newMonths} meses</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Meses Economizados</p>
              <p className="text-base font-bold text-emerald-300">-{aporteSimulation.monthsSaved} meses!</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Juros Poupados</p>
              <p className="text-base font-bold text-amber-300">{formatCurrency(aporteSimulation.interestSaved)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Dívidas individuais */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3">Suas Dívidas (ordenadas pela estratégia)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...debts]
            .sort((a, b) =>
              debtStrategy === "avalanche"
                ? b.interestRateMonthly - a.interestRateMonthly
                : a.currentBalance - b.currentBalance
            )
            .map((debt, idx) => (
              <DebtCard
                key={debt.id}
                debt={debt}
                rank={idx + 1}
                isFocus={idx === 0}
                onDelete={() => {
                  if (confirm(`Tem certeza que deseja excluir a dívida "${debt.name}"?`)) {
                    deleteDebt(debt.id);
                  }
                }}
              />
            ))}
        </div>
      </div>


      {/* Gráfico de Amortização */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Evolução do Saldo Devedor</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="debtGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="monthLabel" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: unknown) => formatCurrency(v as number)} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Area type="monotone" dataKey="saldo" name="Saldo Devedor" stroke="#f43f5e" fill="url(#debtGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabela de plano mês a mês */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Plano Mês a Mês (primeiros 12 meses)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-slate-600">Mês</th>
                <th className="text-left px-4 py-3 font-bold text-slate-600">Dívida Foco</th>
                <th className="text-right px-4 py-3 font-bold text-slate-600">Pagamento</th>
                <th className="text-right px-4 py-3 font-bold text-slate-600">Saldo Restante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {planTable.map(([month, data]) => (
                data.debts.map((d, i) => (
                  <tr key={`${month}-${i}`} className="hover:bg-slate-50">
                    {i === 0 && (
                      <td className="px-4 py-2.5 font-bold text-slate-700" rowSpan={data.debts.length}>
                        {data.label}
                      </td>
                    )}
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                        {d.name}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold">{formatCurrency(d.payment)}</td>
                    <td className="px-4 py-2.5 text-right">
                      {d.remaining < 0.01 ? (
                        <span className="text-emerald-600 font-bold">✓ Quitada!</span>
                      ) : (
                        <span className="text-rose-700 font-semibold">{formatCurrency(d.remaining)}</span>
                      )}
                    </td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DebtModal
        isOpen={showDebtModal}
        onClose={() => setShowDebtModal(false)}
      />
    </div>
  );
}

function DebtCard({
  debt,
  rank,
  isFocus,
  onDelete,
}: {
  debt: Debt;
  rank: number;
  isFocus: boolean;
  onDelete?: () => void;
}) {
  const annualRate = monthlyToAnnualRate(debt.interestRateMonthly);
  const paidPercent = ((debt.originalAmount - debt.currentBalance) / debt.originalAmount) * 100;

  return (
    <div className={cn(
      "bg-white rounded-2xl border shadow-xs overflow-hidden",
      isFocus ? "border-rose-300 ring-2 ring-rose-200" : "border-slate-200"
    )}>
      <div className="h-1.5 w-full" style={{ background: debt.color }} />
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              {isFocus && (
                <span className="text-xs bg-rose-100 text-rose-700 border border-rose-300 font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Foco
                </span>
              )}
              <span className="text-xs text-slate-400 font-medium">#{rank}</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 leading-tight">{debt.name}</h4>
            <p className="text-xs text-slate-500">{debt.creditor} · {DEBT_TYPE_LABEL[debt.type]}</p>
          </div>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              title="Excluir dívida"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div>
          <p className="text-2xl font-black text-rose-700">{formatCurrency(debt.currentBalance)}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            de {formatCurrency(debt.originalAmount)} originais
          </p>
        </div>

        {/* Barra de progresso */}
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Pago</span>
            <span className="font-bold">{paidPercent.toFixed(0)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${paidPercent}%`, background: debt.color }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 rounded-lg p-2">
            <p className="text-slate-400 font-medium">Parcela</p>
            <p className="font-black text-slate-900">{formatCurrency(debt.minimumPayment)}</p>
          </div>
          <div className="bg-rose-50 rounded-lg p-2">
            <p className="text-rose-400 font-medium">Juros a.m.</p>
            <p className="font-black text-rose-700">{(debt.interestRateMonthly * 100).toFixed(2).replace(".", ",")}%</p>
          </div>
          <div className="col-span-2 bg-slate-50 rounded-lg p-2">
            <p className="text-slate-400 font-medium">Taxa Anual</p>
            <p className="font-black text-slate-900">{annualRate.toFixed(1).replace(".", ",")}% a.a.</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5" />
          {debt.remainingInstallments} parcelas restantes
        </div>
      </div>
    </div>
  );
}
