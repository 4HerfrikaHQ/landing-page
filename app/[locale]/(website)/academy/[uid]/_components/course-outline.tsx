import { RevealGroup } from "@/components/motion/reveal-group";
import {
	AlignLeft,
	Check,
	ChevronDown,
	CircleHelp,
	Lock,
	type LucideIcon,
	PenLine,
	Play,
} from "lucide-react";
import type { Route } from "next";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import type { Course } from "../../_helpers";
import type { LessonKind } from "../../_schema";
import { formatCountdown, localizedPath } from "../../sign-in/_helpers";
import {
	type CourseLessonView,
	type LessonState,
	type ModuleState,
	activePolicy,
	lessonPath,
	lessonState,
	moduleProgress,
	moduleStates,
	nextLesson,
} from "../_helpers";
import type { Viewer } from "../_viewer";

const KIND_ICON: Record<LessonKind, LucideIcon> = {
	video: Play,
	reading: AlignLeft,
	quiz: CircleHelp,
	task: PenLine,
};

const NO_PROGRESS: ReadonlySet<string> = new Set();

export function CourseOutline({
	course,
	viewer,
}: {
	course: Course;
	viewer: Viewer;
}) {
	const t = useTranslations("academy.course");
	const enrolled = viewer.kind === "enrolled";
	const policy = activePolicy(course, viewer);
	const completed = enrolled ? viewer.completed : NO_PROGRESS;
	const states = moduleStates(course, policy, completed);
	const next = enrolled ? nextLesson(course, policy, completed) : null;
	const openKey = enrolled
		? course.modules.find((module) => states.get(module.key) === "current")?.key
		: course.modules[0]?.key;

	return (
		<section aria-labelledby="modules-title" className="flex flex-col gap-4">
			<h2
				id="modules-title"
				className="text-xl font-semibold text-secondary-500"
			>
				{t("modulesTitle")}
			</h2>
			<RevealGroup as="ol" className="flex flex-col gap-3">
				{course.modules.map((module, index) => (
					<li key={module.key}>
						<ModuleItem
							module={module}
							number={index + 1}
							state={states.get(module.key) ?? "open"}
							defaultOpen={module.key === openKey}
							enrolled={enrolled}
							completed={completed}
							nextLessonId={next?.id}
							uid={course.uid}
						/>
					</li>
				))}
			</RevealGroup>
		</section>
	);
}

function ModuleItem({
	module,
	number,
	state,
	defaultOpen,
	enrolled,
	completed,
	nextLessonId,
	uid,
}: {
	module: Course["modules"][number];
	number: number;
	state: ModuleState;
	defaultOpen: boolean;
	enrolled: boolean;
	completed: ReadonlySet<string>;
	nextLessonId: string | undefined;
	uid: string;
}) {
	const border =
		state === "current" ? "border-primary-500 border-2" : "border-border";
	return (
		<div>
			<details
				open={defaultOpen}
				className={`group rounded-2xl border bg-white ${border}`}
			>
				<summary className="flex min-h-16 cursor-pointer list-none items-center gap-4 rounded-2xl p-4 focus-visible:outline-2 focus-visible:outline-primary-500 [&::-webkit-details-marker]:hidden">
					<ModuleBadge state={state} number={number} />
					<div className="flex min-w-0 flex-1 flex-col gap-1">
						<h3 className="text-base font-semibold leading-snug text-secondary-500">
							{module.title}
						</h3>
						<ModuleCaption
							module={module}
							state={state}
							enrolled={enrolled}
							completed={completed}
						/>
					</div>
					<ChevronDown
						className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
						aria-hidden="true"
					/>
				</summary>
				<ul className="border-t border-border">
					{module.lessons.map((lesson) => (
						<LessonRow
							key={lesson.id}
							lesson={lesson}
							state={lessonState(lesson, state, completed, nextLessonId)}
							href={enrolled ? lessonPath(uid, lesson.key) : null}
						/>
					))}
				</ul>
			</details>
		</div>
	);
}

