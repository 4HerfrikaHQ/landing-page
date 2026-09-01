import { createHash, randomBytes } from "node:crypto";
import { db } from "@/src/db";
import {
	ActionLinkAction,
	type ActionLinkActionType,
	actionLinks,
} from "@/src/db/schema/tables";
import { and, eq, isNull } from "drizzle-orm";

const TOKEN_BYTES = 16;

export type ResolvedActionLink = {
	action: ActionLinkActionType;
	resourceId: string;
};

export type ResolveActionLinkResult =
	| ({ ok: true } & ResolvedActionLink)
	| {
			ok: false;
			reason: "malformed" | "expired" | "used" | "wrong_action";
	  };

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
): ResolveActionLinkResult {
	const now = new Date();
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

	return { ok: false, reason: "malformed" };
}

export async function replaceActionLink(input: {
	action: ActionLinkActionType;
	resourceId: string;
	expiresAt: Date;
}): Promise<string> {
	const token = generateActionLinkToken();
	const usedAt = new Date();
	await db.transaction(async (tx) => {
		await tx
			.update(actionLinks)
			.set({ used_at: usedAt })
			.where(
				and(
					eq(actionLinks.action, input.action),
					eq(actionLinks.resource_id, input.resourceId),
					isNull(actionLinks.used_at),
				),
			);
		await tx.insert(actionLinks).values({
			token_hash: hashActionLinkToken(token),
			action: input.action,
			resource_id: input.resourceId,
			expires_at: input.expiresAt,
		});
	});
	return token;
}

export async function consumeActionLinks(input: {
	action: ActionLinkActionType;
	resourceId: string;
}): Promise<void> {
	await db
		.update(actionLinks)
		.set({ used_at: new Date() })
		.where(
			and(
				eq(actionLinks.action, input.action),
				eq(actionLinks.resource_id, input.resourceId),
				isNull(actionLinks.used_at),
			),
		);
}
