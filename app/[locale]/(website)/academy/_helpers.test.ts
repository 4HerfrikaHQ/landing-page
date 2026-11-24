import {
	DEFAULT_COMPLETION_POLICY,
	canCompleteVideo,
	clampVideoSeek,
	gradeQuiz,
	isCourseComplete,
	isModuleUnlocked,
	isQuizPassed,
	lessonIdsInCourse,
	missingForCompletion,
	moduleAssetKeys,
	nextQuizAttempt,
	toCompletionPolicy,
	toCourse,
	toLearnerQuiz,
	toQuizAnswerKey,
	videoObjectPath,
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

const quizDocument = {
	id: "quiz-1",
	type: "quiz",
	data: {
		lesson_key: "M1-Q",
		title: "Module 1 quiz",
		questions: [
			{
				question_key: "M1-01",
				prompt: "Sample question one",
				option_a: "Alpha",
				option_b: "Bravo",
				option_c: "Charlie",
				option_d: "Delta",
				correct: "C",
				why: "Sample reason",
				topic: "Prompts",
			},
			{
				question_key: "M1-02",
				prompt: "Sample question two",
				option_a: "One",
				option_b: "Two",
				option_c: "Three",
				option_d: "Four",
				correct: "A",
				why: null,
				topic: "Checking answers",
			},
		],
	},
};

function sequence(values: number[]) {
	let index = 0;
	return () => values[index++ % values.length];
}

describe("quiz content", () => {
	test("the learner quiz never carries the answer, the why or the topic", () => {
		const serialized = JSON.stringify(toLearnerQuiz(quizDocument, Math.random));
		expect(serialized).not.toContain("correct");
		expect(serialized).not.toContain("Sample reason");
		expect(serialized).not.toContain("Prompts");
	});
	test("options keep their stable index while their order is shuffled", () => {
		const quiz = toLearnerQuiz(quizDocument, sequence([0.1, 0.9, 0.5]));
		for (const question of quiz.questions) {
			expect(question.options.map((option) => option.index).sort()).toEqual([
				0, 1, 2, 3,
			]);
		}
		const first = quiz.questions.find((question) => question.key === "M1-01");
		expect(
			first?.options.find((option) => option.text === "Charlie")?.index,
		).toBe(2);
	});
	test("grading uses the stable index, whatever order the learner saw", () => {
		const key = toQuizAnswerKey(quizDocument);
		expect(gradeQuiz(key, { "M1-01": 2, "M1-02": 0 })).toEqual({
			correctCount: 2,
			questionCount: 2,
			missedTopics: [],
		});
		expect(gradeQuiz(key, { "M1-01": 1 })).toEqual({
			correctCount: 0,
			questionCount: 2,
			missedTopics: ["Prompts", "Checking answers"],
		});
	});
	test("duplicate or malformed question keys are rejected", () => {
		const duplicate = structuredClone(quizDocument);
		duplicate.data.questions[1].question_key = "M1-01";
		expect(() => toQuizAnswerKey(duplicate)).toThrow();
		const malformed = structuredClone(quizDocument);
		malformed.data.questions[0].question_key = "q1";
		expect(() => toQuizAnswerKey(malformed)).toThrow();
	});
});

describe("course content", () => {
	const courseDocument = {
		id: "course-1",
		uid: "ai-for-your-next-opportunity",
		data: {
			title: "AI for Your Next Opportunity",
			summary: "  Sample summary  ",
			cover: { url: "https://images.example/cover.jpg" },
			track: "tech",
			level: null,
			hours_label: "About 4–5 hours",
			outcomes: [{ outcome: "Write a clear prompt" }, { outcome: "" }],
			partners: [
				{
					partner: {
						data: {
							name: "Ordina",
							logo: { url: "https://images.example/ordina.png" },
							attribution: "Course content by Ordina",
						},
					},
				},
				{ partner: { link_type: "Document" } },
			],
			pass_mark_percent: 100,
			attempt_rule: "cooldown",
			attempt_value: null,
			video_must_finish: true,
			tasks_required: true,
			sequential_unlock: true,
			notice: [
				{ type: "paragraph", text: " Course content by Ordina. " },
				{ type: "paragraph", text: "" },
				{ type: "paragraph", text: "Please do not share it." },
			],
			certificate_issuer: null,
			certificate_attribution: "Course content by Ordina",
			certificate_signatories: [
				{ name: "Ademide", title: "Founder, 4HerFrika" },
				{ name: "Hack Angel", title: null },
				{ name: "", title: "Draft row" },
			],
			slices: [
				{
					slice_type: "course_module",
					primary: {
						module_key: "M1",
						title: "Foundations",
						summary: null,
						lessons: [
							{ lesson: { link_type: "Document", id: "v1" }, required: null },
							{
								lesson: { link_type: "Document", id: "missing" },
								required: true,
							},
							{
								lesson: { link_type: "Document", id: "t1", isBroken: true },
								required: false,
							},
							{ lesson: { link_type: "Document", id: "t1" }, required: false },
						],
					},
				},
				{ slice_type: "something_else", primary: {} },
			],
		},
	};
	const lessons = [
		{
			id: "v1",
			type: "video_lesson",
			data: {
				lesson_key: "M1-V",
				title: "Meet your study partner",
				duration_seconds: 343,
			},
		},
		{
			id: "t1",
			type: "task",
			data: { lesson_key: "M1-T", title: "Study plan" },
		},
	];

	test("lesson ids skip broken links and other slice types", () => {
		expect(lessonIdsInCourse(courseDocument)).toEqual(["v1", "missing", "t1"]);
	});
	test("builds modules from linked lessons, dropping ones that didn't load", () => {
		const course = toCourse(courseDocument, lessons);
		expect(course.modules).toHaveLength(1);
		expect(
			course.modules[0].lessons.map((lesson) => [
				lesson.id,
				lesson.kind,
				lesson.required,
			]),
		).toEqual([
			["v1", "video", true],
			["t1", "task", false],
			["t1", "task", false],
		]);
		expect(course.modules[0].lessons[0].durationSeconds).toBe(343);
	});
	test("trims text, drops empty outcomes, unloaded partners and nameless signatories, applies defaults", () => {
		const course = toCourse(courseDocument, lessons);
		expect(course.summary).toBe("Sample summary");
		expect(course.outcomes).toEqual(["Write a clear prompt"]);
		expect(course.partners).toEqual([
			{
				name: "Ordina",
				logoUrl: "https://images.example/ordina.png",
				attribution: "Course content by Ordina",
			},
		]);
		expect(course.level).toBe("beginner");
		expect(course.certificate).toEqual({
			issuer: "4HerFrika",
			attribution: "Course content by Ordina",
			signatories: [
				{ name: "Ademide", title: "Founder, 4HerFrika" },
				{ name: "Hack Angel", title: "" },
			],
		});
	});
	test("returns the licence notice as trimmed paragraphs", () => {
		expect(toCourse(courseDocument, lessons).notice).toEqual([
			"Course content by Ordina.",
			"Please do not share it.",
		]);
	});
	test("counts required lessons that failed to load, ignoring optional and empty links", () => {
		expect(toCourse(courseDocument, lessons).missingRequiredLessons).toBe(1);
		const withEmptyLink = structuredClone(courseDocument);
		withEmptyLink.data.slices[0].primary.lessons.push({
			lesson: { link_type: "Any" },
			required: true,
		});
		expect(toCourse(withEmptyLink, lessons).missingRequiredLessons).toBe(1);
		expect(
			toCourse(courseDocument, [
				...lessons,
				{
					id: "missing",
					type: "reading",
					data: { lesson_key: "M1-R", title: "Reading", minutes: 5 },
				},
			]).missingRequiredLessons,
		).toBe(0);
	});
	test("reads the strict policy, filling unset fields from the default", () => {
		expect(toCourse(courseDocument, lessons).policy).toEqual({
			...DEFAULT_COMPLETION_POLICY,
			passMarkPercent: 100,
			attemptLimit: { kind: "cooldown", minutes: 10 },
			videoMustFinish: true,
			tasksRequired: true,
			sequentialUnlock: true,
		});
	});
	test("an empty policy tab is the default policy", () => {
		expect(toCompletionPolicy({})).toEqual(DEFAULT_COMPLETION_POLICY);
	});
	test("out-of-range numbers fall back to the default instead of opening the gate", () => {
		expect(
			toCompletionPolicy({
				pass_mark_percent: 0,
				attempt_rule: "per_hour",
				attempt_value: 2.5,
				min_age: 5,
			}),
		).toEqual(DEFAULT_COMPLETION_POLICY);
	});
});

describe("video storage paths", () => {
	test("builds quality paths under the asset key folder", () => {
		expect(videoObjectPath("ai-for-your-next-opportunity/m1", 480)).toBe(
			"ai-for-your-next-opportunity/m1/480.mp4",
		);
		expect(videoObjectPath("ai-for-your-next-opportunity/m1", 720)).toBe(
			"ai-for-your-next-opportunity/m1/720.mp4",
		);
	});

	test("derives asset and captions keys from course uid and module number", () => {
		expect(moduleAssetKeys("ai-for-your-next-opportunity", 3)).toEqual({
			assetKey: "ai-for-your-next-opportunity/m3",
			captionsKey: "ai-for-your-next-opportunity/m3.vtt",
		});
	});
});
