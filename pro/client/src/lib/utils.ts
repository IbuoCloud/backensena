import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return format(date, "d MMM, yyyy", { locale: es });
}

export function formatDateTime(date: Date): string {
  return format(date, "d MMM, yyyy HH:mm", { locale: es });
}

export function calculateCompletionPercentage(
  completedTasks: number,
  totalTasks: number
): number {
  if (totalTasks === 0) return 0;
  return Math.round((completedTasks / totalTasks) * 100);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function getInitials(name: string): string {
  if (!name) return "";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function getDaysRemaining(endDate: Date): number {
  const today = new Date();
  const diffTime = endDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "review":
      return "bg-amber-100 text-amber-800";
    case "completed":
      return "bg-blue-100 text-blue-800";
    case "late":
      return "bg-red-100 text-red-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800";
    case "medium":
      return "bg-blue-100 text-blue-800";
    case "low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
}
