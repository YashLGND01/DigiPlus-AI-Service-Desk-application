"use client";

// ✅ ResolutionForm — status changer + notes (light theme, incident.io style)
import { useState } from "react";
import type { Incident } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

interface ResolutionFormProps {
  incident: Incident;
  onUpdated: (updated: Incident) => void;
}

type StatusOption = "Open" | "In Progress" | "Resolved" | "Closed";
const STATUS_OPTIONS: StatusOption[] = ["Open", "In Progress", "Resolved", "Closed"];

const STATUS_ACTIVE: Record<StatusOption, string> = {
  "Open":        "bg-blue-50 border-blue-300 text-blue-700",
  "In Progress": "bg-amber-50 border-amber-300 text-amber-700",
  "Resolved":    "bg-emerald-50 border-emerald-300 text-emerald-700",
  "Closed":      "bg-surface-100 border-surface-400 text-surface-600",
};

export function ResolutionForm({ incident, onUpdated }: ResolutionFormProps) {
  const [status, setStatus]               = useState<StatusOption>(incident.status as StatusOption);
  const [resolutionNotes, setNotes]       = useState(incident.resolutionNotes ?? "");
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [notesError, setNotesError]       = useState<string | null>(null);
  const [saved, setSaved]                 = useState(false);

  async function handleSave() {
    setError(null);
    setNotesError(null);
    if (status === "Resolved" && resolutionNotes.trim().length === 0) {
      setNotesError("Resolution notes are required when marking as Resolved.");
      return;
    }
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/incidents/${incident.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, resolutionNotes: resolutionNotes.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.details?.resolutionNotes) setNotesError(data.details.resolutionNotes[0]);
        else setError(data.error ?? "Failed to update incident");
        return;
      }
      onUpdated(data as Incident);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  }

  const isResolved = status === "Resolved" || status === "Closed";
  const hasChanges = status !== incident.status || resolutionNotes !== (incident.resolutionNotes ?? "");

  const inputClass =
    "w-full bg-white border border-surface-200 rounded-xl px-4 py-3 text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-alarmalade-500/30 focus:border-alarmalade-400 transition-all text-sm";

  return (
    <Card>
      <CardHeader>
        <h3 className="text-base font-semibold text-surface-900">Status &amp; Resolution</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status selector */}
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">Status</label>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 ${
                  status === s
                    ? STATUS_ACTIVE[s]
                    : "bg-white border-surface-200 text-surface-500 hover:border-surface-300 hover:text-surface-700"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Resolution Notes */}
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">
            Resolution Notes
            {isResolved && <span className="text-red-500 ml-1">*</span>}
            {!isResolved && (
              <span className="text-surface-400 text-xs font-normal ml-1">(required when resolving)</span>
            )}
          </label>
          <textarea
            value={resolutionNotes}
            onChange={(e) => { setNotes(e.target.value); if (notesError) setNotesError(null); }}
            placeholder={isResolved
              ? "Describe what was done to resolve this incident…"
              : "Add notes about the resolution or investigation progress…"}
            className={`${inputClass} resize-y min-h-[120px]`}
            maxLength={10000}
          />
          {notesError && (
            <p className="mt-1.5 text-xs text-red-600">{notesError}</p>
          )}
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        {saved && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm animate-fade-in">
            Incident updated successfully.
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            loading={saving}
            disabled={!hasChanges}
            variant={status === "Resolved" ? "success" : "primary"}
            className="flex-1 justify-center"
          >
            {status === "Resolved" ? "Mark as Resolved" : "Save Changes"}
          </Button>
        </div>

        {incident.resolvedAt && (
          <p className="text-xs text-surface-400 text-center">
            Resolved on{" "}
            {new Date(incident.resolvedAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
