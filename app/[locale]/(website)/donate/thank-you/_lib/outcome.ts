import { fromMinorUnits } from "@/src/lib/paystack/amounts";
import { PaystackError, verifyTransaction } from "@/src/lib/paystack/client";
import {
	type DonationMetadata,
	type PaystackTransaction,
	REFERENCE_PATTERN,
	cardBrandLabel,
	isDonationTransaction,
	isMonthlyTransaction,
	readDonationMetadata,
} from "@/src/lib/paystack/transaction";

export type GiftSummary = {
	reference: string;
	amount: number;
	currency: PaystackTransaction["currency"];
	monthly: boolean;
	name: string;
	email: string;
	paidWith: string | null;
	paidAt: string | null;
};

export type GiveOutcome =
	| { status: "success"; gift: GiftSummary }
	| { status: "pending"; reference: string }
	| { status: "failed"; reference: string };

const PENDING_STATUSES = new Set([
	"ongoing",
	"pending",
	"processing",
	"queued",
]);

function paidWithLabel(tx: PaystackTransaction): string | null {
	const card = tx.authorization;
	if (!card?.last4) return null;
	return `${cardBrandLabel(card)} •••• ${card.last4}`;
}

export function maskEmail(email: string): string {
	const [local = "", domain = ""] = email.split("@");
	return `${local.slice(0, 2)}${"•".repeat(Math.max(local.length - 2, 1))}@${domain}`;
}

function summarize(
	tx: PaystackTransaction,
	metadata: DonationMetadata | null,
): GiftSummary {
	return {
		reference: tx.reference,
		amount: fromMinorUnits(tx.amount),
		currency: tx.currency,
		monthly: isMonthlyTransaction(tx) || metadata?.frequency === "monthly",
		name: metadata?.name.trim().split(/\s+/)[0] ?? "",
		email: tx.customer?.email ?? "",
		paidWith: paidWithLabel(tx),
		paidAt: tx.paid_at ?? null,
	};
}

export async function resolveOutcome(reference: string): Promise<GiveOutcome> {
	if (!REFERENCE_PATTERN.test(reference)) {
		return { status: "failed", reference };
	}
	try {
		const tx = await verifyTransaction(reference);
		if (!tx || tx.reference !== reference || !isDonationTransaction(tx)) {
			return { status: "failed", reference };
		}
		if (tx.status === "success") {
			return {
				status: "success",
				gift: summarize(tx, readDonationMetadata(tx.metadata)),
			};
		}
		if (PENDING_STATUSES.has(tx.status))
			return { status: "pending", reference };
		return { status: "failed", reference };
	} catch (error) {
		if (
			error instanceof PaystackError &&
			(error.status === 404 || error.status === 400)
		) {
			return { status: "failed", reference };
		}
		return { status: "pending", reference };
	}
}
