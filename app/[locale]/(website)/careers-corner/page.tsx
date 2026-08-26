import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { setLocaleFromParams } from "@/i18n/set-locale-from-params";
import { resolveFeaturedMentor } from "@/src/lib/featured-mentor";
import { isLocalImageUrl } from "@/src/lib/image-url";
import { UserRound } from "lucide-react";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { getHeroMentors, getMentors } from "./_actions";
import { CareersHero } from "./_components/hero";
import { MentorDirectory } from "./_components/mentor-directory";

const CareersCorner = async ({
	params,
}: { params: Promise<{ locale: string }> }) => {
	await setLocaleFromParams(params);

	const [tCareers, tCommon, mentors, heroMentors, featured] = await Promise.all(
		[
			getTranslations("careers"),
			getTranslations("common"),
			getMentors(),
			getHeroMentors(),
			resolveFeaturedMentor(),
		],
	);

	const featuredName = featured ? featured.nickname || featured.name : null;

	return (
		<section className="overflow-x-hidden">
			<CareersHero mentors={heroMentors} />

			{featured && (
				<section className="bg-muted">
					<section className="container mx-auto grid h-full grid-cols-1 items-center gap-10 px-4 py-8 sm:px-6 md:grid-cols-2 md:py-12 lg:px-8 lg:py-16 xl:py-20">
						<FadeIn direction="left">
							<div className="group relative flex h-[400px] w-full flex-col justify-end overflow-hidden rounded-tl-[16px] rounded-tr-[16px] rounded-br-[40px] rounded-bl-[40px] p-6 sm:h-[560px] sm:rounded-br-[70px] sm:rounded-bl-[70px] sm:p-8">
								{featured.image ? (
									<Image
										src={featured.image}
										alt={featured.name}
										fill
										sizes="(max-width: 768px) 100vw, 50vw"
										unoptimized={isLocalImageUrl(featured.image)}
										className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
									/>
								) : (
									<div className="flex h-full w-full items-center justify-center bg-secondary-500/40">
										<UserRound className="size-28 text-white/70" />
									</div>
								)}
								<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
								<div className="relative z-10 flex flex-col gap-3">
									<span className="inline-flex w-fit items-center rounded-full bg-primary-500 px-4 py-1.5 text-xs font-medium text-white sm:text-sm">
										{tCareers("featuredMentor")}
									</span>
									<h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
										{featuredName}
									</h2>
									<p className="text-sm capitalize text-white/90 sm:text-base">
										{featured.position}
									</p>
								</div>
							</div>
						</FadeIn>
						<FadeIn direction="right">
							<div>
								<h3 className="text-lg uppercase tracking-wide text-primary-500">
									{tCareers("featuredMentor")}
								</h3>
								<h2 className="my-3 text-4xl font-semibold text-foreground">
									{featuredName}
								</h2>
								<p className="mb-4 capitalize text-muted-foreground">
									{featured.position}
								</p>

								{featured.bio && (
									<p className="max-w-[65ch] whitespace-pre-line leading-relaxed text-muted-foreground">
										{featured.bio}
									</p>
								)}
								<div className="my-7 flex w-full flex-col items-center justify-between gap-5 md:flex-row">
									{featured.linkedin_url && (
										<a
											href={featured.linkedin_url}
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary-500 underline"
										>
											{tCommon("messageOnLinkedin")}
										</a>
									)}
									<Button
										variant="solid"
										size="lg"
										href={`/careers-corner/${featured.slug}`}
										className="w-full md:w-1/2"
									>
										{tCommon("bookACall")}
									</Button>
								</div>
							</div>
						</FadeIn>
					</section>
				</section>
			)}

			<section className="bg-primary-500 px-4 py-8 sm:px-6 md:py-12 lg:px-8 lg:py-16 xl:py-20">
				<section className="container mx-auto">
					<h2 className="mb-3 text-center text-4xl font-semibold text-white">
						{tCareers("bookCounseling")}
					</h2>
					<p className="mb-8 text-center text-white max-w-[70vw] mx-auto">
						{tCareers("counselingDescription")}
					</p>
					<div className="rounded-3xl bg-white/95 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.12)] sm:p-8">
						<MentorDirectory
							mentors={mentors}
							searchPlaceholder={tCareers("searchMentor")}
							availableLabel={tCareers("availableThisWeek")}
						/>
					</div>
				</section>
			</section>

			<FadeIn>
				<section className="container mx-auto max-w-3xl px-4 py-8 text-center sm:px-6 md:py-12 lg:px-8 lg:py-16 xl:py-20">
					<h2 className="mb-2 text-4xl font-bold">
						{tCareers("becomeMentor")}
					</h2>
					<p className="mb-8 text-muted-foreground">
						{tCareers("becomeMentorDescription")}
					</p>
					<Button href="/careers-corner/apply" variant="solid" size="lg">
						{tCareers("applyToBecomeMentor")}
					</Button>
				</section>
			</FadeIn>
		</section>
	);
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "seo.careers" });
	return { title: t("title"), description: t("description") };
}

export default CareersCorner;
