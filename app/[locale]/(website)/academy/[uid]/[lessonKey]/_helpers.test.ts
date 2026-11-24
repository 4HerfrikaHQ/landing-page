import { describe, expect, test } from "bun:test";
import { type Course, DEFAULT_COMPLETION_POLICY } from "../../_helpers";
import type { CompletionPolicy } from "../../_schema";
import {
	PROGRESS_ALLOWANCE_SECONDS,
	advanceLimit,
	applyProgress,
	checkAttemptNumber,
	completionTransition,
	lessonNavigation,
	nextAttemptNumber,
	videoStartSeconds,
} from "./_helpers";

type Lesson = Course["modules"][number]["lessons"][number];

function lesson(id: string, kind: Lesson["kind"], required = true): Lesson {
	return {
		id,
		kind,
		key: id.toUpperCase(),
		title: id,
		required,
		durationSeconds: null,
		minutes: null,
	};
}

function moduleOf(n: number) {
	return {
		key: `M${n}`,
		title: `Module ${n}`,
		summary: null,
		lessons: [
			lesson(`m${n}v`, "video"),
			lesson(`m${n}q`, "quiz"),
			lesson(`m${n}t`, "task"),
		],
	};
}

const course: Course = {
	id: "c1",
	uid: "course",
	title: "Course",
	summary: null,
	coverUrl: null,
	track: "tech",
	level: "beginner",
	hoursLabel: null,
	outcomes: [],
	partners: [],
	policy: DEFAULT_COMPLETION_POLICY,
	certificate: { issuer: "4HerFrika", attribution: null, signatories: [] },
	notice: [],
	missingRequiredLessons: 0,
	modules: [moduleOf(1), moduleOf(2)],
};

const sequential: CompletionPolicy = {
	...DEFAULT_COMPLETION_POLICY,
	sequentialUnlock: true,
};
const done = (...ids: string[]) => new Set(ids);

const start = { furthestSeconds: 0, lastSeconds: 0, updatedAtMs: 1_000_000 };
const at = (seconds: number) => 1_000_000 + seconds * 1000;
const report = (positionSeconds: number, nowSeconds: number) => ({
	positionSeconds,
	nowMs: at(nowSeconds),
	durationSeconds: 343,
	enforce: true,
});

describe("advanceLimit", () => {
	test("adds elapsed time plus an allowance capped by elapsed time", () => {
		expect(advanceLimit({ ...start, furthestSeconds: 20 }, at(10))).toBe(40);
		expect(advanceLimit({ ...start, furthestSeconds: 20 }, at(1000))).toBe(
			20 + 1000 + PROGRESS_ALLOWANCE_SECONDS,
		);
	});

	test("gives a first report only the allowance", () => {
		expect(
			advanceLimit(
				{ furthestSeconds: 0, lastSeconds: 0, updatedAtMs: null },
				at(0),
			),
		).toBe(PROGRESS_ALLOWANCE_SECONDS);
	});

	test("treats a clock that went backwards as no elapsed time", () => {
		expect(advanceLimit({ ...start, furthestSeconds: 5 }, at(-50))).toBe(5);
	});
});

describe("applyProgress", () => {
	test("accepts honest playback", () => {
		expect(applyProgress(start, report(10, 10))).toEqual({
			furthestSeconds: 10,
			lastSeconds: 10,
		});
	});

	test("limits a forged jump to the time elapsed", () => {
		const result = applyProgress(start, report(100_000, 10));
		expect(result.furthestSeconds).toBe(20);
		expect(result.lastSeconds).toBe(20);
	});

	test("cannot be beaten by many rapid reports", () => {
		let stored = { ...start };
		let nowSeconds = 0;
		for (let call = 0; call < 20; call++) {
			nowSeconds += 1;
			const update = applyProgress(stored, report(100_000, nowSeconds));
			stored = {
				furthestSeconds: update.furthestSeconds,
				lastSeconds: update.lastSeconds,
				updatedAtMs: at(nowSeconds),
			};
		}
		expect(stored.furthestSeconds).toBeLessThanOrEqual(40);
	});

	test("never regresses furthest when the learner seeks back", () => {
		const stored = {
			furthestSeconds: 120,
			lastSeconds: 120,
			updatedAtMs: at(0),
		};
		expect(applyProgress(stored, report(30, 10))).toEqual({
			furthestSeconds: 120,
			lastSeconds: 30,
		});
	});

	test("ignores NaN, Infinity and negative positions", () => {
		const stored = { furthestSeconds: 50, lastSeconds: 40, updatedAtMs: at(0) };
		for (const value of [Number.NaN, Number.POSITIVE_INFINITY]) {
			expect(applyProgress(stored, report(value, 10))).toEqual({
				furthestSeconds: 50,
				lastSeconds: 40,
			});
		}
		expect(applyProgress(stored, report(-5, 10)).lastSeconds).toBe(0);
	});

	test("caps at the duration", () => {
		const stored = {
			furthestSeconds: 340,
			lastSeconds: 340,
			updatedAtMs: at(0),
		};
		expect(applyProgress(stored, report(9999, 100)).furthestSeconds).toBe(343);
	});

	test("does not clamp by time when the policy does not enforce it", () => {
		const result = applyProgress(start, {
			...report(200, 1),
			enforce: false,
		});
		expect(result.furthestSeconds).toBe(200);
	});
});

