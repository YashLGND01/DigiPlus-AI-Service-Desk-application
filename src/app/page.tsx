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

async function getStats() {
  const [total, open, inProgress, critical, resolved] = await Promise.all([
    db.incident.count(),
    db.incident.count({ where: { status: "Open" } }),
    db.incident.count({ where: { status: "In Progress" } }),
    db.incident.count({ where: { priority: "Critical" } }),
    db.incident.count({ where: { status: "Resolved" } }),
  ]);
  return { total, open, inProgress, critical, resolved };
}

async function getIncidents() {
  return db.incident.findMany({ orderBy: { createdAt: "desc" } });
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "amber" | "red" | "emerald";
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  const colors = {
    blue:    { bg: "bg-blue-50",    text: "text-blue-600",    iconBg: "bg-blue-100"    },
    amber:   { bg: "bg-amber-50",   text: "text-amber-600",   iconBg: "bg-amber-100"   },
    red:     { bg: "bg-red-50",     text: "text-red-600",     iconBg: "bg-red-100"     },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", iconBg: "bg-emerald-100" },
  };
  const c = colors[color];

  return (
    <div className={`rounded-xl border border-surface-200 bg-white p-5 shadow-card animate-slide-up`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
            {label}
          </p>
          <p className="text-3xl font-bold text-surface-900">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg ${c.iconBg} flex items-center justify-center ${c.text}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const [stats, incidents] = await Promise.all([getStats(), getIncidents()]);

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

          {/* Live stats line */}
          <p className="text-gray-500 text-sm mt-0.5">
            <span className="font-semibold text-gray-700">{stats.total}</span> total incidents
            {" · "}
            <span className="font-semibold text-gray-700">{stats.open}</span> open
            {" · "}triaged by AI in real time ⚡
          </p>

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

      {/* ── Stat cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Open"
          value={stats.open}
          color="blue"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          }
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          color="amber"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          }
        />
        <StatCard
          label="Critical"
          value={stats.critical}
          color="red"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          }
        />
        <StatCard
          label="Resolved"
          value={stats.resolved}
          color="emerald"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          }
        />
      </div>

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
