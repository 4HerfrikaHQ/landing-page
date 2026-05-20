/**
 * Signed action tokens for one-shot booking links emailed to users.
 *
 * We email links like `/.../{token}` that let an unauthenticated recipient
 * perform exactly one action against a known booking (or mentor record, in
 * the onboarding case). The token is an HMAC-SHA256 signed payload — no
 * server-side session, no DB lookup required to validate.
 *
 * Payload shape: { bookingId, action, expiresAt }
 *   - `bookingId` — the resource the token grants access to. For
 *     `mentor_onboard` this is actually the mentor id (the action predates
 *     the rename and we kept the field name to avoid a token format change).
 *   - `action` — one of `BookingTokenAction`:
 *       * `manage`         — recipient (mentee) manages an existing booking
 *                            (reschedule / cancel).
 *       * `feedback`       — recipient leaves post-call feedback.
 *       * `mentor_onboard` — approved applicant finishes their mentor
 *                            profile + sets availability.
 *   - `expiresAt` — absolute ms-since-epoch deadline. After this the token
 *     is rejected with `reason: "expired"`. Callers pick the lifetime per
 *     action (e.g. 30 days for onboarding).
 *
 * Requires `BOOKING_TOKEN_SECRET` to be set; we throw at sign/verify time
 * rather than at module load so test runners can import without the env.
 *
 * Encoding: `<base64url(JSON payload)>.<base64url(HMAC-SHA256)>`. Signature
 * comparison is constant-time via `timingSafeEqual`.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

export const BookingTokenAction = z.enum([
	"manage",
	"feedback",
	"mentor_onboard",
]);
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

/**
 * Sign a booking action payload and return the URL-safe token string.
 * Throws if `BOOKING_TOKEN_SECRET` is not set. Caller is responsible for
 * setting `expiresAt` appropriately for the action.
 */
export function signBookingToken(payload: Payload): string {
	const body = b64url(JSON.stringify(payload));
	const sig = createHmac("sha256", secret()).update(body).digest();
	return `${body}.${b64url(sig)}`;
}

/**
 * Verify a token. Returns a discriminated union — on success the parsed
 * payload is spread onto the result; on failure `reason` distinguishes
 * `malformed` (bad shape / not JSON), `bad_signature` (HMAC mismatch), and
 * `expired` (signature valid but past `expiresAt`). Never throws on bad
 * input — only if the signing secret is missing.
 */
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
	if (Date.now() > parsed.data.expiresAt)
		return { ok: false, reason: "expired" };
	return { ok: true, ...parsed.data };
}
