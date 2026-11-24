import { ArrowLeft } from "lucide-react";
import type { Route } from "next";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { PartnerLogo } from "../../_components/course-card";
import { CourseChips } from "../../_components/course-chips";
import type { Course } from "../../_helpers";
import { ACADEMY_HOME_PATH, localizedPath } from "../../sign-in/_helpers";
import { splitTitle } from "../_helpers";

export function CourseHeader({ course }: { course: Course }) {
	const t = useTranslations("academy.course");
	const locale = useLocale();
	const { lead, accent } = splitTitle(course.title);

	return (
		<header className="flex flex-col gap-5">
			<Link
				href={localizedPath(locale, ACADEMY_HOME_PATH) as Route}
				className="-ml-1 inline-flex min-h-11 w-fit items-center gap-2 rounded-md px-1 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary-500"
			>
				<ArrowLeft className="size-4" aria-hidden="true" />
				{t("backToCourses")}
			</Link>
			<div className="flex flex-wrap gap-2">
				<CourseChips track={course.track} level={course.level} />
			</div>
			<h1 className="text-4xl font-medium leading-[1.1] tracking-tight text-secondary-500 sm:text-5xl lg:text-6xl">
				{lead}{" "}
				<em className="font-playfair font-black text-primary-500">{accent}</em>
			</h1>
			<Summary text={course.summary} />
			<PartnerStrip partners={course.partners} />
			<Stats course={course} />
		</header>
	);
}

function Summary({ text }: { text: string | null }) {
	if (!text) return null;
	return (
		<p className="max-w-2xl text-lg leading-7 text-muted-foreground">{text}</p>
	);
}

function PartnerStrip({ partners }: { partners: Course["partners"] }) {
	const t = useTranslations("academy.course");
	if (partners.length === 0) return null;
	return (
		<div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-border bg-white px-4 py-3">
			<Image
				src="/assets/academy/academy-logo.png"
				alt="4Herfrika"
				width={96}
				height={27}
				className="h-6 w-auto object-contain"
			/>
			{partners.map((partner) => (
				<span key={partner.name} className="flex items-center gap-3">
					<span aria-hidden="true" className="text-muted-foreground">
						×
					</span>
					<PartnerLogo url={partner.logoUrl} />
					<span className="text-sm font-medium text-foreground">
						{partner.name}
					</span>
				</span>
			))}
			<span className="ml-auto whitespace-nowrap text-xs text-muted-foreground">
				{t("madeTogether")}
			</span>
		</div>
	);
}

function Stats({ course }: { course: Course }) {
	const t = useTranslations("academy.course");
	const stats = [
		{ value: String(course.modules.length), label: t("statModules") },
		{
			value: course.hoursLabel ?? t("statHoursFallback"),
			label: t("statHours"),
		},
		{ value: t("free"), label: t("statCertificate") },
	];
	return (
		<dl className="grid grid-cols-3 gap-3 sm:max-w-xl">
			{stats.map((stat) => (
				<div
					key={stat.label}
					className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-white px-2 py-4 text-center"
				>
					<dd className="order-first text-xl font-semibold text-secondary-500">
						{stat.value}
					</dd>
					<dt className="text-xs text-muted-foreground">{stat.label}</dt>
				</div>
			))}
		</dl>
	);
}
