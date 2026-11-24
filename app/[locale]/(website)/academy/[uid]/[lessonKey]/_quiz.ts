import { type QuizAnswerKey, nextQuizAttempt } from "../../_helpers";
import type { CompletionPolicy } from "../../_schema";

export type ReviewItem = {
	key: string;
	correctIndex: number;
	why: string | null;
};

export type QuizResult =
	| {
			kind: "passed";
			correctCount: number;
			questionCount: number;
			review: ReviewItem[] | null;
			finishedCourse: boolean;
	  }
	| {
			kind: "failed";
			correctCount: number;
			questionCount: number;
			missedTopics: string[] | null;
			retryAtMs: number | null;
	  };

export type QuizOutcome =
	| { kind: "stale" }
	| { kind: "blocked"; retryAtMs: number }
	| { kind: "graded"; result: QuizResult };

export function toReview(
	policy: CompletionPolicy,
	answerKey: QuizAnswerKey,
): ReviewItem[] | null {
	if (!policy.revealAnswersOnPass) return null;
	return answerKey.questions.map(({ key, correctIndex, why }) => ({
		key,
		correctIndex,
		why,
	}));
}

export function toTopics(
	policy: CompletionPolicy,
	missedTopics: string[],
): string[] | null {
	return policy.failFeedback === "score_and_topics" ? missedTopics : null;
}

export function toQuizResult(input: {
	policy: CompletionPolicy;
	answerKey: QuizAnswerKey;
	grade: {
		correctCount: number;
		questionCount: number;
		missedTopics: string[];
	};
	passed: boolean;
	nowMs: number;
	attemptTimesMs: number[];
	finishedCourse: boolean;
}): QuizResult {
	const { policy, answerKey, grade, passed, nowMs, attemptTimesMs } = input;
	if (passed) {
		return {
			kind: "passed",
			correctCount: grade.correctCount,
			questionCount: grade.questionCount,
			review: toReview(policy, answerKey),
			finishedCourse: input.finishedCourse,
		};
	}
	const next = nextQuizAttempt(policy, attemptTimesMs, nowMs);
	return {
		kind: "failed",
		correctCount: grade.correctCount,
		questionCount: grade.questionCount,
		missedTopics: toTopics(policy, grade.missedTopics),
		retryAtMs: next.allowed ? null : next.retryAtMs,
	};
}

export function correctNeeded(
	policy: CompletionPolicy,
	questionCount: number,
): number {
	return Math.ceil((policy.passMarkPercent * questionCount) / 100);
}