function ModuleBadge({
	state,
	number,
}: { state: ModuleState; number: number }) {
	const t = useTranslations("academy.course");
	if (state === "complete") {
		return (
			<span
				role="img"
				aria-label={t("stateDone")}
				className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-700 text-white"
			>
				<Check className="size-4" aria-hidden="true" />
			</span>
		);
	}
	if (state === "locked") {
		return (
			<span
				role="img"
				aria-label={t("stateLocked")}
				className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-indigo text-secondary-500"
			>
				<Lock className="size-4" aria-hidden="true" />
			</span>
		);
	}
	const tone =
		state === "current"
			? "bg-primary-500 text-white"
			: "bg-secondary-500 text-white";
	return (
		<span
			className={`grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold ${tone}`}
		>
			{number}
		</span>
	);
}

function ModuleCaption({
	module,
	state,
	enrolled,
	completed,
}: {
	module: Course["modules"][number];
	state: ModuleState;
	enrolled: boolean;
	completed: ReadonlySet<string>;
}) {
	const t = useTranslations("academy.course");
	if (state === "locked") {
		return <p className="text-xs text-muted-foreground">{t("moduleLocked")}</p>;
	}
	if (enrolled) {
		const { completed: done, total } = moduleProgress(module, completed);
		return (
			<p className="text-xs text-muted-foreground">
				{t("lessonsDone", { done, total })}
			</p>
		);
	}
	const kinds = [...new Set(module.lessons.map((lesson) => lesson.kind))];
	return (
		<p className="text-xs text-muted-foreground">
			{kinds.map((kind) => t(`kinds.${kind}`)).join(" · ")}
		</p>
	);
}

function LessonRow({
	lesson,
	state,
	href,
}: {
	lesson: CourseLessonView;
	state: LessonState;
	href: string | null;
}) {
	const locale = useLocale();
	const Icon = KIND_ICON[lesson.kind];
	const tone = state === "next" ? "bg-surface-pink" : "";
	const content = (
		<>
			<Icon className="size-4 shrink-0 text-secondary-500" aria-hidden="true" />
			<span className="min-w-0 flex-1 text-sm text-foreground">
				<LessonTitle lesson={lesson} done={state === "done"} />
			</span>
			<LessonMeta lesson={lesson} state={state} />
		</>
	);
	const rowClass = `flex min-h-11 items-center gap-3 px-4 py-3 ${tone}`;
	if (!href || state === "locked") {
		return <li className={`${rowClass} opacity-80`}>{content}</li>;
	}
	return (
		<li>
			<Link
				href={localizedPath(locale, href) as Route}
				className={`${rowClass} hover:bg-surface-pink focus-visible:outline-2 focus-visible:outline-primary-500`}
			>
				{content}
			</Link>
		</li>
	);
}

function LessonTitle({
	lesson,
	done,
}: {
	lesson: CourseLessonView;
	done: boolean;
}) {
	const t = useTranslations("academy.course");
	const style = done ? "line-through text-muted-foreground" : "";
	return (
		<span className={style}>
			<span className="font-semibold">{t(`kinds.${lesson.kind}`)}</span>
			{" · "}
			{lesson.title}
		</span>
	);
}

function LessonMeta({
	lesson,
	state,
}: {
	lesson: CourseLessonView;
	state: LessonState;
}) {
	const t = useTranslations("academy.course");
	const parts = [
		state === "done" ? t("stateDone") : null,
		state === "next" ? t("stateNext") : null,
		lesson.required ? null : t("optional"),
		lesson.durationSeconds ? formatCountdown(lesson.durationSeconds) : null,
		lesson.minutes ? t("minutes", { minutes: lesson.minutes }) : null,
	].filter(Boolean);
	return (
		<span className="shrink-0 text-xs text-muted-foreground">
			{parts.join(" · ")}
		</span>
	);
}
