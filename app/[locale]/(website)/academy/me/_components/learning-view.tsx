import { SiteImage as Image } from "@/components/ui/site-image";
import { ArrowRight, GraduationCap } from "lucide-react";
import type { Route } from "next";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { certificatePath } from "../../../certificates/_helpers";
import { completePath, coursePath, lessonPath } from "../../[uid]/_helpers";
import { localizedPath } from "../../sign-in/_helpers";
import { type LearningEntry, currentModuleNumber } from "../_helpers";

const PRIMARY =
	"inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-base font-semibold text-white outline-offset-2 hover:brightness-90 focus-visible:outline-2 focus-visible:outline-secondary-500 sm:w-fit";
const SECONDARY =
	"inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-primary-700 px-6 py-3 text-base font-semibold text-primary-700 outline-offset-2 hover:bg-surface-pink focus-visible:outline-2 focus-visible:outline-secondary-500 sm:w-fit";
const SECTION_TITLE =
	"text-sm font-bold uppercase tracking-wide text-muted-foreground";

type Props = {
	firstName: string;
	inProgress: LearningEntry[];
	completed: LearningEntry[];
};

export function LearningView({ firstName, inProgress, completed }: Props) {
	const t = useTranslations("academy.me");
	const empty = inProgress.length === 0 && completed.length === 0;
	return (
		<main className="bg-surface-indigo/40 px-5 pb-16 pt-8 lg:px-8 lg:pt-14">
			<div className="mx-auto flex max-w-6xl flex-col gap-8">
				<h1 className="text-3xl font-medium tracking-tight text-secondary-500 lg:text-5xl">
					{t("title", { name: firstName })}
				</h1>
				<Empty show={empty} />
				<Sections inProgress={inProgress} completed={completed} empty={empty} />
			</div>
		</main>
	);
}

function Sections({
	inProgress,
	completed,
	empty,
}: Pick<Props, "inProgress" | "completed"> & { empty: boolean }) {
	if (empty) return null;
	return (
		<div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_23.75rem] lg:gap-12">
			<InProgress entries={inProgress} />
			<Certificates entries={completed} />
		</div>
	);
}

function Empty({ show }: { show: boolean }) {
	const t = useTranslations("academy.me");
	const locale = useLocale();
	if (!show) return null;
	return (
		<section
			aria-labelledby="empty-title"
			className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-border bg-white p-8 text-center"
		>
			<GraduationCap
				className="size-10 text-secondary-500"
				aria-hidden="true"
			/>
			<h2 id="empty-title" className="text-xl font-semibold text-secondary-500">
				{t("emptyTitle")}
			</h2>
			<p className="max-w-md text-base text-muted-foreground">
				{t("emptyBody")}
			</p>
			<Link
				href={localizedPath(locale, "/academy") as Route}
				className={PRIMARY}
			>
				{t("browse")}
				<ArrowRight className="size-4" aria-hidden="true" />
			</Link>
		</section>
	);
}

function InProgress({ entries }: { entries: LearningEntry[] }) {
	const t = useTranslations("academy.me");
	if (entries.length === 0) return null;
	return (
		<section aria-labelledby="progress-title" className="flex flex-col gap-4">
			<h2 id="progress-title" className={SECTION_TITLE}>
				{t("inProgress")}
			</h2>
			<ul className="flex flex-col gap-4">
				{entries.map((entry) => (
					<li key={entry.course.id}>
						<ProgressCard entry={entry} />
					</li>
				))}
			</ul>
		</section>
	);
}

function Cover({ url }: { url: string | null }) {
	if (!url) return <div aria-hidden="true" className="bg-surface-pink" />;
	return (
		<div className="relative size-20 overflow-hidden rounded-xl sm:size-auto sm:min-h-48 sm:rounded-none">
			<Image
				src={url}
				alt=""
				fill
				sizes="280px"
				className="object-cover object-left"
			/>
		</div>
	);
}

function ProgressCard({ entry }: { entry: LearningEntry }) {
	const t = useTranslations("academy.me");
	const locale = useLocale();
	const { course, percent, next } = entry;
	const href = localizedPath(
		locale,
		next ? lessonPath(course.uid, next.key) : coursePath(course.uid),
	);
	return (
		<article className="grid gap-4 overflow-hidden rounded-3xl border border-border bg-white p-4 shadow-[0_12px_32px_rgba(3,6,92,0.08)] sm:grid-cols-[17.5rem_minmax(0,1fr)] sm:gap-6 sm:p-0">
			<Cover url={course.coverUrl} />
			<div className="flex min-w-0 flex-col justify-center gap-4 sm:p-6 sm:pl-0">
				<h3 className="text-xl font-semibold text-secondary-500">
					{course.title}
				</h3>
				<div className="flex flex-col gap-2">
					<div className="flex items-baseline justify-between gap-3 text-sm">
						<span className="font-semibold text-secondary-500">
							{t("moduleOf", {
								current: currentModuleNumber(course, next),
								total: course.modules.length,
							})}
						</span>
						<span className="text-muted-foreground">{percent}%</span>
					</div>
					<progress
						aria-label={t("progress", { course: course.title })}
						value={percent}
						max={100}
						className="h-2 w-full overflow-hidden rounded-full [&::-moz-progress-bar]:bg-primary-500 [&::-webkit-progress-bar]:bg-surface-pink [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-primary-500"
					/>
				</div>
				<Link href={href as Route} className={PRIMARY}>
					{next ? t("continueLesson", { title: next.title }) : t("review")}
					<ArrowRight className="size-4 shrink-0" aria-hidden="true" />
				</Link>
			</div>
		</article>
	);
}

function Certificates({ entries }: { entries: LearningEntry[] }) {
	const t = useTranslations("academy.me");
	return (
		<section
			aria-labelledby="certificates-title"
			className="flex flex-col gap-4"
		>
			<h2 id="certificates-title" className={SECTION_TITLE}>
				{t("certificates")}
			</h2>
			<CertificateList entries={entries} />
			<NoCertificates show={entries.length === 0} />
		</section>
	);
}

function NoCertificates({ show }: { show: boolean }) {
	const t = useTranslations("academy.me");
	if (!show) return null;
	return (
		<div className="flex flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-border bg-white p-6 text-center">
			<GraduationCap className="size-8 text-secondary-500" aria-hidden="true" />
			<p className="font-semibold text-secondary-500">
				{t("firstCertificateTitle")}
			</p>
			<p className="text-sm text-muted-foreground">
				{t("firstCertificateBody")}
			</p>
		</div>
	);
}

function CertificateList({ entries }: { entries: LearningEntry[] }) {
	if (entries.length === 0) return null;
	return (
		<ul className="flex flex-col gap-3">
			{entries.map((entry) => (
				<li key={entry.course.id}>
					<CertificateItem entry={entry} />
				</li>
			))}
		</ul>
	);
}

function CertificateItem({ entry }: { entry: LearningEntry }) {
	const t = useTranslations("academy.me");
	const locale = useLocale();
	const { course, certificateCode } = entry;
	const href = certificateCode
		? certificatePath(locale, certificateCode)
		: localizedPath(locale, completePath(course.uid));
	return (
		<div className="flex flex-col gap-3 rounded-3xl border border-border bg-white p-5">
			<p className="flex items-center gap-2 text-sm font-semibold text-[#1a6b42]">
				<GraduationCap className="size-4" aria-hidden="true" />
				{t("completedBadge")}
			</p>
			<h3 className="text-lg font-semibold text-secondary-500">
				{course.title}
			</h3>
			<Link href={href as Route} className={SECONDARY}>
				{t("viewCertificate")}
			</Link>
		</div>
	);
}
