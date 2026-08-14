"use client";

// 🎫 Incident detail page — incident.io style light theme
import { useState, useEffect } from "react";
import Link from "next/link";
import type { Incident } from "@prisma/client";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { AIAnalysisPanel } from "@/components/AIAnalysisPanel";
import { ResolutionForm } from "@/components/ResolutionForm";
import { Spinner } from "@/components/ui/Spinner";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { formatDate, CATEGORY_EMOJI, SENTIMENT_EMOJI } from "@/lib/utils";

interface PageProps {
  params: { id: string };
}

export default function IncidentDetailPage({ params }: PageProps) {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/incidents/${params.id}`);
        if (res.status === 404) { setNotFound(true); return; }
        const data = await res.json();
        setIncident(data as Incident);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (notFound || !incident) {
    return (
      <div className="text-center py-24 animate-fade-in">
        <div className="w-14 h-14 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-surface-800 mb-2">Incident not found</h2>
        <p className="text-surface-400 mb-6 text-sm">
          The incident #{params.id.slice(-8)} does not exist or has been deleted.
        </p>
        <Link href="/" className="text-sm text-alarmalade-600 hover:text-alarmalade-700 font-medium transition-colors">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const categoryEmoji  = CATEGORY_EMOJI[incident.category ?? ""]  ?? "📋";
  const sentimentEmoji = SENTIMENT_EMOJI[incident.sentiment ?? ""] ?? "";

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Back link */}
      <Link
        href="/"
        className="text-sm text-surface-500 hover:text-surface-800 transition-colors inline-flex items-center gap-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 rounded"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <StatusBadge status={incident.status} />
            <PriorityBadge priority={incident.priority} />
            {incident.category && (
              <span className="text-sm text-surface-500">
                {categoryEmoji} {incident.category}
              </span>
            )}
            {incident.sentiment && (
              <span className="text-sm text-surface-500">
                {sentimentEmoji} {incident.sentiment}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-surface-900 leading-snug">
            {incident.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-surface-400">
            {incident.reporterName && <span>{incident.reporterName}</span>}
            <span>{formatDate(incident.createdAt)}</span>
            <span className="font-mono text-xs">#{incident.id.slice(-8)}</span>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left: Description + timestamps + Resolution */}
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-surface-700">Description</h2>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-surface-600 leading-relaxed whitespace-pre-wrap">
                {incident.description}
              </p>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-surface-50 border border-surface-200">
              <p className="font-semibold text-surface-500 uppercase tracking-wider mb-1">Created</p>
              <p className="text-surface-700">{formatDate(incident.createdAt)}</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-50 border border-surface-200">
              <p className="font-semibold text-surface-500 uppercase tracking-wider mb-1">Updated</p>
              <p className="text-surface-700">{formatDate(incident.updatedAt)}</p>
            </div>
          </div>

          <ResolutionForm incident={incident} onUpdated={(updated) => setIncident(updated)} />
        </div>

        {/* Right: AI Analysis */}
        <div>
          <AIAnalysisPanel incident={incident} onReanalyzed={(updated) => setIncident(updated)} />
        </div>
      </div>
    </div>
  );
}
