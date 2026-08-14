"use client";

// 📝 IncidentForm — create new incident with client + server validation
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

interface FieldErrors {
  title?: string[];
  description?: string[];
  reporterName?: string[];
}

export function IncidentForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function validate(): FieldErrors {
    const e: FieldErrors = {};
    if (title.trim().length < 5) e.title = ["Title must be at least 5 characters"];
    if (title.trim().length > 200) e.title = ["Title must be under 200 characters"];
    if (description.trim().length < 20) e.description = ["Description must be at least 20 characters"];
    if (description.trim().length > 5000) e.description = ["Description must be under 5000 characters"];
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          reporterName: reporterName.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.details) setErrors(data.details as FieldErrors);
        else setServerError(data.error ?? "Something went wrong");
        return;
      }
      router.push(`/incidents/${data.id}`);
    } catch {
      setServerError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full bg-white border border-surface-200 rounded-xl px-4 py-3 text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-alarmalade-500/30 focus:border-alarmalade-400 transition-all text-sm";

  const labelClass = "block text-sm font-medium text-surface-700 mb-1.5";

  return (
    <Card className="max-w-2xl mx-auto animate-slide-up">
      <CardHeader>
        <h2 className="text-base font-semibold text-surface-900">
          Incident Details
        </h2>
        <p className="text-sm text-surface-500 mt-0.5">
          Describe the issue in detail — the more context you provide, the better the AI analysis.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Title */}
          <div>
            <label htmlFor="incident-title" className={labelClass}>
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="incident-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="e.g. Cannot connect to VPN from home office"
              className={inputClass}
              maxLength={200}
            />
            {errors.title && (
              <p className="mt-1.5 text-xs text-red-600">{errors.title[0]}</p>
            )}
            <p className="mt-1 text-xs text-surface-400">
              {title.length}/200 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="incident-description" className={labelClass}>
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="incident-description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              placeholder="Describe the issue in detail: what happened, what you expected, steps to reproduce, any error messages, when it started..."
              className={`${inputClass} resize-y min-h-[140px]`}
              maxLength={5000}
            />
            {errors.description && (
              <p className="mt-1.5 text-xs text-red-600">{errors.description[0]}</p>
            )}
            <p className="mt-1 text-xs text-surface-400">
              {description.length}/5000 characters
            </p>
          </div>

          {/* Reporter Name */}
          <div>
            <label htmlFor="incident-reporter" className={labelClass}>
              Your Name{" "}
              <span className="text-surface-400 text-xs font-normal">(optional)</span>
            </label>
            <input
              id="incident-reporter"
              type="text"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              placeholder="e.g. Jane Smith"
              className={inputClass}
              maxLength={100}
            />
          </div>

          {/* Server error */}
          {serverError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {serverError}
            </div>
          )}

          {/* AI note */}
          <div className="p-3.5 rounded-xl bg-alarmalade-50 border border-alarmalade-100 text-sm text-alarmalade-700">
            <span className="font-semibold">AI Triage enabled</span> — After submission, the AI will
            automatically analyze your incident and provide category, priority, resolution steps, and
            related KB articles. This takes 10–20 seconds.
          </div>

          <Button
            type="submit"
            loading={submitting}
            className="w-full justify-center"
            size="lg"
          >
            {submitting ? "Analyzing with AI…" : "Submit Incident"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
