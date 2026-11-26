import { describe, expect, test } from "bun:test";
import {
	toCourse,
	toLearnerQuiz,
	toQuizAnswerKey,
} from "@/app/[locale]/(website)/academy/_helpers";
import { courseDocument, lessonDocuments, partnerDocuments } from "./_build";
import { CourseManifest } from "./_schema";

const blocks = [{ type: "paragraph", text: "Sample text." }];

const manifest = CourseManifest.parse({
	partners: [
		{
			uid: "sample-partner",
			name: "Sample Partner",
			website: "https://partner.example",
			attribution: "Course content by Sample Partner",
		},
	],
	course: {
		uid: "sample-course",
		title: "Sample course",
		summary: "A sample course.",
		track: "tech",
		level: "beginner",
		hoursLabel: "About 1 hour",
		outcomes: ["Do one thing"],
		policy: {
			passMarkPercent: 100,
			attemptRule: "cooldown",
			attemptValue: 10,
			failFeedback: "score_and_topics",
			revealAnswersOnPass: true,
			videoMustFinish: true,
			readingAck: true,
			sequentialUnlock: true,
			tasksRequired: true,
			minAge: 16,
		},
		certificate: {
			issuer: "4HerFrika",
			attribution: "Course content by Sample Partner",
			signatories: [
				{ name: "First Signer", title: "Founder" },
				{ name: "Second Signer" },
			],
		},
	},
	modules: [
		{
			key: "M1",
			title: "Module one",
			lessons: [
				{
					kind: "video",
					key: "M1-V",
					title: "Video",
					videoAssetKey: "m1.mp4",
					durationSeconds: 343,
				},
				{
					kind: "reading",
					key: "M1-R",
					title: "Reading",
					minutes: 8,
					body: blocks,
				},
				{
					kind: "quiz",
					key: "M1-Q",
					title: "Quiz",
					questions: [
						{
							key: "M1-01",
							prompt: "Pick B",
							options: ["a", "b", "c", "d"],
							correct: "B",
							why: "Because B.",
							topic: "Basics",
						},
					],
				},
				{
					kind: "task",
					key: "M1-T",
					title: "Task",
					required: false,
					instructions: blocks,
				},
			],
		},
	],
});

const asLink = (type: string, identity: string) => ({
	link_type: "Document",
	id: identity,
	type,
	isBroken: false,
});

const asPrismic = (document: {
	type: string;
	identity: string;
	uid?: string;
	data: unknown;
}) => ({
	id: document.identity,
	uid: document.uid ?? null,
	type: document.type,
	data: document.data,
});

describe("course import", () => {
	const lessons = lessonDocuments(manifest);
	const partners = partnerDocuments(manifest).map((partner) => ({
		...asPrismic(partner),
		data: { ...partner.data, logo: {} },
	}));
	const course = courseDocument(manifest, asLink);

	test("builds one draft per partner, lesson and course", () => {
		expect(lessons.map((l) => [l.type, l.identity])).toEqual([
			["video_lesson", "M1-V"],
			["reading", "M1-R"],
			["quiz", "M1-Q"],
			["task", "M1-T"],
		]);
		expect(partners).toHaveLength(1);
		expect(course.uid).toBe("sample-course");
	});

	test("the app reads the imported course back as it was written", () => {
		const coursePrismic = {
			...asPrismic(course),
			data: {
				...(course.data as object),
				partners: [{ partner: partners[0] }],
			},
		};
		const read = toCourse(coursePrismic, lessons.map(asPrismic));
		expect(
			read.modules[0].lessons.map((l) => [l.key, l.kind, l.required]),
		).toEqual([
			["M1-V", "video", true],
			["M1-R", "reading", true],
			["M1-Q", "quiz", true],
			["M1-T", "task", false],
		]);
		expect(read.policy.attemptLimit).toEqual({ kind: "cooldown", minutes: 10 });
		expect(read.certificate.signatories).toEqual([
			{ name: "First Signer", title: "Founder" },
			{ name: "Second Signer", title: "" },
		]);
		expect(read.partners[0].name).toBe("Sample Partner");
	});

	test("the quiz keeps its answer on the server side only", () => {
		const quiz = asPrismic(lessons[2]);
		expect(toQuizAnswerKey(quiz).questions[0].correctIndex).toBe(1);
		expect(JSON.stringify(toLearnerQuiz(quiz, () => 0))).not.toContain(
			"Because B.",
		);
	});

	test("rejects a manifest that repeats a lesson key", () => {
		const repeated = structuredClone(manifest);
		repeated.modules[0].lessons[1].key = "M1-V";
		expect(CourseManifest.safeParse(repeated).success).toBe(false);
	});
});
