"use server";

import { db } from "@/src/db";
import { enrolments } from "@/src/db/schema/tables";
import { ActionError, actionClient } from "@/src/lib/safe-action";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCourse } from "../_content";
import { completedLessonIds, findEnrolment } from "../_enrolment";
import { requireLearner } from "../_learner";
import { localizedPath } from "../sign-in/_helpers";
import {
	coursePath,
	firstLesson,
	isCourseOpenForEnrolment,
	lessonPath,
	nextLesson,
} from "./_helpers";

const MAX_UID_LENGTH = 200;

const EnrolSchema = z.object({ uid: z.string().min(1).max(MAX_UID_LENGTH) });

export const enrolInCourse = actionClient
	.schema(EnrolSchema)
	.action(async ({ parsedInput: { uid } }) => {
		const locale = await getLocale();
		const learner = await requireLearner(
			localizedPath(locale, coursePath(uid)),
		);
		const course = await getCourse(uid);
		if (!course) throw new ActionError("course_not_found");
		const first = firstLesson(course);
		if (!first || !isCourseOpenForEnrolment(course)) {
			throw new ActionError("course_updating");
		}
		await db
			.insert(enrolments)
			.values({
				learner_id: learner.id,
				course_id: course.id,
				completion_policy: course.policy,
			})
			.onConflictDoNothing();
		const enrolment = await findEnrolment(learner.id, course.id);
		const completed = enrolment
			? await completedLessonIds(enrolment.id)
			: new Set<string>();
		const target =
			(enrolment
				? nextLesson(course, enrolment.completion_policy, completed)
				: null) ?? first;
		redirect(localizedPath(locale, lessonPath(uid, target.key)));
	});
