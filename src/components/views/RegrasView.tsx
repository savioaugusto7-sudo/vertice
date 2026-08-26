"use client";

import React, { useState } from "react";
import { useVertice } from "@/context/VerticeContext";
import {
  Zap,
  Sparkles,
  ShieldCheck,
  Plus,
  Trash2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export function RegrasView() {
  const { learnedRules } = useVertice();
  const [newPattern, setNewPattern] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [rulesList, setRulesList] = useState(learnedRules);

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPattern || !newCategory) return;
    const rule = {
      id: `rule-${Date.now()}`,
      pattern: newPattern,
      targetCategory: newCategory,
      date: new Date().toISOString().split("T")[0],
    };
    setRulesList([rule, ...rulesList]);
    setNewPattern("");
    setNewCategory("");
  };

  const handleDeleteRule = (id: string) => {
    setRulesList(rulesList.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-purple-700" />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-900">
              Aprendizado de Padrões Contábeis
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Redução Progressiva de Input Manual
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Toda vez que você resolve uma divergência ou classifica um lançamento, o Vértice memoriza a regra para automatizar os próximos meses com 100% de auditabilidade.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-purple-50 border border-purple-200 px-3.5 py-2 rounded-xl text-xs text-purple-900 font-bold">
            {rulesList.length} Regras Ativas
          </div>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Formulário */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-slate-900" />
            Cadastrar Nova Regra
          </h3>
          <p className="text-xs text-slate-500">
            Defina palavras-chave que o sistema deve monitorar em extratos e notas.
          </p>

          <form onSubmit={handleAddRule} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Padrão no Extrato / Descrição
              </label>
              <input
                type="text"
                placeholder="Ex: TAR MANUT, ENEL, GOOGLE..."
                value={newPattern}
                onChange={(e) => setNewPattern(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Classificação Contábil Alvo
              </label>
              <input
                type="text"
                placeholder="Ex: Despesas Bancárias, Energia..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Salvar Regra de Automação</span>
            </button>
          </form>
        </div>

        {/* Right: Lista */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Regras Memorizadas & Auditáveis
              </h3>
              <p className="text-xs text-slate-500">
                Aplicadas em background a cada sincronização das fontes.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {rulesList.map((rule) => (
              <div
                key={rule.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-mono font-bold text-[11px] border border-purple-200">
                      SE CONTÉM: &quot;{rule.pattern}&quot;
                    </span>
                    <span className="text-slate-400">➔</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[11px] border border-emerald-200">
                      CLASSIFICAR: {rule.targetCategory}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    Criada em {formatDate(rule.date)} • 100% de precisão
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                  title="Remover regra"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
