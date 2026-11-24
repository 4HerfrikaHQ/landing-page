import type { CompletionPolicy, CourseLesson, CourseModule } from "./_schema";

const DEFAULT_ATTEMPTS_PER_HOUR = 3;

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

const VIDEO_END_TOLERANCE_SECONDS = 2;

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;

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

function lessonsCountedForCompletion(
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
