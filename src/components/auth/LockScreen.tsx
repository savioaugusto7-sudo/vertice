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
  UserPlus,
  LogIn,
  CheckCircle2,
} from "lucide-react";
import { useFinance } from "@/context/VerticeContext";

export function LockScreen() {
  const { setSession } = useFinance();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("savio@vertice.app");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    if (password !== confirmPassword) {
      setError("A confirmação da senha não coincide com a senha digitada.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Falha ao registrar novo usuário.");
      }

      setSuccessMsg(`Conta criada com sucesso! Entrando no sistema...`);
      setTimeout(() => {
        setSession(data.user, data.method || "Cadastro Real (PBKDF2)");
      }, 1000);
    } catch (err: any) {
      setError(err?.message || "Erro no cadastro de usuário.");
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
        <div className="px-8 pt-8 pb-5 bg-gradient-to-b from-violet-950/40 to-transparent text-center border-b border-slate-100 dark:border-slate-800/60">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-violet-600/30 mb-3">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Vértice Finanças
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Sistema seguro com criptografia de ponta a ponta
          </p>

          {/* Mode Tabs (Acessar vs Criar Conta) */}
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl mt-4 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                mode === "login"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <LogIn className="w-3.5 h-3.5 text-violet-600" />
              <span>Acessar</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                mode === "register"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Criar Conta</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5 animate-in shake">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-in zoom-in-95">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-4">
          {mode === "login" ? (
            <>
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
              <div className="relative flex py-1 items-center">
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
                <p className="font-bold text-slate-700 dark:text-slate-300 mb-0.5">Credencial do Administrador Mestre:</p>
                <p>E-mail: <span className="font-mono text-slate-900 dark:text-white font-bold">savio@vertice.app</span></p>
                <p>Senha Mestre: <span className="font-mono text-slate-900 dark:text-white font-bold">vertice2026</span></p>
              </div>
            </>
          ) : (
            /* Formulário de Cadastro de Novo Usuário */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Seu Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo"
                  className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  E-mail para Acesso
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Criar Senha Mestre (mínimo 6 dígitos)
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha segura"
                  className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha criada"
                  className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 mt-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                <span>{loading ? "Cadastrando Criptografia..." : "Criar Conta e Acessar"}</span>
              </button>

              <p className="text-[11px] text-center text-slate-400 pt-1">
                Seus dados serão protegidos localmente com cifragem AES-256 e PBKDF2.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
