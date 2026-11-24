import {
	type CompletionPolicy,
	CourseDocument,
	type CourseLesson,
	type CourseModule,
	type LessonDocumentType,
	type LessonKind,
	LessonSummaryDocument,
	ModuleSlice,
	PartnerDocument,
	PolicyFields,
	QuizDocument,
	type QuizOptionLetter,
	type QuizSubmission,
} from "./_schema";

export const DEFAULT_ATTEMPTS_PER_HOUR = 3;
export const DEFAULT_COOLDOWN_MINUTES = 10;

export const DEFAULT_COMPLETION_POLICY: CompletionPolicy = {
	passMarkPercent: 70,
	attemptLimit: { kind: "per_hour", max: DEFAULT_ATTEMPTS_PER_HOUR },
	failFeedback: "score",
	revealAnswersOnPass: false,
	videoMustFinish: false,
	readingAck: false,
	sequentialUnlock: false,
	tasksRequired: false,
	minAge: 16,
};

export const DEFAULT_CERTIFICATE_ISSUER = "4HerFrika";
export const VIDEO_END_TOLERANCE_SECONDS = 2;

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;

const lessonKindByType: Record<LessonDocumentType, LessonKind> = {
	video_lesson: "video",
	reading: "reading",
	quiz: "quiz",
	task: "task",
};

const optionIndexByLetter: Record<QuizOptionLetter, number> = {
	A: 0,
	B: 1,
	C: 2,
	D: 3,
};

export function isQuizPassed(
	policy: CompletionPolicy,
	correctCount: number,
	questionCount: number,
): boolean {
	if (questionCount <= 0) return false;
	return correctCount * 100 >= policy.passMarkPercent * questionCount;
}

export type AttemptAvailability =
	| { allowed: true }
	| { allowed: false; retryAtMs: number };

export function nextQuizAttempt(
	policy: CompletionPolicy,
	previousAttemptsMs: number[],
	nowMs: number,
): AttemptAvailability {
	const limit = policy.attemptLimit;
	if (limit.kind === "cooldown") {
		const latest = Math.max(...previousAttemptsMs, Number.NEGATIVE_INFINITY);
		const retryAtMs = latest + limit.minutes * MINUTE_MS;
		return nowMs >= retryAtMs
			? { allowed: true }
			: { allowed: false, retryAtMs };
	}
	const inWindow = previousAttemptsMs
		.filter((at) => nowMs - at < HOUR_MS)
		.sort((a, b) => a - b);
	if (inWindow.length < limit.max) return { allowed: true };
	return {
		allowed: false,
		retryAtMs: inWindow[inWindow.length - limit.max] + HOUR_MS,
	};
}

export function clampVideoSeek(
	policy: CompletionPolicy,
	furthestSeconds: number,
	targetSeconds: number,
	completed: boolean,
): number {
	const target = Number.isFinite(targetSeconds)
		? Math.max(0, targetSeconds)
		: 0;
	if (!policy.videoMustFinish || completed) return target;
	return Math.min(target, Math.max(0, furthestSeconds));
}

export function canCompleteVideo(
	policy: CompletionPolicy,
	furthestSeconds: number,
	durationSeconds: number,
): boolean {
	if (!policy.videoMustFinish) return true;
	if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return false;
	return furthestSeconds >= durationSeconds - VIDEO_END_TOLERANCE_SECONDS;
}

function requiredLessons(module: CourseModule): CourseLesson[] {
	return module.lessons.filter((lesson) => lesson.required);
}

export function isModuleUnlocked(
	policy: CompletionPolicy,
	modules: CourseModule[],
	moduleKey: string,
	completedLessonIds: ReadonlySet<string>,
): boolean {
	if (!policy.sequentialUnlock) return true;
	const index = modules.findIndex((module) => module.key === moduleKey);
	if (index === -1) return false;
	return modules
		.slice(0, index)
		.flatMap(requiredLessons)
		.filter((lesson) => lesson.kind !== "task")
		.every((lesson) => completedLessonIds.has(lesson.id));
}

