/**
 * Booking action tokens.
 *
 * Two flavors:
 *  - JWT (HS256 via `jsonwebtoken`) for stateless actions reusable until
 *    expiry: `manage` (reschedule / cancel) and `feedback` (post-call
 *    survey). No DB round-trip on verify.
 *  - DB-backed opaque tokens (uuid + `booking_tokens` row) for one-shot
 *    actions: `mentor_onboard`. Single-use (consume marks `used_at`),
 *    revocable, supports peek-then-consume so the onboarding form can be
 *    loaded multiple times before final submission.
 *
 * Requires BOOKING_TOKEN_SECRET (HS256 key for JWT). We throw at sign/verify
 * time rather than module-load so test runners can import without env.
 */

import { db } from "@/src/db";
import { bookingTokens } from "@/src/db/schema/tables/booking-tokens";
import { and, eq, isNull } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { z } from "zod";

export const JwtTokenAction = z.enum(["manage", "feedback"]);
export type JwtTokenAction = z.infer<typeof JwtTokenAction>;

export type JwtPayload = {
	bookingId: string;
	action: JwtTokenAction;
};

type JwtVerifyResult =
	| ({ ok: true } & JwtPayload)
	| { ok: false; reason: "malformed" | "bad_signature" | "expired" };

function secret(): string {
	const s = process.env.BOOKING_TOKEN_SECRET;
	if (!s) throw new Error("BOOKING_TOKEN_SECRET not set");
	return s;
}

/**
 * Sign a stateless action token. `expiresAt` is a JS timestamp (ms since
 * epoch). Caller picks the lifetime per action.
 */
export function signJwtToken(payload: JwtPayload, expiresAt: number): string {
	const expSec = Math.floor(expiresAt / 1000);
	const nowSec = Math.floor(Date.now() / 1000);
	return jwt.sign(payload, secret(), {
		algorithm: "HS256",
		expiresIn: Math.max(0, expSec - nowSec),
	});
}

export function verifyJwtToken(token: string): JwtVerifyResult {
	try {
		const decoded = jwt.verify(token, secret(), { algorithms: ["HS256"] });
		if (typeof decoded !== "object" || decoded === null) {
			return { ok: false, reason: "malformed" };
		}
		const parsed = z
			.object({ bookingId: z.string(), action: JwtTokenAction })
			.safeParse(decoded);
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

/**
 * Mint a one-shot opaque onboarding token. Returns the uuid which is the
 * token itself. Stored in `booking_tokens` with `expires_at` and
 * unset `used_at`.
 */
export async function mintOnboardingToken(params: {
	mentorId: string;
	expiresAt: Date;
}): Promise<string> {
	const [row] = await db
		.insert(bookingTokens)
		.values({
			mentor_id: params.mentorId,
			action: "mentor_onboard",
			expires_at: params.expiresAt,
		})
		.returning({ id: bookingTokens.id });
	return row.id;
}

type OnboardingTokenResult =
	| { ok: true; mentorId: string }
	| { ok: false; reason: "not_found" | "expired" | "used" };

async function lookupOnboardingToken(
	token: string,
): Promise<OnboardingTokenResult> {
	// basic uuid sanity — otherwise drizzle throws on cast
	if (
		!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
			token,
		)
	) {
		return { ok: false, reason: "not_found" };
	}
	const [row] = await db
		.select()
		.from(bookingTokens)
		.where(
			and(
				eq(bookingTokens.id, token),
				eq(bookingTokens.action, "mentor_onboard"),
			),
		)
		.limit(1);
	if (!row) return { ok: false, reason: "not_found" };
	if (row.used_at) return { ok: false, reason: "used" };
	if (row.expires_at.getTime() < Date.now())
		return { ok: false, reason: "expired" };
	return { ok: true, mentorId: row.mentor_id };
}

/**
 * Read an onboarding token without consuming it. Use on every GET of the
 * onboarding page so the same link can be opened multiple times before the
 * final submit.
 */
export async function peekOnboardingToken(
	token: string,
): Promise<OnboardingTokenResult> {
	return lookupOnboardingToken(token);
}

/**
 * Consume the onboarding token: validates, then atomically marks `used_at`.
 * Returns `used` if another concurrent submit already consumed it.
 */
export async function consumeOnboardingToken(
	token: string,
): Promise<OnboardingTokenResult> {
	const lookup = await lookupOnboardingToken(token);
	if (!lookup.ok) return lookup;
	const result = await db
		.update(bookingTokens)
		.set({ used_at: new Date() })
		.where(and(eq(bookingTokens.id, token), isNull(bookingTokens.used_at)))
		.returning({ id: bookingTokens.id });
	if (result.length === 0) return { ok: false, reason: "used" };
	return { ok: true, mentorId: lookup.mentorId };
}
