"use client";

// 🎫 IncidentCard — flattened, hierarchy-focused row (DigiPlus IT redesign)
import Link from "next/link";
import type { Incident } from "@prisma/client";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { formatRelativeTime, truncate } from "@/lib/utils";

interface IncidentCardProps {
  incident: Incident;
}

// Priority → left-border accent color (3px bar = real signal, folder icon = not)
const PRIORITY_BORDER: Record<string, string> = {
  Critical: "border-l-red-500",
  High:     "border-l-orange-400",
  Medium:   "border-l-blue-400",
  Low:      "border-l-surface-300",
};

export function IncidentCard({ incident }: IncidentCardProps) {
  const borderColor =
    PRIORITY_BORDER[incident.priority ?? ""] ?? "border-l-surface-200";

  return (
    <Link
      href={`/incidents/${incident.id}`}
      className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-orange-500"
    >
      <div
        className={`group flex items-start gap-4 py-4 px-5 bg-white border-l-4 ${borderColor} hover:bg-surface-50/60 transition-colors duration-150 cursor-pointer`}
      >
        {/* Content — single column, clear hierarchy */}
        <div className="flex-1 min-w-0">
          {/* Title — always neutral, always dominant */}
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-gray-700 transition-colors leading-snug truncate">
            {incident.title}
          </h3>

          {/* Description — one line, demoted */}
          <p className="text-sm text-gray-500 truncate mt-0.5">
            {incident.aiSummary
              ? truncate(incident.aiSummary, 140)
              : truncate(incident.description, 120)}
          </p>

          {/* Meta row — reporter · ID · timestamp, smallest/lightest */}
          <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
            {incident.reporterName && (
              <span>{incident.reporterName}</span>
            )}
            {incident.reporterName && (
              <span className="text-gray-300">·</span>
            )}
            <span className="font-mono">#{incident.id.slice(-8)}</span>
            <span className="text-gray-300">·</span>
            <span>{formatRelativeTime(incident.createdAt)}</span>
            {/* Category only rendered if present — no orphaned separator */}
            {incident.category && (
              <>
                <span className="text-gray-300">·</span>
                <span>{incident.category}</span>
              </>
            )}
          </div>
        </div>

        {/* Right — single-row pill group, right-aligned, same baseline, never stacked */}
        <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
          <StatusBadge status={incident.status} />
          <PriorityBadge priority={incident.priority} />
          {incident.aiAnalysisStatus === "Pending" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-pulse" />
              Analyzing
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
