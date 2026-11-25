import { z } from "zod";

export const legalKind = z.enum(["privacy", "terms"]);

export type LegalKind = z.infer<typeof legalKind>;
