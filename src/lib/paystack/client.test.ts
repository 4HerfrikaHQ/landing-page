import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
	PaystackError,
	findOrCreateMonthlyPlan,
	initializeTransaction,
	isOnlineGivingConfigured,
	verifyTransaction,
} from "./client";

type Call = { url: string; method: string; body: unknown };

const realFetch = globalThis.fetch;
let calls: Call[] = [];
let responder: (call: Call) => { status?: number; json: unknown };

beforeEach(() => {
	calls = [];
	process.env.PAYSTACK_SECRET_KEY = "sk_test_fake";
	process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY = "pk_test_fake";
	globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
		const call: Call = {
			url: String(input),
			method: init?.method ?? "GET",
			body: init?.body ? JSON.parse(String(init.body)) : undefined,
		};
		calls.push(call);
		const { status = 200, json } = responder(call);
		return new Response(JSON.stringify(json), { status });
	}) as typeof fetch;
});

afterEach(() => {
	globalThis.fetch = realFetch;
	Reflect.deleteProperty(process.env, "PAYSTACK_SECRET_KEY");
	Reflect.deleteProperty(process.env, "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY");
});

describe("isOnlineGivingConfigured", () => {
	test("needs both keys", () => {
		expect(isOnlineGivingConfigured()).toBe(true);
		process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY = "";
		expect(isOnlineGivingConfigured()).toBe(false);
		process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY = "pk_test_fake";
		process.env.PAYSTACK_SECRET_KEY = "";
		expect(isOnlineGivingConfigured()).toBe(false);
	});
});

describe("findOrCreateMonthlyPlan", () => {
	test("reuses a matching plan for the same amount and currency", async () => {
		responder = () => ({
			json: {
				status: true,
				message: "ok",
				data: [
					{
						plan_code: "PLN_other",
						name: "4HerFrika monthly NGN 5000",
						amount: 500000,
						currency: "NGN",
						interval: "monthly",
					},
					{
						plan_code: "PLN_match",
						name: "4HerFrika monthly NGN 25000",
						amount: 2500000,
						currency: "NGN",
						interval: "monthly",
					},
				],
			},
		});
		expect(await findOrCreateMonthlyPlan(2_500_000, "NGN")).toBe("PLN_match");
		expect(calls).toHaveLength(1);
	});

	test("creates a monthly plan when none matches", async () => {
		responder = (call) =>
			call.method === "GET"
				? { json: { status: true, message: "ok", data: [] } }
				: {
						json: {
							status: true,
							message: "ok",
							data: { plan_code: "PLN_new" },
						},
					};
		expect(await findOrCreateMonthlyPlan(1_000_000, "NGN")).toBe("PLN_new");
		expect(calls[1]?.url).toBe("https://api.paystack.co/plan");
		expect(calls[1]?.body).toEqual({
			name: "4HerFrika monthly NGN 10000",
			interval: "monthly",
			amount: 1_000_000,
			currency: "NGN",
		});
	});
});

describe("initializeTransaction", () => {
	test("sends kobo, currency, callback, metadata and restricts plan gifts to card", async () => {
		responder = () => ({
			json: {
				status: true,
				message: "ok",
				data: { access_code: "ac_123", reference: "4HF-REF" },
			},
		});
		const result = await initializeTransaction({
			email: "donor@example.com",
			amountMinor: 2_500_000,
			currency: "NGN",
			reference: "4HF-REF",
			callbackUrl: "https://site.test/donate/thank-you",
			planCode: "PLN_match",
			metadata: {
				name: "Amara",
				anonymous: false,
				note: "",
				frequency: "monthly",
				locale: "en",
				coverFee: false,
			},
		});
		expect(result).toEqual({ access_code: "ac_123", reference: "4HF-REF" });
		expect(calls[0]?.url).toBe(
			"https://api.paystack.co/transaction/initialize",
		);
		expect(calls[0]?.body).toMatchObject({
			email: "donor@example.com",
			amount: 2_500_000,
			currency: "NGN",
			plan: "PLN_match",
			channels: ["card"],
			callback_url: "https://site.test/donate/thank-you",
			metadata: { source: "4herfrika-donate", frequency: "monthly" },
		});
	});

	test("surfaces Paystack errors", async () => {
		responder = () => ({
			status: 400,
			json: { status: false, message: "Invalid key", data: null },
		});
		await expect(
			initializeTransaction({
				email: "a@b.co",
				amountMinor: 100000,
				currency: "NGN",
				reference: "r",
				callbackUrl: "https://site.test/x",
				metadata: {
					name: "",
					anonymous: false,
					note: "",
					frequency: "once",
					locale: "en",
					coverFee: false,
				},
			}),
		).rejects.toBeInstanceOf(PaystackError);
	});
});

describe("verifyTransaction", () => {
	test("returns the verified transaction", async () => {
		responder = () => ({
			json: {
				status: true,
				message: "ok",
				data: {
					status: "success",
					reference: "4HF-REF",
					amount: 2500000,
					currency: "NGN",
					customer: { email: "donor@example.com" },
					metadata: { source: "4herfrika-donate" },
				},
			},
		});
		const tx = await verifyTransaction("4HF-REF");
		expect(tx?.status).toBe("success");
		expect(calls[0]?.url).toBe(
			"https://api.paystack.co/transaction/verify/4HF-REF",
		);
	});
});
