"use client";

// 📚 Knowledge Base browse page — incident.io style light theme
import { useState, useEffect } from "react";
import type { KBArticle } from "@prisma/client";
import { KBArticleCard } from "@/components/KBArticleCard";
import { Spinner } from "@/components/ui/Spinner";
import { CATEGORY_EMOJI } from "@/lib/utils";

const CATEGORIES = [
  "Account", "Billing", "Technical", "Network",
  "Hardware", "Software", "Access", "Other",
] as const;

export default function KBPage() {
  const [articles, setArticles]               = useState<KBArticle[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [search, setSearch]                   = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch("/api/kb");
        const data = await res.json();
        setArticles(data.articles ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = articles.filter((a) => {
    const matchesSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase()) ||
      (a.tags ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Knowledge Base</h1>
        <p className="text-surface-500 mt-1 text-sm">
          {articles.length} articles · Browse and search IT support guides
        </p>
      </div>

      {/* Search + Category Filter */}
      <div className="flex flex-wrap gap-3 items-center p-4 rounded-xl bg-surface-50 border border-surface-200">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            id="kb-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles…"
            className="w-full bg-white border border-surface-200 rounded-full pl-9 pr-4 py-2 text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-alarmalade-500/30 focus:border-alarmalade-400 transition-all"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
              !selectedCategory
                ? "bg-alarmalade-500 border-alarmalade-500 text-white"
                : "bg-white border-surface-200 text-surface-500 hover:border-surface-300"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? "" : cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                selectedCategory === cat
                  ? "bg-alarmalade-500 border-alarmalade-500 text-white"
                  : "bg-white border-surface-200 text-surface-500 hover:border-surface-300"
              }`}
            >
              {CATEGORY_EMOJI[cat]} {cat}
            </button>
          ))}
        </div>

        <span className="text-sm text-surface-400 ml-auto">
          {filtered.length} article{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-surface-700 mb-1.5">No articles found</h3>
          <p className="text-sm text-surface-400">
            {search
              ? `No results for "${search}" — try different keywords`
              : "No articles in this category yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((article) => (
            <KBArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
