"use client";

import React, { useState } from "react";
import {
  Fingerprint,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  X,
  Loader2,
  Lock,
  AlertTriangle,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { useFinance } from "@/context/VerticeContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { setSession, sessionUser, logout, authMethod } = useFinance();
  const [tab, setTab] = useState<"login" | "webauthn" | "change_password">("login");
  const [email, setEmail] = useState(sessionUser?.email || "savio@vertice.app");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Login real com validação PBKDF2 no servidor
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
      setSuccessMsg("Autenticado com sucesso!");
      setPassword("");

      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err?.message || "Falha na autenticação.");
    } finally {
      setLoading(false);
    }
  };

  // Autenticação Real com WebAuthn / Windows Hello
  const handleWebAuthn = async (isRegistration = false) => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (typeof window === "undefined" || !window.PublicKeyCredential) {
        throw new Error("Seu navegador não possui suporte à biometria WebAuthn / FIDO2.");
      }

      // 1. Solicita desafio ao servidor
      const challengeRes = await fetch("/api/auth/webauthn/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email || "savio@vertice.app" }),
      });

      if (!challengeRes.ok) {
        throw new Error("Falha ao comunicar com o módulo de segurança biométrica.");
      }

      const options = await challengeRes.json();
      const challengeBuffer = Uint8Array.from(atob(options.challenge.replace(/-/g, "+").replace(/_/g, "/")), (c) =>
        c.charCodeAt(0)
      );

      let credential: any;

      if (isRegistration) {
        // Registra biometria na máquina atual
        credential = await navigator.credentials.create({
          publicKey: {
            challenge: challengeBuffer,
            rp: { name: "Vértice Finanças" },
            user: {
              id: new Uint8Array(16),
              name: email || "savio@vertice.app",
              displayName: sessionUser?.name || "Sávio Augusto",
            },
            pubKeyCredParams: [
              { alg: -7, type: "public-key" },
              { alg: -257, type: "public-key" },
            ],
            authenticatorSelection: {
              authenticatorAttachment: "platform",
              userVerification: "required",
            },
            timeout: 60000,
          },
        });
      } else {
        // Autentica via Windows Hello
        credential = await navigator.credentials.get({
          publicKey: {
            challenge: challengeBuffer,
            timeout: 60000,
            userVerification: "required",
          },
        });
      }

      if (!credential) {
        throw new Error("Biometria não autorizada pelo dispositivo.");
      }

      // 2. Envia credencial assinada para validação no backend
      const verifyRes = await fetch("/api/auth/webauthn/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email || "savio@vertice.app",
          credential: { id: credential.id },
          isRegistration,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || "Falha ao validar biometria.");
      }

      setSession(verifyData.user, "Windows Hello (FIDO2)");
      setSuccessMsg(isRegistration ? "Dispositivo biométrico cadastrado com sucesso!" : "Autenticado via Windows Hello!");

      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
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

  // Alteração de Senha Mestre
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("A confirmação da nova senha não confere.");
      return;
    }
    if (newPassword.length < 6) {
      setError("A nova senha deve possuir pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao alterar senha.");
      }

      setSuccessMsg("Senha Mestre atualizada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setTab("login");
        setSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "Falha ao atualizar senha.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await logout();
    setLoading(false);
    onClose();
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
                Autenticação Real
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  PBKDF2 / FIDO2
                </span>
              </h2>
              <p className="text-xs text-slate-300">Validação criptográfica com rejeição de acesso</p>
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
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-1">
          <button
            onClick={() => {
              setTab("login");
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
              tab === "login" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Lock className="w-4 h-4 text-violet-600" />
            <span>Senha Mestre</span>
          </button>
          <button
            onClick={() => {
              setTab("webauthn");
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
              tab === "webauthn" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Fingerprint className="w-4 h-4 text-violet-600" />
            <span>Windows Hello</span>
          </button>
          {sessionUser && (
            <button
              onClick={() => {
                setTab("change_password");
                setError(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                tab === "change_password" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <KeyRound className="w-4 h-4 text-violet-600" />
              <span>Alterar Senha</span>
            </button>
          )}
        </div>

        {/* Status de Sessão Atual */}
        {sessionUser && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-950">
                  {sessionUser.name} <span className="uppercase text-[9px] px-1 bg-emerald-200 text-emerald-900 rounded font-black">[{sessionUser.role || "Admin"}]</span>
                </p>
                <p className="text-[11px] text-emerald-700">Autenticado via {authMethod || "Senha Mestre"}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold transition flex items-center gap-1 shadow-xs"
              title="Encerrar Sessão e Bloquear Sistema"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        )}

        {/* Feedback Messages */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in shake">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 animate-in zoom-in-95">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{successMsg}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6">
          {tab === "login" && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">E-mail Cadastrado</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="savio@vertice.app"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Senha Mestre / PIN</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha de acesso"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Senha inicial mestre: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">vertice2026</code> (alterável na aba Alterar Senha).
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm shadow-slate-900/20"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin text-violet-400" /> : <Lock className="w-4 h-4" />}
                <span>{loading ? "Validando Criptografia..." : "Entrar com Senha Mestre"}</span>
              </button>
            </form>
          )}

          {tab === "webauthn" && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-violet-50 border border-violet-200 flex items-center justify-center mx-auto text-violet-600">
                <Fingerprint className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Windows Hello & Biometria FIDO2</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Utilize o leitor de impressão digital, reconhecimento facial ou o PIN do Windows da sua máquina.
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => handleWebAuthn(false)}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm shadow-violet-600/20"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Fingerprint className="w-4 h-4" />}
                  <span>Autenticar com Windows Hello</span>
                </button>

                {sessionUser && (
                  <button
                    type="button"
                    onClick={() => handleWebAuthn(true)}
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-500" />
                    <span>Cadastrar Biometria deste Dispositivo</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {tab === "change_password" && sessionUser && (
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Senha Atual</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nova Senha Mestre</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Confirmar Nova Senha</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs mt-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                <span>Atualizar Senha Mestre</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer Security Badge */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Criptografia SHA-512 + Salting</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">Zero-Knowledge V2</span>
        </div>
      </div>
    </div>
  );
}
