# 🎫 AI-Powered Service Desk

An intelligent IT support desk that uses **Claude (Anthropic)** to automatically triage incoming incidents — assigning category, priority, sentiment, suggested resolution steps, and linking to relevant Knowledge Base articles and similar open incidents.

![Tech Stack](https://img.shields.io/badge/Next.js-14-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Prisma](https://img.shields.io/badge/Prisma-SQLite-teal?logo=prisma) ![Claude](https://img.shields.io/badge/AI-Claude%20Sonnet-orange)

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DATABASE_URL="file:./prisma/dev.db"
ANTHROPIC_API_KEY="sk-ant-..."   # Your Anthropic API key
```

Get an API key at [console.anthropic.com](https://console.anthropic.com).

### 3. Set up the database
```bash
# Create the SQLite database and apply the schema
npx prisma migrate dev --name init

# Seed with 15 KB articles and 18 sample incidents
npx prisma db seed
```

### 4. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📱 Pages

| Route | Description |
|---|---|
| `/` | 📊 Dashboard — stat cards, filterable incident list |
| `/incidents/new` | ➕ Submit a new incident (triggers AI analysis) |
| `/incidents/[id]` | 🎫 Incident detail — AI panel, status management, resolution notes |
| `/kb` | 📚 Knowledge Base browser with text search + category filter |

---

## 🤖 AI Integration

### Provider & Model
- **Provider**: [Google AI Studio](https://aistudio.google.com) — **free tier available**
- **Model**: `gemini-2.0-flash` (fast, capable, generous free quota)
- **Get your free API key**: [aistudio.google.com](https://aistudio.google.com) → Create API Key

### Forced Tool-Use (Structured Output)
The AI call uses **forced function-calling** (`toolConfig: { functionCallingConfig: { mode: "ANY" } }`). This guarantees the response is always a structured JSON object conforming to the function's parameter schema — not free-text prose. The response is then validated again with a **Zod schema** for double assurance.

```typescript
// Force Gemini to always call this exact function
toolConfig: {
  functionCallingConfig: {
    mode: "ANY",
    allowedFunctionNames: ["submit_incident_analysis"],
  },
}
```

### What the AI Produces
For each incident, Claude returns:
- **Category** (Account / Billing / Technical / Network / Hardware / Software / Access / Other)
- **Priority** (Low / Medium / High / Critical) — with explicit definitions in the system prompt
- **Sentiment** (Neutral / Frustrated / Urgent / Satisfied)
- **Summary** — a 1–2 sentence technical summary for triage engineers
- **Suggested Resolution Steps** — ordered, specific, actionable steps
- **KB Matches** — IDs from the provided KB list with relevance (High/Medium/Low) and reason
- **Similar Incidents** — IDs from provided open incidents with similarity and reason
- **Confidence Score** (0.0–1.0)

### What Happens When AI Fails
If the AI call fails for any reason (network error, rate limit, invalid response, Zod validation failure):
1. The error is caught and logged
2. `aiAnalysisStatus` is set to `"Failed"` on the incident
3. The incident is still created and returned with HTTP 201
4. A **🔄 Re-analyze** button appears in the UI to retry

---

## 🏗️ Architecture Decisions

### In-Context KB Matching vs. Vector Database
The KB (15 articles) fits entirely within Claude's context window (~200k tokens). Sending all articles with each request means:
- **Zero infrastructure** — no vector database, no embeddings pipeline
- **Higher accuracy** — the LLM can reason about relevance semantically rather than by embedding cosine similarity
- **Simplicity** — one API call does everything: categorization + priority + KB matching + duplicate detection

**Trade-off**: This approach does not scale past ~50–100 articles before context costs become prohibitive. At production scale, the right approach is: compute embeddings once per article (store in pgvector/Pinecone), retrieve the top-k at query time, and send only those to the LLM.

### One Combined AI Call vs. Multiple Calls
A single Claude call handles all triage tasks simultaneously. This:
- Reduces latency (one round trip vs. 4–5)
- Allows the model to reason holistically (e.g., sentiment can inform priority)
- Costs less per incident

### JSON-Stringified DB Columns
`aiSuggestedSteps`, `aiKbMatches`, and `aiSimilarIncidents` are stored as JSON strings in SQLite rather than normalized into join tables. This was a deliberate time-saving choice for this demo.

**Trade-off**: Cannot query/filter by AI fields in SQL; requires `JSON.parse` on read; no referential integrity. In production, use proper relational tables or a JSON-native database.

---

## 📂 Project Structure

```
ai-service-desk/
├── prisma/
│   ├── schema.prisma       # Incident + KBArticle models
│   └── seed.ts             # Seeds from data/*.json
├── data/
│   ├── kb-articles.json    # 15 synthetic KB articles
│   └── sample-incidents.json # 18 sample incidents (2 near-duplicate pairs)
├── src/
│   ├── app/                # Next.js 14 App Router pages + API routes
│   ├── components/         # React components (UI + feature)
│   ├── lib/
│   │   ├── db.ts           # Prisma singleton
│   │   ├── validation.ts   # Zod schemas for API input
│   │   ├── utils.ts        # Helpers, emoji maps, color maps
│   │   └── ai/
│   │       ├── client.ts   # Anthropic singleton
│   │       ├── schemas.ts  # Zod schema + Anthropic tool definition
│   │       ├── prompts.ts  # System prompt + user message builder
│   │       └── analyzeIncident.ts  # AI orchestration
│   └── types/index.ts      # Shared TypeScript types
```

---

## ⚠️ Known Limitations

1. **In-context retrieval doesn't scale**: The current approach sends all KB articles with every request. Beyond ~50 articles, switch to embeddings + vector search.

2. **No authentication**: Anyone with access to the dev server can view and modify all incidents. Add NextAuth or Clerk before any multi-user deployment.

3. **SQLite for single-user demo**: SQLite is file-based and doesn't support concurrent writes well. Migrate to PostgreSQL for multi-user production use (`provider = "postgresql"` in `schema.prisma`).

4. **No automated tests**: Time-constrained build. Add `@testing-library/react` for component tests and `vitest` for unit tests before shipping.

5. **AI analysis is synchronous in POST**: The API route awaits the Gemini call before responding. For high-volume deployments, move analysis to a background queue (BullMQ, Inngest, etc.) and poll for results.

6. **AI context includes only open incidents**: Similarity detection only compares against Open/In Progress incidents (most recent 20). Resolved incidents are excluded to keep context focused on actionable duplicates.

---

## 🔧 Other Commands

```bash
npx prisma studio      # Browse the database in a GUI
npx prisma db push     # Push schema changes without a migration
npm run build          # Build for production
```

---

## 📋 Assumptions

- KB articles and sample incidents are **synthetic/curated** — the original Hugging Face dataset (`mindweave/help-desk-tickets`) was not used because network access was unavailable during build. The synthetic data covers the same categories and includes deliberate near-duplicate pairs for demo purposes.
- The Anthropic model string `claude-sonnet-5` maps to `claude-sonnet-4-5` in the current SDK (the latest Claude Sonnet available). Update the model string in `src/lib/ai/analyzeIncident.ts` as new versions release.
- No image or file attachments are supported on incidents (text-only for this build).
