// 📚 /api/kb — GET (list all) + POST (add new article)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CreateKBArticleSchema } from "@/lib/validation";

// ---- GET /api/kb ----
export async function GET() {
  try {
    const articles = await db.kBArticle.findMany({
      orderBy: { category: "asc" },
    });

    return NextResponse.json({ articles, total: articles.length });
  } catch (error) {
    console.error("❌ GET /api/kb error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ---- POST /api/kb ----
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parseResult = CreateKBArticleSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const input = parseResult.data;

    const article = await db.kBArticle.create({
      data: {
        title: input.title,
        content: input.content,
        category: input.category ?? null,
        tags: input.tags ? JSON.stringify(input.tags) : null,
      },
    });

    console.log(`📚 Created KB article: ${article.id}`);
    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("❌ POST /api/kb error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
