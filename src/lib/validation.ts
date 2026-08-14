// ✅ Zod Validation Schemas — used by API routes for input validation
import { z } from "zod";

export const CreateIncidentSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be under 200 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description must be under 5000 characters"),
  reporterName: z
    .string()
    .max(100, "Reporter name must be under 100 characters")
    .optional(),
});

export type CreateIncidentInput = z.infer<typeof CreateIncidentSchema>;

export const UpdateIncidentSchema = z
  .object({
    status: z
      .enum(["Open", "In Progress", "Resolved", "Closed"])
      .optional(),
    resolutionNotes: z
      .string()
      .max(10000, "Resolution notes must be under 10000 characters")
      .optional(),
  })
  .refine(
    (data) => {
      // If setting status to Resolved, resolutionNotes must be present and non-empty
      if (data.status === "Resolved") {
        return (
          data.resolutionNotes !== undefined &&
          data.resolutionNotes.trim().length > 0
        );
      }
      return true;
    },
    {
      message: "Resolution notes are required when marking an incident as Resolved",
      path: ["resolutionNotes"],
    }
  );

export type UpdateIncidentInput = z.infer<typeof UpdateIncidentSchema>;

export const IncidentFilterSchema = z.object({
  status: z
    .enum(["Open", "In Progress", "Resolved", "Closed"])
    .optional(),
  priority: z.enum(["Low", "Medium", "High", "Critical"]).optional(),
  category: z
    .enum(["Account", "Billing", "Technical", "Network", "Hardware", "Software", "Access", "Other"])
    .optional(),
});

export type IncidentFilter = z.infer<typeof IncidentFilterSchema>;

export const CreateKBArticleSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(10).max(20000),
  category: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateKBArticleInput = z.infer<typeof CreateKBArticleSchema>;
