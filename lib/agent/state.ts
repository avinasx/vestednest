import { z } from "zod";
import type { ChatInteraction } from "@/lib/chat-interactions/types";
import type { PropertyLookupResult } from "./tools";
import { citationSchema } from "./response-schema";

export const dealSnapshotSchema = z
  .object({
    formattedAddress: z.string().optional(),
    downPaymentPct: z.number().optional(),
    interestOnly: z.boolean().optional(),
    loanTerm: z.string().optional(),
    purpose: z.string().optional(),
  })
  .nullable()
  .default(null);

export const nestAgentStateSchema = z.object({
  lastInteraction: z.custom<ChatInteraction | null>().nullable().default(null),
  propertyLookup: z.custom<PropertyLookupResult | null>().nullable().default(null),
  citations: z.array(citationSchema).default([]),
  dealSnapshot: dealSnapshotSchema,
});

export type NestAgentStateFields = z.infer<typeof nestAgentStateSchema>;

export type NestAgentGraphState = NestAgentStateFields & {
  messages: unknown[];
  structuredResponse?: {
    message: string;
    actions: string[];
    citations?: { title: string; source: string }[];
  };
};
