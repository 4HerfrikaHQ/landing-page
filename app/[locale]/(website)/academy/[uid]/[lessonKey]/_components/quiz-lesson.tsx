import { db } from "@/src/db";
import { quizAttempts } from "@/src/db/schema/tables";
import { and, asc, eq } from "drizzle-orm";
import { getLearnerQuiz, getQuizAnswerKey } from "../../../_content";
import { gradeQuiz, nextQuizAttempt } from "../../../_helpers";
import type { QuizState } from "../_hooks/use-quiz";
import { correctNeeded, toReview, toTopics } from "../_quiz";
import type { LessonViewProps } from "../_view";
import { QuizPlayer } from "./quiz-player";

async function loadAttempts(enrolmentId: string, lessonId: string) {
	return db
		.select()
		.from(quizAttempts)
		.where(
			and(
				eq(quizAttempts.enrolment_id, enrolmentId),
				eq(quizAttempts.lesson_id, lessonId),
			),
		)
		.orderBy(asc(quizAttempts.attempt_number));
}

type Attempts = Awaited<ReturnType<typeof loadAttempts>>;

async function initialState(
	view: LessonViewProps,
	attempts: Attempts,
	policy: LessonViewProps["access"]["enrolment"]["completion_policy"],
): Promise<{
	state: QuizState;
	failedScore: number | null;
	failedTopics: string[] | null;
}> {
	const { access } = view;
	const answering: QuizState = {
		kind: "answering",
		index: 0,
		answers: {},
		moved: false,
	};
	const none = { state: answering, failedScore: null, failedTopics: null };
	const latest = attempts.at(-1);
	if (!latest) return none;
	const passed = attempts.find((attempt) => attempt.passed);
	if (passed) {
		const answerKey = policy.revealAnswersOnPass
			? await getQuizAnswerKey(access.lesson.id)
			: null;
		return {
			...none,
			state: {
				kind: "result",
				result: {
					kind: "passed",
					correctCount: passed.correct_count,
					questionCount: passed.question_count,
					review: answerKey ? toReview(policy, answerKey) : null,
					finishedCourse: access.enrolment.completed_at !== null,
				},
			},
		};
	}
	const availability = nextQuizAttempt(
		policy,
		attempts.map((attempt) => attempt.submitted_at.getTime()),
		Date.now(),
	);
	if (availability.allowed) return none;
	const topics =
		policy.failFeedback === "score_and_topics"
			? toTopics(
					policy,
					gradeQuiz(await getQuizAnswerKey(access.lesson.id), latest.answers)
						.missedTopics,
				)
			: null;
	return {
		state: {
			kind: "blocked",
			retryAtMs: availability.retryAtMs,
		},
		failedScore: latest.correct_count,
		failedTopics: topics,
	};
}

export async function QuizLesson({ view }: { view: LessonViewProps }) {
	const { access, nav } = view;
	const { enrolment, lesson } = access;
	const policy = enrolment.completion_policy;
	const [quiz, attempts] = await Promise.all([
		getLearnerQuiz(lesson.id),
		loadAttempts(enrolment.id, lesson.id),
	]);
	const { state, failedScore, failedTopics } = await initialState(
		view,
		attempts,
		policy,
	);
	const expectedAttempt =
		Math.max(0, ...attempts.map((a) => a.attempt_number)) + 1;
	return (
		<>
			<QuizPlayer
				key={`${expectedAttempt}-${state.kind}`}
				uid={access.course.uid}
				lessonKey={lesson.key}
				moduleNumber={nav.position.moduleNumber}
				quiz={quiz}
				expectedAttempt={expectedAttempt}
				needed={correctNeeded(policy, quiz.questions.length)}
				initial={state}
				failedScore={failedScore}
				failedTopics={failedTopics}
				nextHref={nav.continueHref}
				courseHref={nav.courseHref}
				reviewHref={nav.previousHref ?? nav.courseHref}
			/>
		</>
	);
}
