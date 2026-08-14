// 📊 Dashboard — DigiPlus IT AI Service Desk
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { IncidentList } from "@/components/IncidentList";
import { ParticleBackground } from "@/components/ParticleBackground";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "DigiPlus IT AI Service Desk — view and manage all support incidents.",
};

export const revalidate = 30;

async function getIncidents() {
  return db.incident.findMany({ orderBy: { createdAt: "desc" } });
}

export default async function DashboardPage() {
  const incidents = await getIncidents();

  return (
    <div className="space-y-8">
      {/* ── Hero section — DigiPlus IT branded ────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white" style={{ minHeight: 260 }}>
        {/* Animated particle background */}
        <ParticleBackground />

        {/* Subtle dot-grid overlay for depth on static render / reduced motion */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(99,102,241,0.25) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-start gap-2 px-8 py-12 sm:py-14">
          {/* DigiPlus IT eyebrow */}
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
            DigiPlus IT
          </p>

          {/* Gradient headline — hero-only, doesn't leak into rest of app */}
          <h1
            className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 bg-clip-text text-transparent text-3xl sm:text-4xl font-extrabold leading-tight"
          >
            AI-Powered Service Desk
          </h1>

          {/* Primary CTA — orange, this is its one home on the dashboard */}
          <Link
            href="/incidents/new"
            id="dashboard-new-incident"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Incident
          </Link>
        </div>
      </section>

      {/* ── Incident list ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-surface-900">All Incidents</h2>
        </div>
        <IncidentList initialIncidents={incidents} />
      </div>
    </div>
  );
}
