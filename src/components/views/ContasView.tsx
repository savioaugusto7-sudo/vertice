"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/VerticeContext";
import { formatCurrency } from "@/lib/finance";
import { cn } from "@/lib/utils";
import { Account, Transaction } from "@/types";
import {
  Wallet, CreditCard, TrendingUp, Banknote, Plus, Upload,
  RefreshCw, CheckCircle2, AlertCircle, X, Trash2, Globe, Sparkles
} from "lucide-react";
import { ImportModal } from "@/components/modals/ImportModal";
import { PluggyConnectModal } from "@/components/modals/PluggyConnectModal";

const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  corrente: "Conta Corrente",
  poupanca: "Poupança",
  cartao_credito: "Cartão de Crédito",
  investimento: "Conta Investimento",
  dinheiro: "Dinheiro",
  outro: "Outro",
};

const ACCOUNT_TYPE_ICON: Record<string, React.ElementType> = {
  corrente: Wallet,
  poupanca: Banknote,
  cartao_credito: CreditCard,
  investimento: TrendingUp,
  dinheiro: Banknote,
  outro: Wallet,
};

const BANK_COLORS: Record<string, string> = {
  Nubank: "#8b5cf6",
  "Banco Inter": "#f97316",
  Itaú: "#003d7a",
  Bradesco: "#cc0000",
  "Banco do Brasil": "#f5be00",
  Santander: "#ec0000",
  Dinheiro: "#10b981",
};

