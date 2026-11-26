import "server-only";
import { db } from "@/src/db";
import { enrolments } from "@/src/db/schema/tables";
import { ActionError } from "@/src/lib/safe-action";
import { getCourse } from "../_content";
import { completedLessonIds, findEnrolment } from "../_enrolment";
import {
	firstLesson,
	isCourseOpenForEnrolment,
	lessonPath,
	nextLesson,
} from "./_helpers";

export async function startCourse(learnerId: string, uid: string) {
	const course = await getCourse(uid);
	if (!course) throw new ActionError("course_not_found");
	const first = firstLesson(course);
	if (!first || !isCourseOpenForEnrolment(course)) {
		throw new ActionError("course_updating");
	}
	await db
		.insert(enrolments)
		.values({
			learner_id: learnerId,
			course_id: course.id,
			completion_policy: course.policy,
		})
		.onConflictDoNothing();
	const enrolment = await findEnrolment(learnerId, course.id);
	const completed = enrolment
		? await completedLessonIds(enrolment.id)
		: new Set<string>();
	const target =
		(enrolment
			? nextLesson(course, enrolment.completion_policy, completed)
			: null) ?? first;
	return lessonPath(uid, target.key);
}
