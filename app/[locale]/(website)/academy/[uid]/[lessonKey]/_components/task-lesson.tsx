import { db } from "@/src/db";
import {
	type TaskSubmissionStatus,
	taskSubmissions,
} from "@/src/db/schema/tables";
import { and, desc, eq } from "drizzle-orm";
import { ArrowRight } from "lucide-react";
import type { Route } from "next";
import { getFormatter, getTranslations } from "next-intl/server";
import Link from "next/link";
import { getLessonContent } from "../_content";
import { canSubmitTask } from "../_task";
import type { LessonViewProps } from "../_view";
import { LessonFooter, SECONDARY_ACTION } from "./lesson-footer";
import { Badge, LessonHeading } from "./lesson-heading";
import { RichBody } from "./rich-body";
import { TaskForm } from "./task-form";

const STATUS_STYLE: Record<TaskSubmissionStatus, string> = {
	submitted: "bg-surface-indigo text-secondary-500",
	needs_work: "bg-[#ffd84d] text-secondary-500",
	complete: "bg-[#e6f4ec] text-[#1f7a4d]",
};

const STATUS_BODY = {
	submitted: "submittedBody",
	needs_work: "needsWorkBody",
	complete: "completeBody",
} as const;

type Latest = { body: string; note: string | null; sentOn: string };

export async function TaskLesson({ view }: { view: LessonViewProps }) {
	const { access, nav } = view;
	const { enrolment, lesson } = access;
	const [content, t, format] = await Promise.all([
		getLessonContent(lesson.id),
		getTranslations("academy.lesson.task"),
		getFormatter(),
	]);
	if (content.kind !== "task") return null;
	const [row] = await db
		.select()
		.from(taskSubmissions)
		.where(
			and(
				eq(taskSubmissions.enrolment_id, enrolment.id),
				eq(taskSubmissions.lesson_id, lesson.id),
			),
		)
		.orderBy(desc(taskSubmissions.submitted_at))
		.limit(1);
	const status = row?.status ?? null;
	const latest: Latest | null = row
		? {
				body: row.body,
				note: row.facilitator_note,
				sentOn: format.dateTime(row.submitted_at, { dateStyle: "medium" }),
			}
		: null;
	const nextHref = nav.nextEnabled ? nav.nextHref : null;
	const tracks = content.tracks.map(({ key, title, instructions }) => ({
		key,
		title,
		instructions: instructions ? <RichBody field={instructions} /> : null,
	}));
	const intro = content.instructions ? (
		<RichBody field={content.instructions} />
	) : null;

	return (
		<>
			<LessonHeading title={lesson.title}>
				<Badge>{t("badge")}</Badge>
			</LessonHeading>
			<SubmissionStatus status={status} latest={latest} />
			<FormArea
				open={canSubmitTask(status)}
				uid={access.course.uid}
				lessonKey={lesson.key}
				resubmit={status === "needs_work"}
				intro={intro}
				fallback={t("noInstructions")}
				tracks={tracks}
			/>
			<LessonFooter previousHref={nav.previousHref}>
				<TaskContinue
					href={nextHref ?? nav.courseHref}
					hasNext={nextHref !== null}
				/>
			</LessonFooter>
		</>
	);
}

async function TaskContinue({
	href,
	hasNext,
}: {
	href: string;
	hasNext: boolean;
}) {
	const t = await getTranslations("academy.lesson");
	return (
		<Link href={href as Route} className={SECONDARY_ACTION}>
			{hasNext ? t("next") : t("backToCourse")}
			<ArrowRight className="size-4" aria-hidden />
		</Link>
	);
}

async function SubmissionStatus({
	status,
	latest,
}: {
	status: TaskSubmissionStatus | null;
	latest: Latest | null;
}) {
	const t = await getTranslations("academy.lesson.task");
	if (!status || !latest) return null;
	return (
		<section className="flex flex-col gap-4">
			<p
				className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${STATUS_STYLE[status]}`}
			>
				{t(`status.${status}`)}
			</p>
			<p className="text-lg text-muted-foreground">{t(STATUS_BODY[status])}</p>
			<FacilitatorNote note={latest.note} show={status !== "submitted"} />
			<div className="rounded-2xl border border-border p-4">
				<h2 className="text-base font-semibold text-secondary-500">
					{t("yourSubmission")}
				</h2>
				<p className="text-sm text-muted-foreground">
					{t("sentOn", { date: latest.sentOn })}
				</p>
				<p className="mt-2 whitespace-pre-wrap break-words text-base text-secondary-500">
					{latest.body}
				</p>
			</div>
		</section>
	);
}

async function FacilitatorNote({
	note,
	show,
}: {
	note: string | null;
	show: boolean;
}) {
	const t = await getTranslations("academy.lesson.task");
	if (!show) return null;
	return (
		<div className="rounded-2xl border border-border p-4 shadow-sm">
			<h2 className="text-base font-semibold text-secondary-500">
				{t("noteTitle")}
			</h2>
			<p className="mt-1 whitespace-pre-wrap text-base text-secondary-500">
				{note ?? t("noNote")}
			</p>
		</div>
	);
}

type FormAreaProps = {
	open: boolean;
	uid: string;
	lessonKey: string;
	resubmit: boolean;
	intro: React.ReactNode;
	fallback: string;
	tracks: { key: string; title: string; instructions: React.ReactNode }[];
};

function FormArea({ open, fallback, ...form }: FormAreaProps) {
	if (!open) return null;
	if (!form.intro && form.tracks.length === 0) {
		return <p className="text-lg text-muted-foreground">{fallback}</p>;
	}
	return <TaskForm {...form} />;
}
