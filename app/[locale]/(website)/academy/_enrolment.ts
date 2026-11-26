import "server-only";
import { db } from "@/src/db";
import {
	enrolments,
	lessonProgress,
	taskSubmissions,
} from "@/src/db/schema/tables";
import { and, eq, isNotNull } from "drizzle-orm";
import type { Transaction } from "../certificates/_certificate";

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

export async function completedLessonIds(
	enrolmentId: string,
	executor: Transaction | typeof db = db,
) {
	const rows = await executor
		.select({ lessonId: lessonProgress.lesson_id })
		.from(lessonProgress)
		.where(
			and(
				eq(lessonProgress.enrolment_id, enrolmentId),
				isNotNull(lessonProgress.completed_at),
			),
		);
	const reviewed = await executor
		.selectDistinct({ lessonId: taskSubmissions.lesson_id })
		.from(taskSubmissions)
		.where(
			and(
				eq(taskSubmissions.enrolment_id, enrolmentId),
				eq(taskSubmissions.status, "complete"),
			),
		);
	return new Set([...rows, ...reviewed].map((row) => row.lessonId));
}
