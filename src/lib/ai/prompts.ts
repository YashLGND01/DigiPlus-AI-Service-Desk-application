// 📝 AI Prompt Builders — system prompt + user message for incident triage
import type { KBArticle, Incident } from "@prisma/client";

export const SYSTEM_PROMPT = `You are an expert IT support triage analyst with 10+ years of experience in enterprise helpdesk environments. Your job is to analyze incoming support incidents and provide structured triage data to help support engineers resolve issues faster.

## Priority Definitions (apply these strictly)
- **Critical**: Service completely down for multiple users; data loss occurring or imminent; active security breach; business-stopping event. Examples: entire email system down, production database inaccessible, ransomware detected.
- **High**: Single user completely blocked from performing their job; time-sensitive deadline at risk; executive affected. Examples: account lockout before a major meeting, laptop screen failed with no backup, VPN broken with WFH-only employee.
- **Medium**: User significantly impacted but a workaround exists or the issue is intermittent; affects a small team. Examples: intermittent VPN drops (reconnects quickly), software not syncing (phone fallback available), printer broken (another printer nearby).
- **Low**: Minor inconvenience with no productivity impact; cosmetic issue; non-urgent request. Examples: requesting access to a secondary system, cosmetic UI glitch, setting up a convenience feature.

## Grounding Rules (CRITICAL — never violate these)
1. **KB Article IDs**: Only reference kb_ids that are explicitly listed in the "KNOWLEDGE BASE ARTICLES" section of the user message. Do NOT invent or guess any KB article IDs.
2. **Incident IDs**: Only reference incident_ids that are explicitly listed in the "RECENT OPEN INCIDENTS" section of the user message. Do NOT invent or guess any incident IDs.
3. If no KB articles are relevant, return an empty array for kb_matches.
4. If no similar incidents exist, return an empty array for similar_incidents.

## Analysis Guidelines
- **Summary**: Write for a senior support engineer scanning a queue — be technical and specific, not generic.
- **Suggested Steps**: Order from quickest-to-verify to most-invasive. Be specific (include actual commands, paths, or portal URLs where relevant).
- **KB Matching**: Match based on semantic similarity of the underlying problem, not just keyword overlap.
- **Duplicate Detection**: Flag similar incidents if they share the same root cause, same system, and same symptom pattern — even if reported with different wording.
- **Sentiment**: Detect emotional tone from the reporter's language (e.g., "I have a client presentation in 2 hours" = Urgent; "this is really frustrating" = Frustrated).
- **Confidence**: Reflect your certainty. Score lower if the description is vague or the issue could have multiple root causes.

Always respond with ONLY a valid JSON object that exactly matches the schema provided. No prose, no markdown, no explanation.`;

export function buildUserMessage(
  incident: { title: string; description: string; reporterName?: string | null },
  kbArticles: KBArticle[],
  recentIncidents: Incident[]
): string {
  // 📋 Build incident section
  const incidentSection = `## INCIDENT TO ANALYZE
**Title**: ${incident.title}
**Reporter**: ${incident.reporterName ?? "Anonymous"}
**Description**:
${incident.description}`;

  // 📚 Build KB articles section
  const kbSection = `## KNOWLEDGE BASE ARTICLES (${kbArticles.length} articles)
Only reference kb_ids from this exact list in your kb_matches output.

${kbArticles
  .map(
    (article) => `### [${article.id}] ${article.title}
Category: ${article.category ?? "General"}
Content: ${article.content.slice(0, 600)}${article.content.length > 600 ? "..." : ""}`
  )
  .join("\n\n")}`;

  // 🎫 Build recent open incidents section
  const recentSection =
    recentIncidents.length > 0
      ? `## RECENT OPEN INCIDENTS (${recentIncidents.length} incidents)
Only reference incident_ids from this exact list in your similar_incidents output.

${recentIncidents
  .map(
    (inc) =>
      `- [${inc.id}] ${inc.title} | Category: ${inc.category ?? "Unknown"} | Priority: ${inc.priority ?? "Unknown"}`
  )
  .join("\n")}`
      : `## RECENT OPEN INCIDENTS
No other open incidents at this time. Return an empty array for similar_incidents.`;

  return `${incidentSection}

---

${kbSection}

---

${recentSection}

---

Please analyze the incident above and respond with the structured JSON triage results.`;
}
