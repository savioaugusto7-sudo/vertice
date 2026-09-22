"use client";

import React, { useState } from "react";
import {
  Lock,
  Fingerprint,
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { useFinance } from "@/context/VerticeContext";

export function LockScreen() {
  const { setSession } = useFinance();
  const [email, setEmail] = useState("savio@vertice.app");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Credenciais inválidas.");
      }

      setSession(data.user, data.method || "Senha Mestre (PBKDF2)");
    } catch (err: any) {
      setError(err?.message || "Falha na autenticação. Verifique seu e-mail e senha.");
    } finally {
      setLoading(false);
    }
  };

  const handleWebAuthnLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      if (typeof window === "undefined" || !window.PublicKeyCredential) {
        throw new Error("Seu navegador não possui suporte a WebAuthn / FIDO2.");
      }

      const challengeRes = await fetch("/api/auth/webauthn/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!challengeRes.ok) {
        throw new Error("Falha ao comunicar com o módulo de segurança biométrica.");
      }

      const options = await challengeRes.json();
      const challengeBuffer = Uint8Array.from(
        atob(options.challenge.replace(/-/g, "+").replace(/_/g, "/")),
        (c) => c.charCodeAt(0)
      );

      const credential: any = await navigator.credentials.get({
        publicKey: {
          challenge: challengeBuffer,
          timeout: 60000,
          userVerification: "required",
        },
      });

      if (!credential) {
        throw new Error("Biometria não autorizada pelo Windows Hello.");
      }

      const verifyRes = await fetch("/api/auth/webauthn/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          credential: { id: credential.id },
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || "Falha ao validar biometria.");
      }

      setSession(verifyData.user, "Windows Hello (FIDO2)");
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setError("Autenticação biométrica cancelada pelo usuário ou leitor.");
      } else {
        setError(err?.message || "Erro na biometria do sistema operacional.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Top Gradient Banner */}
        <div className="px-8 pt-8 pb-6 bg-gradient-to-b from-violet-950/40 to-transparent text-center border-b border-slate-100 dark:border-slate-800/60">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-violet-600/30 mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Vértice Finanças
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Sistema seguro com criptografia de ponta a ponta
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mt-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Autenticação Real Obrigatória</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5 animate-in shake">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Form Body */}
        <div className="p-8 space-y-4">
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                E-mail Cadastrado
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="savio@vertice.app"
                className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Senha Mestre / PIN
                </label>
                <span className="text-[10px] text-slate-400">Padrão PBKDF2</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm shadow-violet-600/20"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span>{loading ? "Verificando Criptografia..." : "Desbloquear com Senha Mestre"}</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              ou Biometria
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          {/* Windows Hello Button */}
          <button
            type="button"
            onClick={handleWebAuthnLogin}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
          >
            <Fingerprint className="w-4 h-4 text-violet-600" />
            <span>Acessar via Windows Hello / Biometria</span>
          </button>

          {/* Credencial inicial para o titular */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            <p className="font-bold text-slate-700 dark:text-slate-300 mb-0.5">Credencial Inicial de Administrador:</p>
            <p>E-mail: <span className="font-mono text-slate-900 dark:text-white font-bold">savio@vertice.app</span></p>
            <p>Senha Mestre: <span className="font-mono text-slate-900 dark:text-white font-bold">vertice2026</span></p>
            <p className="text-[10px] text-slate-400 mt-1">
              (Você pode alterar a senha mestre a qualquer momento nas configurações do seu perfil).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
