import { createHash, randomBytes } from "node:crypto";
import { db } from "@/src/db";
import {
	ActionLinkAction,
	type ActionLinkActionType,
	actionLinks,
} from "@/src/db/schema/tables";
import { verifyBookingToken } from "@/src/lib/booking-tokens";
import { and, eq, gt, isNull, ne } from "drizzle-orm";

const TOKEN_BYTES = 16;

export type ResolvedActionLink = {
	action: ActionLinkActionType;
	resourceId: string;
	source: "database" | "legacy_jwt";
};

export type ResolveActionLinkResult =
	| ({ ok: true } & ResolvedActionLink)
	| {
			ok: false;
			reason:
				| "malformed"
				| "bad_signature"
				| "expired"
				| "used"
				| "wrong_action";
	  };

export type ActionLinkClaim = {
	tokenHash: string;
	claimedAt: Date;
};

export type ClaimActionLinkResult =
	| ({ ok: true; claim: ActionLinkClaim } & ResolvedActionLink)
	| Exclude<ResolveActionLinkResult, { ok: true }>;

export function generateActionLinkToken(): string {
	return randomBytes(TOKEN_BYTES).toString("base64url");
}

export function hashActionLinkToken(token: string): string {
	return createHash("sha256").update(token).digest("hex");
}

export function validateActionLinkRecord(
	row: {
		action: string;
		resourceId: string;
		expiresAt: Date;
		usedAt: Date | null;
	},
	expectedAction: ActionLinkActionType,
	now = new Date(),
): ResolveActionLinkResult {
	const action = ActionLinkAction.safeParse(row.action);
	if (!action.success) return { ok: false, reason: "malformed" };
	if (action.data !== expectedAction)
		return { ok: false, reason: "wrong_action" };
	if (row.usedAt) return { ok: false, reason: "used" };
	if (row.expiresAt.getTime() <= now.getTime())
		return { ok: false, reason: "expired" };
	return {
		ok: true,
		action: action.data,
		resourceId: row.resourceId,
		source: "database",
	};
}

export async function createActionLink(input: {
	action: ActionLinkActionType;
	resourceId: string;
	expiresAt: Date;
}): Promise<string> {
	const token = generateActionLinkToken();
	await db.insert(actionLinks).values({
		token_hash: hashActionLinkToken(token),
		action: input.action,
		resource_id: input.resourceId,
		expires_at: input.expiresAt,
	});
	return token;
}

export async function resolveActionLink(
	token: string,
	expectedAction: ActionLinkActionType,
): Promise<ResolveActionLinkResult> {
	const [row] = await db
		.select()
		.from(actionLinks)
		.where(eq(actionLinks.token_hash, hashActionLinkToken(token)))
		.limit(1);

	if (row) {
		return validateActionLinkRecord(
			{
				action: row.action,
				resourceId: row.resource_id,
				expiresAt: row.expires_at,
				usedAt: row.used_at,
			},
			expectedAction,
		);
	}

	if (token.split(".").length !== 3) {
		return { ok: false, reason: "malformed" };
	}
	const legacy = verifyBookingToken(token);
	if (!legacy.ok) return legacy;
	if (legacy.action !== expectedAction)
		return { ok: false, reason: "wrong_action" };
	return {
		ok: true,
		action: legacy.action,
		resourceId: legacy.bookingId,
		source: "legacy_jwt",
	};
}

/**
 * Atomically reserves a link before a mutation starts. Callers should release
 * the claim if the mutation fails before it completes; successful claims stay
 * consumed.
 */
export async function claimActionLink(
	token: string,
	expectedAction: ActionLinkActionType,
): Promise<ClaimActionLinkResult> {
	const tokenHash = hashActionLinkToken(token);
	const claimedAt = new Date();
	const [claimed] = await db
		.update(actionLinks)
		.set({ used_at: claimedAt })
		.where(
			and(
				eq(actionLinks.token_hash, tokenHash),
				eq(actionLinks.action, expectedAction),
				isNull(actionLinks.used_at),
				gt(actionLinks.expires_at, claimedAt),
			),
		)
		.returning({
			action: actionLinks.action,
			resourceId: actionLinks.resource_id,
			claimedAt: actionLinks.used_at,
		});

	if (claimed?.claimedAt) {
		return {
			ok: true,
			action: claimed.action,
			resourceId: claimed.resourceId,
			source: "database",
			claim: { tokenHash, claimedAt: claimed.claimedAt },
		};
	}

	const [existing] = await db
		.select()
		.from(actionLinks)
		.where(eq(actionLinks.token_hash, tokenHash))
		.limit(1);
	if (existing) {
		const validation = validateActionLinkRecord(
			{
				action: existing.action,
				resourceId: existing.resource_id,
				expiresAt: existing.expires_at,
				usedAt: existing.used_at,
			},
			expectedAction,
			claimedAt,
		);
		// A valid row can only miss the conditional update if another request
		// changed it concurrently. Treat that lost claim as consumed.
		return validation.ok ? { ok: false, reason: "used" } : validation;
	}

	if (token.split(".").length !== 3) {
		return { ok: false, reason: "malformed" };
	}
	const legacy = verifyBookingToken(token);
	if (!legacy.ok) return legacy;
	if (legacy.action !== expectedAction) {
		return { ok: false, reason: "wrong_action" };
	}

	const [inserted] = await db
		.insert(actionLinks)
		.values({
			token_hash: tokenHash,
			action: legacy.action,
			resource_id: legacy.bookingId,
			expires_at: new Date(legacy.expiresAt),
			used_at: claimedAt,
		})
		.onConflictDoNothing({ target: actionLinks.token_hash })
		.returning({ claimedAt: actionLinks.used_at });
	if (!inserted?.claimedAt) return { ok: false, reason: "used" };

	return {
		ok: true,
		action: legacy.action,
		resourceId: legacy.bookingId,
		source: "legacy_jwt",
		claim: { tokenHash, claimedAt: inserted.claimedAt },
	};
}

export async function releaseActionLinkClaim(
	claim: ActionLinkClaim,
): Promise<void> {
	await db
		.update(actionLinks)
		.set({ used_at: null })
		.where(
			and(
				eq(actionLinks.token_hash, claim.tokenHash),
				eq(actionLinks.used_at, claim.claimedAt),
			),
		);
}

export async function consumeActionLinks(input: {
	action: ActionLinkActionType;
	resourceId: string;
	excludeToken?: string;
}): Promise<void> {
	const conditions = [
		eq(actionLinks.action, input.action),
		eq(actionLinks.resource_id, input.resourceId),
		isNull(actionLinks.used_at),
	];
	if (input.excludeToken) {
		conditions.push(
			ne(actionLinks.token_hash, hashActionLinkToken(input.excludeToken)),
		);
	}
	await db
		.update(actionLinks)
		.set({ used_at: new Date() })
		.where(and(...conditions));
}
