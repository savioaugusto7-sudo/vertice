"use client";

import React, { useState } from "react";
import { useVertice } from "@/context/VerticeContext";
import { formatCurrency } from "@/lib/utils";
import {
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  FolderArchive,
  ShieldCheck,
  Building,
  Sparkles,
  ArrowRight,
  Send,
  FileText,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function FechamentoView() {
  const { monthlyClosing, autoReconcileAll } = useVertice();
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const is100Percent = monthlyClosing.readinessPercent === 100;

  const handleExportPackage = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleSendToAccounting = () => {
    setSendSuccess(true);
    setTimeout(() => setSendSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Status Fechamento */}
      <div
        className={cn(
          "p-6 lg:p-8 rounded-3xl border transition-all duration-300 relative overflow-hidden",
          is100Percent
            ? "bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-900 border-emerald-500/40"
            : "bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border-slate-800"
        )}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700">
                Competência: {monthlyClosing.competence}
              </span>
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5",
                  is100Percent
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                )}
              >
                {is100Percent ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Status: 100% — Pronto para Contabilidade
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Status: {monthlyClosing.readinessPercent}% — Existem Pendências
                  </>
                )}
              </span>
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight">
              Fechamento Contábil Mensal Automatizado
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              O sistema consolidou todos os lançamentos das 5 fontes de dados. Abaixo está o checklist automático verificado contra as diretrizes do escritório contábil.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleExportPackage}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all shadow-md active:scale-95"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{downloadSuccess ? "Baixando Pacote .ZIP..." : "Baixar Pacote Contábil (.ZIP)"}</span>
            </button>

            <button
              onClick={handleSendToAccounting}
              disabled={!is100Percent}
              className={cn(
                "w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-extrabold text-xs shadow-xl transition-all active:scale-95",
                is100Percent
                  ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20"
                  : "bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700"
              )}
            >
              <Send className="w-4 h-4" />
              <span>{sendSuccess ? "Transmitido com Sucesso!" : "Transmitir Direto p/ Contabilidade"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Checklist Automático vs Pacote Contábil 5 Blocos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Checklist Automático */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Checklist Automático da Competência
              </h3>
              <p className="text-xs text-slate-400">
                Gerado a partir das transações reais das integrações ativas.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {monthlyClosing.checklist.filter((i) => i.status === "ok").length} /{" "}
              {monthlyClosing.checklist.length} Aprovados
            </span>
          </div>

          <div className="space-y-3">
            {monthlyClosing.checklist.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 flex items-start gap-3"
              >
                {item.status === "ok" ? (
                  <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="p-1 rounded-full bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{item.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Auto-verificado
                    </span>
                  </div>
                  <p className="text-slate-400 mt-0.5">{item.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Os 5 Blocos do Pacote Contábil */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-blue-400" />
                Estrutura do Pacote Contábil Consolidado
              </h3>
              <p className="text-xs text-slate-400">
                Os 5 blocos fundamentais exigidos pelo escritório contábil.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-300">
              5 / 5 Blocos Prontos
            </span>
          </div>

          <div className="space-y-3">
            {/* Bloco 1: Financeiro */}
            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    1. Bloco Financeiro
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Receitas, despesas, tarifas, extrato Itaú e fluxo DRE
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {monthlyClosing.packages.financial.count} registros
              </span>
            </div>

            {/* Bloco 2: Fiscal */}
            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    2. Bloco Fiscal
                  </span>
                  <span className="text-[11px] text-slate-400">
                    XMLs de NF-e, NFS-e, NFC-e emitidas e recebidas
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {monthlyClosing.packages.fiscal.count} XMLs
              </span>
            </div>

            {/* Bloco 3: Trabalhista */}
            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    3. Bloco Trabalhista
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Espelhos de ponto digital, folha e provisões
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {monthlyClosing.packages.labor.count} colaboradores
              </span>
            </div>

            {/* Bloco 4: Patrimonial */}
            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    4. Bloco Patrimonial
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Bens do ativo imobilizado e aquisições do mês
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {monthlyClosing.packages.assets.count} itens
              </span>
            </div>

            {/* Bloco 5: Documental */}
            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <FolderArchive className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    5. Bloco Documental
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Comprovantes de pagamento, DARFs e contratos
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {monthlyClosing.packages.documents.count} anexos
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
