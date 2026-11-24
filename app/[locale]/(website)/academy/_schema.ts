import type { Review } from "@/components/reviews/reviews-section";
import { z } from "zod";

export const academyType = z.enum(["tech", "business", "climate"]);

export type Academy = z.infer<typeof academyType>;

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
		image: "/assets/academy/tech-source.jpg",
	},
	{
		academy: "business",
		name: "Business Academy",
		description:
			"Turn your ideas into sustainable ventures with practical business skills, mentorship, and a community built to help you grow.",
		image: "/assets/academy/business-source.jpg",
	},
	{
		academy: "climate",
		name: "Climate Academy",
		description:
			"Shape Africa's environmental future. Build the skills to lead in green innovation, sustainability, and climate advocacy.",
		image: "/assets/academy/climate-source.jpg",
	},
] as const;

export const academyTranslationKeys = {
	tech: { name: "techAcademy", description: "techDescription" },
	business: { name: "businessAcademy", description: "businessDescription" },
	climate: { name: "climateAcademy", description: "climateDescription" },
} as const;

export const testimonials: readonly Review[] = [
	{
		id: "adesola-adewale",
		quote:
			"I came with no tech background. Now I'm a product designer at a global firm. This academy changed my entire career trajectory.",
		name: "Adesola Adewale",
		title: "Founder, ReadEvolve",
		image: { src: "/assets/academy/adesola_crop.png", alt: "Adesola Adewale" },
	},
	{
		id: "adeleke-glory",
		quote:
			"I walked in with an idea. I walked out with a registered business, three clients, and the confidence to lead a team.",
		name: "Adeleke Glory",
		title: "Student, Lautech Campus",
		image: { src: "/assets/academy/glory_crop.png", alt: "Adeleke Glory" },
	},
	{
		id: "elizabeth-akinmolayan",
		quote:
			"The Climate Academy gave me the language and the network to turn frustration into a movement in my community.",
		name: "Elizabeth Akinmolayan",
		title: "Student, FUTA Campus",
		image: {
			src: "/assets/academy/elizabeth_crop.png",
			alt: "Elizabeth Akinmolayan",
		},
	},
	{
		id: "olafisoye-theresa",
		quote:
			"The Climate Academy gave me the language and the network to turn frustration into a movement in my community.",
		name: "Olafisoye Theresa",
		title: "Campus lead, 4Herfrika FUTA campus",
		image: {
			src: "/assets/academy/theresa_crop.png",
			alt: "Olafisoye Theresa",
		},
	},
] as const;

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
	pass_mark_percent: nullableNumber,
	attempt_rule: z.enum(["per_hour", "cooldown"]).nullish(),
	attempt_value: nullableNumber,
	fail_feedback: FailFeedback.nullish(),
	reveal_answers_on_pass: nullableBoolean,
	video_must_finish: nullableBoolean,
	reading_ack: nullableBoolean,
	sequential_unlock: nullableBoolean,
	tasks_required: nullableBoolean,
	min_age: nullableNumber,
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
