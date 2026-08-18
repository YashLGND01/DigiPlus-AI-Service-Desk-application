// 🤖 analyzeIncident — Groq-powered incident triage using JSON mode
import { db } from "@/lib/db";
import { groqClient } from "./client";
import {
  IncidentAnalysisSchema,
  type IncidentAnalysis,
} from "./schemas";
import { SYSTEM_PROMPT, buildUserMessage } from "./prompts";
import type { Incident } from "@prisma/client";

// ✅ Success result type
interface AnalysisSuccess {
  success: true;
  data: IncidentAnalysis;
}

// ❌ Failure result type — returned instead of throwing so callers never crash
interface AnalysisFailure {
  success: false;
  error: string;
}

export type AnalysisResult = AnalysisSuccess | AnalysisFailure;

// JSON schema description appended to the system prompt so Groq knows the exact shape to emit
const JSON_SCHEMA_INSTRUCTION = `

## Output Format (REQUIRED)
You MUST respond with ONLY a valid JSON object — no prose, no markdown fences, no explanation. The JSON must exactly match this schema:

{
  "category": "Account" | "Billing" | "Technical" | "Network" | "Hardware" | "Software" | "Access" | "Other",
  "priority": "Low" | "Medium" | "High" | "Critical",
  "sentiment": "Neutral" | "Frustrated" | "Urgent" | "Satisfied",
  "summary": "<1-2 sentence technical summary for triage engineers>",
  "suggested_steps": ["<step 1>", "<step 2>", ...],
  "kb_matches": [
    { "kb_id": "<exact id from KB list>", "relevance": "High" | "Medium" | "Low", "reason": "<why relevant>" }
  ],
  "similar_incidents": [
    { "incident_id": "<exact id from incidents list>", "similarity": "High" | "Medium" | "Low", "reason": "<why similar>" }
  ],
  "confidence": <number 0.0 to 1.0>
}

Return ONLY the JSON object. Nothing else.`;

/**
 * Run AI triage analysis on a support incident via Groq.
 *
 * Uses JSON mode (response_format: json_object) so the response is always
 * a parseable JSON object — no prose fallback.
 *
 * @param incident - The incident to analyze
 * @param excludeIncidentId - Exclude this ID from open-incidents context (the incident itself)
 */
export async function analyzeIncident(
  incident: Pick<Incident, "id" | "title" | "description" | "reporterName">,
  excludeIncidentId?: string
): Promise<AnalysisResult> {
  try {
    // 📚 Fetch all KB articles for in-context matching
    const kbArticles = await db.kBArticle.findMany({
      orderBy: { createdAt: "asc" },
    });

    // 🎫 Fetch up to 20 recent open incidents for duplicate detection
    const recentIncidents = await db.incident.findMany({
      where: {
        status: { in: ["Open", "In Progress"] },
        id: excludeIncidentId ? { not: excludeIncidentId } : undefined,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
        reporterName: true,
        status: true,
        sentiment: true,
        aiSummary: true,
        aiSuggestedSteps: true,
        aiKbMatches: true,
        aiSimilarIncidents: true,
        aiConfidence: true,
        aiAnalysisStatus: true,
        resolutionNotes: true,
        resolvedAt: true,
      },
    });

    console.log(`🤖 Starting Groq analysis for incident: ${incident.id}`);
    console.log(`   📚 KB articles in context: ${kbArticles.length}`);
    console.log(`   🎫 Open incidents in context: ${recentIncidents.length}`);

    // 📝 Build the user message with full context
    const userMessage = buildUserMessage(incident, kbArticles, recentIncidents);

    // 📡 Call Groq with JSON mode enabled
    const completion = await groqClient.chat.completions.create({
      model: "openai/gpt-oss-20b",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT + JSON_SCHEMA_INSTRUCTION,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.2, // Low temp for consistent structured output
      max_tokens: 2048,
    });

    const finishReason = completion.choices[0]?.finish_reason;
    console.log(`✅ Groq responded. Finish reason: ${finishReason}`);

    const rawContent = completion.choices[0]?.message?.content;

    if (!rawContent) {
      return {
        success: false,
        error: "Groq returned an empty response",
      };
    }

    // 🔍 Parse JSON response
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      console.error("❌ Failed to parse Groq JSON response:", rawContent.slice(0, 300));
      return {
        success: false,
        error: "Groq response was not valid JSON",
      };
    }

    // ✅ Validate against existing Zod schema — unchanged from before
    const parseResult = IncidentAnalysisSchema.safeParse(parsed);

    if (!parseResult.success) {
      console.error(
        "❌ Groq response failed Zod validation:",
        parseResult.error.flatten()
      );
      return {
        success: false,
        error: `AI response validation failed: ${parseResult.error.message}`,
      };
    }

    console.log(
      `🎯 Analysis complete. Category: ${parseResult.data.category}, Priority: ${parseResult.data.priority}, Confidence: ${parseResult.data.confidence}`
    );

    return {
      success: true,
      data: parseResult.data,
    };
  } catch (error: unknown) {
    // 🛡️ Catch all errors (network, quota exceeded, invalid key, etc.)
    const message = error instanceof Error ? error.message : "Unknown AI error";
    console.error(`❌ Groq analysis failed for incident ${incident.id}:`, message);
    return {
      success: false,
      error: message,
    };
  }
}
