import { z } from "zod";
import type { Currency, FREQUENCIES } from "./amounts";
import {
	DONATION_SOURCE,
	PLAN_NAME_PREFIX,
	type PaystackTransaction,
	parseTransaction,
} from "./transaction";

const API_BASE_URL = "https://api.paystack.co";

export class PaystackError extends Error {
	constructor(
		message: string,
		readonly status: number,
	) {
		super(message);
		this.name = "PaystackError";
	}
}

export function isOnlineGivingConfigured(): boolean {
	return Boolean(
		process.env.PAYSTACK_SECRET_KEY &&
			process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
	);
}

type RequestOptions = {
	method?: "GET" | "POST";
	body?: unknown;
};

async function paystackRequest(
	path: string,
	{ method = "GET", body }: RequestOptions = {},
): Promise<unknown> {
	const secret = process.env.PAYSTACK_SECRET_KEY;
	if (!secret) throw new PaystackError("Paystack is not configured", 503);

	const response = await fetch(`${API_BASE_URL}${path}`, {
		method,
		cache: "no-store",
		headers: {
			Authorization: `Bearer ${secret}`,
			"Content-Type": "application/json",
		},
		body: body === undefined ? undefined : JSON.stringify(body),
	});

	const json: unknown = await response.json().catch(() => null);
	const parsed = z
		.object({ status: z.boolean(), message: z.string(), data: z.unknown() })
		.safeParse(json);

	if (!response.ok || !parsed.success || !parsed.data.status) {
		const message = parsed.success ? parsed.data.message : response.statusText;
		throw new PaystackError(message, response.status);
	}
	return parsed.data.data;
}

const planListSchema = z.array(
	z.object({
		plan_code: z.string(),
		name: z.string(),
		amount: z.number(),
		currency: z.string(),
		interval: z.string(),
		is_deleted: z.boolean().optional(),
		is_archived: z.boolean().optional(),
	}),
);

const planSchema = z.object({ plan_code: z.string() });

function planNameFor(amountMinor: number, currency: Currency): string {
	return `${PLAN_NAME_PREFIX} ${currency} ${amountMinor / 100}`;
}

export async function findOrCreateMonthlyPlan(
	amountMinor: number,
	currency: Currency,
): Promise<string> {
	const name = planNameFor(amountMinor, currency);
	const existing = planListSchema.safeParse(
		await paystackRequest(
			`/plan?interval=monthly&amount=${amountMinor}&perPage=50`,
		),
	);
	const match = existing.success
		? existing.data.find(
				(plan) =>
					plan.name === name &&
					plan.currency === currency &&
					plan.amount === amountMinor &&
					!plan.is_deleted &&
					!plan.is_archived,
			)
		: undefined;
	if (match) return match.plan_code;

	const created = planSchema.parse(
		await paystackRequest("/plan", {
			method: "POST",
			body: { name, interval: "monthly", amount: amountMinor, currency },
		}),
	);
	return created.plan_code;
}

export type InitializeInput = {
	email: string;
	amountMinor: number;
	currency: Currency;
	reference: string;
	callbackUrl: string;
	planCode?: string;
	metadata: {
		name: string;
		anonymous: boolean;
		note: string;
		frequency: (typeof FREQUENCIES)[number];
		locale: string;
		coverFee: boolean;
	};
};

const initializeSchema = z.object({
	access_code: z.string(),
	reference: z.string(),
});

export async function initializeTransaction(input: InitializeInput) {
	const data = await paystackRequest("/transaction/initialize", {
		method: "POST",
		body: {
			email: input.email,
			amount: input.amountMinor,
			currency: input.currency,
			reference: input.reference,
			callback_url: input.callbackUrl,
			plan: input.planCode,
			channels: input.planCode ? ["card"] : undefined,
			metadata: { source: DONATION_SOURCE, ...input.metadata },
		},
	});
	return initializeSchema.parse(data);
}

export async function verifyTransaction(
	reference: string,
): Promise<PaystackTransaction | null> {
	const data = await paystackRequest(
		`/transaction/verify/${encodeURIComponent(reference)}`,
	);
	return parseTransaction(data);
}

const subscriptionListSchema = z.array(
	z.object({ subscription_code: z.string(), status: z.string() }),
);

export async function findActiveSubscriptionCode(
	customerId: number,
	planId: number,
): Promise<string | null> {
	const data = subscriptionListSchema.safeParse(
		await paystackRequest(
			`/subscription?customer=${customerId}&plan=${planId}&perPage=5`,
		),
	);
	if (!data.success) return null;
	return (
		data.data.find((subscription) => subscription.status === "active")
			?.subscription_code ?? null
	);
}

const manageLinkSchema = z.object({ link: z.url() });

export async function getSubscriptionManageLink(
	subscriptionCode: string,
): Promise<string> {
	const data = await paystackRequest(
		`/subscription/${encodeURIComponent(subscriptionCode)}/manage/link`,
	);
	return manageLinkSchema.parse(data).link;
}
