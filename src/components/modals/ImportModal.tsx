"use client";

import React, { useState, useRef, useEffect } from "react";
import { useFinance } from "@/context/VerticeContext";
import { parseOFX, parseCSV, detectDuplicates, formatCurrency, formatDate, extractOFXAccountInfo } from "@/lib/finance";
import { ImportPreviewItem, Transaction, AccountType } from "@/types";
import { X, Upload, Check, AlertCircle, FileText, CheckCircle2, Loader2, Plus, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetAccountId?: string;
}

export function ImportModal({ isOpen, onClose, targetAccountId }: ImportModalProps) {
  const { accounts, transactions, addTransactions, addAccount, categories, autoRules } = useFinance();

  const [selectedAccountId, setSelectedAccountId] = useState(
    targetAccountId || accounts[0]?.id || ""
  );
  const [isCreatingNewAccount, setIsCreatingNewAccount] = useState(accounts.length === 0);
  const [newAccountBank, setNewAccountBank] = useState("C6 Bank");
  const [newAccountName, setNewAccountName] = useState("C6 Bank — Conta Corrente");
  const [newAccountType, setNewAccountType] = useState<AccountType>("corrente");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState<"ofx" | "csv" | null>(null);
  const [items, setItems] = useState<ImportPreviewItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [destinationAccountName, setDestinationAccountName] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (accounts.length === 0) {
      setIsCreatingNewAccount(true);
    } else if (targetAccountId) {
      setSelectedAccountId(targetAccountId);
      setIsCreatingNewAccount(false);
    } else if (!selectedAccountId && accounts[0]?.id) {
      setSelectedAccountId(accounts[0].id);
      setIsCreatingNewAccount(false);
    }
  }, [accounts, targetAccountId, isOpen]);

  if (!isOpen) return null;

  const handleProcessFile = (file: File) => {
    setFileName(file.name);
    setIsSuccess(false);
    setErrorMessage(null);

    const isOfx = file.name.toLowerCase().endsWith(".ofx");
    const isCsv = file.name.toLowerCase().endsWith(".csv");
    setFileType(isOfx ? "ofx" : isCsv ? "csv" : null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsed = isOfx ? parseOFX(content) : parseCSV(content);

      if (isOfx) {
        const info = extractOFXAccountInfo(content);
        if (info.bank) {
          setNewAccountBank(info.bank);
          setNewAccountName(`${info.bank} — Conta Corrente`);
        }
      }

      // Deduplicação inteligente
      const duplicates = detectDuplicates(parsed, transactions);

      // Auto-categorização por heurística e regras salvas
      const previewItems: ImportPreviewItem[] = parsed.map((p) => {
        const isDup = duplicates.has(p.id);
        const descLower = p.description.toLowerCase();

        let matchedCat = autoRules.find((r) => descLower.includes(r.pattern.toLowerCase()))?.categoryId;

        if (!matchedCat) {
          if (descLower.includes("ifood") || descLower.includes("restaurante") || descLower.includes("lanche") || descLower.includes("buritis")) {
            matchedCat = "cat-delivery";
          } else if (descLower.includes("supermercado") || descLower.includes("mercado") || descLower.includes("carrefour") || descLower.includes("pao de acucar") || descLower.includes("dma") || descLower.includes("distribuidora")) {
            matchedCat = "cat-mercado";
          } else if (descLower.includes("uber") || descLower.includes("99app") || descLower.includes("taxi")) {
            matchedCat = "cat-uber";
          } else if (descLower.includes("posto") || descLower.includes("combustivel") || descLower.includes("shell") || descLower.includes("ipiranga")) {
            matchedCat = "cat-combustivel";
          } else if (descLower.includes("farmacia") || descLower.includes("droga") || descLower.includes("remedio") || descLower.includes("panvel")) {
            matchedCat = "cat-farmacia";
          } else if (descLower.includes("netflix") || descLower.includes("spotify") || descLower.includes("amazon prime") || descLower.includes("disney")) {
            matchedCat = "cat-streaming";
          } else if (descLower.includes("salario") || descLower.includes("remuneracao") || descLower.includes("pix recebido") || descLower.includes("rec - pagamento")) {
            matchedCat = "cat-salario";
          } else if (descLower.includes("aluguel") || descLower.includes("condominio")) {
            matchedCat = "cat-aluguel";
          } else {
            matchedCat = p.amount > 0 ? "cat-salario" : "cat-outros";
          }
        }

        return {
          id: p.id,
          date: p.date,
          description: p.description,
          amount: p.amount,
          type: p.amount > 0 ? "receita" : "despesa",
          categoryId: matchedCat,
          isDuplicate: isDup,
          selected: !isDup,
        };
      });

      setItems(previewItems);
    };

    reader.readAsText(file, "latin1");
  };

  const toggleSelect = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const toggleSelectAll = (select: boolean) => {
    setItems((prev) => prev.map((i) => ({ ...i, selected: select })));
  };

  const handleCategoryChange = (id: string, newCategoryId: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, categoryId: newCategoryId } : item))
    );
  };

  const handleConfirmImport = async () => {
    setErrorMessage(null);
    const selected = items.filter((i) => i.selected);

    if (selected.length === 0) {
      setErrorMessage("Nenhuma transação selecionada para importação.");
      return;
    }

    let targetId = selectedAccountId;
    let accName = "";

    if (isCreatingNewAccount) {
      if (!newAccountName.trim()) {
        setErrorMessage("Por favor, informe o nome para a nova conta (ex: C6 Bank).");
        return;
      }
      const bankName = newAccountBank.trim() || "Banco";
      accName = newAccountName.trim();
      targetId = addAccount({
        name: accName,
        bank: bankName,
        type: newAccountType,
        balance: 0,
        color: bankName.toLowerCase().includes("c6") ? "#1e293b" : "#8b5cf6",
        iconName: newAccountType === "cartao_credito" ? "CreditCard" : "Wallet",
        status: "ativa",
      });
      setSelectedAccountId(targetId);
      setIsCreatingNewAccount(false);
    } else {
      if (!targetId) {
        setErrorMessage("Por favor, selecione uma conta de destino para os lançamentos.");
        return;
      }
      const existing = accounts.find((a) => a.id === targetId);
      accName = existing ? `${existing.bank} — ${existing.name}` : "Conta Selecionada";
    }

    setDestinationAccountName(accName);
    setIsProcessing(true);

    // Pequena pausa para animação do indicador
    await new Promise((r) => setTimeout(r, 400));

    const newTxs: Omit<Transaction, "id">[] = selected.map((s) => ({
      accountId: targetId,
      date: s.date,
      description: s.description,
      amount: s.amount,
      type: s.type,
      categoryId: s.categoryId,
      ofxId: s.id,
    }));

    addTransactions(newTxs);
    setIsProcessing(false);
    setIsSuccess(true);
    setImportedCount(selected.length);
  };

  const handleClose = () => {
    setItems([]);
    setFileName("");
    setIsSuccess(false);
    setErrorMessage(null);
    onClose();
  };

  const selectedCount = items.filter((i) => i.selected).length;
  const duplicateCount = items.filter((i) => i.isDuplicate).length;

  const PREVIEW_LIMIT = 40;
  const displayedItems = items.slice(0, PREVIEW_LIMIT);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 bg-slate-50/50 dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-blue-600 dark:text-blue-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Importar Extrato Bancário</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Suporte nativo a arquivos <strong>.OFX</strong> e <strong>.CSV</strong> de qualquer banco
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {isSuccess ? (
            <div className="text-center py-10 space-y-3 animate-in zoom-in">
              <div className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Importação Concluída com Sucesso!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                <strong className="text-emerald-600 dark:text-emerald-400">{importedCount} transações</strong> foram integradas à conta <strong className="text-slate-900 dark:text-white">{destinationAccountName}</strong> com categorização automática e saldo recalculado.
              </p>
              <div className="pt-4">
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  Concluir e Ver Extrato
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Seletor / Criação de Conta de Destino */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Conta de Destino *
                  </label>
                  {accounts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingNewAccount(!isCreatingNewAccount);
                        setErrorMessage(null);
                      }}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      {isCreatingNewAccount ? "← Selecionar conta existente" : "+ Criar nova conta"}
                    </button>
                  )}
                </div>

                {isCreatingNewAccount ? (
                  <div className="space-y-3 animate-in fade-in">
                    <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
                      <span className="text-base">💡</span>
                      <span>Uma nova conta será criada no seu Vértice para receber os lançamentos deste arquivo.</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Banco / Instituição
                        </label>
                        <input
                          type="text"
                          value={newAccountBank}
                          onChange={(e) => {
                            setNewAccountBank(e.target.value);
                            setErrorMessage(null);
                          }}
                          placeholder="Ex: C6 Bank"
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Nome da Conta
                        </label>
                        <input
                          type="text"
                          value={newAccountName}
                          onChange={(e) => {
                            setNewAccountName(e.target.value);
                            setErrorMessage(null);
                          }}
                          placeholder="Ex: C6 Bank — Corrente"
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Tipo de Conta
                        </label>
                        <select
                          value={newAccountType}
                          onChange={(e) => setNewAccountType(e.target.value as any)}
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="corrente">Conta Corrente</option>
                          <option value="cartao_credito">Cartão de Crédito</option>
                          <option value="poupanca">Poupança</option>
                          <option value="investimento">Investimento</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <select
                    value={selectedAccountId}
                    onChange={(e) => {
                      if (e.target.value === "new") {
                        setIsCreatingNewAccount(true);
                      } else {
                        setSelectedAccountId(e.target.value);
                      }
                      setErrorMessage(null);
                    }}
                    className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white font-semibold"
                  >
                    <option value="">Selecione uma conta existente...</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.bank} — {a.name} ({formatCurrency(a.balance)})
                      </option>
                    ))}
                    <option value="new">➕ Criar nova conta para este extrato...</option>
                  </select>
                )}
              </div>

              {/* Upload Box */}
              {items.length === 0 ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleProcessFile(file);
                  }}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-800/30 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".ofx,.csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleProcessFile(file);
                    }}
                  />
                  <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
                    <FileText className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Clique para selecionar ou arraste o arquivo aqui
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Aceita extratos em <strong>.OFX</strong> ou faturas/extratos em <strong>.CSV</strong> (C6 Bank, Nubank, Itaú, Inter, Bradesco, etc.)
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Arquivo selecionado bar */}
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 min-w-0">
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      <span className="font-semibold truncate max-w-xs">{fileName}</span>
                      <span className="text-slate-500 shrink-0">({items.length} lançamentos encontrados)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setItems([]);
                        setFileName("");
                        setErrorMessage(null);
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-semibold shrink-0 ml-2"
                    >
                      Trocar arquivo
                    </button>
                  </div>

                  {/* Barra de seleção */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 px-1">
                    <div className="flex items-center gap-2 font-medium">
                      <span>{selectedCount} de {items.length} selecionadas</span>
                      {duplicateCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {duplicateCount} duplicata{duplicateCount > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleSelectAll(true)}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        Marcar todas
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => toggleSelectAll(false)}
                        className="text-slate-600 dark:text-slate-400 hover:underline font-medium"
                      >
                        Desmarcar todas
                      </button>
                    </div>
                  </div>

                  {/* Informação sobre quantidade de linhas se for grande */}
                  {items.length > PREVIEW_LIMIT && (
                    <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between border border-slate-200 dark:border-slate-700">
                      <span>Exibindo os primeiros <strong>{PREVIEW_LIMIT}</strong> lançamentos para navegação rápida.</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">Todos os {selectedCount} selecionados serão importados.</span>
                    </div>
                  )}

                  {/* Tabela de Preview */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-64 overflow-y-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 sticky top-0 font-semibold">
                        <tr>
                          <th className="p-2.5 w-8 text-center">Sel.</th>
                          <th className="p-2.5">Data</th>
                          <th className="p-2.5">Descrição</th>
                          <th className="p-2.5">Categoria</th>
                          <th className="p-2.5 text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {displayedItems.map((item) => (
                          <tr
                            key={item.id}
                            className={cn(
                              "transition",
                              item.isDuplicate
                                ? "bg-amber-50/40 dark:bg-amber-950/20"
                                : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                            )}
                          >
                            <td className="p-2.5 text-center">
                              <input
                                type="checkbox"
                                checked={item.selected}
                                onChange={() => toggleSelect(item.id)}
                                className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                              />
                            </td>
                            <td className="p-2.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                              {formatDate(item.date)}
                            </td>
                            <td className="p-2.5 font-medium text-slate-800 dark:text-slate-200">
                              <div className="flex items-center gap-1.5">
                                <span className="truncate max-w-[180px] sm:max-w-xs">{item.description}</span>
                                {item.isDuplicate && (
                                  <span className="px-1.5 py-0.5 text-[10px] bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 rounded font-semibold whitespace-nowrap">
                                    Já existe
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-2.5">
                              <select
                                value={item.categoryId}
                                onChange={(e) => handleCategoryChange(item.id, e.target.value)}
                                className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
                              >
                                {categories
                                  .filter((c) => (item.type === "receita" ? c.isIncome : !c.isIncome))
                                  .map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.name}
                                    </option>
                                  ))}
                              </select>
                            </td>
                            <td
                              className={cn(
                                "p-2.5 text-right font-bold whitespace-nowrap",
                                item.amount > 0
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-rose-600 dark:text-rose-400"
                              )}
                            >
                              {formatCurrency(item.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <div className="mx-6 mb-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 animate-in shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* Footer */}
        {!isSuccess && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex-shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-xs text-slate-500">
              {items.length > 0 ? `${selectedCount} transações prontas para importar` : "Selecione um arquivo para começar"}
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={items.length === 0 || selectedCount === 0 || isProcessing}
                onClick={handleConfirmImport}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-blue-500/20 transition active:scale-95"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Importando {selectedCount}...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Importar {selectedCount > 0 && `(${selectedCount})`}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
