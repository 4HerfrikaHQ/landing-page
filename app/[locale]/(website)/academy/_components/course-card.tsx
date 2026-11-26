import { Button } from "@/components/ui/button";
import { SiteImage as Image } from "@/components/ui/site-image";
import { ArrowRight } from "lucide-react";
import type { Route } from "next";
import { useTranslations } from "next-intl";
import { coursePath } from "../[uid]/_helpers";
import type { Course } from "../_helpers";
import { CourseChips } from "./course-chips";

type Partner = Course["partners"][number];

export function CourseCard({ course }: { course: Course }) {
	const t = useTranslations("academy.catalog");
	const facts = [
		t("modules", { count: course.modules.length }),
		course.hoursLabel,
		t("freeCertificate"),
	].filter(Boolean);

	return (
		<article className="grid overflow-hidden rounded-3xl bg-white shadow-[0_12px_32px_rgba(3,6,92,0.10)] lg:grid-cols-2">
			<CardCover url={course.coverUrl} />
			<div className="flex flex-col gap-4 p-6 lg:p-8">
				<div className="flex flex-wrap gap-2">
					<span className="inline-flex items-center rounded-full bg-amber-300 px-3 py-1 text-xs font-semibold text-secondary-500">
						{t("free")}
					</span>
					<CourseChips track={course.track} level={course.level} />
				</div>
				<h3 className="text-2xl font-semibold leading-8 text-secondary-500">
					{course.title}
				</h3>
				<CardSummary text={course.summary} />
				<PartnerLine partner={course.partners[0]} />
				<p className="text-sm text-muted-foreground">{facts.join(" · ")}</p>
				<Button
					href={coursePath(course.uid) as Route}
					size="lg"
					className="mt-auto min-h-12 w-fit gap-2 text-base md:py-3 md:text-base"
				>
					{t("startCourse")} <ArrowRight className="size-4" />
				</Button>
			</div>
		</article>
	);
}

function CardCover({ url }: { url: string | null }) {
	return (
		<div className="relative aspect-3/2 bg-surface-pink lg:aspect-auto lg:min-h-80">
			<CoverImage url={url} />
		</div>
	);
}

function CoverImage({ url }: { url: string | null }) {
	if (!url) return null;
	return (
		<Image
			src={url}
			alt=""
			fill
			sizes="(max-width: 1024px) 100vw, 420px"
			className="object-cover"
		/>
	);
}

function CardSummary({ text }: { text: string | null }) {
	if (!text) return null;
	return <p className="text-base leading-6 text-muted-foreground">{text}</p>;
}

export function PartnerLogo({ url }: { url: string | null }) {
	if (!url) return null;
	return (
		<Image
			src={url}
			alt=""
			width={72}
			height={20}
			className="h-5 w-auto object-contain"
		/>
	);
}

function PartnerLine({ partner }: { partner: Partner | undefined }) {
	const t = useTranslations("academy.catalog");
	if (!partner) return null;
	return (
		<p className="flex flex-wrap items-center gap-2 text-sm text-foreground">
			<PartnerLogo url={partner.logoUrl} />
			<span>
				{partner.attribution ?? t("withPartner", { name: partner.name })}
			</span>
		</p>
	);
}
