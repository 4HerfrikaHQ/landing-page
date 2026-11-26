import {
	DEFAULT_COMPLETION_POLICY,
	canCompleteVideo,
	clampVideoSeek,
	isCourseComplete,
	isModuleUnlocked,
	isQuizPassed,
	missingForCompletion,
	nextQuizAttempt,
} from "./_helpers";
import {
	type CompletionPolicy,
	CompletionPolicy as CompletionPolicySchema,
	type CourseModule,
} from "./_schema";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

const strict: CompletionPolicy = {
	passMarkPercent: 100,
	attemptLimit: { kind: "cooldown", minutes: 10 },
	failFeedback: "score_and_topics",
	revealAnswersOnPass: true,
	videoMustFinish: true,
	readingAck: true,
	sequentialUnlock: true,
	tasksRequired: true,
	minAge: 16,
};

function moduleOf(n: number): CourseModule {
	return {
		key: `M${n}`,
		lessons: [
			{ id: `m${n}-video`, kind: "video", required: true },
			{ id: `m${n}-reading`, kind: "reading", required: true },
			{ id: `m${n}-quiz`, kind: "quiz", required: true },
			{ id: `m${n}-task`, kind: "task", required: true },
		],
	};
}

const course = [moduleOf(1), moduleOf(2)];
const done = (...ids: string[]) => new Set(ids);

describe("CompletionPolicy schema", () => {
	test("accepts the default and the strict policy", () => {
		expect(CompletionPolicySchema.parse(DEFAULT_COMPLETION_POLICY)).toEqual(
			DEFAULT_COMPLETION_POLICY,
		);
		expect(CompletionPolicySchema.parse(strict)).toEqual(strict);
	});
	test("rejects a pass mark of 0 or over 100", () => {
		for (const passMarkPercent of [0, 101]) {
			expect(
				CompletionPolicySchema.safeParse({ ...strict, passMarkPercent })
					.success,
			).toBe(false);
		}
	});
});

describe("isQuizPassed", () => {
	test("70% passes at exactly 7 of 10 and fails at 6", () => {
		expect(isQuizPassed(DEFAULT_COMPLETION_POLICY, 7, 10)).toBe(true);
		expect(isQuizPassed(DEFAULT_COMPLETION_POLICY, 6, 10)).toBe(false);
	});
	test("70% of a 3-question quiz needs all 3, with no rounding down", () => {
		expect(isQuizPassed(DEFAULT_COMPLETION_POLICY, 2, 3)).toBe(false);
		expect(isQuizPassed(DEFAULT_COMPLETION_POLICY, 3, 3)).toBe(true);
	});
	test("100% needs every answer right", () => {
		expect(isQuizPassed(strict, 19, 20)).toBe(false);
		expect(isQuizPassed(strict, 20, 20)).toBe(true);
	});
	test("a quiz with no questions never passes", () => {
		expect(isQuizPassed(strict, 0, 0)).toBe(false);
	});
});

describe("nextQuizAttempt", () => {
	test("cooldown: the first attempt is always allowed", () => {
		expect(nextQuizAttempt(strict, [], 0)).toEqual({ allowed: true });
	});
	test("cooldown: waits 10 minutes after the latest attempt", () => {
		const attempts = [0, 5 * MINUTE];
		expect(nextQuizAttempt(strict, attempts, 14 * MINUTE)).toEqual({
			allowed: false,
			retryAtMs: 15 * MINUTE,
		});
		expect(nextQuizAttempt(strict, attempts, 15 * MINUTE)).toEqual({
			allowed: true,
		});
	});
	test("per hour: the 4th attempt within an hour waits for the oldest to expire", () => {
		const attempts = [0, 10 * MINUTE, 20 * MINUTE];
		expect(
			nextQuizAttempt(DEFAULT_COMPLETION_POLICY, attempts, 30 * MINUTE),
		).toEqual({
			allowed: false,
			retryAtMs: HOUR,
		});
		expect(nextQuizAttempt(DEFAULT_COMPLETION_POLICY, attempts, HOUR)).toEqual({
			allowed: true,
		});
	});
	test("per hour: attempts older than an hour don't count", () => {
		const attempts = [0, 1, 2, HOUR + 1];
		expect(
			nextQuizAttempt(DEFAULT_COMPLETION_POLICY, attempts, HOUR + 5 * MINUTE),
		).toEqual({ allowed: true });
	});
	test("per hour: order of stored attempts doesn't matter", () => {
		const attempts = [20 * MINUTE, 0, 10 * MINUTE];
		expect(
			nextQuizAttempt(DEFAULT_COMPLETION_POLICY, attempts, 30 * MINUTE),
		).toEqual({
			allowed: false,
			retryAtMs: HOUR,
		});
	});
});

