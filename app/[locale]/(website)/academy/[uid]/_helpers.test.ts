import { type Course, DEFAULT_COMPLETION_POLICY } from "../_helpers";
import type { CompletionPolicy } from "../_schema";
import {
	courseProgressPercent,
	firstLesson,
	isCourseOpenForEnrolment,
	lessonPath,
	lessonState,
	moduleProgress,
	moduleStates,
	nextLesson,
	policyRules,
	splitTitle,
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
			lesson(`m${n}r`, "reading"),
			lesson(`m${n}q`, "quiz"),
			lesson(`m${n}t`, "task"),
		],
	};
}

function courseOf(
	modules: Course["modules"],
	missingRequiredLessons = 0,
): Course {
	return {
		id: "c1",
		uid: "ai-for-your-next-opportunity",
		title: "AI for Your Next Opportunity",
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
		missingRequiredLessons,
		modules,
	};
}

const course = courseOf([moduleOf(1), moduleOf(2)]);
const done = (...ids: string[]) => new Set(ids);
const strict: CompletionPolicy = {
	...DEFAULT_COMPLETION_POLICY,
	sequentialUnlock: true,
	tasksRequired: true,
	videoMustFinish: true,
	readingAck: true,
	passMarkPercent: 100,
	attemptLimit: { kind: "cooldown", minutes: 10 },
};

describe("isCourseOpenForEnrolment", () => {
	test("is open with lessons and nothing missing", () => {
		expect(isCourseOpenForEnrolment(course)).toBe(true);
	});
	test("is closed while a required lesson failed to load", () => {
		expect(isCourseOpenForEnrolment(courseOf(course.modules, 1))).toBe(false);
	});
	test("is closed with no lessons", () => {
		expect(isCourseOpenForEnrolment(courseOf([]))).toBe(false);
		expect(
			isCourseOpenForEnrolment(
				courseOf([{ key: "M1", title: "", summary: null, lessons: [] }]),
			),
		).toBe(false);
	});
});

describe("firstLesson and lessonPath", () => {
	test("first lesson is the first lesson of the first non-empty module", () => {
		expect(firstLesson(course)?.id).toBe("m1v");
		expect(
			firstLesson(
				courseOf([
					{ key: "M0", title: "", summary: null, lessons: [] },
					moduleOf(2),
				]),
			)?.id,
		).toBe("m2v");
		expect(firstLesson(courseOf([]))).toBeNull();
	});
	test("builds the lesson URL from course uid and lesson key", () => {
		expect(lessonPath("ai", "M1-V")).toBe("/academy/ai/M1-V");
	});
});

describe("nextLesson", () => {
	test("is the first lesson for a fresh enrolment", () => {
		expect(nextLesson(course, DEFAULT_COMPLETION_POLICY, done())?.id).toBe(
			"m1v",
		);
	});
	test("skips completed lessons", () => {
		expect(
			nextLesson(course, DEFAULT_COMPLETION_POLICY, done("m1v", "m1r"))?.id,
		).toBe("m1q");
	});
	test("ignores tasks unless the policy requires them", () => {
		const all = done("m1v", "m1r", "m1q");
		expect(nextLesson(course, DEFAULT_COMPLETION_POLICY, all)?.id).toBe("m2v");
		expect(nextLesson(course, strict, all)?.id).toBe("m1t");
	});
	test("ignores optional lessons", () => {
		const optional = courseOf([
			{
				key: "M1",
				title: "",
				summary: null,
				lessons: [lesson("a", "video"), lesson("b", "reading", false)],
			},
		]);
		expect(
			nextLesson(optional, DEFAULT_COMPLETION_POLICY, done("a")),
		).toBeNull();
	});
	test("is null when everything required is done", () => {
		const all = done("m1v", "m1r", "m1q", "m2v", "m2r", "m2q");
		expect(nextLesson(course, DEFAULT_COMPLETION_POLICY, all)).toBeNull();
	});
});

describe("progress", () => {
	test("module progress counts completed lessons out of all lessons", () => {
		expect(
			moduleProgress(course.modules[0], done("m1v", "m2v", "m1t")),
		).toEqual({
			completed: 2,
			total: 4,
		});
	});
	test("course percent counts only lessons that count for completion", () => {
		expect(
			courseProgressPercent(course, DEFAULT_COMPLETION_POLICY, done()),
		).toBe(0);
		expect(
			courseProgressPercent(
				course,
				DEFAULT_COMPLETION_POLICY,
				done("m1v", "m1r", "m1q"),
			),
		).toBe(50);
		expect(
			courseProgressPercent(course, strict, done("m1v", "m1r", "m1q")),
		).toBe(37);
		expect(courseProgressPercent(courseOf([]), strict, done())).toBe(0);
	});
});

describe("moduleStates and lessonState", () => {
	test("without sequential unlock nothing is locked and the next module is current", () => {
		const states = moduleStates(
			course,
			DEFAULT_COMPLETION_POLICY,
			done("m1v", "m1r", "m1q", "m1t"),
		);
		expect(states.get("M1")).toBe("complete");
		expect(states.get("M2")).toBe("current");
	});
	test("with sequential unlock a later module stays locked until the earlier one is done", () => {
		const fresh = moduleStates(course, strict, done());
		expect(fresh.get("M1")).toBe("current");
		expect(fresh.get("M2")).toBe("locked");
		const after = moduleStates(
			course,
			strict,
			done("m1v", "m1r", "m1q", "m1t"),
		);
		expect(after.get("M1")).toBe("complete");
		expect(after.get("M2")).toBe("current");
	});
	test("lesson state follows module state, completion and next", () => {
		expect(lessonState(lesson("x", "video"), "locked", done("x"), "x")).toBe(
			"locked",
		);
		expect(
			lessonState(lesson("x", "video"), "open", done("x"), undefined),
		).toBe("done");
		expect(lessonState(lesson("x", "video"), "current", done(), "x")).toBe(
			"next",
		);
		expect(lessonState(lesson("y", "video"), "current", done(), "x")).toBe(
			"todo",
		);
	});
});

describe("policyRules", () => {
	test("default policy: quiz attempts per hour and tap continue", () => {
		expect(
			policyRules(DEFAULT_COMPLETION_POLICY, course).map((rule) => rule.id),
		).toEqual(["quizPerHour", "tapContinue"]);
		expect(
			policyRules(DEFAULT_COMPLETION_POLICY, course)[0].values,
		).toMatchObject({
			percent: 70,
			max: 3,
		});
	});
	test("strict policy lists every rule with the task count", () => {
		const rules = policyRules(strict, course);
		expect(rules.map((rule) => rule.id)).toEqual([
			"quizAllCooldown",
			"watchToEnd",
			"markRead",
			"tasks",
			"inOrder",
		]);
		expect(rules[0].values.minutes).toBe(10);
		expect(rules[3].values.count).toBe(2);
	});
	test("hides the tasks rule when the course has no required tasks", () => {
		const noTasks = courseOf([
			{ key: "M1", title: "", summary: null, lessons: [lesson("a", "video")] },
		]);
		expect(policyRules(strict, noTasks).map((rule) => rule.id)).not.toContain(
			"tasks",
		);
	});
});

describe("splitTitle", () => {
	test("accents the last word", () => {
		expect(splitTitle("AI for Your Next Opportunity")).toEqual({
			lead: "AI for Your Next",
			accent: "Opportunity",
		});
		expect(splitTitle("Opportunity")).toEqual({
			lead: "",
			accent: "Opportunity",
		});
	});
});
