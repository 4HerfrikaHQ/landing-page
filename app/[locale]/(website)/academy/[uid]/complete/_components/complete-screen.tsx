import type { DbCertificate } from "@/src/db/schema/tables";
import { Check, Linkedin, Sparkles } from "lucide-react";
import type { Route } from "next";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import {
	CertificateCard,
	CertificateFooter,
} from "../../../../certificates/_components/certificate-card";
import { ShareActions } from "../../../../certificates/_components/share-actions";
import { formatCertificateCode } from "../../../../certificates/_helpers";
import type { Course } from "../../../_helpers";
import { localizedPath } from "../../../sign-in/_helpers";
import { MY_LEARNING_PATH, coursePath } from "../../_helpers";
import { courseCounts } from "../_helpers";

type Props = {
	firstName: string;
	course: Course;
	certificate: DbCertificate;
	completedLabel: string;
	url: string;
	printHref: string;
};

export function CompleteScreen({
	firstName,
	course,
	certificate,
	completedLabel,
	url,
	printHref,
}: Props) {
	const t = useTranslations("academy.complete");
	const locale = useLocale();
	const counts = courseCounts(course);
	const stats = [
		counts.modules > 0 && t("modules", { count: counts.modules }),
		counts.quizzes > 0 && t("quizzes", { count: counts.quizzes }),
		counts.tasks > 0 && t("tasks", { count: counts.tasks }),
	].filter(Boolean);

	return (
		<main className="relative overflow-hidden bg-linear-to-b from-surface-pink via-white to-white px-5 pb-16 pt-10 lg:px-8 lg:py-20">
			<div
				aria-hidden="true"
				className="pointer-events-none absolute -right-24 top-40 size-72 rounded-full bg-amber-200/60 blur-3xl"
			/>
			<div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
				<div className="flex flex-col gap-6 lg:order-1">
					<p className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-300 px-4 py-1.5 text-sm font-semibold text-secondary-500">
						<Sparkles className="size-4" aria-hidden="true" />
						{t("badge")}
					</p>
					<h1 className="text-4xl font-medium leading-[1.1] tracking-tight text-secondary-500 lg:text-6xl">
						{t("titleLead")}{" "}
						<em className="font-playfair font-black text-primary-500">
							{firstName}.
						</em>
					</h1>
					<p className="max-w-xl text-lg leading-7 text-muted-foreground">
						{stats.join(", ")}
						{stats.length > 0 ? ". " : ""}
						{t("oneCertificate")}
					</p>
					<div className="max-lg:hidden">
						<ShareActions
							courseTitle={certificate.course_title}
							issuer={certificate.issuer}
							code={certificate.code}
							completedAt={certificate.completed_at}
							url={url}
							printHref={printHref}
						/>
					</div>
				</div>
				<div className="flex flex-col gap-6 lg:order-2">
					<CertificateCard
						name={certificate.learner_name}
						courseTitle={certificate.course_title}
						partners={certificate.partners}
						className="-rotate-2 motion-reduce:rotate-0"
					>
						<CertificateFooter
							issuer={certificate.issuer}
							attribution={certificate.attribution}
						>
							<p className="text-sm text-muted-foreground">
								{t("completedOn", { date: completedLabel })} ·{" "}
								{t("certificateId")}{" "}
								<span className="font-mono font-semibold text-secondary-500">
									{formatCertificateCode(certificate.code)}
								</span>
							</p>
						</CertificateFooter>
					</CertificateCard>
					<NextSteps />
					<div className="lg:hidden">
						<ShareActions
							courseTitle={certificate.course_title}
							issuer={certificate.issuer}
							code={certificate.code}
							completedAt={certificate.completed_at}
							url={url}
							printHref={printHref}
						/>
					</div>
				</div>
			</div>
			<nav
				aria-label={t("navLabel")}
				className="relative mx-auto mt-10 flex max-w-6xl flex-wrap gap-x-6"
			>
				<Link
					href={localizedPath(locale, MY_LEARNING_PATH) as Route}
					className={LINK}
				>
					{t("myLearning")}
				</Link>
				<Link
					href={localizedPath(locale, coursePath(course.uid)) as Route}
					className={LINK}
				>
					{t("backToCourse")}
				</Link>
				<Link
					href={localizedPath(locale, "/academy") as Route}
					className={LINK}
				>
					{t("backToCourses")}
				</Link>
			</nav>
		</main>
	);
}

const LINK =
	"inline-flex min-h-11 items-center rounded-md px-1 text-sm font-semibold text-secondary-500 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-primary-500";

function NextSteps() {
	const t = useTranslations("academy.complete");
	const steps = [
		{ key: "emailed", Icon: Check },
		{ key: "linkedin", Icon: Linkedin },
		{ key: "mentor", Icon: Sparkles },
	] as const;
	return (
		<ul className="flex flex-col gap-3 rounded-3xl border border-border bg-white p-5">
			{steps.map(({ key, Icon }) => (
				<li
					key={key}
					className="flex items-center gap-3 text-sm text-foreground"
				>
					<span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-pink text-primary-700">
						<Icon className="size-4" aria-hidden="true" />
					</span>
					{t(`steps.${key}`)}
				</li>
			))}
		</ul>
	);
}
