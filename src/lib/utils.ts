// 🔧 Utility functions — class merging, date formatting, JSON parsing helpers
// Assumption: no clsx/tailwind-merge — implemented inline to avoid extra deps
export function cn(...inputs: (string | undefined | null | false | 0)[]): string {
  return inputs
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
}

export function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 3) + "...";
}

export const STATUS_COLORS: Record<string, string> = {
  Open: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "In Progress": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  Resolved: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  Closed: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

export const PRIORITY_COLORS: Record<string, string> = {
  Low: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  Medium: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  High: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Critical: "bg-red-500/20 text-red-300 border-red-500/30",
};

export const STATUS_EMOJI: Record<string, string> = {
  Open: "🔵",
  "In Progress": "🟡",
  Resolved: "✅",
  Closed: "⛔",
};

export const PRIORITY_EMOJI: Record<string, string> = {
  Low: "🟢",
  Medium: "🔵",
  High: "🟠",
  Critical: "🔴",
};

export const CATEGORY_EMOJI: Record<string, string> = {
  Account: "👤",
  Billing: "💳",
  Technical: "⚙️",
  Network: "🌐",
  Hardware: "🖥️",
  Software: "💾",
  Access: "🔑",
  Other: "📋",
};

export const SENTIMENT_EMOJI: Record<string, string> = {
  Neutral: "😐",
  Frustrated: "😤",
  Urgent: "🚨",
  Satisfied: "😊",
};
