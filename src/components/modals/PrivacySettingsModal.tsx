"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Lock,
  Trash2,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  FileCheck,
  RefreshCw,
  ExternalLink,
  Ban,
} from "lucide-react";
import { useFinance } from "@/context/VerticeContext";

interface PrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacySettingsModal({ isOpen, onClose }: PrivacySettingsModalProps) {
  const {
    accounts,
    purgeAllUserData,
    exportBackup,
    isEncryptedStorage,
    sessionUser,
    authMethod,
    logout,
  } = useFinance();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletedSuccess, setDeletedSuccess] = useState(false);
  const [consentInfo, setConsentInfo] = useState<{ accepted: boolean; timestamp: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("vertice_lgpd_consent_v1");
      if (raw) {
        try {
          setConsentInfo(JSON.parse(raw));
        } catch {}
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExportData = () => {
    const jsonStr = exportBackup();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vertice_portabilidade_lgpd_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExecutePurge = async () => {
    setIsDeleting(true);
    try {
      await purgeAllUserData();
      setDeletedSuccess(true);
      setTimeout(() => {
        setIsDeleting(false);
        setDeletedSuccess(false);
        setConfirmDelete(false);
        onClose();
      }, 2500);
    } catch (err) {
      console.error("Erro ao purgar dados:", err);
      setIsDeleting(false);
    }
  };

  const pluggyAccounts = accounts.filter((a) => Boolean(a.pluggyItemId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400 border border-white/10">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                Central de Privacidade & LGPD
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Lei nº 13.709/2018
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Gerencie seus direitos, autorizações de Open Finance e segurança local.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs">
          {/* Status Geral de Segurança */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-800 font-bold mb-1">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Criptografia Ativa</span>
              </div>
              <p className="text-[11px] text-emerald-700">AES-256-GCM Zero-Knowledge no armazenamento local.</p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2 text-blue-800 font-bold mb-1">
                <FileCheck className="w-4 h-4 text-blue-600" />
                <span>Consentimento</span>
              </div>
              <p className="text-[11px] text-blue-700">
                {consentInfo?.accepted
                  ? `Registrado em ${new Date(consentInfo.timestamp).toLocaleDateString("pt-BR")}`
                  : "Consentimento local padrão"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-violet-50 border border-violet-200">
              <div className="flex items-center gap-2 text-violet-800 font-bold mb-1">
                <Shield className="w-4 h-4 text-violet-600" />
                <span>Sessão & Acesso</span>
              </div>
              <p className="text-[11px] text-violet-700">
                {sessionUser ? `Autenticado via ${authMethod || "Passkey"}` : "Modo Local Seguro"}
              </p>
            </div>
          </div>

          {/* Direito 1: Portabilidade de Dados (Art. 18, V) */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-violet-600" />
                  Portabilidade de Dados (Art. 18, V da LGPD)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Baixe uma cópia integral de todos os seus dados cadastrados, contas, transações e dívidas em formato padronizado e interoperável.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportData}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-xs transition flex items-center gap-1.5 flex-shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-violet-600" />
                <span>Exportar JSON</span>
              </button>
            </div>
          </div>

          {/* Conexões Open Finance Ativas & Revogação */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-indigo-600" />
              Conexões Open Finance (Pluggy)
            </h4>
            {pluggyAccounts.length === 0 ? (
              <p className="text-xs text-slate-500">Nenhum banco conectado via Open Finance no momento.</p>
            ) : (
              <div className="space-y-2">
                {pluggyAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200"
                  >
                    <div>
                      <p className="font-bold text-slate-800 text-xs">{acc.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">ID Item: {acc.pluggyItemId}</p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Conexão Ativa
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Direito 2: Direito ao Esquecimento / Eliminação Total (Art. 18, VI) */}
          <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/30 space-y-3">
            <div>
              <h4 className="font-bold text-rose-900 text-sm flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-rose-600" />
                Direito ao Esquecimento & Eliminação de Dados (Art. 18, VI da LGPD)
              </h4>
              <p className="text-xs text-rose-700/80 mt-0.5 leading-relaxed">
                Você pode solicitar a destruição imediata e irrecuperável de todo o seu histórico financeiro,
                contas, transações locais e revogação formal de consentimentos bancários junto ao Open Finance.
              </p>
            </div>

            {deletedSuccess ? (
              <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Todos os dados foram excluídos e conexões revogadas com sucesso!</span>
              </div>
            ) : confirmDelete ? (
              <div className="p-3.5 rounded-xl bg-rose-100 border border-rose-200 space-y-2.5 animate-in fade-in">
                <div className="flex items-start gap-2 text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-bold">
                    Tem certeza absoluta? Esta ação não pode ser desfeita. Todos os dados locais e tokens bancários serão destruídos permanentemente.
                  </p>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={handleExecutePurge}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition"
                  >
                    {isDeleting ? "Destruindo dados..." : "Sim, Excluir Tudo Definitivamente"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Solicitar Eliminação Total dos Dados</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Encarregado de Dados (DPO): dpo@vertice.app</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}