describe("video rules", () => {
	test("strict policy blocks seeking past the furthest point on first watch", () => {
		expect(clampVideoSeek(strict, 120, 300, false)).toBe(120);
		expect(clampVideoSeek(strict, 120, 60, false)).toBe(60);
	});
	test("seeking is free once the video is complete, or under the default policy", () => {
		expect(clampVideoSeek(strict, 120, 300, true)).toBe(300);
		expect(clampVideoSeek(DEFAULT_COMPLETION_POLICY, 0, 300, false)).toBe(300);
	});
	test("strict policy completes only within 2 seconds of the end", () => {
		expect(canCompleteVideo(strict, 340, 343)).toBe(false);
		expect(canCompleteVideo(strict, 341, 343)).toBe(true);
	});
	test("default policy completes on Continue", () => {
		expect(canCompleteVideo(DEFAULT_COMPLETION_POLICY, 0, 343)).toBe(true);
	});
});

describe("isModuleUnlocked", () => {
	test("every module is open under the default policy", () => {
		expect(
			isModuleUnlocked(DEFAULT_COMPLETION_POLICY, course, "M2", done()),
		).toBe(true);
	});
	test("sequential: module 2 opens once module 1's video, reading and quiz are done", () => {
		expect(
			isModuleUnlocked(strict, course, "M2", done("m1-video", "m1-reading")),
		).toBe(false);
		expect(
			isModuleUnlocked(
				strict,
				course,
				"M2",
				done("m1-video", "m1-reading", "m1-quiz"),
			),
		).toBe(true);
	});
	test("sequential: the task under review doesn't hold the next module back", () => {
		expect(
			isModuleUnlocked(
				strict,
				course,
				"M2",
				done("m1-video", "m1-reading", "m1-quiz"),
			),
		).toBe(true);
	});
	test("the first module is always open and an unknown key is closed", () => {
		expect(isModuleUnlocked(strict, course, "M1", done())).toBe(true);
		expect(isModuleUnlocked(strict, course, "M9", done())).toBe(false);
	});
});

describe("course completion", () => {
	const allButTasks = done(
		"m1-video",
		"m1-reading",
		"m1-quiz",
		"m2-video",
		"m2-reading",
		"m2-quiz",
	);
	test("strict policy needs every task marked complete", () => {
		expect(isCourseComplete(strict, course, allButTasks)).toBe(false);
		expect(
			missingForCompletion(strict, course, allButTasks).map((l) => l.id),
		).toEqual(["m1-task", "m2-task"]);
		expect(
			isCourseComplete(
				strict,
				course,
				new Set([...allButTasks, "m1-task", "m2-task"]),
			),
		).toBe(true);
	});
	test("tasks don't count when the policy doesn't require them", () => {
		expect(
			isCourseComplete(DEFAULT_COMPLETION_POLICY, course, allButTasks),
		).toBe(true);
	});
	test("optional lessons are never required", () => {
		const withOptional: CourseModule[] = [
			{
				key: "M1",
				lessons: [
					{ id: "a", kind: "video", required: true },
					{ id: "b", kind: "reading", required: false },
				],
			},
		];
		expect(isCourseComplete(strict, withOptional, done("a"))).toBe(true);
	});
	test("a course with no required lessons is never complete", () => {
		expect(isCourseComplete(strict, [], done())).toBe(false);
	});
	test("a course whose only required lessons are tasks isn't complete when tasks don't count", () => {
		const tasksOnly: CourseModule[] = [
			{ key: "M1", lessons: [{ id: "t", kind: "task", required: true }] },
		];
		expect(isCourseComplete(DEFAULT_COMPLETION_POLICY, tasksOnly, done())).toBe(
			false,
		);
	});
});

describe("untrusted video numbers", () => {
	test("negative or non-numeric seeks clamp to 0", () => {
		expect(clampVideoSeek(strict, 120, -5, false)).toBe(0);
		expect(clampVideoSeek(strict, 120, Number.NaN, false)).toBe(0);
		expect(clampVideoSeek(DEFAULT_COMPLETION_POLICY, 0, -5, false)).toBe(0);
	});
	test("a missing or zero duration never counts as watched", () => {
		expect(canCompleteVideo(strict, 0, 0)).toBe(false);
		expect(canCompleteVideo(strict, 500, Number.NaN)).toBe(false);
	});
});

describe("per hour attempt edges", () => {
	test("no previous attempts is allowed", () => {
		expect(nextQuizAttempt(DEFAULT_COMPLETION_POLICY, [], 0)).toEqual({
			allowed: true,
		});
	});
	test("an attempt exactly an hour ago no longer counts", () => {
		expect(
			nextQuizAttempt(DEFAULT_COMPLETION_POLICY, [0, HOUR / 2, HOUR / 2], HOUR),
		).toEqual({ allowed: true });
	});
});
