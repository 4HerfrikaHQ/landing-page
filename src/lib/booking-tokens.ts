import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

export const BookingTokenAction = z.enum(["manage", "feedback", "mentor_onboard"]);
export type BookingTokenAction = z.infer<typeof BookingTokenAction>;

const PayloadSchema = z.object({
	bookingId: z.string(),
	action: BookingTokenAction,
	expiresAt: z.number(),
});
type Payload = z.infer<typeof PayloadSchema>;

type VerifyResult =
	| ({ ok: true } & Payload)
	| { ok: false; reason: "malformed" | "bad_signature" | "expired" };

function b64url(input: Buffer | string): string {
	const buf = typeof input === "string" ? Buffer.from(input) : input;
	return buf.toString("base64url");
}

function b64urlDecode(input: string): Buffer {
	return Buffer.from(input, "base64url");
}

function secret(): Buffer {
	const s = process.env.BOOKING_TOKEN_SECRET;
	if (!s) throw new Error("BOOKING_TOKEN_SECRET not set");
	return Buffer.from(s);
}

export function signBookingToken(payload: Payload): string {
	const body = b64url(JSON.stringify(payload));
	const sig = createHmac("sha256", secret()).update(body).digest();
	return `${body}.${b64url(sig)}`;
}

export function verifyBookingToken(token: string): VerifyResult {
	const parts = token.split(".");
	if (parts.length !== 2) return { ok: false, reason: "malformed" };
	const [body, sigB64] = parts;
	const expectedSig = createHmac("sha256", secret()).update(body).digest();
	const givenSig = b64urlDecode(sigB64);
	if (expectedSig.length !== givenSig.length)
		return { ok: false, reason: "bad_signature" };
	if (!timingSafeEqual(expectedSig, givenSig))
		return { ok: false, reason: "bad_signature" };

	const parsed = PayloadSchema.safeParse(
		(() => {
			try {
				return JSON.parse(b64urlDecode(body).toString("utf8"));
			} catch {
				return null;
			}
		})(),
	);
	if (!parsed.success) return { ok: false, reason: "malformed" };
	if (Date.now() > parsed.data.expiresAt) return { ok: false, reason: "expired" };
	return { ok: true, ...parsed.data };
}
