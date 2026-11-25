import { z } from "zod";
import { CURRENCIES, FREQUENCIES } from "./amounts";

export const DONATION_SOURCE = "4herfrika-donate";
export const REFERENCE_PREFIX = "4HF-";
export const REFERENCE_PATTERN = /^4HF-[0-9A-F]{16}$/;
export const PLAN_NAME_PREFIX = "4HerFrika monthly";

export const donationMetadataSchema = z.object({
	source: z.literal(DONATION_SOURCE),
	name: z.string().default(""),
	anonymous: z.boolean().default(false),
	note: z.string().default(""),
	frequency: z.enum(FREQUENCIES).default("once"),
	locale: z.string().default("en"),
	coverFee: z.boolean().default(false),
});

export type DonationMetadata = z.infer<typeof donationMetadataSchema>;

const transactionSchema = z.object({
	status: z.string(),
	reference: z.string(),
	amount: z.number(),
	currency: z.enum(CURRENCIES),
	paid_at: z.string().nullish(),
	customer: z
		.object({
			id: z.number().optional(),
			email: z.string(),
			first_name: z.string().nullish(),
		})
		.nullish(),
	authorization: z
		.object({
			last4: z.string().nullish(),
			brand: z.string().nullish(),
			card_type: z.string().nullish(),
		})
		.nullish(),
	plan: z
		.object({
			id: z.number().optional(),
			plan_code: z.string().optional(),
			name: z.string().optional(),
		})
		.nullish(),
	metadata: z.unknown().optional(),
});

export type PaystackTransaction = z.infer<typeof transactionSchema>;

export function parseTransaction(data: unknown): PaystackTransaction | null {
	const parsed = transactionSchema.safeParse(data);
	return parsed.success ? parsed.data : null;
}

export function readDonationMetadata(
	metadata: unknown,
): DonationMetadata | null {
	const parsed = donationMetadataSchema.safeParse(metadata);
	return parsed.success ? parsed.data : null;
}

export function isMonthlyTransaction(tx: PaystackTransaction): boolean {
	return Boolean(tx.plan?.plan_code);
}

export function isDonationTransaction(tx: PaystackTransaction): boolean {
	if (readDonationMetadata(tx.metadata)) return true;
	return Boolean(tx.plan?.name?.startsWith(PLAN_NAME_PREFIX));
}

export function cardBrandLabel(
	card: NonNullable<PaystackTransaction["authorization"]>,
): string {
	const raw = (card.brand ?? card.card_type ?? "Card").trim();
	return raw.charAt(0).toUpperCase() + raw.slice(1);
}
