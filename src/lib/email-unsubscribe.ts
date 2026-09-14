import { createHmac, timingSafeEqual } from "node:crypto";
import { db } from "@/src/db";
import { emailUnsubscribes } from "@/src/db/schema/tables/email-unsubscribes";
import { eq } from "drizzle-orm";

function secret(): string {
	const value = process.env.UNSUBSCRIBE_SECRET ?? process.env.CRON_SECRET;
	if (!value) {
		throw new Error("UNSUBSCRIBE_SECRET or CRON_SECRET must be set");
	}
	return value;
}

export function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

export function unsubscribeToken(email: string): string {
	return createHmac("sha256", secret())
		.update(normalizeEmail(email))
		.digest("hex");
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
	const expected = Buffer.from(unsubscribeToken(email));
	const actual = Buffer.from(token);
	return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function siteUrl(): string {
	return process.env.NEXT_PUBLIC_SITE_URL ?? "https://4herfrika.org";
}

export function unsubscribeUrl(email: string): string {
	const params = new URLSearchParams({ e: email, t: unsubscribeToken(email) });
	return `${siteUrl()}/unsubscribe?${params.toString()}`;
}

export function unsubscribePostUrl(email: string): string {
	const params = new URLSearchParams({ e: email, t: unsubscribeToken(email) });
	return `${siteUrl()}/api/unsubscribe?${params.toString()}`;
}

export async function isUnsubscribed(email: string): Promise<boolean> {
	const [row] = await db
		.select({ email: emailUnsubscribes.email })
		.from(emailUnsubscribes)
		.where(eq(emailUnsubscribes.email, normalizeEmail(email)))
		.limit(1);
	return Boolean(row);
}

export async function recordUnsubscribe(email: string): Promise<void> {
	await db
		.insert(emailUnsubscribes)
		.values({ email: normalizeEmail(email) })
		.onConflictDoNothing();
}
