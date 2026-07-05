import { z } from "zod";

export const searchSchema = z.object({
  query: z.string().trim().min(1, "query is required").max(500),
  limit: z.number().int().min(1).max(50).optional(),
});

export const explainSchema = z.object({
  question: z.string().trim().min(1, "question is required").max(500),
});

export const rememberSchema = z.object({
  title: z.string().trim().min(1, "title is required").max(200),
  content: z.string().trim().min(1, "content is required").max(20000),
  source: z.string().trim().max(100).optional(),
});
