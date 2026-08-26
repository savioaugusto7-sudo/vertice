import React from "react";
import { SourceType } from "@/types";
import { Database, Building2, CreditCard, FileCheck, Clock, UploadCloud, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface SourceBadgeProps {
  source: SourceType | string;
  size?: "sm" | "md";
  showTrust?: boolean;
  className?: string;
}

export function SourceBadge({ source, size = "md", showTrust = true, className }: SourceBadgeProps) {
  const getSourceConfig = (src: string) => {
    switch (src) {
      case "alterdata":
        return {
          label: "Alterdata ERP",
          icon: Database,
          bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          trust: "100% Auto",
        };
      case "banco_itau":
        return {
          label: "Itaú Open Finance",
          icon: Building2,
          bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
          trust: "100% Auto",
        };
      case "stone_card":
        return {
          label: "Stone Adquirente",
          icon: CreditCard,
          bg: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
          trust: "100% Auto",
        };
      case "sefaz_nfe":
        return {
          label: "SEFAZ / Fiscal DF-e",
          icon: FileCheck,
          bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          trust: "100% Oficial",
        };
      case "ponto_secullum":
        return {
          label: "Ponto Digital",
          icon: Clock,
          bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
          trust: "100% Auto",
        };
      case "upload_ofx":
        return {
          label: "Upload OFX",
          icon: UploadCloud,
          bg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
          trust: "Importado",
        };
      default:
        return {
          label: "Entrada Manual",
          icon: User,
          bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
          trust: "Manual (Atenção)",
        };
    }
  };

  const config = getSourceConfig(source);
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full border transition-all",
        config.bg,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        className
      )}
      title={`Origem da informação: ${config.label}`}
    >
      <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      <span>{config.label}</span>
      {showTrust && (
        <span className="opacity-75 text-[10px] pl-0.5 font-mono">({config.trust})</span>
      )}
    </span>
  );
}
