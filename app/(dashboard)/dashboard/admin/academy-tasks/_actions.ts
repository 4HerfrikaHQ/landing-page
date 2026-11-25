"use server";

import {
	concludeEnrolment,
	notifyCertificateIssued,
} from "@/app/[locale]/(website)/academy/_conclusion";
import { getCourseById } from "@/app/[locale]/(website)/academy/_content";
import type { Course } from "@/app/[locale]/(website)/academy/_helpers";
import { routing } from "@/i18n/routing";
import { createAdminClient } from "@/src/auth";
import { db } from "@/src/db";
import { enrolments, learners, taskSubmissions } from "@/src/db/schema/tables";
import { ActionError, adminAction } from "@/src/lib/safe-action";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { type ReviewDecision, reviewTransition } from "./_helpers";
import { ReviewTaskSchema } from "./_schema";

async function findReviewTarget(submissionId: string) {
	const [target] = await db
		.select({ enrolment: enrolments, learner: learners })
		.from(taskSubmissions)
		.innerJoin(enrolments, eq(taskSubmissions.enrolment_id, enrolments.id))
		.innerJoin(learners, eq(enrolments.learner_id, learners.id))
		.where(eq(taskSubmissions.id, submissionId))
		.limit(1);
	if (!target) throw new ActionError("This submission no longer exists.");
	return target;
}

async function courseToConclude(
	decision: ReviewDecision,
	courseId: string,
): Promise<Course | null> {
	if (decision !== "complete") return null;
	const course = await getCourseById(courseId);
	if (!course) {
		throw new ActionError(
			"This course is not published in Prismic, so the certificate cannot be issued. Publish it and try again.",
		);
	}
	return course;
}

async function learnerEmail(authUserId: string) {
	const admin = await createAdminClient();
	const { data } = await admin.auth.admin.getUserById(authUserId);
	return data.user?.email ?? null;
}

export const reviewTaskSubmission = adminAction
	.schema(ReviewTaskSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { submissionId, decision, note } = parsedInput;
		const { enrolment, learner } = await findReviewTarget(submissionId);
		const course = await courseToConclude(decision, enrolment.course_id);

		const conclusion = await db.transaction(async (tx) => {
			const [locked] = await tx
				.select({ status: taskSubmissions.status })
				.from(taskSubmissions)
				.where(eq(taskSubmissions.id, submissionId))
				.for("update");
			if (!locked) throw new ActionError("This submission no longer exists.");
			const transition = reviewTransition(locked.status, decision);
			if (transition.kind === "already_reviewed") {
				throw new ActionError(
					"Someone already reviewed this submission. Refresh to see the outcome.",
				);
			}
			await tx
				.update(taskSubmissions)
				.set({
					status: transition.status,
					facilitator_note: note === "" ? null : note,
					reviewed_by: ctx.id,
					reviewed_at: new Date(),
				})
				.where(eq(taskSubmissions.id, submissionId));
			return course ? concludeEnrolment(tx, course, enrolment, learner) : null;
		});

		const certificate = conclusion?.certificate ?? null;
		if (certificate) {
			const email = await learnerEmail(learner.auth_user_id);
			if (email) {
				await notifyCertificateIssued({
					certificate,
					email,
					name: learner.certificate_name,
					locale: routing.defaultLocale,
				});
			}
		}

		revalidatePath("/dashboard/admin/academy-tasks");
		revalidatePath("/[locale]/academy/me", "page");
		revalidatePath("/[locale]/academy/[uid]", "page");
		revalidatePath("/[locale]/academy/[uid]/[lessonKey]", "page");

		return {
			decision,
			courseCompleted: conclusion !== null,
			certificateIssued: certificate !== null,
		};
	});
