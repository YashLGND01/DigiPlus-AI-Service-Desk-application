// ➕ New Incident page — incident.io style
import type { Metadata } from "next";
import Link from "next/link";
import { IncidentForm } from "@/components/IncidentForm";

export const metadata: Metadata = {
  title: "New Incident",
  description: "Submit a new support incident for AI-powered triage and resolution.",
};

export default function NewIncidentPage() {
  return (
    <div className="space-y-6 animate-slide-up">
      <Link
        href="/"
        className="text-sm text-surface-500 hover:text-surface-800 transition-colors inline-flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-surface-900">Submit New Incident</h1>
        <p className="text-surface-500 text-sm mt-1">
          Describe your issue below. Gemini AI will automatically triage it — assigning category, priority, and suggesting resolution steps.
        </p>
      </div>

      <IncidentForm />
    </div>
  );
}
