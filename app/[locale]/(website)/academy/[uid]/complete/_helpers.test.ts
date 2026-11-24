import { expect, test } from "bun:test";
import type { Course } from "../../_helpers";
import { courseCounts } from "./_helpers";

test("counts modules, quizzes and tasks", () => {
	const lesson = (kind: string) => ({ kind });
	const course = {
		modules: [
			{ lessons: [lesson("video"), lesson("quiz"), lesson("task")] },
			{ lessons: [lesson("reading"), lesson("quiz")] },
		],
	} as unknown as Course;
	expect(courseCounts(course)).toEqual({ modules: 2, quizzes: 2, tasks: 1 });
});