describe("attempt numbering", () => {
	test("starts at one and follows the highest attempt", () => {
		expect(nextAttemptNumber([])).toBe(1);
		expect(nextAttemptNumber([1, 3, 2])).toBe(4);
	});

	test("accepts the expected number and rejects a replay", () => {
		expect(checkAttemptNumber([1, 2], 3)).toEqual({
			kind: "ok",
			attemptNumber: 3,
		});
		expect(checkAttemptNumber([1, 2, 3], 3)).toEqual({
			kind: "stale",
			currentNumber: 3,
		});
	});
});

describe("lessonNavigation", () => {
	test("reports the position and neighbours", () => {
		const nav = lessonNavigation(course, sequential, "M1Q", done());
		expect(nav?.position).toMatchObject({
			moduleNumber: 1,
			lessonNumber: 2,
			lessonCount: 3,
		});
		expect(nav?.previous?.id).toBe("m1v");
		expect(nav?.next?.id).toBe("m1t");
		expect(nav?.nextEnabled).toBe(true);
	});

	test("returns null for an unknown lesson", () => {
		expect(lessonNavigation(course, sequential, "NOPE", done())).toBeNull();
	});

	test("blocks the next module until required lessons are complete", () => {
		const nav = lessonNavigation(course, sequential, "M1T", done("m1v"));
		expect(nav?.next?.id).toBe("m2v");
		expect(nav?.nextEnabled).toBe(false);
		const open = lessonNavigation(
			course,
			sequential,
			"M1T",
			done("m1v", "m1q"),
		);
		expect(open?.nextEnabled).toBe(true);
	});

	test("never blocks on a task", () => {
		const nav = lessonNavigation(course, sequential, "M1T", done("m1v", "m1q"));
		expect(nav?.nextEnabled).toBe(true);
	});

	test("is always enabled without sequential unlock", () => {
		const nav = lessonNavigation(
			course,
			DEFAULT_COMPLETION_POLICY,
			"M1T",
			done(),
		);
		expect(nav?.nextEnabled).toBe(true);
	});

	test("has no neighbours past the ends", () => {
		const first = lessonNavigation(course, sequential, "M1V", done());
		const last = lessonNavigation(course, sequential, "M2T", done());
		expect(first?.previous).toBeNull();
		expect(last?.next).toBeNull();
		expect(last?.nextEnabled).toBe(false);
	});
});

describe("completionTransition", () => {
	const allButLast = done("m1v", "m1q", "m2v");

	test("blocks when not allowed", () => {
		expect(
			completionTransition(sequential, course, "m2q", allButLast, false, false),
		).toEqual({ kind: "blocked" });
	});

	test("is a no-op when already complete", () => {
		expect(
			completionTransition(sequential, course, "m1v", allButLast, true, false),
		).toEqual({ kind: "already_complete" });
	});

	test("finishes the course on the last required lesson", () => {
		expect(
			completionTransition(sequential, course, "m2q", allButLast, true, false),
		).toEqual({ kind: "complete", finishesCourse: true });
	});

	test("does not finish the course while lessons remain", () => {
		expect(
			completionTransition(sequential, course, "m1q", done("m1v"), true, false),
		).toEqual({ kind: "complete", finishesCourse: false });
	});

	test("does not finish twice", () => {
		expect(
			completionTransition(sequential, course, "m2q", allButLast, true, true),
		).toEqual({ kind: "complete", finishesCourse: false });
	});

	test("waits for tasks when the policy requires them", () => {
		const strict = { ...sequential, tasksRequired: true };
		expect(
			completionTransition(strict, course, "m2q", allButLast, true, false),
		).toEqual({ kind: "complete", finishesCourse: false });
	});
});

describe("videoStartSeconds", () => {
	test("resumes at the last position", () => {
		expect(
			videoStartSeconds(
				DEFAULT_COMPLETION_POLICY,
				{ furthestSeconds: 90, lastSeconds: 60 },
				false,
			),
		).toBe(60);
	});

	test("never starts past the furthest point under videoMustFinish", () => {
		const policy = { ...DEFAULT_COMPLETION_POLICY, videoMustFinish: true };
		expect(
			videoStartSeconds(
				policy,
				{ furthestSeconds: 30, lastSeconds: 60 },
				false,
			),
		).toBe(30);
	});

	test("starts over once completed", () => {
		expect(
			videoStartSeconds(
				DEFAULT_COMPLETION_POLICY,
				{ furthestSeconds: 343, lastSeconds: 343 },
				true,
			),
		).toBe(0);
	});
});
