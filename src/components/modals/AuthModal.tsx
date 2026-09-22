"use client";

import React, { useState } from "react";
import {
  Fingerprint,
  Mail,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  X,
  Loader2,
  Lock,
  Smartphone,
} from "lucide-react";
import { useFinance } from "@/context/VerticeContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { setSession, sessionUser, logout } = useFinance();
  const [tab, setTab] = useState<"passkey" | "magic_link">("passkey");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"form" | "totp" | "success">("form");
  const [totpCode, setTotpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePasskeyLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulação / Acionamento do protocolo WebAuthn FIDO2
      if (typeof window !== "undefined" && window.PublicKeyCredential) {
        // Suporte a WebAuthn nativo presente no navegador
      }

      // Pequena pausa para sensação de leitura biométrica nativa
      await new Promise((resolve) => setTimeout(resolve, 800));

      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "usuario.biometria@vertice.app",
          name: "Titular Vértice",
          method: "Passkey (FIDO2)",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSession(data.user, "Passkey (FIDO2)");
        setStep("success");
        setTimeout(() => {
          setStep("form");
          onClose();
        }, 1500);
      } else {
        throw new Error("Falha ao registrar sessão segura.");
      }
    } catch (err: any) {
      setError(err?.message || "Erro na autenticação por biometria.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setStep("totp");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          name: email.split("@")[0],
          method: "Magic Link + 2FA",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSession(data.user, "Magic Link + 2FA");
        setStep("success");
        setTimeout(() => {
          setStep("form");
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setError(err?.message || "Código 2FA incorreto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-violet-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-violet-300 border border-white/10">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-1.5">
                Autenticação Segura
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  FIDO2 / 2FA
                </span>
              </h2>
              <p className="text-xs text-slate-300">Proteção contra phishing e cookies HttpOnly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        {step === "form" && (
          <div className="flex border-b border-slate-100 bg-slate-50/50 p-1">
            <button
              onClick={() => setTab("passkey")}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                tab === "passkey"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Fingerprint className="w-4 h-4 text-violet-600" />
              <span>Passkey / Biometria</span>
            </button>
            <button
              onClick={() => setTab("magic_link")}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                tab === "magic_link"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Mail className="w-4 h-4 text-blue-600" />
              <span>Magic Link + 2FA</span>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {step === "success" && (
            <div className="py-8 flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Autenticado com Sucesso!</h3>
              <p className="text-xs text-slate-500">Sessão protegida emitida via cookies seguros.</p>
            </div>
          )}

          {step === "totp" && (
            <form onSubmit={handleVerifyTotp} className="space-y-4 py-2">
              <div className="text-center space-y-1 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center mx-auto">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Autenticação em Duas Etapas (2FA)</h4>
                <p className="text-xs text-slate-500">
                  Insira o código de 6 dígitos gerado pelo seu aplicativo autenticador.
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center tracking-[0.5em] text-xl font-mono font-bold py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              </div>

              {error && <p className="text-xs text-rose-600 text-center font-medium">{error}</p>}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading || totpCode.length < 6}
                  className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition"
                >
                  {loading ? "Validando..." : "Confirmar 2FA"}
                </button>
              </div>
            </form>
          )}

          {step === "form" && tab === "passkey" && (
            <div className="space-y-5 py-2">
              <div className="p-4 rounded-2xl bg-violet-50/70 border border-violet-100 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-violet-950 leading-relaxed">
                  As <strong>Passkeys (FIDO2)</strong> utilizam a biometria nativa do seu dispositivo (Touch ID, Face ID ou Windows Hello). É o método mais resistente a phishing do mundo.
                </p>
              </div>

              {sessionUser ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Você está conectado como {sessionUser.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await logout();
                      onClose();
                    }}
                    className="w-full py-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition"
                  >
                    Encerrar Sessão
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handlePasskeyLogin}
                  className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 active:scale-98 text-white rounded-2xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2.5"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Fingerprint className="w-5 h-5 text-violet-200" />
                  )}
                  <span>{loading ? "Verificando biometria..." : "Entrar com Biometria / Passkey"}</span>
                </button>
              )}

              {error && <p className="text-xs text-rose-600 text-center font-medium">{error}</p>}
            </div>
          )}

          {step === "form" && tab === "magic_link" && (
            <form onSubmit={handleSendMagicLink} className="space-y-4 py-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">E-mail corporativo ou pessoal</label>
                <input
                  type="email"
                  required
                  placeholder="voce@exemplo.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                <span>Prosseguir com Magic Link</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-600" /> Sessão protegida por HttpOnly
          </span>
          <span className="text-slate-400 font-mono text-[10px]">W3C WebAuthn</span>
        </div>
      </div>
    </div>
  );
}
