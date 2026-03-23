import { z } from "zod";

export const HdiByNameSchema = z.object({
  drug1: z.string(),
  drug2: z.string().optional(),
  maxRows: z.number().int().positive().optional(),
});

export const SearchItemSchema = z.object({
  drug: z.string(),
});

export const HdiByIdSchema = z.object({
  item_id1: z.string(),
  item_id2: z.string().optional(),
  maxRows: z.number().int().positive().optional(),
});

export type HdiByNamePayload = z.infer<typeof HdiByNameSchema>;
export type SearchItemPayload = z.infer<typeof SearchItemSchema>;
export type HdiByIdPayload = z.infer<typeof HdiByIdSchema>;
