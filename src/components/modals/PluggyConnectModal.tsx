"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { X, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { useFinance } from "@/context/VerticeContext";

// Import dinâmico com ssr: false pois o pluggy-connect-sdk acessa window diretamente
const DynamicPluggyConnect = dynamic(
  () => import("react-pluggy-connect").then((mod) => mod.PluggyConnect),
  { ssr: false }
);

interface PluggyConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessMessage?: (msg: string) => void;
}

export function PluggyConnectModal({
  isOpen,
  onClose,
  onSuccessMessage,
}: PluggyConnectModalProps) {
  const { addAccount, addTransactions } = useFinance();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setToken(null);
      setError(null);
      setSyncing(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    // Gerar token de conexão com a API da Pluggy
    fetch("/api/pluggy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create_connect_token" }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Falha ao gerar Connect Token na Pluggy");
        }
        if (isMounted) {
          setToken(data.connectToken);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Erro de conexão com o serviço Open Finance.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSuccess = async (data: { item: { id: string } }) => {
    try {
      setSyncing(true);
      const itemId = data?.item?.id;
      if (!itemId) {
        onClose();
        return;
      }

      // Sincronizar contas e transações da instituição conectada
      const res = await fetch("/api/pluggy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "fetch_item_data", itemId }),
      });

      if (res.ok) {
        const result = await res.json();
        if (Array.isArray(result.accounts)) {
          for (const acc of result.accounts) {
            addAccount(acc);
          }
        }
        if (Array.isArray(result.transactions)) {
          addTransactions(result.transactions);
        }

        const msg = `Banco ${result.institution || "conectado"} sincronizado com sucesso!`;
        if (onSuccessMessage) onSuccessMessage(msg);
      } else {
        if (onSuccessMessage) {
          onSuccessMessage("Instituição conectada com sucesso na Pluggy!");
        }
      }
    } catch (err) {
      console.error("Erro ao sincronizar dados do item Pluggy:", err);
    } finally {
      setSyncing(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/90 p-0.5 flex items-center justify-center shadow-xs overflow-hidden">
              <img src="/favicon-64.png" alt="Vértice Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                Conectar via Open Finance
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold border border-emerald-200">
                  Pluggy Live
                </span>
              </h3>
              <p className="text-xs text-slate-500">Criptografia ponta a ponta e autorização bancária</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center justify-center min-h-[380px]">
          {loading && (
            <div className="flex flex-col items-center text-center space-y-3 py-10">
              <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-800">Inicializando Pluggy Connect...</p>
              <p className="text-xs text-slate-500 max-w-xs">
                Estabelecendo canal seguro com a infraestrutura oficial de Open Finance.
              </p>
            </div>
          )}

          {syncing && (
            <div className="flex flex-col items-center text-center space-y-3 py-10">
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-800">Sincronizando contas e extratos...</p>
              <p className="text-xs text-slate-500 max-w-xs">
                Importando saldos e transações recentes para seu Vértice.
              </p>
            </div>
          )}

          {error && !loading && !syncing && (
            <div className="flex flex-col items-center text-center space-y-4 py-8 max-w-sm">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">Não foi possível iniciar o widget</h4>
                <p className="text-xs text-rose-600 leading-relaxed">{error}</p>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
              >
                Fechar
              </button>
            </div>
          )}

          {token && !loading && !syncing && (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="w-full flex justify-center">
                <DynamicPluggyConnect
                  connectToken={token}
                  includeSandbox={false}
                  onSuccess={handleSuccess}
                  onError={(err) => {
                    console.error("Pluggy Connect erro:", err);
                    setError(err?.message || "Ocorreu um erro durante a autenticação bancária.");
                  }}
                  onClose={onClose}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Seus dados bancários nunca são expostos
          </span>
          <span className="text-slate-400 font-mono">Pluggy SDK 2.12</span>
        </div>
      </div>
    </div>
  );
}
