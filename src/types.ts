import { z } from "zod";

export const RequestPayloadSchema = z.object({
  drug1: z.string(),
  drug2: z.string().optional(),
});

export type RequestPayload = z.infer<typeof RequestPayloadSchema>;
