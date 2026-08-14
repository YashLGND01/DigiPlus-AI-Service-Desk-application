// 🔄 /api/incidents/[id]/analyze — POST (manually re-run AI analysis)
// Used by the "🔄 Re-analyze" button in the UI when analysis failed or incident was edited
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { analyzeIncident } from "@/lib/ai/analyzeIncident";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const incident = await db.incident.findUnique({
      where: { id: params.id },
    });

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    console.log(`🔄 Re-running AI analysis for incident: ${params.id}`);

    // Mark as Pending while re-analyzing
    await db.incident.update({
      where: { id: params.id },
      data: { aiAnalysisStatus: "Pending" },
    });

    // 🤖 Run the AI analysis
    const analysisResult = await analyzeIncident(incident, incident.id);

    let updatedIncident;
    if (analysisResult.success) {
      const data = analysisResult.data;

      updatedIncident = await db.incident.update({
        where: { id: params.id },
        data: {
          category: data.category,
          priority: data.priority,
          sentiment: data.sentiment,
          aiSummary: data.summary,
          aiSuggestedSteps: JSON.stringify(data.suggested_steps),
          aiKbMatches: JSON.stringify(
            data.kb_matches.map((m) => ({
              kbArticleId: m.kb_id,
              relevance: m.relevance,
              reason: m.reason,
            }))
          ),
          aiSimilarIncidents: JSON.stringify(
            data.similar_incidents.map((s) => ({
              incidentId: s.incident_id,
              similarity: s.similarity,
              reason: s.reason,
            }))
          ),
          aiConfidence: data.confidence,
          aiAnalysisStatus: "Done",
        },
      });

      console.log(`✅ Re-analysis complete for incident: ${params.id}`);
      return NextResponse.json(updatedIncident);
    } else {
      // ❌ Analysis failed — mark as Failed
      updatedIncident = await db.incident.update({
        where: { id: params.id },
        data: { aiAnalysisStatus: "Failed" },
      });

      console.warn(`⚠️ Re-analysis failed for ${params.id}: ${analysisResult.error}`);
      return NextResponse.json(
        {
          error: "AI analysis failed",
          details: analysisResult.error,
          incident: updatedIncident,
        },
        { status: 422 }
      );
    }
  } catch (error) {
    console.error(`❌ POST /api/incidents/${params.id}/analyze error:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
