import { z } from "zod";

const text = z.string().trim().min(1);
const key = z.string().regex(/^[A-Za-z0-9-]+$/);

export const Block = z.object({
	type: z.enum([
		"paragraph",
		"heading2",
		"heading3",
		"list-item",
		"o-list-item",
	]),
	text,
});
export type Block = z.infer<typeof Block>;

const blocks = z.array(Block).min(1);

const lessonBase = { key, title: text, required: z.boolean().default(true) };

export const VideoLesson = z.object({
	kind: z.literal("video"),
	...lessonBase,
	videoAssetKey: text,
	durationSeconds: z.number().int().positive(),
	captionsKey: text.optional(),
	transcript: blocks.optional(),
});

export const ReadingLesson = z.object({
	kind: z.literal("reading"),
	...lessonBase,
	minutes: z.number().int().positive(),
	body: blocks,
});

export const QuizQuestion = z.object({
	key: z.string().regex(/^(M\d+|FINAL)-\d{2}$/),
	prompt: text,
	options: z.tuple([text, text, text, text]),
	correct: z.enum(["A", "B", "C", "D"]),
	why: text,
	topic: text.optional(),
});

export const QuizLesson = z.object({
	kind: z.literal("quiz"),
	...lessonBase,
	questions: z.array(QuizQuestion).min(1),
});

export const TaskLesson = z.object({
	kind: z.literal("task"),
	...lessonBase,
	instructions: blocks,
	tracks: z
		.array(z.object({ key, title: text, instructions: blocks }))
		.default([]),
});

export const Lesson = z.discriminatedUnion("kind", [
	VideoLesson,
	ReadingLesson,
	QuizLesson,
	TaskLesson,
]);
export type Lesson = z.infer<typeof Lesson>;

export const CourseManifest = z
	.object({
		partners: z
			.array(
				z.object({
					uid: key,
					name: text,
					website: z.url().optional(),
					attribution: text.optional(),
				}),
			)
			.default([]),
		course: z.object({
			uid: key,
			title: text,
			summary: text,
			track: z.enum(["tech", "business", "climate"]),
			level: z.enum(["beginner", "intermediate", "advanced"]),
			hoursLabel: text,
			outcomes: z.array(text).default([]),
			notice: blocks.optional(),
			policy: z.object({
				passMarkPercent: z.number().int().min(1).max(100),
				attemptRule: z.enum(["per_hour", "cooldown"]),
				attemptValue: z.number().int().positive(),
				failFeedback: z.enum(["score", "score_and_topics"]),
				revealAnswersOnPass: z.boolean(),
				videoMustFinish: z.boolean(),
				readingAck: z.boolean(),
				sequentialUnlock: z.boolean(),
				tasksRequired: z.boolean(),
				minAge: z.number().int().min(13),
			}),
			certificate: z.object({
				issuer: text,
				attribution: text.optional(),
				signatories: z
					.array(z.object({ name: text, title: text.optional() }))
					.default([]),
			}),
		}),
		modules: z
			.array(
				z.object({
					key,
					title: text,
					summary: text.optional(),
					lessons: z.array(Lesson).min(1),
				}),
			)
			.min(1),
	})
	.superRefine((manifest, ctx) => {
		const keys = manifest.modules.flatMap((module) =>
			module.lessons.map((lesson) => lesson.key),
		);
		const duplicate = keys.find((k, index) => keys.indexOf(k) !== index);
		if (duplicate) {
			ctx.addIssue({
				code: "custom",
				message: `Lesson key ${duplicate} is used more than once`,
			});
		}
	});
export type CourseManifest = z.infer<typeof CourseManifest>;
