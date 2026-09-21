"use client";

import React, { useState, useRef } from "react";
import { useFinance } from "@/context/VerticeContext";
import { X, Download, Upload, RotateCcw, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BackupModal({ isOpen, onClose }: BackupModalProps) {
  const {
    exportBackup,
    importBackup,
    resetToMock,
    accounts,
    transactions,
    debts,
    investments,
  } = useFinance();

  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [resetConfirm, setResetConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const jsonStr = exportBackup();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const today = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `vertice-backup-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importBackup(content);
      setImportStatus(success ? "success" : "error");
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    resetToMock();
    setResetConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Gerenciar Dados & Backup</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Seus dados ficam salvos localmente com total privacidade
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Status atual */}
          <div className="grid grid-cols-4 gap-2 text-center p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div>
              <div className="text-base font-bold text-slate-900 dark:text-white">{accounts.length}</div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Contas</div>
            </div>
            <div>
              <div className="text-base font-bold text-slate-900 dark:text-white">{transactions.length}</div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Transações</div>
            </div>
            <div>
              <div className="text-base font-bold text-slate-900 dark:text-white">{debts.length}</div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Dívidas</div>
            </div>
            <div>
              <div className="text-base font-bold text-slate-900 dark:text-white">{investments.length}</div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Ativos</div>
            </div>
          </div>

          {/* Exportar */}
          <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Download className="w-4 h-4 text-emerald-600" /> Exportar Backup (JSON)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Baixa um arquivo com todas as suas contas, dívidas e extratos
              </p>
            </div>
            <button
              type="button"
              onClick={handleExport}
              className="px-3.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 rounded-lg transition"
            >
              Baixar Backup
            </button>
          </div>

          {/* Restaurar */}
          <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-blue-600" /> Restaurar de um Arquivo
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Carrega um arquivo de backup previamente exportado
              </p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportFile}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 rounded-lg transition"
              >
                Selecionar JSON
              </button>
            </div>
          </div>

          {importStatus === "success" && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Backup restaurado com sucesso! Seus dados foram atualizados.</span>
            </div>
          )}

          {importStatus === "error" && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Formato de backup inválido. Certifique-se de escolher um arquivo .json exportado pelo Vértice.</span>
            </div>
          )}

          {/* Resetar dados */}
          <div className="p-4 border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-rose-600" /> Restaurar Demonstração
                </h4>
                <p className="text-xs text-rose-700 dark:text-rose-400">
                  Volta todos os dados para o cenário inicial educativo (Nubank, dívidas e investimentos)
                </p>
              </div>
              {!resetConfirm ? (
                <button
                  type="button"
                  onClick={() => setResetConfirm(true)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-white dark:bg-rose-900/60 hover:bg-rose-100 border border-rose-300 dark:border-rose-800 rounded-lg transition"
                >
                  Resetar
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setResetConfirm(false)}
                    className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                  >
                    Não
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition"
                  >
                    Confirmar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
