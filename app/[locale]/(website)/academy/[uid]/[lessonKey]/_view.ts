import type { Locale } from "next-intl";
import type { Course } from "../../_helpers";
import { localizedPath } from "../../sign-in/_helpers";
import { coursePath, lessonPath } from "../_helpers";
import type { LessonAccess } from "./_access";
import { type LessonNavigation, lessonNavigation } from "./_helpers";

export type OkAccess = Extract<LessonAccess, { kind: "ok" }>;

export type LessonNav = {
	previousHref: string | null;
	nextHref: string | null;
	nextEnabled: boolean;
	continueHref: string | null;
	courseHref: string;
	position: LessonNavigation["position"];
};

export type LessonViewProps = {
	access: OkAccess;
	nav: LessonNav;
	locale: Locale;
};

function hrefOf(locale: Locale, course: Course, key: string | undefined) {
	return key ? localizedPath(locale, lessonPath(course.uid, key)) : null;
}

export function buildNav(access: OkAccess, locale: Locale): LessonNav | null {
	const { course, enrolment, completed, lesson } = access;
	const policy = enrolment.completion_policy;
	const now = lessonNavigation(course, policy, lesson.key, completed);
	if (!now) return null;
	const after = lessonNavigation(
		course,
		policy,
		lesson.key,
		new Set([...completed, lesson.id]),
	);
	return {
		previousHref: hrefOf(locale, course, now.previous?.key),
		nextHref: hrefOf(locale, course, now.next?.key),
		nextEnabled: now.nextEnabled,
		continueHref:
			after?.nextEnabled && after.next
				? hrefOf(locale, course, after.next.key)
				: null,
		courseHref: localizedPath(locale, coursePath(course.uid)),
		position: now.position,
	};
}
