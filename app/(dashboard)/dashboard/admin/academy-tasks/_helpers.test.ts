import { describe, expect, test } from "bun:test";
import {
	attemptLabel,
	countryName,
	describeTask,
	indexTaskTitles,
	linkSegments,
	reviewTransition,
	withAttemptNumbers,
} from "./_helpers";
import { ReviewTaskSchema } from "./_schema";

describe("reviewTransition", () => {
	test("applies a decision only to a submitted task", () => {
		expect(reviewTransition("submitted", "complete")).toEqual({
			kind: "apply",
			status: "complete",
		});
		expect(reviewTransition("submitted", "needs_work")).toEqual({
			kind: "apply",
			status: "needs_work",
		});
	});

	test("refuses a second review", () => {
		for (const current of ["needs_work", "complete"] as const) {
			for (const decision of ["complete", "needs_work"] as const) {
				expect(reviewTransition(current, decision)).toEqual({
					kind: "already_reviewed",
				});
			}
		}
	});
});

describe("ReviewTaskSchema", () => {
	const submissionId = "0fee3312-502b-482e-b1d1-3909f8a459a2";

	test("needs work requires a note", () => {
		expect(
			ReviewTaskSchema.safeParse({
				submissionId,
				decision: "needs_work",
				note: "   ",
			}).success,
		).toBe(false);
	});

	test("complete accepts an empty note", () => {
		expect(
			ReviewTaskSchema.safeParse({
				submissionId,
				decision: "complete",
				note: "",
			}).success,
		).toBe(true);
	});

	test("caps the note length", () => {
		expect(
			ReviewTaskSchema.safeParse({
				submissionId,
				decision: "needs_work",
				note: "a".repeat(1501),
			}).success,
		).toBe(false);
	});
});

describe("linkSegments", () => {
	test("keeps plain text as one segment", () => {
		expect(linkSegments("no links here")).toEqual([
			{ kind: "text", offset: 0, value: "no links here" },
		]);
	});

	test("links http and https urls and drops trailing punctuation", () => {
		expect(
			linkSegments("See https://example.com/a?b=1, then http://x.dev."),
		).toEqual([
			{ kind: "text", offset: 0, value: "See " },
			{
				kind: "link",
				offset: 4,
				value: "https://example.com/a?b=1",
				href: "https://example.com/a?b=1",
			},
			{ kind: "text", offset: 29, value: ", then " },
			{
				kind: "link",
				offset: 36,
				value: "http://x.dev",
				href: "http://x.dev/",
			},
			{ kind: "text", offset: 48, value: "." },
		]);
	});

	test("never links other schemes", () => {
		const segments = linkSegments("javascript:alert(1) data:text/html,x");
		expect(segments.every((segment) => segment.kind === "text")).toBe(true);
	});

	test("preserves line breaks inside text", () => {
		const segments = linkSegments("one\ntwo https://a.co\nthree");
		expect(segments.map((segment) => segment.value).join("")).toBe(
			"one\ntwo https://a.co\nthree",
		);
	});
});

describe("task titles", () => {
	const titles = indexTaskTitles([
		{
			id: "c1",
			title: "AI for your next opportunity",
			modules: [{ lessons: [{ id: "l1", title: "Pitch task" }] }],
		},
	]);

	test("resolves course and lesson titles", () => {
		expect(describeTask(titles, "c1", "l1")).toEqual({
			courseTitle: "AI for your next opportunity",
			lessonTitle: "Pitch task",
		});
	});

	test("falls back when the course is unpublished", () => {
		expect(describeTask(titles, "gone", "l1")).toEqual({
			courseTitle: "Unpublished course",
			lessonTitle: "Unknown task",
		});
	});
});

describe("labels", () => {
	test("attempt", () => {
		expect(attemptLabel(1)).toBe("First attempt");
		expect(attemptLabel(3)).toBe("Attempt 3");
	});

	test("country falls back to the code", () => {
		expect(countryName("NG")).toBe("Nigeria");
		expect(countryName("??")).toBe("??");
	});
});

describe("withAttemptNumbers", () => {
	const at = (day: number) => new Date(Date.UTC(2026, 10, day));

	test("numbers attempts per enrolment and lesson in submission order", () => {
		const numbered = withAttemptNumbers([
			{ id: "c", enrolmentId: "e1", lessonId: "l1", submittedAt: at(5) },
			{ id: "a", enrolmentId: "e1", lessonId: "l1", submittedAt: at(1) },
			{ id: "x", enrolmentId: "e1", lessonId: "l2", submittedAt: at(2) },
			{ id: "y", enrolmentId: "e2", lessonId: "l1", submittedAt: at(3) },
		]);
		expect(
			Object.fromEntries(numbered.map((item) => [item.id, item.attempt])),
		).toEqual({ a: 1, c: 2, x: 1, y: 1 });
	});
});
