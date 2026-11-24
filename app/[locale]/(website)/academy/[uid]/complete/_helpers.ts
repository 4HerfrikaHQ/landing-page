import type { Course } from "../../_helpers";

export function courseCounts(course: Course) {
	const lessons = course.modules.flatMap((module) => module.lessons);
	return {
		modules: course.modules.length,
		quizzes: lessons.filter((lesson) => lesson.kind === "quiz").length,
		tasks: lessons.filter((lesson) => lesson.kind === "task").length,
	};
}
