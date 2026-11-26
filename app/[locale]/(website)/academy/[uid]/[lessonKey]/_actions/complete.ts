"use server";

import { ActionError, actionClient } from "@/src/lib/safe-action";
import { canCompleteVideo } from "../../../_helpers";
import {
	actionAccess,
	concludeCourse,
	findProgress,
	markLessonComplete,
} from "../_access";
import { completionTransition } from "../_helpers";
import { CompleteLessonSchema } from "../_schema";

export const completeLesson = actionClient
	.schema(CompleteLessonSchema)
	.action(async ({ parsedInput: { uid, lessonKey } }) => {
		const { course, enrolment, completed, lesson, learner } =
			await actionAccess(uid, lessonKey);
		if (lesson.kind === "quiz" || lesson.kind === "task") {
			throw new ActionError("not_completable");
		}
		const policy = enrolment.completion_policy;
		const progress =
			lesson.kind === "video"
				? await findProgress(enrolment.id, lesson.id)
				: null;
		const allowed =
			lesson.kind === "reading" ||
			canCompleteVideo(
				policy,
				progress?.furthest_position_seconds ?? 0,
				lesson.durationSeconds ?? 0,
			);
		const transition = completionTransition(
			policy,
			course,
			lesson.id,
			completed,
			allowed,
			enrolment.completed_at !== null,
		);
		if (transition.kind === "blocked") throw new ActionError("not_finished");
		if (transition.kind === "complete") {
			await markLessonComplete(enrolment.id, lesson.id, new Date());
			const finishedCourse = transition.finishesCourse
				? await concludeCourse(course, enrolment, learner)
				: false;
			return { completed: true, finishedCourse };
		}
		return { completed: true, finishedCourse: false };
	});
