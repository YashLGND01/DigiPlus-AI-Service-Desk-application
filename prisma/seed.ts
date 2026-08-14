// 🌱 Prisma Seed Script — populates KB articles and sample incidents
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface KBArticleData {
  id: string;
  title: string;
  content: string;
  category?: string;
  tags?: string;
}

interface IncidentData {
  id: string;
  title: string;
  description: string;
  reporterName?: string;
  status: string;
  category?: string;
  priority?: string;
  sentiment?: string;
  aiSummary?: string;
  aiSuggestedSteps?: string;
  aiKbMatches?: string;
  aiSimilarIncidents?: string;
  aiConfidence?: number;
  aiAnalysisStatus: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

async function main() {
  console.log("🌱 Starting database seed...");

  // 📚 Load KB articles from JSON
  const kbPath = path.join(__dirname, "../data/kb-articles.json");
  const kbArticles: KBArticleData[] = JSON.parse(
    fs.readFileSync(kbPath, "utf-8")
  );

  console.log(`📚 Seeding ${kbArticles.length} KB articles...`);
  for (const article of kbArticles) {
    await prisma.kBArticle.upsert({
      where: { id: article.id },
      update: {
        title: article.title,
        content: article.content,
        category: article.category,
        tags: article.tags,
      },
      create: {
        id: article.id,
        title: article.title,
        content: article.content,
        category: article.category,
        tags: article.tags,
      },
    });
  }
  console.log("✅ KB articles seeded.");

  // 🎫 Load sample incidents from JSON
  const incidentsPath = path.join(__dirname, "../data/sample-incidents.json");
  const incidents: IncidentData[] = JSON.parse(
    fs.readFileSync(incidentsPath, "utf-8")
  );

  console.log(`🎫 Seeding ${incidents.length} sample incidents...`);
  for (const incident of incidents) {
    await prisma.incident.upsert({
      where: { id: incident.id },
      update: {
        title: incident.title,
        description: incident.description,
        reporterName: incident.reporterName,
        status: incident.status,
        category: incident.category,
        priority: incident.priority,
        sentiment: incident.sentiment,
        aiSummary: incident.aiSummary,
        aiSuggestedSteps: incident.aiSuggestedSteps,
        aiKbMatches: incident.aiKbMatches,
        aiSimilarIncidents: incident.aiSimilarIncidents,
        aiConfidence: incident.aiConfidence,
        aiAnalysisStatus: incident.aiAnalysisStatus,
        resolutionNotes: incident.resolutionNotes,
        resolvedAt: incident.resolvedAt ? new Date(incident.resolvedAt) : null,
        createdAt: new Date(incident.createdAt),
      },
      create: {
        id: incident.id,
        title: incident.title,
        description: incident.description,
        reporterName: incident.reporterName,
        status: incident.status,
        category: incident.category,
        priority: incident.priority,
        sentiment: incident.sentiment,
        aiSummary: incident.aiSummary,
        aiSuggestedSteps: incident.aiSuggestedSteps,
        aiKbMatches: incident.aiKbMatches,
        aiSimilarIncidents: incident.aiSimilarIncidents,
        aiConfidence: incident.aiConfidence,
        aiAnalysisStatus: incident.aiAnalysisStatus,
        resolutionNotes: incident.resolutionNotes,
        resolvedAt: incident.resolvedAt ? new Date(incident.resolvedAt) : null,
        createdAt: new Date(incident.createdAt),
      },
    });
  }
  console.log("✅ Sample incidents seeded.");

  console.log("🎉 Database seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
