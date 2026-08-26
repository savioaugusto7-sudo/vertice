"use client";

import React, { useState } from "react";
import { VerticeProvider } from "@/context/VerticeContext";
import { Sidebar, TabType } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { CockpitView } from "@/components/views/CockpitView";
import { IntegracoesView } from "@/components/views/IntegracoesView";
import { ConciliacaoView } from "@/components/views/ConciliacaoView";
import { PendenciasView } from "@/components/views/PendenciasView";
import { FechamentoView } from "@/components/views/FechamentoView";
import { RegrasView } from "@/components/views/RegrasView";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("cockpit");
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  return (
    <VerticeProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
        {/* Responsive Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpenMobile={isOpenMobile}
          setIsOpenMobile={setIsOpenMobile}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
          {/* Header */}
          <Header
            activeTab={activeTab}
            setIsOpenMobile={setIsOpenMobile}
            setActiveTab={setActiveTab}
          />

          {/* Body Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {activeTab === "cockpit" && <CockpitView setActiveTab={setActiveTab} />}
            {activeTab === "integracoes" && <IntegracoesView />}
            {activeTab === "conciliacao" && <ConciliacaoView />}
            {activeTab === "pendencias" && <PendenciasView />}
            {activeTab === "fechamento" && <FechamentoView />}
            {activeTab === "regras" && <RegrasView />}
          </main>
        </div>
      </div>
    </VerticeProvider>
  );
}