export function lessonsCountedForCompletion(
	policy: CompletionPolicy,
	modules: CourseModule[],
): CourseLesson[] {
	return modules
		.flatMap(requiredLessons)
		.filter((lesson) => lesson.kind !== "task" || policy.tasksRequired);
}

export function missingForCompletion(
	policy: CompletionPolicy,
	modules: CourseModule[],
	completedLessonIds: ReadonlySet<string>,
): CourseLesson[] {
	return lessonsCountedForCompletion(policy, modules).filter(
		(lesson) => !completedLessonIds.has(lesson.id),
	);
}

export function isCourseComplete(
	policy: CompletionPolicy,
	modules: CourseModule[],
	completedLessonIds: ReadonlySet<string>,
): boolean {
	const counted = lessonsCountedForCompletion(policy, modules);
	return (
		counted.length > 0 &&
		counted.every((lesson) => completedLessonIds.has(lesson.id))
	);
}

function toAttemptLimit(
	rule: "per_hour" | "cooldown" | null | undefined,
	value: number | null | undefined,
): CompletionPolicy["attemptLimit"] {
	if (rule === "cooldown") {
		return { kind: "cooldown", minutes: value ?? DEFAULT_COOLDOWN_MINUTES };
	}
	if (rule === "per_hour") {
		return { kind: "per_hour", max: value ?? DEFAULT_ATTEMPTS_PER_HOUR };
	}
	return DEFAULT_COMPLETION_POLICY.attemptLimit;
}

export function toCompletionPolicy(fields: PolicyFields): CompletionPolicy {
	const parsed = PolicyFields.parse(fields);
	const fallback = DEFAULT_COMPLETION_POLICY;
	return {
		passMarkPercent: parsed.pass_mark_percent ?? fallback.passMarkPercent,
		attemptLimit: toAttemptLimit(parsed.attempt_rule, parsed.attempt_value),
		failFeedback: parsed.fail_feedback ?? fallback.failFeedback,
		revealAnswersOnPass:
			parsed.reveal_answers_on_pass ?? fallback.revealAnswersOnPass,
		videoMustFinish: parsed.video_must_finish ?? fallback.videoMustFinish,
		readingAck: parsed.reading_ack ?? fallback.readingAck,
		sequentialUnlock: parsed.sequential_unlock ?? fallback.sequentialUnlock,
		tasksRequired: parsed.tasks_required ?? fallback.tasksRequired,
		minAge: parsed.min_age ?? fallback.minAge,
	};
}

function linkedLessons(slices: unknown[]) {
	return slices.flatMap((slice) => {
		const module = ModuleSlice.safeParse(slice);
		return module.success ? [module.data.primary] : [];
	});
}

export function lessonIdsInCourse(courseDocument: unknown): string[] {
	const { data } = CourseDocument.parse(courseDocument);
	return linkedLessons(data.slices)
		.flatMap((module) => module.lessons)
		.flatMap(({ lesson }) =>
			lesson.link_type === "Document" && lesson.id && !lesson.isBroken
				? [lesson.id]
				: [],
		);
}

