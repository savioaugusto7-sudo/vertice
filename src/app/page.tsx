"use client";

import React, { useState } from "react";
import { FinanceProvider } from "@/context/VerticeContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { DashboardView } from "@/components/views/DashboardView";
import { ContasView } from "@/components/views/ContasView";
import { ExtratoView } from "@/components/views/ExtratoView";
import { AlertasView } from "@/components/views/AlertasView";
import { DesendividamentoView } from "@/components/views/DesendividamentoView";
import { InvestimentosView } from "@/components/views/InvestimentosView";
import { useFinance } from "@/context/VerticeContext";

function AppShell() {
  const { activeTab } = useFinance();
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased selection:bg-violet-900 selection:text-white">
      <Sidebar isOpenMobile={isOpenMobile} setIsOpenMobile={setIsOpenMobile} />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <Header setIsOpenMobile={setIsOpenMobile} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === "dashboard"      && <DashboardView />}
          {activeTab === "contas"         && <ContasView />}
          {activeTab === "extrato"        && <ExtratoView />}
          {activeTab === "alertas"        && <AlertasView />}
          {activeTab === "dividas"        && <DesendividamentoView />}
          {activeTab === "investimentos"  && <InvestimentosView />}
        </main>
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
