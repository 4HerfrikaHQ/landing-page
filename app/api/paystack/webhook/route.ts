import { handleChargeSuccess } from "@/src/lib/paystack/handle-charge-success";
import { verifyPaystackSignature } from "@/src/lib/paystack/signature";
import { parseTransaction } from "@/src/lib/paystack/transaction";
import { after } from "next/server";
import { z } from "zod";

const eventSchema = z.object({ event: z.string(), data: z.unknown() });

const IGNORED_EVENTS = new Set([
	"subscription.create",
	"subscription.disable",
	"subscription.not_renew",
	"subscription.expiring_cards",
	"invoice.create",
	"invoice.update",
	"invoice.payment_failed",
	"charge.failed",
]);

function siteUrlFrom(request: Request): string {
	return new URL(request.url).origin;
}

export async function POST(request: Request) {
	const secret = process.env.PAYSTACK_SECRET_KEY;
	if (!secret) return new Response("Not configured", { status: 503 });

	const rawBody = await request.text();
	const signature = request.headers.get("x-paystack-signature");
	if (!verifyPaystackSignature(rawBody, signature, secret)) {
		return new Response("Invalid signature", { status: 401 });
	}

	let payload: unknown;
	try {
		payload = JSON.parse(rawBody);
	} catch {
		return new Response("Invalid JSON", { status: 400 });
	}

	const event = eventSchema.safeParse(payload);
	if (!event.success) return new Response("Invalid event", { status: 400 });

	if (event.data.event === "charge.success") {
		const tx = parseTransaction(event.data.data);
		if (tx) {
			const siteUrl = siteUrlFrom(request);
			after(async () => {
				try {
					await handleChargeSuccess(tx, siteUrl);
				} catch (error) {
					console.error("[paystack] charge.success handling failed", error);
				}
			});
		}
		return new Response("ok", { status: 200 });
	}

	if (IGNORED_EVENTS.has(event.data.event)) {
		console.info(`[paystack] ${event.data.event} acknowledged`);
	}
	return new Response("ok", { status: 200 });
}
