import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export from finance.ts so all imports from @/lib/utils keep working
export {
  formatCurrency,
  formatDate,
  formatDateShort,
  formatPercent,
  formatMonthLabel,
  getCurrentMonth,
  getMonthRange,
  isWithinMonth,
} from "@/lib/finance";
