import { routing } from "@/i18n/routing";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Resend } from "resend";
import { formatAmount, fromMinorUnits } from "./amounts";
import {
	findActiveSubscriptionCode,
	getSubscriptionManageLink,
} from "./client";
import { type ReceiptTranslator, buildReceiptEmail } from "./receipt-email";
import {
	type PaystackTransaction,
	cardBrandLabel,
	isDonationTransaction,
	isMonthlyTransaction,
	readDonationMetadata,
} from "./transaction";

const FROM = "4HerFrika <hello@4herfrika.org>";
const SUBSCRIPTION_LOOKUP_ATTEMPTS = 3;
const SUBSCRIPTION_LOOKUP_DELAY_MS = 2_000;

function wait(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function lookupManageLink(
	tx: PaystackTransaction,
): Promise<string | null> {
	const customerId = tx.customer?.id;
	const planId = tx.plan?.id;
	if (!customerId || !planId) return null;

	for (let attempt = 0; attempt < SUBSCRIPTION_LOOKUP_ATTEMPTS; attempt++) {
		try {
			const code = await findActiveSubscriptionCode(customerId, planId);
			if (code) return await getSubscriptionManageLink(code);
		} catch (error) {
			console.error("[paystack] manage link lookup failed", error);
		}
		await wait(SUBSCRIPTION_LOOKUP_DELAY_MS);
	}
	return null;
}

function resolveLocale(value: string | undefined): Locale {
	return (
		routing.locales.find((locale) => locale === value) ?? routing.defaultLocale
	);
}

function paidWithLabel(tx: PaystackTransaction): string | null {
	const card = tx.authorization;
	if (!card?.last4) return null;
	const brand = cardBrandLabel(card);
	return `${brand} •••• ${card.last4}`;
}

export type ChargeSuccessResult = "sent" | "ignored" | "no-email-key";

export async function handleChargeSuccess(
	tx: PaystackTransaction,
	siteUrl: string,
): Promise<ChargeSuccessResult> {
	if (tx.status !== "success" || !isDonationTransaction(tx)) return "ignored";
	const email = tx.customer?.email;
	if (!email) return "ignored";

	const apiKey = process.env.RESEND_API_KEY;
	if (!apiKey) return "no-email-key";

	const metadata = readDonationMetadata(tx.metadata);
	const locale = resolveLocale(metadata?.locale);
	const monthly = isMonthlyTransaction(tx) || metadata?.frequency === "monthly";
	const translate = await getTranslations({
		locale,
		namespace: "donate.email",
	});
	const t: ReceiptTranslator = (key, values) =>
		translate(key as never, values as never);

	const manageLink = monthly ? await lookupManageLink(tx) : null;
	const amount = fromMinorUnits(tx.amount);
	const paidAt = new Date(tx.paid_at ?? Date.now());

	const message = buildReceiptEmail({
		t,
		siteUrl,
		donorName: metadata?.name || tx.customer?.first_name || "",
		amount,
		currency: tx.currency,
		monthly,
		reference: tx.reference,
		paidAt: new Intl.DateTimeFormat(locale, {
			dateStyle: "long",
			timeZone: "Africa/Lagos",
		}).format(paidAt),
		paidWith: paidWithLabel(tx),
		manageLink,
	});

	const resend = new Resend(apiKey);
	const { error } = await resend.emails.send(
		{
			from: FROM,
			to: email,
			replyTo: "hello@4herfrika.org",
			subject: message.subject,
			html: message.html,
			text: message.text,
		},
		{ idempotencyKey: `donation-receipt/${tx.reference}` },
	);
	if (error) throw new Error(`Receipt email failed: ${error.message}`);

	console.info(
		`[paystack] receipt sent ${tx.reference} ${formatAmount(amount, tx.currency)}`,
	);
	return "sent";
}