export function toCourse(courseDocument: unknown, lessonDocuments: unknown[]) {
	const { id, uid, data } = CourseDocument.parse(courseDocument);
	const lessonsById = new Map(
		lessonDocuments.flatMap((document) => {
			const lesson = LessonSummaryDocument.safeParse(document);
			return lesson.success ? [[lesson.data.id, lesson.data] as const] : [];
		}),
	);
	const linkedModules = linkedLessons(data.slices);
	const missingRequiredLessons = linkedModules
		.flatMap((module) => module.lessons)
		.filter(
			({ lesson, required }) =>
				lesson.link_type === "Document" &&
				(required ?? true) &&
				!(lesson.id && lessonsById.has(lesson.id)),
		).length;
	const modules = linkedModules.map((module) => ({
		key: module.module_key,
		title: module.title,
		summary: module.summary,
		lessons: module.lessons.flatMap(({ lesson, required }) => {
			const document = lesson.id ? lessonsById.get(lesson.id) : undefined;
			if (!document) return [];
			return [
				{
					id: document.id,
					kind: lessonKindByType[document.type],
					key: document.data.lesson_key,
					title: document.data.title,
					required: required ?? true,
					durationSeconds: document.data.duration_seconds ?? null,
					minutes: document.data.minutes ?? null,
				},
			];
		}),
	}));
	const partners = (data.partners ?? []).flatMap(({ partner }) => {
		const document = PartnerDocument.safeParse(partner);
		if (!document.success) return [];
		const { name, logo, attribution } = document.data.data;
		return [{ name, logoUrl: logo, attribution }];
	});
	return {
		id,
		uid,
		title: data.title,
		summary: data.summary,
		coverUrl: data.cover,
		track: data.track ?? "tech",
		level: data.level ?? "beginner",
		hoursLabel: data.hours_label,
		notice: (data.notice ?? []).flatMap(({ text }) =>
			text?.trim() ? [text.trim()] : [],
		),
		missingRequiredLessons,
		outcomes: (data.outcomes ?? []).flatMap(({ outcome }) =>
			outcome ? [outcome] : [],
		),
		partners,
		policy: toCompletionPolicy(data),
		certificate: {
			issuer: data.certificate_issuer ?? DEFAULT_CERTIFICATE_ISSUER,
			attribution: data.certificate_attribution,
			signatories: (data.certificate_signatories ?? []).flatMap(
				({ name, title }) => (name ? [{ name, title: title ?? "" }] : []),
			),
		},
		modules,
	};
}

export type Course = ReturnType<typeof toCourse>;

export function toPolicyModules(course: Course): CourseModule[] {
	return course.modules.map((module) => ({
		key: module.key,
		lessons: module.lessons.map(({ id, kind, required }) => ({
			id,
			kind,
			required,
		})),
	}));
}

export function shuffledOrder(length: number, random: () => number): number[] {
	const order = Array.from({ length }, (_, index) => index);
	for (let index = order.length - 1; index > 0; index--) {
		const swap = Math.floor(random() * (index + 1));
		[order[index], order[swap]] = [order[swap], order[index]];
	}
	return order;
}

export function toLearnerQuiz(quizDocument: unknown, random: () => number) {
	const { id, data } = QuizDocument.parse(quizDocument);
	const questions = data.questions.map((question) => {
		const texts = [
			question.option_a,
			question.option_b,
			question.option_c,
			question.option_d,
		];
		return {
			key: question.question_key,
			prompt: question.prompt,
			options: shuffledOrder(texts.length, random).map((index) => ({
				index,
				text: texts[index],
			})),
		};
	});
	return {
		id,
		key: data.lesson_key,
		title: data.title,
		questions: shuffledOrder(questions.length, random).map(
			(index) => questions[index],
		),
	};
}

export type LearnerQuiz = ReturnType<typeof toLearnerQuiz>;

export function toQuizAnswerKey(quizDocument: unknown) {
	const { id, data } = QuizDocument.parse(quizDocument);
	return {
		id,
		questions: data.questions.map((question) => ({
			key: question.question_key,
			correctIndex: optionIndexByLetter[question.correct],
			why: question.why,
			topic: question.topic,
		})),
	};
}

export type QuizAnswerKey = ReturnType<typeof toQuizAnswerKey>;

export function gradeQuiz(
	answerKey: QuizAnswerKey,
	submission: QuizSubmission,
) {
	const missed = answerKey.questions.filter(
		(question) => submission[question.key] !== question.correctIndex,
	);
	return {
		correctCount: answerKey.questions.length - missed.length,
		questionCount: answerKey.questions.length,
		missedTopics: [
			...new Set(missed.flatMap(({ topic }) => (topic ? [topic] : []))),
		],
	};
}

export const COURSE_VIDEOS_BUCKET = "course-videos";
export const VIDEO_QUALITIES = [480, 720] as const;
export type VideoQuality = (typeof VIDEO_QUALITIES)[number];
export const VIDEO_URL_TTL_SECONDS = 2 * 60 * 60;

export function videoObjectPath(assetKey: string, quality: VideoQuality) {
	return `${assetKey}/${quality}.mp4`;
}

export function moduleAssetKeys(courseUid: string, moduleNumber: number) {
	const assetKey = `${courseUid}/m${moduleNumber}`;
	return { assetKey, captionsKey: `${assetKey}.vtt` };
}
