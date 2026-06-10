import { z } from "zod";

export const citationSchema = z.object({
  title: z.string(),
  source: z.string(),
});

export const nestResponseSchema = z.object({
  message: z
    .string()
    .describe("Assistant reply shown in chat — concise, humane, operator-friendly"),
  actions: z
    .array(z.string())
    .max(4)
    .describe(
      "0-4 short chip labels the USER might tap as their next reply — never bot questions or prompts (e.g. 'Enter your address'); those belong in message only. Never random example addresses.",
    ),
  citations: z
    .array(citationSchema)
    .optional()
    .describe("KB sources woven into the reply when search_knowledge_base was used"),
});

export type NestResponse = z.infer<typeof nestResponseSchema>;
export type NestCitation = z.infer<typeof citationSchema>;
