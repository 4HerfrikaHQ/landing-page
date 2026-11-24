import type { CourseLessonView } from "../[uid]/_helpers";
import type { Course } from "../_helpers";

export type LearningEntry = {
	course: Course;
	percent: number;
	next: CourseLessonView | null;
	completedAt: Date | null;
	certificateCode: string | null;
};

export function currentModuleNumber(
	course: Course,
	next: CourseLessonView | null,
): number {
	if (!next) return course.modules.length;
	const index = course.modules.findIndex((module) =>
		module.lessons.some((lesson) => lesson.id === next.id),
	);
	return index === -1 ? 1 : index + 1;
}

export function splitEntries(entries: LearningEntry[]) {
	return {
		inProgress: entries.filter((entry) => entry.completedAt === null),
		completed: entries
			.filter((entry) => entry.completedAt !== null)
			.sort(
				(a, b) =>
					(b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0),
			),
	};
}
