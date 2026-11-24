import { MentorImage } from "@/components/mentor-image";
import type { DbMentorWithAvailability } from "@/src/db/schema/tables";
import { Clock, UserRound } from "lucide-react";
import type { Route } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { BookCallLink } from "./book-call-link";

export async function FeaturedMentorCard({
	mentor,
}: {
	mentor: DbMentorWithAvailability | null;
}) {
	if (!mentor) return null;

	const [t, tc] = await Promise.all([
		getTranslations("careers"),
		getTranslations("common"),
	]);
	const displayName = mentor.nickname || mentor.name;
	const isAvailable = mentor.availability.length > 0;

	return (
		<section
			aria-label={t("featuredMentor")}
			className="px-4 pt-14 lg:px-20 lg:pt-20"
		>
			<div className="mx-auto max-w-6xl">
				<article className="relative grid overflow-hidden rounded-[32px] bg-surface-pink shadow-[0_12px_24px_rgba(0,0,0,0.08)] lg:grid-cols-[1.15fr_1fr] lg:rounded-[40px]">
					<div className="relative h-95 bg-white lg:order-2 lg:h-120">
						{mentor.image ? (
							<MentorImage
								src={mentor.image}
								alt={displayName}
								crop={mentor.image_crop}
								sizes="(max-width: 1024px) 100vw, 45vw"
								className="absolute inset-0"
							/>
						) : (
							<div className="absolute inset-0 flex items-center justify-center bg-surface-pink">
								<UserRound className="size-28 text-primary-500/60" />
							</div>
						)}
						{isAvailable ? (
							<span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-pill bg-white px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm">
								<span
									aria-hidden="true"
									className="size-2 rounded-pill bg-emerald-600"
								/>
								{t("availableThisWeek")}
							</span>
						) : null}
					</div>
					<div className="relative z-10 flex flex-col justify-center gap-3 p-6 lg:order-1 lg:p-14">
						<span className="w-fit rounded-pill bg-primary-500 px-4 py-1.5 text-xs font-medium text-white">
							{t("featuredMentor")}
						</span>
						<h2 className="text-[40px] font-bold leading-none text-foreground lg:text-6xl">
							{displayName}
						</h2>
						<p className="text-[17px] capitalize text-muted-foreground lg:text-xl">
							{mentor.position}
						</p>
						<p className="line-clamp-3 max-w-prose whitespace-pre-line text-[15px] leading-relaxed text-muted-foreground">
							{mentor.bio}
						</p>
						<p className="flex items-center gap-2 text-[15px] text-muted-foreground">
							<Clock aria-hidden="true" className="size-4 shrink-0" />
							{t("featuredCall")}
						</p>
						<div className="mt-3 flex flex-col gap-3 sm:flex-row">
							<BookCallLink
								mentor={{
									id: mentor.id,
									slug: mentor.slug,
									name: displayName,
								}}
								source="featured"
								ariaLabel={t("bookCallWith", { name: displayName })}
								className="inline-flex h-12 items-center justify-center rounded-pill bg-primary-500 px-6 font-medium text-white transition-[filter] hover:no-underline hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
							>
								{tc("bookACall")}
							</BookCallLink>
							<Link
								href={`/careercorner/${mentor.slug}` as Route}
								aria-label={`${t("viewProfile")}: ${displayName}`}
								className="inline-flex h-12 items-center justify-center rounded-pill border-2 border-primary-500 px-6 font-medium text-primary-500 transition-colors hover:bg-primary-500 hover:text-white hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
							>
								{t("viewProfile")}
							</Link>
						</div>
					</div>
				</article>
			</div>
		</section>
	);
}
