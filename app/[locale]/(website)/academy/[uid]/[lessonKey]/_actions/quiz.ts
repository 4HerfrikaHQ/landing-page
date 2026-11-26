"use server";

import { db } from "@/src/db";
import {
	enrolments,
	lessonProgress,
	quizAttempts,
} from "@/src/db/schema/tables";
import { ActionError, actionClient } from "@/src/lib/safe-action";
import { and, asc, eq, sql } from "drizzle-orm";
import { getQuizAnswerKey } from "../../../_content";
import { gradeQuiz, isQuizPassed, nextQuizAttempt } from "../../../_helpers";
import { actionAccess, concludeCourse } from "../_access";
import { checkAttemptNumber } from "../_helpers";
import { toQuizResult } from "../_quiz";
import { SubmitQuizSchema } from "../_schema";

export const submitQuiz = actionClient
	.schema(SubmitQuizSchema)
	.action(
		async ({ parsedInput: { uid, lessonKey, expectedAttempt, answers } }) => {
			const { course, enrolment, lesson } = await actionAccess(uid, lessonKey);
			if (lesson.kind !== "quiz") throw new ActionError("not_a_quiz");
			const policy = enrolment.completion_policy;

			const answerKey = await getQuizAnswerKey(lesson.id);
			const grade = gradeQuiz(answerKey, answers);
			const passed = isQuizPassed(
				policy,
				grade.correctCount,
				grade.questionCount,
			);

			const outcome = await db.transaction(async (tx) => {
				await tx
					.select({ id: enrolments.id })
					.from(enrolments)
					.where(eq(enrolments.id, enrolment.id))
					.for("update");
				const previous = await tx
					.select({
						attemptNumber: quizAttempts.attempt_number,
						submittedAt: quizAttempts.submitted_at,
						passed: quizAttempts.passed,
					})
					.from(quizAttempts)
					.where(
						and(
							eq(quizAttempts.enrolment_id, enrolment.id),
							eq(quizAttempts.lesson_id, lesson.id),
						),
					)
					.orderBy(asc(quizAttempts.attempt_number));
				if (previous.some((attempt) => attempt.passed)) {
					return { kind: "stale" as const };
				}
				const check = checkAttemptNumber(
					previous.map((attempt) => attempt.attemptNumber),
					expectedAttempt,
				);
				if (check.kind === "stale") return { kind: "stale" as const };

				const now = Date.now();
				const times = previous.map((attempt) => attempt.submittedAt.getTime());
				const availability = nextQuizAttempt(policy, times, now);
				if (!availability.allowed) {
					return {
						kind: "blocked" as const,
						retryAtMs: availability.retryAtMs,
					};
				}

				await tx.insert(quizAttempts).values({
					enrolment_id: enrolment.id,
					lesson_id: lesson.id,
					attempt_number: check.attemptNumber,
					answers,
					correct_count: grade.correctCount,
					question_count: grade.questionCount,
					passed,
					submitted_at: new Date(now),
				});
				if (passed) {
					await tx
						.insert(lessonProgress)
						.values({
							enrolment_id: enrolment.id,
							lesson_id: lesson.id,
							completed_at: new Date(now),
						})
						.onConflictDoUpdate({
							target: [lessonProgress.enrolment_id, lessonProgress.lesson_id],
							set: {
								completed_at: sql`coalesce(${lessonProgress.completed_at}, ${new Date(now).toISOString()}::timestamptz)`,
								updated_at: new Date(now),
							},
						});
				}
				return { kind: "graded" as const, nowMs: now, previousTimes: times };
			});

			if (outcome.kind !== "graded") return outcome;
			const finishedCourse = passed
				? await concludeCourse(course, enrolment)
				: false;
			return {
				kind: "graded" as const,
				result: toQuizResult({
					policy,
					answerKey,
					grade,
					passed,
					nowMs: outcome.nowMs,
					attemptTimesMs: [...outcome.previousTimes, outcome.nowMs],
					finishedCourse,
				}),
			};
		},
	);
