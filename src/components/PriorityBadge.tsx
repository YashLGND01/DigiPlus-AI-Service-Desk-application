// 🔴 PriorityBadge — clean, no-emoji priority pill
import { Badge } from "@/components/ui/Badge";

const PRIORITY_STYLES: Record<string, string> = {
  Critical: "bg-red-50 text-red-700",
  High:     "bg-orange-50 text-orange-700",
  Medium:   "bg-blue-50 text-blue-700",
  Low:      "bg-surface-100 text-surface-500",
};

const PRIORITY_DOT: Record<string, string> = {
  Critical: "bg-red-500",
  High:     "bg-orange-500",
  Medium:   "bg-blue-500",
  Low:      "bg-surface-400",
};

interface PriorityBadgeProps {
  priority: string | null | undefined;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  if (!priority) {
    return (
      <Badge className="bg-surface-100 text-surface-400">
        <span className="w-1.5 h-1.5 rounded-full bg-surface-300 shrink-0 animate-pulse" />
        Analyzing
      </Badge>
    );
  }

  const style = PRIORITY_STYLES[priority] ?? "bg-surface-100 text-surface-500";
  const dot   = PRIORITY_DOT[priority]   ?? "bg-surface-400";

  return (
    <Badge className={style}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      {priority}
    </Badge>
  );
}
