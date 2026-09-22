"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  Lock,
  Trash2,
  CheckCircle2,
  Ban,
  X,
  Loader2,
  KeyRound,
  Fingerprint,
  Mail,
  MoreVertical,
} from "lucide-react";
import { SystemUser } from "@/app/api/admin/users/route";

interface AdminUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminUsersModal({ isOpen, onClose }: AdminUsersModalProps) {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error("Erro ao carregar usuários:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setShowAddForm(false);
      setFeedbackMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setSubmitting(true);
    setFeedbackMsg(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMsg(`Convite enviado para ${name} com sucesso!`);
        setName("");
        setEmail("");
        setShowAddForm(false);
        fetchUsers();
      } else {
        setFeedbackMsg(data.error || "Erro ao adicionar usuário.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: SystemUser) => {
    const newStatus = user.status === "ativo" ? "bloqueado" : "ativo";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, status: newStatus }),
      });
      if (res.ok) {
        setFeedbackMsg(`Status de ${user.name} alterado para ${newStatus}.`);
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleRole = async (user: SystemUser) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, role: newRole }),
      });
      if (res.ok) {
        setFeedbackMsg(`Papel de ${user.name} atualizado para ${newRole.toUpperCase()}.`);
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (user: SystemUser) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário ${user.name}? Esta ação é irreversível.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/users?id=${user.id}`, { method: "DELETE" });
      if (res.ok) {
        setFeedbackMsg(`Usuário ${user.name} excluído do sistema.`);
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const activeCount = users.filter((u) => u.status === "ativo").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400 border border-white/10">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">Painel do Administrador</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  Acesso Restrito
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Controle de usuários, permissões de acesso e segurança da plataforma
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

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-100 text-xs font-bold text-emerald-800 flex items-center justify-between">
            <span>{feedbackMsg}</span>
            <button onClick={() => setFeedbackMsg(null)} className="text-emerald-600 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Métricas do Sistema */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
              <p className="text-xs text-slate-500 font-semibold mb-1">Total de Contas</p>
              <p className="text-2xl font-black text-slate-900">{totalUsers}</p>
            </div>
            <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/50">
              <p className="text-xs text-indigo-700 font-semibold mb-1">Administradores</p>
              <p className="text-2xl font-black text-indigo-900">{adminCount}</p>
            </div>
            <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50">
              <p className="text-xs text-emerald-700 font-semibold mb-1">Usuários Ativos</p>
              <p className="text-2xl font-black text-emerald-900">{activeCount}</p>
            </div>
          </div>

          {/* Barra de Ações */}
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-600" />
              Usuários Registrados
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm((p) => !p)}
              className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{showAddForm ? "Cancelar" : "Novo Usuário"}</span>
            </button>
          </div>

          {/* Formulário de Novo Usuário */}
          {showAddForm && (
            <form
              onSubmit={handleAddUser}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in"
            >
              <p className="text-xs font-bold text-slate-900">Convidar Novo Usuário para o Sistema</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">E-mail</label>
                  <input
                    type="email"
                    required
                    placeholder="carlos@exemplo.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Papel / Nível de Acesso</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="user">Usuário Padrão</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  {submitting ? "Cadastrando..." : "Enviar Convite"}
                </button>
              </div>
            </form>
          )}

          {/* Tabela de Usuários */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Titular</th>
                    <th className="py-3 px-4">Papel</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Autenticação</th>
                    <th className="py-3 px-4">Último Acesso</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-violet-600" />
                        Carregando usuários...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Nenhum usuário cadastrado.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleRole(u)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition ${
                              u.role === "admin"
                                ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                            title="Clique para alternar permissão"
                          >
                            {u.role === "admin" ? "Administrador" : "Usuário"}
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              u.status === "ativo"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                u.status === "ativo" ? "bg-emerald-500" : "bg-rose-500"
                              }`}
                            />
                            {u.status === "ativo" ? "Ativo" : "Bloqueado"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                          {u.authMethod}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          {u.lastLogin.includes("T")
                            ? new Date(u.lastLogin).toLocaleDateString("pt-BR")
                            : u.lastLogin}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {u.id !== "usr_admin_1" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(u)}
                                  className={`p-1.5 rounded-lg border text-xs transition ${
                                    u.status === "ativo"
                                      ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                                      : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                  }`}
                                  title={u.status === "ativo" ? "Suspender Acesso" : "Reativar Acesso"}
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(u)}
                                  className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                                  title="Excluir Usuário"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer com Aviso de Sigilo Bancário */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            Zero-Knowledge: O administrador gerencia credenciais; os saldos e transações de cada usuário são inacessíveis para terceiros.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
