"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, CheckCircle2, Lock, EyeOff, FileText, ChevronRight, X } from "lucide-react";

interface LGPDConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onClose?: () => void;
}

export function LGPDConsentModal({ isOpen, onAccept, onClose }: LGPDConsentModalProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "vertice_lgpd_consent_v1",
        JSON.stringify({
          accepted: true,
          timestamp: new Date().toISOString(),
          version: "2026.1",
          basis: "Consentimento Explícito (Art. 7º, I e Art. 8º da Lei nº 13.709/2018)",
        })
      );
    }
    onAccept();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-violet-950 text-white flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10 text-emerald-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">Privacidade & Proteção de Dados</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  LGPD Art. 8º
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Transparência total, criptografia de grau bancário e controle absoluto sob suas informações.
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-slate-600 text-xs leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-violet-50 border border-violet-100 flex gap-3 text-violet-900">
            <Lock className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs">Arquitetura Zero-Knowledge & Criptografia Local</p>
              <p className="text-[11px] text-violet-700 mt-0.5">
                Seus saldos, transações e dívidas são criptografados com <strong>AES-256-GCM</strong>. 
                Nem administradores nem servidores terceiros possuem acesso aos seus extratos.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider">
              Como tratamos seus dados:
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-start gap-2.5">
                <EyeOff className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800 text-xs">Sem Venda de Dados</p>
                  <p className="text-[11px] text-slate-500">Nunca comercializamos ou compartilhamos seus dados com anunciantes ou birôs de crédito.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800 text-xs">Finalidade Exclusiva</p>
                  <p className="text-[11px] text-slate-500">Dados lidos (OFX/Open Finance) servem apenas para o seu planejamento financeiro pessoal.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Direitos do Titular */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="font-black text-xs text-slate-900">Seus Direitos Garantidos pela LGPD (Art. 18):</h4>
            <ul className="space-y-1.5 list-disc list-inside text-[11px] text-slate-500">
              <li><strong>Direito ao Esquecimento:</strong> Exclua seu histórico integralmente a qualquer momento.</li>
              <li><strong>Portabilidade:</strong> Exporte todos os seus dados em formato JSON ou CSV com 1 clique.</li>
              <li><strong>Revogação Imediata:</strong> Desvincule bancos conectados no Open Finance quando desejar.</li>
            </ul>
          </div>

          {/* Checkbox de consentimento */}
          <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors mt-2">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500"
            />
            <span className="text-xs text-slate-700 font-medium">
              Li e concordo com os termos de privacidade, autorizando o processamento de dados para fins de gestão financeira e inteligência pessoal.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">Lei Federal 13.709/2018</span>
          <button
            type="button"
            disabled={!acceptedTerms}
            onClick={handleConfirm}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 active:scale-95 text-white text-xs font-bold transition shadow-sm"
          >
            <span>Confirmar e Continuar</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
