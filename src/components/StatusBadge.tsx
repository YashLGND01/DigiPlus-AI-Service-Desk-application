// 🏷️ StatusBadge — clean, no-emoji status pill
import { Badge } from "@/components/ui/Badge";

// Light-theme status colors
const STATUS_STYLES: Record<string, string> = {
  "Open":        "bg-blue-50 text-blue-700",
  "In Progress": "bg-amber-50 text-amber-700",
  "Resolved":    "bg-emerald-50 text-emerald-700",
  "Closed":      "bg-surface-100 text-surface-500",
};

const STATUS_DOT: Record<string, string> = {
  "Open":        "bg-blue-500",
  "In Progress": "bg-amber-500",
  "Resolved":    "bg-emerald-500",
  "Closed":      "bg-surface-400",
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? "bg-surface-100 text-surface-500";
  const dot   = STATUS_DOT[status]   ?? "bg-surface-400";

  return (
    <Badge className={style}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      {status}
    </Badge>
  );
}
