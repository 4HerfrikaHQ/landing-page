import { routing } from "@/i18n/routing";
import {
	type Course,
	isModuleUnlocked,
	lessonsCountedForCompletion,
	missingForCompletion,
	toPolicyModules,
} from "../_helpers";
import type { CompletionPolicy } from "../_schema";
import type { Viewer } from "./_viewer";

export const PERCENT = 100;
export const ACCENT_WORD_COUNT = 1;

export type CourseLessonView = Course["modules"][number]["lessons"][number];

export type LessonState = "done" | "next" | "todo" | "locked";

export type ModuleState = "complete" | "current" | "locked" | "open";

export type PolicyRule = {
	id:
		| "quizPerHour"
		| "quizCooldown"
		| "quizAllPerHour"
		| "quizAllCooldown"
		| "tapContinue"
		| "watchToEnd"
		| "markRead"
		| "tasks"
		| "inOrder";
	values: { percent: number; max: number; minutes: number; count: number };
};

export function isCourseOpenForEnrolment(course: Course): boolean {
	return (
		course.missingRequiredLessons === 0 &&
		course.modules.some((module) => module.lessons.length > 0)
	);
}

export function activePolicy(course: Course, viewer: Viewer): CompletionPolicy {
	return viewer.kind === "enrolled" ? viewer.policy : course.policy;
}

export function firstLesson(course: Course): CourseLessonView | null {
	for (const module of course.modules) {
		if (module.lessons.length > 0) return module.lessons[0];
	}
	return null;
}

export function lessonPath(uid: string, lessonKey: string): string {
	return `/academy/${uid}/${lessonKey}`;
}

export function coursePath(uid: string): string {
	return `/academy/${uid}`;
}

export function nextLesson(
	course: Course,
	policy: CompletionPolicy,
	completed: ReadonlySet<string>,
): CourseLessonView | null {
	const [next] = missingForCompletion(
		policy,
		toPolicyModules(course),
		completed,
	);
	if (!next) return null;
	for (const module of course.modules) {
		const found = module.lessons.find((lesson) => lesson.id === next.id);
		if (found) return found;
	}
	return null;
}

export function courseProgressPercent(
	course: Course,
	policy: CompletionPolicy,
	completed: ReadonlySet<string>,
): number {
	const counted = lessonsCountedForCompletion(policy, toPolicyModules(course));
	if (counted.length === 0) return 0;
	const done = counted.filter((lesson) => completed.has(lesson.id)).length;
	return Math.floor((done / counted.length) * PERCENT);
}

export function moduleProgress(
	module: Course["modules"][number],
	completed: ReadonlySet<string>,
) {
	return {
		completed: module.lessons.filter((lesson) => completed.has(lesson.id))
			.length,
		total: module.lessons.length,
	};
}

export function moduleStates(
	course: Course,
	policy: CompletionPolicy,
	completed: ReadonlySet<string>,
): Map<string, ModuleState> {
	const policyModules = toPolicyModules(course);
	const next = nextLesson(course, policy, completed);
	const nextModuleKey = next
		? course.modules.find((module) =>
				module.lessons.some((lesson) => lesson.id === next.id),
			)?.key
		: undefined;
	return new Map(
		course.modules.map((module) => {
			if (!isModuleUnlocked(policy, policyModules, module.key, completed)) {
				return [module.key, "locked"] as const;
			}
			const { completed: done, total } = moduleProgress(module, completed);
			if (total > 0 && done === total) return [module.key, "complete"] as const;
			if (module.key === nextModuleKey) return [module.key, "current"] as const;
			return [module.key, "open"] as const;
		}),
	);
}

export function lessonState(
	lesson: CourseLessonView,
	moduleState: ModuleState,
	completed: ReadonlySet<string>,
	nextLessonId: string | undefined,
): LessonState {
	if (moduleState === "locked") return "locked";
	if (completed.has(lesson.id)) return "done";
	if (lesson.id === nextLessonId) return "next";
	return "todo";
}

export function policyRules(
	policy: CompletionPolicy,
	course: Course,
): PolicyRule[] {
	const limit = policy.attemptLimit;
	const taskCount = course.modules
		.flatMap((module) => module.lessons)
		.filter((lesson) => lesson.kind === "task" && lesson.required).length;
	const values = {
		percent: policy.passMarkPercent,
		max: limit.kind === "per_hour" ? limit.max : 0,
		minutes: limit.kind === "cooldown" ? limit.minutes : 0,
		count: taskCount,
	};
	const all = policy.passMarkPercent === PERCENT;
	const quizId =
		`quiz${all ? "All" : ""}${limit.kind === "per_hour" ? "PerHour" : "Cooldown"}` as
			| "quizPerHour"
			| "quizCooldown"
			| "quizAllPerHour"
			| "quizAllCooldown";
	const rules: PolicyRule["id"][] = [quizId];
	if (policy.videoMustFinish) rules.push("watchToEnd");
	if (policy.readingAck) rules.push("markRead");
	if (!policy.videoMustFinish && !policy.readingAck) rules.push("tapContinue");
	if (policy.tasksRequired && taskCount > 0) rules.push("tasks");
	if (policy.sequentialUnlock) rules.push("inOrder");
	return rules.map((id) => ({ id, values }));
}

export function splitTitle(title: string) {
	const words = title.trim().split(/\s+/);
	if (words.length <= ACCENT_WORD_COUNT) return { lead: "", accent: title };
	return {
		lead: words.slice(0, -ACCENT_WORD_COUNT).join(" "),
		accent: words.slice(-ACCENT_WORD_COUNT).join(" "),
	};
}

const ACADEMY_PAGES = new Set(["sign-in", "welcome", "me"]);

const coursePathPattern = new RegExp(
	`^(?:/(?:${routing.locales.join("|")}))?/academy/([^/?#]+)/?$`,
);

export function courseUidFromPath(path: string): string | null {
	const uid = coursePathPattern.exec(path)?.[1];
	if (!uid || ACADEMY_PAGES.has(uid)) return null;
	return uid;
}
