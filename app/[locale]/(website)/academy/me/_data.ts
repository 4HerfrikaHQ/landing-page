import "server-only";
import { db } from "@/src/db";
import { enrolments } from "@/src/db/schema/tables";
import { eq } from "drizzle-orm";
import { findCertificatesByEnrolments } from "../../certificates/_certificate";
import { courseProgressPercent, nextLesson } from "../[uid]/_helpers";
import { getCourses } from "../_content";
import { completedLessonIds } from "../_enrolment";
import type { LearningEntry } from "./_helpers";

async function loadCourses() {
	try {
		return await getCourses();
	} catch (error) {
		console.error("[academy] could not load courses for My learning", error);
		return [];
	}
}

export async function loadLearning(
	learnerId: string,
): Promise<LearningEntry[]> {
	const rows = await db
		.select()
		.from(enrolments)
		.where(eq(enrolments.learner_id, learnerId))
		.orderBy(enrolments.enrolled_at);
	if (rows.length === 0) return [];
	const [courses, certificates] = await Promise.all([
		loadCourses(),
		findCertificatesByEnrolments(rows.map((row) => row.id)),
	]);
	const courseById = new Map(courses.map((course) => [course.id, course]));
	const codeByEnrolment = new Map(
		certificates.map((certificate) => [
			certificate.enrolment_id,
			certificate.code,
		]),
	);
	const entries = await Promise.all(
		rows.map(async (row) => {
			const course = courseById.get(row.course_id);
			if (!course) return [];
			const completed = await completedLessonIds(row.id);
			const policy = row.completion_policy;
			return [
				{
					course,
					percent: courseProgressPercent(course, policy, completed),
					next: nextLesson(course, policy, completed),
					completedAt: row.completed_at,
					certificateCode: codeByEnrolment.get(row.id) ?? null,
				},
			];
		}),
	);
	return entries.flat();
}
