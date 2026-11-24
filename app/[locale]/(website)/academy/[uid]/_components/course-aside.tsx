import { useTranslations } from "next-intl";
import Image from "next/image";
import { PartnerLogo } from "../../_components/course-card";
import type { Course } from "../../_helpers";
import { courseProgressPercent, nextLesson } from "../_helpers";
import type { Viewer } from "../_viewer";
import { CourseAction } from "./course-action";
import { FinishPanel } from "./finish-panel";

const HINT_KEY = {
	signedOut: "startFreeHint",
	needsDetails: "detailsHint",
	learner: "enrolHint",
	enrolled: "enrolHint",
} as const;

export function CourseAside({
	course,
	viewer,
}: {
	course: Course;
	viewer: Viewer;
}) {
	return (
		<aside className="flex flex-col gap-5 rounded-3xl border border-border bg-white p-5 shadow-[0_12px_32px_rgba(3,6,92,0.08)] max-lg:hidden lg:sticky lg:top-28 lg:self-start">
			<AsideCover url={course.coverUrl} />
			<AsideProgress course={course} viewer={viewer} />
			<div className="flex flex-col gap-2">
				<CourseAction course={course} viewer={viewer} />
				<ActionHint viewer={viewer} />
			</div>
			<AsideFacts course={course} />
			<FinishPanel
				course={course}
				policy={viewer.kind === "enrolled" ? viewer.policy : course.policy}
				className="max-lg:hidden"
			/>
		</aside>
	);
}

export function EnrolledSummary({
	course,
	viewer,
}: {
	course: Course;
	viewer: Viewer;
}) {
	if (viewer.kind !== "enrolled") return null;
	return (
		<div className="flex flex-col gap-5 rounded-3xl border border-border bg-white p-5 shadow-[0_12px_32px_rgba(3,6,92,0.08)] lg:hidden">
			<AsideProgress course={course} viewer={viewer} />
			<CourseAction course={course} viewer={viewer} />
		</div>
	);
}

function AsideCover({ url }: { url: string | null }) {
	if (!url) return null;
	return (
		<div className="relative aspect-3/2 overflow-hidden rounded-2xl max-lg:hidden">
			<Image src={url} alt="" fill sizes="360px" className="object-cover" />
		</div>
	);
}

function ActionHint({ viewer }: { viewer: Viewer }) {
	const t = useTranslations("academy.course");
	if (viewer.kind === "enrolled") return null;
	return (
		<p className="text-center text-xs text-muted-foreground">
			{t(HINT_KEY[viewer.kind])}
		</p>
	);
}

function AsideProgress({
	course,
	viewer,
}: {
	course: Course;
	viewer: Viewer;
}) {
	const t = useTranslations("academy.course");
	if (viewer.kind !== "enrolled") return null;
	const percent = courseProgressPercent(
		course,
		viewer.policy,
		viewer.completed,
	);
	const next = nextLesson(course, viewer.policy, viewer.completed);
	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-baseline justify-between gap-3 text-sm">
				<p className="text-muted-foreground">
					{t("welcomeBack", { name: viewer.name })}
				</p>
				<p className="font-semibold text-secondary-500">
					{t("percentDone", { percent })}
				</p>
			</div>
			<progress
				aria-label={t("progress")}
				value={percent}
				max={100}
				className="h-2 w-full overflow-hidden rounded-full [&::-moz-progress-bar]:bg-primary-500 [&::-webkit-progress-bar]:bg-surface-pink [&::-webkit-progress-value]:bg-primary-500 [&::-webkit-progress-value]:rounded-full"
			/>
			<UpNext title={next?.title ?? null} />
		</div>
	);
}

function UpNext({ title }: { title: string | null }) {
	const t = useTranslations("academy.course");
	if (!title) {
		return <p className="text-sm text-foreground">{t("finished")}</p>;
	}
	return (
		<p className="flex flex-col gap-0.5 text-sm">
			<span className="text-xs font-bold uppercase tracking-wide text-primary-700">
				{t("upNext")}
			</span>
			<span className="text-lg font-semibold text-secondary-500">{title}</span>
		</p>
	);
}

function AsideFacts({ course }: { course: Course }) {
	const t = useTranslations("academy.course");
	const facts = [
		{
			label: t("factLength"),
			value: course.hoursLabel ?? t("statHoursFallback"),
		},
		{ label: t("factCertificate"), value: t("factCertificateValue") },
	];
	return (
		<dl className="grid grid-cols-2 gap-4 border-t border-border pt-5 max-lg:hidden">
			<Partners partners={course.partners} />
			{facts.map((fact) => (
				<div key={fact.label} className="flex flex-col gap-1">
					<dt className="text-xs text-muted-foreground">{fact.label}</dt>
					<dd className="text-sm font-semibold text-secondary-500">
						{fact.value}
					</dd>
				</div>
			))}
		</dl>
	);
}

function Partners({ partners }: { partners: Course["partners"] }) {
	const t = useTranslations("academy.course");
	if (partners.length === 0) return null;
	return (
		<div className="col-span-2 flex flex-col gap-1">
			<dt className="text-xs text-muted-foreground">{t("factPartner")}</dt>
			<dd className="flex flex-wrap items-center gap-3 text-sm font-semibold text-secondary-500">
				{partners.map((partner) => (
					<span key={partner.name} className="flex items-center gap-2">
						<PartnerLogo url={partner.logoUrl} />
						{partner.name}
					</span>
				))}
			</dd>
		</div>
	);
}
