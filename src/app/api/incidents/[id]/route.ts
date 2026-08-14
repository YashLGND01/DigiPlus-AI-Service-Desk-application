// 🎫 /api/incidents/[id] — GET (fetch one) + PATCH (update status/notes)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { UpdateIncidentSchema } from "@/lib/validation";

// ---- GET /api/incidents/[id] ----
export async function GET(
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

    return NextResponse.json(incident);
  } catch (error) {
    console.error(`❌ GET /api/incidents/${params.id} error:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ---- PATCH /api/incidents/[id] ----
// Updates status and/or resolutionNotes. Resolving requires non-empty notes.
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check incident exists
    const existing = await db.incident.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    const body = await request.json();

    // 🔍 Validate with Zod (includes Resolved → resolutionNotes check)
    const parseResult = UpdateIncidentSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const input = parseResult.data;

    // Build update payload
    const updateData: Record<string, unknown> = {};
    if (input.status !== undefined) updateData.status = input.status;
    if (input.resolutionNotes !== undefined) {
      updateData.resolutionNotes = input.resolutionNotes;
    }

    // ✅ Set resolvedAt timestamp when transitioning to Resolved
    if (input.status === "Resolved" && existing.status !== "Resolved") {
      updateData.resolvedAt = new Date();
    }

    // Clear resolvedAt if re-opening
    if (input.status === "Open" || input.status === "In Progress") {
      updateData.resolvedAt = null;
    }

    const updated = await db.incident.update({
      where: { id: params.id },
      data: updateData,
    });

    console.log(`📝 Incident ${params.id} updated: status=${updated.status}`);

    return NextResponse.json(updated);
  } catch (error) {
    console.error(`❌ PATCH /api/incidents/${params.id} error:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
