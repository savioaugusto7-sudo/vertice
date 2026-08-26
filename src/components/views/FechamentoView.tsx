"use client";

import React, { useState } from "react";
import { useVertice } from "@/context/VerticeContext";
import {
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  FolderArchive,
  Building,
  Send,
  FileText,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function FechamentoView() {
  const { monthlyClosing } = useVertice();
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
          "p-6 lg:p-7 rounded-2xl border transition-all duration-300 bg-white shadow-xs",
          is100Percent ? "border-emerald-300" : "border-slate-200"
        )}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                Competência: {monthlyClosing.competence}
              </span>
              <span
                className={cn(
                  "px-2.5 py-0.5 rounded-md text-xs font-bold flex items-center gap-1.5",
                  is100Percent
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-amber-50 text-amber-900 border border-amber-200"
                )}
              >
                {is100Percent ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    Status: 100% — Pronto para Contabilidade
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                    Status: {monthlyClosing.readinessPercent}% — Existem Pendências
                  </>
                )}
              </span>
            </div>

            <h2 className="text-xl lg:text-2xl font-black text-slate-950 tracking-tight">
              Fechamento Contábil Mensal Automatizado
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              O sistema consolidou todos os lançamentos das 5 fontes de dados. Abaixo está o checklist automático verificado contra as diretrizes do escritório contábil.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <button
              onClick={handleExportPackage}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs border border-slate-200 transition-all shadow-2xs active:scale-95"
            >
              <Download className="w-4 h-4 text-slate-700" />
              <span>{downloadSuccess ? "Baixando Pacote .ZIP..." : "Baixar Pacote Contábil (.ZIP)"}</span>
            </button>

            <button
              onClick={handleSendToAccounting}
              disabled={!is100Percent}
              className={cn(
                "w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-bold text-xs shadow-xs transition-all active:scale-95",
                is100Percent
                  ? "bg-slate-900 hover:bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
              )}
            >
              <Send className="w-4 h-4 text-emerald-400" />
              <span>{sendSuccess ? "Transmitido com Sucesso!" : "Transmitir Direto p/ Contabilidade"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Checklist Automático vs Pacote Contábil 5 Blocos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Checklist Automático */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                Checklist Automático da Competência
              </h3>
              <p className="text-xs text-slate-500">
                Gerado a partir das transações reais das integrações ativas.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-900">
              {monthlyClosing.checklist.filter((i) => i.status === "ok").length} /{" "}
              {monthlyClosing.checklist.length} Aprovados
            </span>
          </div>

          <div className="space-y-2.5">
            {monthlyClosing.checklist.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3"
              >
                {item.status === "ok" ? (
                  <div className="p-1 rounded-md bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="p-1 rounded-md bg-amber-100 text-amber-900 shrink-0 mt-0.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{item.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Auto-verificado
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{item.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Os 5 Blocos do Pacote Contábil */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-slate-700" />
                Estrutura do Pacote Contábil Consolidado
              </h3>
              <p className="text-xs text-slate-500">
                Os 5 blocos fundamentais exigidos pela auditoria e contabilidade.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800">
              5 / 5 Blocos Prontos
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Bloco 1: Financeiro */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    1. Bloco Financeiro
                  </span>
                  <span className="text-[11px] text-slate-600">
                    Receitas, despesas, tarifas, extrato Itaú e fluxo DRE
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-900 font-bold">
                {monthlyClosing.packages.financial.count} registros
              </span>
            </div>

            {/* Bloco 2: Fiscal */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    2. Bloco Fiscal
                  </span>
                  <span className="text-[11px] text-slate-600">
                    XMLs de NF-e, NFS-e, NFC-e emitidas e recebidas
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-900 font-bold">
                {monthlyClosing.packages.fiscal.count} XMLs
              </span>
            </div>

            {/* Bloco 3: Trabalhista */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-800 border border-purple-200">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    3. Bloco Trabalhista
                  </span>
                  <span className="text-[11px] text-slate-600">
                    Espelhos de ponto digital, folha e provisões
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-900 font-bold">
                {monthlyClosing.packages.labor.count} colaboradores
              </span>
            </div>

            {/* Bloco 4: Patrimonial */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    4. Bloco Patrimonial
                  </span>
                  <span className="text-[11px] text-slate-600">
                    Bens do ativo imobilizado e aquisições do mês
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-900 font-bold">
                {monthlyClosing.packages.assets.count} itens
              </span>
            </div>

            {/* Bloco 5: Documental */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-800 border border-slate-300">
                  <FolderArchive className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    5. Bloco Documental
                  </span>
                  <span className="text-[11px] text-slate-600">
                    Comprovantes de pagamento, DARFs e contratos
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-900 font-bold">
                {monthlyClosing.packages.documents.count} anexos
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
