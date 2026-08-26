"use client";

import React, { useState } from "react";
import { useVertice } from "@/context/VerticeContext";
import {
  Zap,
  Sparkles,
  ShieldCheck,
  Plus,
  Trash2,
  CheckCircle2,
  Layers,
  History,
  BookOpen,
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
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Aprendizado de Padrões Contábeis
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Redução Progressiva de Input Manual
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Toda vez que você resolve uma divergência ou classifica um lançamento, o Vértice memoriza a regra para automatizar os próximos meses com 100% de auditabilidade.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-purple-500/10 border border-purple-500/30 px-3.5 py-2 rounded-xl text-xs text-purple-300 font-bold">
            {rulesList.length} Regras Ativas
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Criar Regra vs Lista de Regras */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Formulário de Nova Regra */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            Cadastrar Nova Regra
          </h3>
          <p className="text-xs text-slate-400">
            Defina palavras-chave que o sistema deve monitorar em extratos e notas.
          </p>

          <form onSubmit={handleAddRule} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Padrão no Extrato / Descrição
              </label>
              <input
                type="text"
                placeholder="Ex: TAR MANUT, ENEL, GOOGLE..."
                value={newPattern}
                onChange={(e) => setNewPattern(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Classificação Contábil Alvo
              </label>
              <input
                type="text"
                placeholder="Ex: Despesas Bancárias, Energia..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Salvar Regra de Automação</span>
            </button>
          </form>
        </div>

        {/* Right: Lista de Regras Memorizadas */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Regras Memorizadas & Auditáveis
              </h3>
              <p className="text-xs text-slate-400">
                Aplicadas em background a cada sincronização das fontes.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {rulesList.map((rule) => (
              <div
                key={rule.id}
                className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between gap-4"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-mono font-bold text-[11px]">
                      SE CONTÉM: &quot;{rule.pattern}&quot;
                    </span>
                    <span className="text-slate-400">➔</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                      CLASSIFICAR: {rule.targetCategory}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    Criada em {formatDate(rule.date)} • 100% de precisão
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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
