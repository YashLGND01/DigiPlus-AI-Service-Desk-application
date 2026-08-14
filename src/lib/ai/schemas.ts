// 📐 Zod schemas for structured AI output validation
import { z } from "zod";

// ---- Zod schemas (used to validate Groq JSON response) ----

export const KBMatchSchema = z.object({
  kb_id: z.string(),
  relevance: z.enum(["High", "Medium", "Low"]),
  reason: z.string(),
});

export const SimilarIncidentSchema = z.object({
  incident_id: z.string(),
  similarity: z.enum(["High", "Medium", "Low"]),
  reason: z.string(),
});

export const IncidentAnalysisSchema = z.object({
  category: z.enum([
    "Account",
    "Billing",
    "Technical",
    "Network",
    "Hardware",
    "Software",
    "Access",
    "Other",
  ]),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  sentiment: z.enum(["Neutral", "Frustrated", "Urgent", "Satisfied"]),
  summary: z.string(),
  suggested_steps: z.array(z.string()),
  kb_matches: z.array(KBMatchSchema),
  similar_incidents: z.array(SimilarIncidentSchema),
  confidence: z.number().min(0).max(1),
});

export type IncidentAnalysis = z.infer<typeof IncidentAnalysisSchema>;
export type KBMatch = z.infer<typeof KBMatchSchema>;
export type SimilarIncident = z.infer<typeof SimilarIncidentSchema>;
