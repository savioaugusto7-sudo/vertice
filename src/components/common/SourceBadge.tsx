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
          bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
          trust: "Oficial",
        };
      case "banco_itau":
        return {
          label: "Itaú Open Finance",
          icon: Building2,
          bg: "bg-blue-50 text-blue-800 border-blue-200",
          trust: "D-0",
        };
      case "stone_card":
        return {
          label: "Stone Adquirente",
          icon: CreditCard,
          bg: "bg-teal-50 text-teal-800 border-teal-200",
          trust: "MDR Auto",
        };
      case "sefaz_nfe":
        return {
          label: "SEFAZ / DF-e",
          icon: FileCheck,
          bg: "bg-amber-50 text-amber-900 border-amber-200",
          trust: "Fiscal",
        };
      case "ponto_secullum":
        return {
          label: "Ponto Digital",
          icon: Clock,
          bg: "bg-purple-50 text-purple-900 border-purple-200",
          trust: "Folha",
        };
      case "upload_ofx":
        return {
          label: "Upload OFX",
          icon: UploadCloud,
          bg: "bg-slate-100 text-slate-800 border-slate-300",
          trust: "Arquivo",
        };
      default:
        return {
          label: "Entrada Manual",
          icon: User,
          bg: "bg-rose-50 text-rose-800 border-rose-200",
          trust: "Revisar",
        };
    }
  };

  const config = getSourceConfig(source);
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold rounded-md border transition-all",
        config.bg,
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        className
      )}
      title={`Origem auditada: ${config.label}`}
    >
      <Icon className={size === "sm" ? "w-3 h-3 text-current opacity-80" : "w-3.5 h-3.5 text-current opacity-80"} />
      <span>{config.label}</span>
      {showTrust && (
        <span className="opacity-70 text-[10px] font-mono uppercase">[{config.trust}]</span>
      )}
    </span>
  );
}
