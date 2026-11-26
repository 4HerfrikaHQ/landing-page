import businessSourceImage from "@/public/assets/academy/business-source.jpg";
import climateSourceImage from "@/public/assets/academy/climate-source.jpg";
import techSourceImage from "@/public/assets/academy/tech-source.jpg";
import { z } from "zod";

export const academyType = z.enum(["tech", "business", "climate"]);

export type Academy = z.infer<typeof academyType>;

export const catalogFilter = z.enum(["all", ...academyType.options]);

export type CatalogFilter = z.infer<typeof catalogFilter>;

export const AcademyWaitlistSchema = z.object({
	name: z.string().trim().min(2).max(120),
	email: z.string().trim().toLowerCase().email(),
	phone: z.string().trim().min(5).max(40),
	academy: academyType,
	location: z.string().trim().min(2).max(120),
});

export const academies = [
	{
		academy: "tech",
		name: "Tech Academy",
		description:
			"Master product design, web development, product management, and more. Join 1000+ women already shaping Africa's tech future.",
		image: techSourceImage,
	},
	{
		academy: "business",
		name: "Business Academy",
		description:
			"Turn your ideas into sustainable ventures with practical business skills, mentorship, and a community built to help you grow.",
		image: businessSourceImage,
	},
	{
		academy: "climate",
		name: "Climate Academy",
		description:
			"Shape Africa's environmental future. Build the skills to lead in green innovation, sustainability, and climate advocacy.",
		image: climateSourceImage,
	},
] as const;

export const academyTranslationKeys = {
	tech: { name: "techAcademy", description: "techDescription" },
	business: { name: "businessAcademy", description: "businessDescription" },
	climate: { name: "climateAcademy", description: "climateDescription" },
} as const;

export const CommunityTestimonial = z.object({
	name: z.string().trim().min(1),
	testimonial: z.string().trim().min(1),
	role_and_location: z
		.string()
		.nullish()
		.transform((value) => value ?? ""),
	profile_picture: z.object({ url: z.string().url() }),
});
export type CommunityTestimonial = z.infer<typeof CommunityTestimonial>;

export const QuizAttemptLimit = z.discriminatedUnion("kind", [
	z.object({ kind: z.literal("per_hour"), max: z.number().int().min(1) }),
	z.object({ kind: z.literal("cooldown"), minutes: z.number().int().min(1) }),
]);
export type QuizAttemptLimit = z.infer<typeof QuizAttemptLimit>;

export const FailFeedback = z.enum(["score", "score_and_topics"]);
export type FailFeedback = z.infer<typeof FailFeedback>;

export const CompletionPolicy = z.object({
	passMarkPercent: z.number().int().min(1).max(100),
	attemptLimit: QuizAttemptLimit,
	failFeedback: FailFeedback,
	revealAnswersOnPass: z.boolean(),
	videoMustFinish: z.boolean(),
	readingAck: z.boolean(),
	sequentialUnlock: z.boolean(),
	tasksRequired: z.boolean(),
	minAge: z.number().int().min(13),
});
export type CompletionPolicy = z.infer<typeof CompletionPolicy>;

export const LessonKind = z.enum(["video", "reading", "quiz", "task"]);
export type LessonKind = z.infer<typeof LessonKind>;

export const CourseLesson = z.object({
	id: z.string(),
	kind: LessonKind,
	required: z.boolean(),
});
export type CourseLesson = z.infer<typeof CourseLesson>;

export const CourseModule = z.object({
	key: z.string(),
	lessons: z.array(CourseLesson),
});
export type CourseModule = z.infer<typeof CourseModule>;

export const CourseLevel = z.enum(["beginner", "intermediate", "advanced"]);
export type CourseLevel = z.infer<typeof CourseLevel>;

export const LessonDocumentType = z.enum([
	"video_lesson",
	"reading",
	"quiz",
	"task",
]);
export type LessonDocumentType = z.infer<typeof LessonDocumentType>;

const nullableText = z
	.string()
	.nullish()
	.transform((value) => value?.trim() || null);