export function ContasView() {
  const { accounts, addAccount, deleteAccount, addTransactions, transactions } = useFinance();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPluggyModal, setShowPluggyModal] = useState(false);
  const [targetAccountId, setTargetAccountId] = useState<string>("");
  const [isConnectingOpenFinance, setIsConnectingOpenFinance] = useState(false);
  const [openFinanceMsg, setOpenFinanceMsg] = useState<string | null>(null);

  // Totais
  const totalAtivos = accounts
    .filter((a) => a.type !== "cartao_credito")
    .reduce((acc, a) => acc + a.balance, 0);
  const totalCartoes = accounts
    .filter((a) => a.type === "cartao_credito")
    .reduce((acc, a) => acc + a.balance, 0);

  // Contar transações por conta
  const txCountByAccount = transactions.reduce<Record<string, number>>((acc, t) => {
    acc[t.accountId] = (acc[t.accountId] || 0) + 1;
    return acc;
  }, {});

  const handleOpenFinanceConnect = async (bankName: string) => {
    setIsConnectingOpenFinance(true);
    setOpenFinanceMsg(null);
    try {
      const res = await fetch("/api/pluggy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bank: bankName }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.account) {
          addAccount(data.account);
          if (Array.isArray(data.sampleTransactions)) {
            const txsWithAccount = data.sampleTransactions.map((st: any) => ({
              ...st,
              accountId: data.account.id,
            }));
            addTransactions(txsWithAccount);
          }
          setOpenFinanceMsg(`Conectado com sucesso ao ${bankName}! Conta e transações sincronizadas.`);
        }
      }
    } catch {
      setOpenFinanceMsg(`Erro ao sincronizar com ${bankName}.`);
    } finally {
      setIsConnectingOpenFinance(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900">Minhas Contas & Conexões</h2>
          <p className="text-sm text-slate-500 mt-0.5">{accounts.length} contas cadastradas</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setTargetAccountId(accounts[0]?.id || "");
              setShowImportModal(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Upload className="w-4 h-4 text-blue-600" /> Importar OFX / CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Nova Conta
          </button>
        </div>
      </div>

      {/* Banner Open Finance (Fase 2) */}
      <div className="p-5 bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 text-white rounded-2xl shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm">
              <Globe className="w-6 h-6 text-violet-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                Conexão Open Finance (Pluggy / Sandbox)
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Pronto para uso
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Conecte seu banco real com credenciais Pluggy ou simule a sincronização instantânea em 1 clique
              </p>
            </div>
          </div>
        </div>

        {openFinanceMsg && (
          <div className="flex items-center gap-2 p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{openFinanceMsg}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setShowPluggyModal(true)}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-95 text-xs font-bold text-white transition border border-violet-400/40 shadow-sm flex items-center gap-2"
          >
            <Globe className="w-4 h-4 text-emerald-300" />
            <span>Conectar Banco Real (Pluggy Widget)</span>
          </button>
          <span className="text-xs text-slate-400 font-medium ml-2">Simulação Sandbox rápida:</span>
          {["Nubank", "Banco Inter", "Itaú", "Bradesco"].map((bank) => (
            <button
              key={bank}
              type="button"
              disabled={isConnectingOpenFinance}
              onClick={() => handleOpenFinanceConnect(bank)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-semibold text-white transition border border-white/10 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{bank}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Saldo Total (Ativos)", value: totalAtivos, color: "text-slate-900", bg: "bg-white border-slate-200" },
          { label: "Faturas de Cartão", value: Math.abs(totalCartoes), color: "text-rose-600", bg: "bg-rose-50 border-rose-200" },
          { label: "Contas Cadastradas", value: accounts.length, color: "text-violet-700", bg: "bg-violet-50 border-violet-200", isCnt: true },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-2xl border p-4 shadow-xs", s.bg)}>
            <p className="text-xs text-slate-500 font-medium mb-1">{s.label}</p>
            <p className={cn("text-2xl font-black", s.color)}>
              {s.isCnt ? s.value : formatCurrency(s.value as number)}
            </p>
          </div>
        ))}
      </div>

      {/* Contas Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => {
          const Icon = ACCOUNT_TYPE_ICON[acc.type] ?? Wallet;
          const bankColor = BANK_COLORS[acc.bank] ?? "#94a3b8";
          const isCard = acc.type === "cartao_credito";
          const txCount = txCountByAccount[acc.id] ?? 0;

          return (
            <div
              key={acc.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Top color strip */}
              <div className="h-1.5 w-full" style={{ background: bankColor }} />

              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: bankColor + "20" }}
                    >
                      <Icon className="w-5 h-5" style={{ color: bankColor }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-tight">{acc.name}</p>
                      <p className="text-xs text-slate-500">{ACCOUNT_TYPE_LABEL[acc.type]}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-semibold",
                    acc.status === "ativa" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                  )}>
                    {acc.status === "ativa" ? "Ativa" : "Inativa"}
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">
                      {isCard ? "Fatura Atual" : "Saldo Disponível"}
                    </p>
                    <p className={cn(
                      "text-2xl font-black mt-0.5",
                      isCard ? "text-rose-600" : "text-slate-900"
                    )}>
                      {isCard
                        ? formatCurrency(Math.abs(acc.balance))
                        : formatCurrency(acc.balance)}
                    </p>
                    {isCard && acc.limit && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        Limite: {formatCurrency(acc.limit)} · Disponível: {formatCurrency(acc.limit - Math.abs(acc.balance))}
                      </p>
                    )}
                  </div>

                  {isCard && acc.dueDate && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Vencimento dia {acc.dueDate}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <RefreshCw className="w-3 h-3" />
                      {acc.lastSync
                        ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(acc.lastSync))
                        : "Não sincronizado"}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setTargetAccountId(acc.id);
                          setShowImportModal(true);
                        }}
                        className="p-1.5 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                        title="Importar extrato para esta conta"
                      >
                        <Upload className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Tem certeza que deseja excluir a conta "${acc.name}"?`)) {
                            deleteAccount(acc.id);
                          }
                        }}
                        className="p-1.5 text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Excluir conta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Card de adicionar */}
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-white rounded-2xl border-2 border-dashed border-slate-200 shadow-xs p-5 flex flex-col items-center justify-center gap-3 hover:border-violet-300 hover:bg-violet-50 transition-all text-slate-400 hover:text-violet-600 min-h-48"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
            <Plus className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold">Adicionar Conta</p>
        </button>
      </div>

      {/* Modal de Importação OFX / CSV (Fase 2) */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        targetAccountId={targetAccountId}
      />

      {/* Modal: Pluggy Connect Real Widget */}
      <PluggyConnectModal
        isOpen={showPluggyModal}
        onClose={() => setShowPluggyModal(false)}
        onSuccessMessage={(msg) => setOpenFinanceMsg(msg)}
      />

      {/* Modal: Nova Conta — versão simplificada */}
      {showAddModal && (
        <AddAccountModal onClose={() => setShowAddModal(false)} onAdd={addAccount} />
      )}
    </div>
  );
}

function AddAccountModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (account: Omit<Account, "id">) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    bank: "",
    type: "corrente" as Account["type"],
    balance: "",
    color: "#8b5cf6",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      name: form.name,
      bank: form.bank,
      type: form.type,
      balance: parseFloat(form.balance.replace(",", ".")) || 0,
      color: form.color,
      iconName: "Wallet",
      status: "ativa",
      lastSync: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Nova Conta</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {[
            { label: "Nome da Conta", key: "name", placeholder: "Ex: Nubank Conta Corrente" },
            { label: "Banco / Instituição", key: "bank", placeholder: "Ex: Nubank" },
            { label: "Saldo Atual (R$)", key: "balance", placeholder: "0,00", type: "number" },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-xs font-bold text-slate-700 block mb-1">{f.label}</label>
              <input
                required
                type={f.type ?? "text"}
                step="0.01"
                placeholder={f.placeholder}
                value={(form as any)[f.key]}
                onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Tipo</label>
            <select
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as Account["type"] }))}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {Object.entries(ACCOUNT_TYPE_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Cancelar
            </button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700">
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
