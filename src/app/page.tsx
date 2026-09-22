"use client";

import React, { useState } from "react";
import { FinanceProvider } from "@/context/VerticeContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { DashboardView } from "@/components/views/DashboardView";
import { ContasView } from "@/components/views/ContasView";
import { ExtratoView } from "@/components/views/ExtratoView";
import { AlertasView } from "@/components/views/AlertasView";
import { DesendividamentoView } from "@/components/views/DesendividamentoView";
import { InvestimentosView } from "@/components/views/InvestimentosView";
import { TransactionModal } from "@/components/modals/TransactionModal";
import { LockScreen } from "@/components/auth/LockScreen";
import { useFinance } from "@/context/VerticeContext";

function AppShell() {
  const { activeTab, sessionUser, authChecked } = useFinance();
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [showMobileTxModal, setShowMobileTxModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased selection:bg-violet-900 selection:text-white">
      {/* Tela de Bloqueio Obrigatória enquanto não autenticado */}
      {authChecked && !sessionUser && <LockScreen />}

      <Sidebar isOpenMobile={isOpenMobile} setIsOpenMobile={setIsOpenMobile} />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <Header setIsOpenMobile={setIsOpenMobile} />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          {activeTab === "dashboard"      && <DashboardView />}
          {activeTab === "contas"         && <ContasView />}
          {activeTab === "extrato"        && <ExtratoView />}
          {activeTab === "alertas"        && <AlertasView />}
          {activeTab === "dividas"        && <DesendividamentoView />}
          {activeTab === "investimentos"  && <InvestimentosView />}
        </main>

        {/* Barra de Navegação Inferior Nativa para Smartphones */}
        <MobileNav onOpenNewTx={() => setShowMobileTxModal(true)} />

        {/* Modal de Transação acionado pela Mobile Nav */}
        <TransactionModal
          isOpen={showMobileTxModal}
          onClose={() => setShowMobileTxModal(false)}
        />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <FinanceProvider>
      <AppShell />
    </FinanceProvider>
  );
}
