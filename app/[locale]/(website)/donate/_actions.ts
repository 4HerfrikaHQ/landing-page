"use server";

import { randomUUID } from "node:crypto";
import { routing } from "@/i18n/routing";
import {
	findOrCreateMonthlyPlan,
	initializeTransaction,
	isOnlineGivingConfigured,
} from "@/src/lib/paystack/client";
import { chargeFor } from "@/src/lib/paystack/fee";
import { getLocale } from "next-intl/server";
import { headers } from "next/headers";
import { type StartGivingResult, giveInputSchema } from "./_schema";

async function callbackUrlFor(locale: string): Promise<string> {
	const requestHeaders = await headers();
	const host =
		requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
	const protocol =
		requestHeaders.get("x-forwarded-proto") ??
		(host?.startsWith("localhost") ? "http" : "https");
	const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
	return `${protocol}://${host}${prefix}/donate/thank-you`;
}

export async function startGiving(input: unknown): Promise<StartGivingResult> {
	if (!isOnlineGivingConfigured()) {
		return { status: "error", code: "unavailable" };
	}

	const parsed = giveInputSchema.safeParse(input);
	if (!parsed.success) return { status: "error", code: "invalid" };
	const gift = parsed.data;

	try {
		const locale = await getLocale();
		const { chargeMinor } = chargeFor(
			gift.amount,
			gift.currency,
			gift.coverFee,
		);
		const planCode =
			gift.frequency === "monthly"
				? await findOrCreateMonthlyPlan(chargeMinor, gift.currency)
				: undefined;
		const reference = `4HF-${randomUUID().replaceAll("-", "").slice(0, 16).toUpperCase()}`;

		const transaction = await initializeTransaction({
			email: gift.email,
			amountMinor: chargeMinor,
			currency: gift.currency,
			reference,
			callbackUrl: await callbackUrlFor(locale),
			planCode,
			metadata: {
				name: gift.name,
				anonymous: gift.anonymous,
				note: gift.note,
				frequency: gift.frequency,
				locale,
				coverFee: gift.coverFee,
			},
		});

		return {
			status: "ready",
			accessCode: transaction.access_code,
			reference: transaction.reference,
		};
	} catch (error) {
		console.error("[donate] could not start giving", error);
		return { status: "error", code: "failed" };
	}
}
