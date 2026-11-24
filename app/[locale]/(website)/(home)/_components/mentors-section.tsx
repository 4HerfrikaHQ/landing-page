import { MentorImage } from "@/components/mentor-image";
import { FadeIn } from "@/components/motion";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import type { Route } from "next";
import { getTranslations } from "next-intl/server";
import type { HeroMentor } from "../../careercorner/_actions";
import { PillLink } from "./pill-link";
import { SectionHeading } from "./section-heading";

export async function MentorsSection({ mentors }: { mentors: HeroMentor[] }) {
	if (mentors.length === 0) return null;
	const t = await getTranslations("home.mentors");

	return (
		<section className="px-4 pb-16 lg:px-20 lg:pb-24">
			<FadeIn className="mx-auto max-w-6xl">
				<div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<SectionHeading
							eyebrow={t("eyebrow")}
							first={t("titleFirst")}
							second={t("titleSecond")}
						/>
						<p className="mt-3 text-[17px] text-muted-foreground">
							{t("description")}
						</p>
					</div>
					<PillLink
						href="/careercorner"
						variant="outline-primary"
						className="shrink-0 gap-2 self-start lg:self-auto"
					>
						{t("viewAll")}
						<ArrowRight aria-hidden="true" className="size-4" />
					</PillLink>
				</div>
				<ul className="-mx-4 mt-8 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-6 lg:gap-5 lg:overflow-visible lg:px-0">
					{mentors.map((mentor) => (
						<li
							key={mentor.slug}
							className="w-[40%] shrink-0 snap-start lg:w-auto"
						>
							<Link
								href={`/careercorner/${mentor.slug}` as Route}
								className="group block rounded-[24px] hover:no-underline! focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
							>
								<MentorImage
									src={mentor.image}
									alt={mentor.displayName}
									crop={mentor.crop}
									aspectRatio={1}
									sizes="(max-width: 1024px) 40vw, 16vw"
									className="aspect-square w-full rounded-[24px]"
								/>
								<b className="mt-3 block font-semibold">{mentor.displayName}</b>
								<span className="block text-[15px] text-muted-foreground">
									{mentor.position}
								</span>
							</Link>
						</li>
					))}
				</ul>
			</FadeIn>
		</section>
	);
}
