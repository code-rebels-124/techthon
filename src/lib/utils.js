import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getStatusTone(status) {
  if (status === "critical") {
    return "bg-rose-500/15 text-rose-600 dark:text-rose-300";
  }

  if (status === "low") {
    return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
  }

  return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
}
