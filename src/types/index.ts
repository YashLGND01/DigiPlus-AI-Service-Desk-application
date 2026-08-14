// 📦 Shared TypeScript types for the AI Service Desk application
import type { Incident as PrismaIncident, KBArticle as PrismaKBArticle } from "@prisma/client";

// Re-export Prisma types for convenience
export type { PrismaIncident as Incident, PrismaKBArticle as KBArticle };

// ---- Parsed AI Data Types ----
// These are the deserialized versions of the JSON-stringified DB columns

export interface KBMatch {
  kbArticleId: string;
  relevance: "High" | "Medium" | "Low";
  reason: string;
}

export interface SimilarIncident {
  incidentId: string;
  similarity: "High" | "Medium" | "Low";
  reason: string;
}

// ---- Full incident with parsed AI fields ----
export interface IncidentWithParsedAI extends PrismaIncident {
  parsedSuggestedSteps: string[];
  parsedKbMatches: KBMatch[];
  parsedSimilarIncidents: SimilarIncident[];
}

// ---- API Response Types ----
export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}

export interface IncidentListResponse {
  incidents: PrismaIncident[];
  total: number;
}

// ---- UI-only types ----
export type IncidentStatus = "Open" | "In Progress" | "Resolved" | "Closed";
export type IncidentPriority = "Low" | "Medium" | "High" | "Critical";
export type IncidentCategory =
  | "Account"
  | "Billing"
  | "Technical"
  | "Network"
  | "Hardware"
  | "Software"
  | "Access"
  | "Other";
export type IncidentSentiment = "Neutral" | "Frustrated" | "Urgent" | "Satisfied";
export type AIAnalysisStatus = "Pending" | "Done" | "Failed";
export type KBRelevance = "High" | "Medium" | "Low";
