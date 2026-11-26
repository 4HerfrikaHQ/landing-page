import "server-only";
import { db } from "@/src/db";
import { enrolments, lessonProgress } from "@/src/db/schema/tables";
import { and, eq, isNotNull } from "drizzle-orm";

export async function findEnrolment(learnerId: string, courseId: string) {
	const [enrolment] = await db
		.select()
		.from(enrolments)
		.where(
			and(
				eq(enrolments.learner_id, learnerId),
				eq(enrolments.course_id, courseId),
			),
		)
		.limit(1);
	return enrolment ?? null;
}

export async function completedLessonIds(enrolmentId: string) {
	const rows = await db
		.select({ lessonId: lessonProgress.lesson_id })
		.from(lessonProgress)
		.where(
			and(
				eq(lessonProgress.enrolment_id, enrolmentId),
				isNotNull(lessonProgress.completed_at),
			),
		);
	return new Set(rows.map((row) => row.lessonId));
}
