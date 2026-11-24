import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { requireLearner } from "../../_learner";
import { localizedPath } from "../../sign-in/_helpers";
import { coursePath, lessonPath } from "../_helpers";
import { loadCourse, resolveLessonAccess } from "./_access";
import { FinishState } from "./_components/finish-state";
import { LessonBody } from "./_components/lesson-body";
import { LessonShell } from "./_components/lesson-shell";
import { buildNav } from "./_view";

type Params = { uid: string; lessonKey: string };

export async function generateMetadata({
	params,
}: {
	params: Promise<Params>;
}): Promise<Metadata> {
	const { uid, lessonKey } = await params;
	const course = await loadCourse(uid);
	const lesson = course?.modules
		.flatMap((module) => module.lessons)
		.find((item) => item.key === lessonKey);
	return {
		title: lesson ? `${lesson.title} · ${course?.title}` : undefined,
		robots: { index: false },
	};
}

export default async function LessonPage({
	params,
}: {
	params: Promise<Params>;
}) {
	const { uid, lessonKey } = await params;
	const locale = await getLocale();
	const learner = await requireLearner(
		localizedPath(locale, lessonPath(uid, lessonKey)),
	);
	const access = await resolveLessonAccess(learner.id, uid, lessonKey);
	if (access.kind === "course_missing" || access.kind === "lesson_missing") {
		notFound();
	}
	if (access.kind === "to_course") {
		redirect(localizedPath(locale, coursePath(uid)));
	}
	const nav = buildNav(access, locale);
	if (!nav) notFound();
	const { course, enrolment, completed, lesson } = access;
	const view = { access, nav, locale };
	const finished =
		enrolment.completed_at !== null &&
		nav.nextHref === null &&
		completed.has(lesson.id);

	return (
		<LessonShell
			course={course}
			policy={enrolment.completion_policy}
			completed={completed}
			currentKey={lesson.key}
			position={nav.position}
		>
			<FinishState show={finished} courseHref={nav.courseHref} />
			<LessonBody view={view} />
		</LessonShell>
	);
}
