"use client";

// 📋 IncidentList — flattened filter bar, divide-y row separation
import { useState, useEffect } from "react";
import type { Incident } from "@prisma/client";
import { IncidentCard } from "./IncidentCard";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

type FilterStatus = "" | "Open" | "In Progress" | "Resolved" | "Closed";
type FilterPriority = "" | "Low" | "Medium" | "High" | "Critical";
type FilterCategory =
  | ""
  | "Account"
  | "Billing"
  | "Technical"
  | "Network"
  | "Hardware"
  | "Software"
  | "Access"
  | "Other";

interface IncidentListProps {
  initialIncidents: Incident[];
}

export function IncidentList({ initialIncidents }: IncidentListProps) {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<FilterStatus>("");
  const [priority, setPriority] = useState<FilterPriority>("");
  const [category, setCategory] = useState<FilterCategory>("");

  useEffect(() => {
    const fetchFiltered = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (status) params.set("status", status);
        if (priority) params.set("priority", priority);
        if (category) params.set("category", category);
        const res = await fetch(`/api/incidents?${params.toString()}`);
        const data = await res.json();
        setIncidents(data.incidents ?? []);
      } catch {
        // silently show stale data
      } finally {
        setLoading(false);
      }
    };
    fetchFiltered();
  }, [status, priority, category]);

  const hasFilter = status || priority || category;

  // Flat select style — no card wrapper, sits directly on page bg
  const selectClass =
    "bg-white text-gray-700 border border-gray-200 rounded-full px-3 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1 transition-all appearance-none pr-8 cursor-pointer hover:border-gray-300";

  return (
    <div className="space-y-0">
      {/* Filter bar — sits flat on page bg, bottom border only as separator */}
      <div className="flex flex-wrap items-center gap-2.5 pb-4 mb-0 border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">
          Filter
        </span>

        <div className="relative">
          <select
            id="filter-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as FilterStatus)}
            className={selectClass}
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
          <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
          </svg>
        </div>

        <div className="relative">
          <select
            id="filter-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as FilterPriority)}
            className={selectClass}
          >
            <option value="">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
          </svg>
        </div>

        <div className="relative">
          <select
            id="filter-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as FilterCategory)}
            className={selectClass}
          >
            <option value="">All Categories</option>
            <option value="Account">Account</option>
            <option value="Billing">Billing</option>
            <option value="Technical">Technical</option>
            <option value="Network">Network</option>
            <option value="Hardware">Hardware</option>
            <option value="Software">Software</option>
            <option value="Access">Access</option>
            <option value="Other">Other</option>
          </select>
          <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
          </svg>
        </div>

        {hasFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatus("");
              setPriority("");
              setCategory("");
            }}
          >
            Clear filters
          </Button>
        )}

        <div className="ml-auto text-sm text-gray-400">
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner size="sm" /> Loading…
            </span>
          ) : (
            <span>
              {incidents.length} incident{incidents.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* List — borderless rows divided by divide-y, no card nesting */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : incidents.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-700 mb-1.5">
            No incidents found
          </h3>
          <p className="text-sm text-gray-400">
            {hasFilter
              ? "Try adjusting your filters to see more results."
              : "All clear — the queue is empty."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {incidents.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
        </div>
      )}
    </div>
  );
}
