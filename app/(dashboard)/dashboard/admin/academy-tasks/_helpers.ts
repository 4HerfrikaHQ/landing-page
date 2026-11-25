import type { TaskSubmissionStatus } from "@/src/db/schema/tables";

export const NOTE_MAX_LENGTH = 1500;
export const QUEUE_PAGE_SIZE = 20;
export const DEFAULT_QUEUE_STATUS = "submitted";

export type ReviewDecision = "complete" | "needs_work";

export type ReviewTransition =
	| { kind: "apply"; status: ReviewDecision }
	| { kind: "already_reviewed" };

export function reviewTransition(
	current: TaskSubmissionStatus,
	decision: ReviewDecision,
): ReviewTransition {
	if (current !== "submitted") return { kind: "already_reviewed" };
	return { kind: "apply", status: decision };
}

export type TextSegment =
	| { kind: "text"; offset: number; value: string }
	| { kind: "link"; offset: number; value: string; href: string };

const URL_PATTERN = /https?:\/\/[^\s<>"']+/gi;
const TRAILING_PUNCTUATION = /[.,;:!?)\]}]+$/;

function safeHref(candidate: string): string | null {
	try {
		const url = new URL(candidate);
		return url.protocol === "http:" || url.protocol === "https:"
			? url.href
			: null;
	} catch {
		return null;
	}
}

export function linkSegments(text: string): TextSegment[] {
	const segments: TextSegment[] = [];
	let cursor = 0;
	for (const match of text.matchAll(URL_PATTERN)) {
		const raw = match[0];
		const trimmed = raw.replace(TRAILING_PUNCTUATION, "");
		const href = safeHref(trimmed);
		if (!href) continue;
		if (match.index > cursor) {
			segments.push({
				kind: "text",
				offset: cursor,
				value: text.slice(cursor, match.index),
			});
		}
		segments.push({ kind: "link", offset: match.index, value: trimmed, href });
		cursor = match.index + trimmed.length;
	}
	if (cursor < text.length) {
		segments.push({ kind: "text", offset: cursor, value: text.slice(cursor) });
	}
	return segments;
}

type IndexedCourse = {
	id: string;
	title: string;
	modules: { lessons: { id: string; title: string }[] }[];
};

export type TaskTitles = ReadonlyMap<
	string,
	{ title: string; lessons: ReadonlyMap<string, string> }
>;

export function indexTaskTitles(courses: IndexedCourse[]): TaskTitles {
	return new Map(
		courses.map((course) => [
			course.id,
			{
				title: course.title,
				lessons: new Map(
					course.modules.flatMap((module) =>
						module.lessons.map((lesson) => [lesson.id, lesson.title] as const),
					),
				),
			},
		]),
	);
}

export function describeTask(
	titles: TaskTitles,
	courseId: string,
	lessonId: string,
) {
	const course = titles.get(courseId);
	return {
		courseTitle: course?.title ?? "Unpublished course",
		lessonTitle: course?.lessons.get(lessonId) ?? "Unknown task",
	};
}

export function countryName(code: string): string {
	try {
		return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
	} catch {
		return code;
	}
}

export function attemptLabel(attempt: number): string {
	return attempt === 1 ? "First attempt" : `Attempt ${attempt}`;
}

export function withAttemptNumbers<
	T extends { enrolmentId: string; lessonId: string; submittedAt: Date },
>(items: T[]): (T & { attempt: number })[] {
	const seen = new Map<string, number>();
	return [...items]
		.sort((a, b) => a.submittedAt.getTime() - b.submittedAt.getTime())
		.map((item) => {
			const key = `${item.enrolmentId}:${item.lessonId}`;
			const attempt = (seen.get(key) ?? 0) + 1;
			seen.set(key, attempt);
			return { ...item, attempt };
		});
}
