import type { RichTextField } from "@prismicio/client";
import { z } from "zod";
import { QuizSubmission } from "../../_schema";

const MAX_KEY_LENGTH = 200;
const MAX_QUIZ_QUESTIONS = 200;
export const MAX_TASK_TEXT_LENGTH = 5000;
export const MAX_TRACK_KEY_LENGTH = 40;

const LessonRef = z.object({
	uid: z.string().min(1).max(MAX_KEY_LENGTH),
	lessonKey: z.string().min(1).max(MAX_KEY_LENGTH),
});

export const ReportProgressSchema = LessonRef.extend({
	positionSeconds: z.number().min(0).max(86_400),
});

export const CompleteLessonSchema = LessonRef;

export const RefreshVideoSchema = LessonRef;

export const SubmitQuizSchema = LessonRef.extend({
	expectedAttempt: z.number().int().min(1),
	answers: QuizSubmission.refine(
		(answers) => Object.keys(answers).length <= MAX_QUIZ_QUESTIONS,
	),
});

export const SubmitTaskSchema = LessonRef.extend({
	track: z.string().trim().min(1).max(MAX_TRACK_KEY_LENGTH).optional(),
	body: z.string().trim().min(1).max(MAX_TASK_TEXT_LENGTH),
});

const richText = z.custom<RichTextField>((value) => Array.isArray(value));

const nullableText = z
	.string()
	.nullish()
	.transform((value) => value?.trim() || null);

const emptyRichText = richText
	.nullish()
	.transform((value) => (value && value.length > 0 ? value : null));

export const VideoLessonDocument = z.object({
	type: z.literal("video_lesson"),
	data: z.object({
		video_asset_key: nullableText,
		captions_key: nullableText,
		poster: z
			.object({ url: z.string().nullish() })
			.nullish()
			.transform((image) => image?.url ?? null),
		transcript: emptyRichText,
	}),
});

export const ReadingDocument = z.object({
	type: z.literal("reading"),
	data: z.object({
		minutes: z.number().nullish(),
		body: emptyRichText,
	}),
});

export const TaskDocument = z.object({
	type: z.literal("task"),
	data: z.object({
		instructions: emptyRichText,
		tracks: z
			.array(
				z.object({
					track_key: nullableText,
					title: nullableText,
					instructions: emptyRichText,
				}),
			)
			.nullish(),
	}),
});

export const QuizLessonDocument = z.object({ type: z.literal("quiz") });

export const LessonDocument = z.discriminatedUnion("type", [
	VideoLessonDocument,
	ReadingDocument,
	TaskDocument,
	QuizLessonDocument,
]);
