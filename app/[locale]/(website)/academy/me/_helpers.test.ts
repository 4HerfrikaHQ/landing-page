import { expect, test } from "bun:test";
import type { Course } from "../_helpers";
import {
	type LearningEntry,
	currentModuleNumber,
	splitEntries,
} from "./_helpers";

const course = {
	modules: [
		{ lessons: [{ id: "a" }, { id: "b" }] },
		{ lessons: [{ id: "c" }] },
	],
} as unknown as Course;

const lesson = (id: string) => ({ id }) as never;

test("current module follows the next lesson", () => {
	expect(currentModuleNumber(course, lesson("a"))).toBe(1);
	expect(currentModuleNumber(course, lesson("c"))).toBe(2);
	expect(currentModuleNumber(course, null)).toBe(2);
	expect(currentModuleNumber(course, lesson("zzz"))).toBe(1);
});

test("splits in-progress from completed, newest completion first", () => {
	const entry = (completedAt: Date | null) =>
		({ completedAt }) as unknown as LearningEntry;
	const early = entry(new Date("2026-12-01"));
	const late = entry(new Date("2026-12-09"));
	const open = entry(null);
	const { inProgress, completed } = splitEntries([early, open, late]);
	expect(inProgress).toEqual([open]);
	expect(completed).toEqual([late, early]);
});
