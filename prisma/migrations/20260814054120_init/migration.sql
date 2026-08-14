-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reporterName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "category" TEXT,
    "priority" TEXT,
    "sentiment" TEXT,
    "aiSummary" TEXT,
    "aiSuggestedSteps" TEXT,
    "aiKbMatches" TEXT,
    "aiSimilarIncidents" TEXT,
    "aiConfidence" REAL,
    "aiAnalysisStatus" TEXT NOT NULL DEFAULT 'Pending',
    "resolutionNotes" TEXT,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "KBArticle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
