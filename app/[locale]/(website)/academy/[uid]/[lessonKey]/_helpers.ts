import {
	type Course,
	isCourseComplete,
	isModuleUnlocked,
	toPolicyModules,
} from "../../_helpers";
import type { CompletionPolicy } from "../../_schema";
import type { CourseLessonView } from "../_helpers";

export const PROGRESS_ALLOWANCE_SECONDS = 15;
export const PROGRESS_INTERVAL_MS = 10_000;
export const MAX_TEXT_LENGTH = 5000;
export const MAX_TRACK_LENGTH = 40;
const MS_PER_SECOND = 1000;

export type StoredProgress = {
	furthestSeconds: number;
	lastSeconds: number;
	updatedAtMs: number | null;
};

export type ProgressReport = {
	positionSeconds: number;
	nowMs: number;
	durationSeconds: number | null;
	enforce: boolean;
};

export type ProgressUpdate = {
	furthestSeconds: number;
	lastSeconds: number;
};

function sanitisePosition(value: number) {
	return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : null;
}

export function advanceLimit(stored: StoredProgress, nowMs: number): number {
	if (stored.updatedAtMs === null) {
		return stored.furthestSeconds + PROGRESS_ALLOWANCE_SECONDS;
	}
	const elapsed = Math.max(0, (nowMs - stored.updatedAtMs) / MS_PER_SECOND);
	const allowance = Math.min(PROGRESS_ALLOWANCE_SECONDS, elapsed);
	return stored.furthestSeconds + Math.floor(elapsed + allowance);
}

export function applyProgress(
	stored: StoredProgress,
	report: ProgressReport,
): ProgressUpdate {
	const position = sanitisePosition(report.positionSeconds);
	if (position === null) {
		return {
			furthestSeconds: stored.furthestSeconds,
			lastSeconds: stored.lastSeconds,
		};
	}
	const duration =
		report.durationSeconds !== null && report.durationSeconds > 0
			? Math.ceil(report.durationSeconds)
			: Number.POSITIVE_INFINITY;
	const ceiling = report.enforce
		? Math.min(advanceLimit(stored, report.nowMs), duration)
		: duration;
	const furthest = Math.max(
		stored.furthestSeconds,
		Math.min(position, ceiling),
	);
	return {
		furthestSeconds: furthest,
		lastSeconds: Math.min(position, furthest),
	};
}

export function nextAttemptNumber(previousNumbers: number[]): number {
	return Math.max(0, ...previousNumbers) + 1;
}

export type AttemptCheck =
	| { kind: "stale"; currentNumber: number }
	| { kind: "ok"; attemptNumber: number };

export function checkAttemptNumber(
	previousNumbers: number[],
	expectedNumber: number,
): AttemptCheck {
	const attemptNumber = nextAttemptNumber(previousNumbers);
	if (attemptNumber !== expectedNumber) {
		return { kind: "stale", currentNumber: attemptNumber - 1 };
	}
	return { kind: "ok", attemptNumber };
}

export type LessonPosition = {
	moduleKey: string;
	moduleTitle: string;
	moduleNumber: number;
	lessonNumber: number;
	lessonCount: number;
};

export type LessonNavigation = {
	position: LessonPosition;
	previous: CourseLessonView | null;
	next: CourseLessonView | null;
	nextEnabled: boolean;
};

export function findLesson(course: Course, lessonKey: string) {
	for (const [moduleIndex, module] of course.modules.entries()) {
		const lessonIndex = module.lessons.findIndex(
			(lesson) => lesson.key === lessonKey,
		);
		if (lessonIndex !== -1) {
			return {
				module,
				moduleIndex,
				lesson: module.lessons[lessonIndex],
				lessonIndex,
			};
		}
	}
	return null;
}

export function canOpenLesson(
	policy: CompletionPolicy,
	course: Course,
	moduleKey: string,
	completed: ReadonlySet<string>,
): boolean {
	return isModuleUnlocked(
		policy,
		toPolicyModules(course),
		moduleKey,
		completed,
	);
}

export function lessonNavigation(
	course: Course,
	policy: CompletionPolicy,
	lessonKey: string,
	completed: ReadonlySet<string>,
): LessonNavigation | null {
	const found = findLesson(course, lessonKey);
	if (!found) return null;
	const flat = course.modules.flatMap((module) =>
		module.lessons.map((lesson) => ({ lesson, moduleKey: module.key })),
	);
	const index = flat.findIndex(({ lesson }) => lesson.id === found.lesson.id);
	const previous = flat[index - 1]?.lesson ?? null;
	const nextEntry = flat[index + 1] ?? null;
	const nextUnlocked = nextEntry
		? canOpenLesson(policy, course, nextEntry.moduleKey, completed)
		: false;
	return {
		position: {
			moduleKey: found.module.key,
			moduleTitle: found.module.title,
			moduleNumber: found.moduleIndex + 1,
			lessonNumber: found.lessonIndex + 1,
			lessonCount: found.module.lessons.length,
		},
		previous,
		next: nextEntry?.lesson ?? null,
		nextEnabled: nextUnlocked,
	};
}

export type CompletionTransition =
	| { kind: "already_complete" }
	| { kind: "blocked" }
	| { kind: "complete"; finishesCourse: boolean };

export function completionTransition(
	policy: CompletionPolicy,
	course: Course,
	lessonId: string,
	completed: ReadonlySet<string>,
	allowed: boolean,
	courseAlreadyComplete: boolean,
): CompletionTransition {
	if (completed.has(lessonId)) return { kind: "already_complete" };
	if (!allowed) return { kind: "blocked" };
	const after = new Set([...completed, lessonId]);
	return {
		kind: "complete",
		finishesCourse:
			!courseAlreadyComplete &&
			isCourseComplete(policy, toPolicyModules(course), after),
	};
}

export function videoStartSeconds(
	policy: CompletionPolicy,
	stored: Pick<StoredProgress, "furthestSeconds" | "lastSeconds">,
	completed: boolean,
): number {
	if (completed) return 0;
	if (!policy.videoMustFinish) return stored.lastSeconds;
	return Math.min(stored.lastSeconds, stored.furthestSeconds);
}
