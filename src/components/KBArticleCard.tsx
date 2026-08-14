// 📚 KBArticleCard — clean, light-theme KB article card
import type { KBArticle } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { safeJsonParse, CATEGORY_EMOJI } from "@/lib/utils";

interface KBArticleCardProps {
  article: KBArticle;
}

export function KBArticleCard({ article }: KBArticleCardProps) {
  const categoryEmoji = CATEGORY_EMOJI[article.category ?? ""] ?? "📋";
  const tags = safeJsonParse<string[]>(article.tags, []);

  return (
    <Card className="h-full hover:shadow-card-hover hover:border-surface-300 transition-all duration-200 cursor-default">
      <CardContent className="py-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-surface-100 flex items-center justify-center text-lg shrink-0">
            {categoryEmoji}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-surface-900 leading-snug mb-1">
              {article.title}
            </h3>
            {article.category && (
              <Badge className="bg-surface-100 text-surface-500 text-xs">
                {article.category}
              </Badge>
            )}
          </div>
          <span className="text-xs font-mono text-surface-300 shrink-0">
            {article.id}
          </span>
        </div>

        <p className="text-sm text-surface-500 leading-relaxed line-clamp-4 mb-3">
          {article.content}
        </p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full bg-surface-100 text-surface-500 text-xs"
              >
                #{tag}
              </span>
            ))}
            {tags.length > 5 && (
              <span className="text-xs text-surface-400 self-center">
                +{tags.length - 5} more
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
