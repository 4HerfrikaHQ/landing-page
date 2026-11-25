import { ClipReveal } from "@/components/motion/clip-reveal";
import { ArrowRight, Check } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { COURSE_POINT_KEYS } from "../_schema";
import { PillLink } from "./pill-link";

export async function CourseBand() {
	const t = await getTranslations("home.course");

	return (
		<section className="flex flex-col overflow-hidden rounded-t-[40px] bg-white lg:min-h-160 lg:flex-row lg:rounded-t-[64px]">
			<div className="bg-secondary-500 px-6 py-14 text-white lg:w-1/2 lg:px-20 lg:py-24">
				<span className="inline-flex rounded-full bg-surface-pink px-3 py-1.5 text-xs text-primary-500">
					{t("eyebrow")}
				</span>
				<h2 className="mt-4 text-[32px] font-bold leading-tight lg:text-[44px]">
					{t("titleFirst")}{" "}
					<em className="font-playfair font-black text-primary-bright">
						{t("titleSecond")}
					</em>
				</h2>
				<p className="mt-4 text-base text-white/80 lg:text-lg">
					{t("description")}
				</p>
				<ul className="mt-6 grid gap-2 text-[15px]">
					{COURSE_POINT_KEYS.map((key) => (
						<li key={key} className="flex items-start gap-2">
							<Check
								aria-hidden="true"
								className="mt-0.5 size-4 shrink-0 text-primary-bright"
							/>
							{t(key)}
						</li>
					))}
				</ul>
				<div className="mt-8 flex flex-col gap-3 sm:flex-row">
					<PillLink href="/academy" variant="bright" className="gap-2">
						{t("start")}
						<ArrowRight aria-hidden="true" className="size-4" />
					</PillLink>
					<PillLink href="/academy" variant="outline-light">
						{t("seeAll")}
					</PillLink>
				</div>
			</div>
			<ClipReveal className="relative aspect-square w-full lg:aspect-auto lg:w-1/2 lg:self-stretch">
				<Image
					src="/assets/home/course.jpg"
					alt={t("imageAlt")}
					fill
					sizes="(max-width: 1024px) 100vw, 50vw"
					className="object-cover"
				/>
			</ClipReveal>
		</section>
	);
}
