/**
 * Signed action tokens for booking links emailed to users.
 *
 * We email links like `/.../{token}` that let an unauthenticated recipient
 * perform an action against a known booking (or mentor record, in the
 * onboarding case). The token is a JWT (HS256 via `jsonwebtoken`) — no
 * server-side session, no DB lookup required to validate. Tokens are
 * reusable until they expire.
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
 *     action (e.g. 30 days for onboarding). The same value drives the JWT
 *     `exp` claim, so verification rejects expired tokens without a DB hit.
 *
 * Requires `BOOKING_TOKEN_SECRET` to be set; we throw at sign/verify time
 * rather than at module load so test runners can import without the env.
 */

import jwt from "jsonwebtoken";
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

function secret(): string {
	const s = process.env.BOOKING_TOKEN_SECRET;
	if (!s) throw new Error("BOOKING_TOKEN_SECRET not set");
	return s;
}

/**
 * Sign a booking action payload and return the JWT token string. Throws if
 * `BOOKING_TOKEN_SECRET` is not set. Caller is responsible for setting
 * `expiresAt` (ms since epoch) appropriately for the action; it doubles as
 * the JWT `exp` claim.
 */
export function signBookingToken(payload: Payload): string {
	const nowSec = Math.floor(Date.now() / 1000);
	const expSec = Math.floor(payload.expiresAt / 1000);
	return jwt.sign(payload, secret(), {
		algorithm: "HS256",
		expiresIn: Math.max(0, expSec - nowSec),
	});
}

/**
 * Verify a token. Returns a discriminated union — on success the parsed
 * payload is spread onto the result; on failure `reason` distinguishes
 * `malformed` (bad shape), `bad_signature` (wrong/garbage token), and
 * `expired` (signature valid but past `expiresAt`). Never throws on bad
 * input — only if the signing secret is missing.
 */
export function verifyBookingToken(token: string): VerifyResult {
	try {
		const decoded = jwt.verify(token, secret(), { algorithms: ["HS256"] });
		if (typeof decoded !== "object" || decoded === null) {
			return { ok: false, reason: "malformed" };
		}
		const parsed = PayloadSchema.safeParse(decoded);
		if (!parsed.success) return { ok: false, reason: "malformed" };
		return { ok: true, ...parsed.data };
	} catch (e) {
		if (e instanceof jwt.TokenExpiredError)
			return { ok: false, reason: "expired" };
		if (e instanceof jwt.JsonWebTokenError)
			return { ok: false, reason: "bad_signature" };
		return { ok: false, reason: "malformed" };
	}
}