const nullableNumber = z.number().nullish();
const nullableBoolean = z.boolean().nullish();

const imageField = z
	.object({ url: z.string().nullish() })
	.nullish()
	.transform((image) => image?.url ?? null);

const DocumentLink = z.object({
	id: z.string().optional(),
	link_type: z.string(),
	isBroken: z.boolean().optional(),
});

export const PolicyFields = z.object({
	pass_mark_percent: z.number().int().min(1).max(100).nullish().catch(null),
	attempt_rule: z.enum(["per_hour", "cooldown"]).nullish(),
	attempt_value: z.number().int().positive().nullish().catch(null),
	fail_feedback: FailFeedback.nullish(),
	reveal_answers_on_pass: nullableBoolean,
	video_must_finish: nullableBoolean,
	reading_ack: nullableBoolean,
	sequential_unlock: nullableBoolean,
	tasks_required: nullableBoolean,
	min_age: z.number().int().min(13).nullish().catch(null),
});
export type PolicyFields = z.input<typeof PolicyFields>;

export const LessonSummaryDocument = z.object({
	id: z.string(),
	type: LessonDocumentType,
	data: z.object({
		lesson_key: z.string().min(1),
		title: z.string().min(1),
		duration_seconds: nullableNumber,
		minutes: nullableNumber,
	}),
});

export const ModuleSlice = z.object({
	slice_type: z.literal("course_module"),
	primary: z.object({
		module_key: z.string().min(1),
		title: z.string().min(1),
		summary: nullableText,
		lessons: z.array(
			z.object({ lesson: DocumentLink, required: nullableBoolean }),
		),
	}),
});

export const PartnerDocument = z.object({
	data: z.object({
		name: z.string().min(1),
		logo: imageField,
		attribution: nullableText,
	}),
});

export const CourseDocument = z.object({
	id: z.string(),
	uid: z.string(),
	data: PolicyFields.extend({
		title: z.string().min(1),
		summary: nullableText,
		cover: imageField,
		track: academyType.nullish(),
		level: CourseLevel.nullish(),
		hours_label: nullableText,
		outcomes: z.array(z.object({ outcome: nullableText })).nullish(),
		partners: z.array(z.object({ partner: z.unknown() })).nullish(),
		notice: z.array(z.object({ text: z.string().nullish() }).loose()).nullish(),
		certificate_issuer: nullableText,
		certificate_attribution: nullableText,
		certificate_signatories: z
			.array(z.object({ name: nullableText, title: nullableText }))
			.nullish(),
		slices: z.array(z.unknown()),
	}),
});

const QUESTION_KEY_PATTERN = /^(M\d+|FINAL)-\d{2}$/;

export const QuizOptionLetter = z.enum(["A", "B", "C", "D"]);
export type QuizOptionLetter = z.infer<typeof QuizOptionLetter>;

export const QuizDocument = z.object({
	id: z.string(),
	type: z.literal("quiz"),
	data: z.object({
		lesson_key: z.string().min(1),
		title: z.string().min(1),
		questions: z
			.array(
				z.object({
					question_key: z.string().regex(QUESTION_KEY_PATTERN),
					prompt: z.string().min(1),
					option_a: z.string().min(1),
					option_b: z.string().min(1),
					option_c: z.string().min(1),
					option_d: z.string().min(1),
					correct: QuizOptionLetter,
					why: nullableText,
					topic: nullableText,
				}),
			)
			.min(1)
			.refine(
				(questions) =>
					new Set(questions.map((question) => question.question_key)).size ===
					questions.length,
				"Question keys must be unique within a quiz",
			),
	}),
});

export const QUIZ_OPTION_COUNT = 4;

export const QuizSubmission = z.record(
	z.string(),
	z
		.number()
		.int()
		.min(0)
		.max(QUIZ_OPTION_COUNT - 1),
);
export type QuizSubmission = z.infer<typeof QuizSubmission>;

export const COURSE_CONTENT_LOCALE = "en";
