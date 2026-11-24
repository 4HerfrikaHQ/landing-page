import "server-only";
import { db } from "@/src/db";
import { enrolments, lessonProgress } from "@/src/db/schema/tables";
import { ActionError } from "@/src/lib/safe-action";
import { and, eq, isNull, sql } from "drizzle-orm";
import { getLocale } from "next-intl/server";
import { cache } from "react";
import { issueCertificate } from "../../../certificates/_certificate";
import { sendCertificateReadyEmail } from "../../../certificates/_email";
import { buildCertificateSnapshot } from "../../../certificates/_helpers";
import { getCourse } from "../../_content";
import { completedLessonIds, findEnrolment } from "../../_enrolment";
import { type Course, isCourseComplete, toPolicyModules } from "../../_helpers";
import { currentAuthUser, currentLearner } from "../../_learner";
import { canOpenLesson, findLesson } from "./_helpers";

export const loadCourse = cache(getCourse);

export type LessonAccess =
	| { kind: "course_missing" }
	| { kind: "to_course" }
	| { kind: "lesson_missing" }
	| {
			kind: "ok";
			course: Course;
			enrolment: NonNullable<Awaited<ReturnType<typeof findEnrolment>>>;
			completed: ReadonlySet<string>;
			lesson: Course["modules"][number]["lessons"][number];
			module: Course["modules"][number];
	  };

export async function resolveLessonAccess(
	learnerId: string,
	uid: string,
	lessonKey: string,
	load: (uid: string) => Promise<Course | null> = loadCourse,
): Promise<LessonAccess> {
	const course = await load(uid);
	if (!course) return { kind: "course_missing" };
	if (course.missingRequiredLessons > 0) return { kind: "to_course" };
	const enrolment = await findEnrolment(learnerId, course.id);
	if (!enrolment) return { kind: "to_course" };
	const found = findLesson(course, lessonKey);
	if (!found) return { kind: "lesson_missing" };
	const completed = await completedLessonIds(enrolment.id);
	if (
		!canOpenLesson(
			enrolment.completion_policy,
			course,
			found.module.key,
			completed,
		)
	) {
		return { kind: "to_course" };
	}
	return {
		kind: "ok",
		course,
		enrolment,
		completed,
		lesson: found.lesson,
		module: found.module,
	};
}

export async function findProgress(enrolmentId: string, lessonId: string) {
	const [row] = await db
		.select()
		.from(lessonProgress)
		.where(
			and(
				eq(lessonProgress.enrolment_id, enrolmentId),
				eq(lessonProgress.lesson_id, lessonId),
			),
		)
		.limit(1);
	return row ?? null;
}

export async function markLessonComplete(
	enrolmentId: string,
	lessonId: string,
	at: Date,
) {
	await db
		.insert(lessonProgress)
		.values({
			enrolment_id: enrolmentId,
			lesson_id: lessonId,
			completed_at: at,
		})
		.onConflictDoUpdate({
			target: [lessonProgress.enrolment_id, lessonProgress.lesson_id],
			set: {
				completed_at: sql`coalesce(${lessonProgress.completed_at}, ${at.toISOString()}::timestamptz)`,
				updated_at: at,
			},
		});
}

type Learner = NonNullable<Awaited<ReturnType<typeof currentLearner>>>;

async function notifyCertificateIssued(
	certificate: { code: string; course_title: string },
	learner: Learner,
) {
	try {
		const user = await currentAuthUser();
		if (!user?.email) return;
		await sendCertificateReadyEmail({
			to: user.email,
			name: learner.certificate_name,
			courseTitle: certificate.course_title,
			code: certificate.code,
			locale: await getLocale(),
		});
	} catch (error) {
		console.error("[certificate-ready] email failed", error);
	}
}

export async function concludeCourse(
	course: Course,
	enrolment: NonNullable<Awaited<ReturnType<typeof findEnrolment>>>,
	learner: Learner,
) {
	if (enrolment.completed_at) return false;
	const completed = await completedLessonIds(enrolment.id);
	const finished = isCourseComplete(
		enrolment.completion_policy,
		toPolicyModules(course),
		completed,
	);
	if (!finished) return false;
	const completedAt = new Date();
	const snapshot = buildCertificateSnapshot({
		learnerName: learner.certificate_name,
		course,
		completedAt,
	});
	const outcome = await db.transaction(async (tx) => {
		const [concluded] = await tx
			.update(enrolments)
			.set({ completed_at: completedAt })
			.where(
				and(eq(enrolments.id, enrolment.id), isNull(enrolments.completed_at)),
			)
			.returning({ id: enrolments.id });
		if (!concluded) return null;
		return { certificate: await issueCertificate(tx, enrolment.id, snapshot) };
	});
	if (!outcome) return false;
	if (outcome.certificate) {
		await notifyCertificateIssued(outcome.certificate, learner);
	}
	return true;
}

export async function actionAccess(uid: string, lessonKey: string) {
	const learner = await currentLearner();
	if (!learner) throw new ActionError("session_expired");
	const access = await resolveLessonAccess(
		learner.id,
		uid,
		lessonKey,
		getCourse,
	);
	if (access.kind !== "ok") throw new ActionError("lesson_unavailable");
	return { ...access, learner };
}
