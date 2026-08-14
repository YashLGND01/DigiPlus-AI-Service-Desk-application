"use client";

// 🤖 AIAnalysisPanel — displays structured AI triage results (light theme)
import { useState } from "react";
import type { Incident } from "@prisma/client";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { safeJsonParse, CATEGORY_EMOJI, SENTIMENT_EMOJI } from "@/lib/utils";
import type { KBMatch, SimilarIncident } from "@/types";

interface AIAnalysisPanelProps {
  incident: Incident;
  onReanalyzed: (updated: Incident) => void;
}

const RELEVANCE_COLORS: Record<string, string> = {
  High:   "bg-emerald-50 text-emerald-700",
  Medium: "bg-blue-50 text-blue-700",
  Low:    "bg-surface-100 text-surface-500",
};

export function AIAnalysisPanel({ incident, onReanalyzed }: AIAnalysisPanelProps) {
  const [reanalyzing, setReanalyzing] = useState(false);
  const [reanalyzeError, setReanalyzeError] = useState<string | null>(null);

  const suggestedSteps    = safeJsonParse<string[]>(incident.aiSuggestedSteps, []);
  const kbMatches         = safeJsonParse<KBMatch[]>(incident.aiKbMatches, []);
  const similarIncidents  = safeJsonParse<SimilarIncident[]>(incident.aiSimilarIncidents, []);

  async function handleReanalyze() {
    setReanalyzing(true);
    setReanalyzeError(null);
    try {
      const res  = await fetch(`/api/incidents/${incident.id}/analyze`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        onReanalyzed(data as Incident);
      } else {
        if (data.incident) onReanalyzed(data.incident as Incident);
        setReanalyzeError(data.details ?? data.error ?? "Re-analysis failed");
      }
    } catch {
      setReanalyzeError("Network error — please try again");
    } finally {
      setReanalyzing(false);
    }
  }

  // Pending state
  if (incident.aiAnalysisStatus === "Pending") {
    return (
      <div className="rounded-xl border border-orange-200 overflow-hidden">
        {/* Callout header — DigiPlus AI Insight style */}
        <div className="flex items-center gap-2 px-4 py-3 bg-orange-50 border-b border-orange-200">
          <span className="text-base">🤖</span>
          <span className="text-sm font-semibold text-orange-700 tracking-tight">AI Analysis</span>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-600">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
            Pending
          </span>
        </div>
        <div className="py-12 px-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <Spinner size="lg" />
            <p className="text-surface-700 font-medium">AI is analyzing this incident…</p>
            <p className="text-sm text-surface-400">
              Groq is triaging the incident, matching KB articles, and checking for duplicates.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Failed state
  if (incident.aiAnalysisStatus === "Failed") {
    return (
      <div className="rounded-xl border border-red-200 overflow-hidden">
        {/* Callout header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border-b border-red-200">
          <span className="text-base">🤖</span>
          <span className="text-sm font-semibold text-red-700 tracking-tight">AI Analysis</span>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-600">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Failed
          </span>
        </div>
        <div className="py-10 px-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <div>
              <p className="text-surface-800 font-semibold mb-1">AI Analysis Failed</p>
              <p className="text-sm text-surface-400">
                The analysis could not be completed. You can retry below.
              </p>
            </div>
            {reanalyzeError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {reanalyzeError}
              </p>
            )}
            <Button onClick={handleReanalyze} loading={reanalyzing} variant="secondary">
              Re-analyze with AI
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Analysis complete
  const categoryEmoji  = CATEGORY_EMOJI[incident.category ?? ""]  ?? "📋";
  const sentimentEmoji = SENTIMENT_EMOJI[incident.sentiment ?? ""] ?? "😐";

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Branded callout header — DigiPlus AI Insight style */}
      <div className="rounded-xl border border-orange-200 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 bg-orange-50 border-b border-orange-200">
          <span className="text-base">🤖</span>
          <span className="text-sm font-semibold text-orange-700 tracking-tight">AI Analysis</span>
          {typeof incident.aiConfidence === "number" && (
            <Badge className="ml-1 bg-orange-100 text-orange-600 text-xs">
              {Math.round(incident.aiConfidence * 100)}% confidence
            </Badge>
          )}
          <div className="ml-auto">
            <Button onClick={handleReanalyze} loading={reanalyzing} variant="secondary" size="sm">
              Re-analyze
            </Button>
          </div>
        </div>
      </div>

      {/* Classification row */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-1.5">Category</p>
              <p className="text-sm font-medium text-surface-800">
                {categoryEmoji} {incident.category ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-1.5">Sentiment</p>
              <p className="text-sm font-medium text-surface-800">
                {sentimentEmoji} {incident.sentiment ?? "—"}
              </p>
            </div>
            {typeof incident.aiConfidence === "number" && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-1.5">AI Confidence</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-surface-200 rounded-full h-1.5">
                    <div
                      className="bg-alarmalade-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.round(incident.aiConfidence * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-surface-500">
                    {Math.round(incident.aiConfidence * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Summary */}
      {incident.aiSummary && (
        <Card>
          <CardHeader>
            <p className="text-sm font-semibold text-surface-700">Summary</p>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-surface-600 leading-relaxed">{incident.aiSummary}</p>
          </CardContent>
        </Card>
      )}

      {/* Suggested Steps */}
      {suggestedSteps.length > 0 && (
        <Card>
          <CardHeader>
            <p className="text-sm font-semibold text-surface-700">Suggested Resolution Steps</p>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {suggestedSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-alarmalade-50 text-alarmalade-600 text-xs flex items-center justify-center font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-surface-600 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* KB Matches */}
      {kbMatches.length > 0 && (
        <Card>
          <CardHeader>
            <p className="text-sm font-semibold text-surface-700">Related Knowledge Base Articles</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {kbMatches.map((match) => (
              <div
                key={match.kbArticleId}
                className="flex items-start gap-3 p-3 rounded-lg bg-surface-50 border border-surface-200"
              >
                <Badge className={RELEVANCE_COLORS[match.relevance] ?? RELEVANCE_COLORS.Low}>
                  {match.relevance}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-surface-400 mb-0.5">{match.kbArticleId}</p>
                  <p className="text-sm text-surface-600">{match.reason}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Similar Incidents */}
      {similarIncidents.length > 0 && (
        <Card>
          <CardHeader>
            <p className="text-sm font-semibold text-surface-700">Potential Duplicate / Similar Incidents</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {similarIncidents.map((sim) => (
              <a
                key={sim.incidentId}
                href={`/incidents/${sim.incidentId}`}
                className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100 hover:border-amber-300 transition-colors"
              >
                <Badge className={RELEVANCE_COLORS[sim.similarity] ?? RELEVANCE_COLORS.Low}>
                  {sim.similarity}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-surface-400 mb-0.5">{sim.incidentId}</p>
                  <p className="text-sm text-amber-700">{sim.reason}</p>
                </div>
                <svg className="w-4 h-4 text-surface-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                </svg>
              </a>
            ))}
          </CardContent>
        </Card>
      )}

      {reanalyzeError && (
        <p className="text-xs text-red-600 text-center">{reanalyzeError}</p>
      )}
    </div>
  );
}
