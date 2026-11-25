import "server-only";
import { enrolments } from "@/src/db/schema/tables";
import type { DbEnrolment, DbLearner } from "@/src/db/schema/tables";
import { and, eq, isNull } from "drizzle-orm";
import type { Locale } from "next-intl";
import {
	type Transaction,
	issueCertificate,
} from "../certificates/_certificate";
import { sendCertificateReadyEmail } from "../certificates/_email";
import { buildCertificateSnapshot } from "../certificates/_helpers";
import { completedLessonIds } from "./_enrolment";
import { type Course, isCourseComplete, toPolicyModules } from "./_helpers";

type IssuedCertificate = NonNullable<
	Awaited<ReturnType<typeof issueCertificate>>
>;

export type Conclusion = { certificate: IssuedCertificate | null };

export async function concludeEnrolment(
	tx: Transaction,
	course: Course,
	enrolment: DbEnrolment,
	learner: Pick<DbLearner, "certificate_name">,
): Promise<Conclusion | null> {
	if (enrolment.completed_at) return null;
	const completed = await completedLessonIds(enrolment.id, tx);
	const finished = isCourseComplete(
		enrolment.completion_policy,
		toPolicyModules(course),
		completed,
	);
	if (!finished) return null;
	const completedAt = new Date();
	const snapshot = buildCertificateSnapshot({
		learnerName: learner.certificate_name,
		course,
		completedAt,
	});
	const [concluded] = await tx
		.update(enrolments)
		.set({ completed_at: completedAt })
		.where(
			and(eq(enrolments.id, enrolment.id), isNull(enrolments.completed_at)),
		)
		.returning({ id: enrolments.id });
	if (!concluded) return null;
	return { certificate: await issueCertificate(tx, enrolment.id, snapshot) };
}

export async function notifyCertificateIssued(input: {
	certificate: IssuedCertificate;
	email: string;
	name: string;
	locale: Locale;
}) {
	try {
		await sendCertificateReadyEmail({
			to: input.email,
			name: input.name,
			courseTitle: input.certificate.course_title,
			code: input.certificate.code,
			locale: input.locale,
		});
	} catch (error) {
		console.error("[certificate-ready] email failed", error);
	}
}
