// 🎫 /api/incidents — GET (list) + POST (create + auto-analyze)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CreateIncidentSchema, IncidentFilterSchema } from "@/lib/validation";
import { analyzeIncident } from "@/lib/ai/analyzeIncident";

// ---- GET /api/incidents ----
// Supports ?status=, ?priority=, ?category= query filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawFilters = {
      status: searchParams.get("status") ?? undefined,
      priority: searchParams.get("priority") ?? undefined,
      category: searchParams.get("category") ?? undefined,
    };

    // Validate filters with Zod
    const filterResult = IncidentFilterSchema.safeParse(rawFilters);
    if (!filterResult.success) {
      return NextResponse.json(
        { error: "Invalid filter parameters", details: filterResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const filters = filterResult.data;

    // Build Prisma where clause from validated filters
    const where: Record<string, unknown> = {};
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.category) where.category = filters.category;

    const incidents = await db.incident.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ incidents, total: incidents.length });
  } catch (error) {
    console.error("❌ GET /api/incidents error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ---- POST /api/incidents ----
// Creates incident → runs AI analysis → updates row → returns full incident
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 🔍 Validate input with Zod
    const parseResult = CreateIncidentSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const input = parseResult.data;

    // 📝 Insert the incident row
    const incident = await db.incident.create({
      data: {
        title: input.title,
        description: input.description,
        reporterName: input.reporterName ?? null,
        status: "Open",
        aiAnalysisStatus: "Pending",
      },
    });

    console.log(`🎫 Created incident: ${incident.id}`);

    // 🤖 Run AI analysis — never let a failure block ticket creation
    const analysisResult = await analyzeIncident(incident, incident.id);

    let updatedIncident;
    if (analysisResult.success) {
      const data = analysisResult.data;

      // 💾 Map AI snake_case fields to DB camelCase columns
      updatedIncident = await db.incident.update({
        where: { id: incident.id },
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

      console.log(`✅ AI analysis saved for incident: ${incident.id}`);
    } else {
      // ❌ AI failed — mark as Failed but still return 201 with the created incident
      updatedIncident = await db.incident.update({
        where: { id: incident.id },
        data: { aiAnalysisStatus: "Failed" },
      });

      console.warn(`⚠️ AI analysis failed for incident ${incident.id}: ${analysisResult.error}`);
    }

    return NextResponse.json(updatedIncident, { status: 201 });
  } catch (error) {
    console.error("❌ POST /api/incidents error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
