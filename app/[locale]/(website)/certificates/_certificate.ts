import "server-only";
import { randomBytes } from "node:crypto";
import { db } from "@/src/db";
import { certificates } from "@/src/db/schema/tables";
import { eq, inArray } from "drizzle-orm";
import { cache } from "react";
import {
	type buildCertificateSnapshot,
	generateCertificateCode,
} from "./_helpers";

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

const MAX_CODE_ATTEMPTS = 5;

export async function issueCertificate(
	tx: Transaction,
	enrolmentId: string,
	snapshot: ReturnType<typeof buildCertificateSnapshot>,
) {
	for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
		const [issued] = await tx
			.insert(certificates)
			.values({
				...snapshot,
				enrolment_id: enrolmentId,
				code: generateCertificateCode(randomBytes),
			})
			.onConflictDoNothing()
			.returning();
		if (issued) return issued;
		const [existing] = await tx
			.select({ id: certificates.id })
			.from(certificates)
			.where(eq(certificates.enrolment_id, enrolmentId))
			.limit(1);
		if (existing) return null;
	}
	throw new Error("Could not allocate a unique certificate code");
}

export const findCertificateByCode = cache(async (code: string) => {
	const [certificate] = await db
		.select()
		.from(certificates)
		.where(eq(certificates.code, code))
		.limit(1);
	return certificate ?? null;
});

export async function findCertificateByEnrolment(enrolmentId: string) {
	const [certificate] = await db
		.select()
		.from(certificates)
		.where(eq(certificates.enrolment_id, enrolmentId))
		.limit(1);
	return certificate ?? null;
}

export async function findCertificatesByEnrolments(enrolmentIds: string[]) {
	if (enrolmentIds.length === 0) return [];
	return db
		.select()
		.from(certificates)
		.where(inArray(certificates.enrolment_id, enrolmentIds));
}
