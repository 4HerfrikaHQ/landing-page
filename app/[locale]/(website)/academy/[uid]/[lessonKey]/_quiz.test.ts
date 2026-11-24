import { describe, expect, test } from "bun:test";
import { DEFAULT_COMPLETION_POLICY, type QuizAnswerKey } from "../../_helpers";
import type { CompletionPolicy } from "../../_schema";
import { correctNeeded, toQuizResult, toReview, toTopics } from "./_quiz";

const answerKey: QuizAnswerKey = {
	id: "q",
	questions: [
		{ key: "M1-01", correctIndex: 1, why: "Because.", topic: "A" },
		{ key: "M1-02", correctIndex: 0, why: null, topic: "B" },
	],
};
const grade = { correctCount: 1, questionCount: 2, missedTopics: ["B"] };
const cooldown: CompletionPolicy = {
	...DEFAULT_COMPLETION_POLICY,
	attemptLimit: { kind: "cooldown", minutes: 10 },
	passMarkPercent: 100,
};
const MINUTE = 60_000;

describe("correctNeeded", () => {
	test("rounds the pass mark up", () => {
		expect(correctNeeded({ ...cooldown, passMarkPercent: 70 }, 10)).toBe(7);
		expect(correctNeeded({ ...cooldown, passMarkPercent: 70 }, 4)).toBe(3);
		expect(correctNeeded(cooldown, 10)).toBe(10);
	});
});

describe("toReview and toTopics", () => {
	test("hides answers unless the policy reveals them", () => {
		expect(toReview(cooldown, answerKey)).toBeNull();
		const reveal = { ...cooldown, revealAnswersOnPass: true };
		expect(toReview(reveal, answerKey)?.[0]).toEqual({
			key: "M1-01",
			correctIndex: 1,
			why: "Because.",
		});
	});

	test("hides topics unless the policy shows them", () => {
		expect(toTopics(cooldown, ["B"])).toBeNull();
		expect(
			toTopics({ ...cooldown, failFeedback: "score_and_topics" }, ["B"]),
		).toEqual(["B"]);
	});
});

describe("toQuizResult", () => {
	const base = { answerKey, grade, nowMs: 1_000_000, finishedCourse: false };

	test("a fail under a cooldown reports the retry time", () => {
		const result = toQuizResult({
			...base,
			policy: cooldown,
			passed: false,
			attemptTimesMs: [1_000_000],
		});
		expect(result).toEqual({
			kind: "failed",
			correctCount: 1,
			questionCount: 2,
			missedTopics: null,
			retryAtMs: 1_000_000 + 10 * MINUTE,
		});
	});

	test("a fail with attempts left has no wait", () => {
		const policy: CompletionPolicy = {
			...cooldown,
			attemptLimit: { kind: "per_hour", max: 3 },
			failFeedback: "score_and_topics",
		};
		const result = toQuizResult({
			...base,
			policy,
			passed: false,
			attemptTimesMs: [1_000_000],
		});
		expect(result).toMatchObject({ retryAtMs: null, missedTopics: ["B"] });
	});

	test("a fail at the hourly limit waits for the oldest attempt to age out", () => {
		const policy: CompletionPolicy = {
			...cooldown,
			attemptLimit: { kind: "per_hour", max: 2 },
		};
		const result = toQuizResult({
			...base,
			policy,
			passed: false,
			attemptTimesMs: [900_000, 1_000_000],
		});
		expect(result).toMatchObject({ retryAtMs: 900_000 + 60 * MINUTE });
	});

	test("a pass never carries topics and only reveals answers when allowed", () => {
		const hidden = toQuizResult({
			...base,
			policy: cooldown,
			passed: true,
			attemptTimesMs: [1_000_000],
		});
		expect(hidden).toMatchObject({ kind: "passed", review: null });
		const shown = toQuizResult({
			...base,
			policy: { ...cooldown, revealAnswersOnPass: true },
			passed: true,
			finishedCourse: true,
			attemptTimesMs: [1_000_000],
		});
		expect(shown).toMatchObject({ kind: "passed", finishedCourse: true });
		expect(shown.kind === "passed" && shown.review?.length).toBe(2);
	});
});
