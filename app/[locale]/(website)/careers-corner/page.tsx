import {
	FadeIn,
	HoverCard,
	StaggerContainer,
	StaggerItem,
} from "@/components/motion";
import { Button } from "@/components/ui/button";
import { setLocaleFromParams } from "@/i18n/set-locale-from-params";
import type { Metadata } from "next";
import { UserRound } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { getMentors } from "./_actions";
import { BecomeAMentorForm } from "./_components/become-a-mentor-form";
import { CareersHero } from "./_components/hero";
import { MentorCard } from "./_components/mentor-modal";
import { resolveFeaturedMentor } from "@/src/lib/featured-mentor";

const CareersCorner = async ({
	params,
}: { params: Promise<{ locale: string }> }) => {
	await setLocaleFromParams(params);

	const [tCareers, tCommon, mentors, featured] = await Promise.all([
		getTranslations("careers"),
		getTranslations("common"),
		getMentors(),
		resolveFeaturedMentor(),
	]);

	const featuredName = featured ? featured.nickname || featured.name : null;

	return (
		<section className="overflow-x-hidden">
			<CareersHero />

			{featured && (
				<section className="bg-muted">
					<section className="container mx-auto h-full grid md:grid-cols-2 grid-cols-1 gap-10 items-center py-8 md:py-12 lg:py-16 xl:py-20 px-4 sm:px-6 lg:px-8">
						<FadeIn direction="left">
							<div className="relative w-full h-150">
								<div className="absolute -bottom-12 -right-10 size-40 rounded-full aspect-square border-50 z-10 border-white" />
								<Image
									src="/assets/careers/Star-2.png"
									alt="star"
									width={300}
									height={400}
									className="absolute -top-6 -left-5 size-12 object-contain animate-pulse"
								/>
								<Image
									src="/assets/careers/Star-1.png"
									alt="star"
									width={300}
									height={400}
									className="absolute -top-6 -right-5 size-12 object-contain animate-pulse"
									style={{ animationDelay: "0.5s" }}
								/>
								<Image
									src="/assets/careers/Star-1.png"
									alt="star"
									width={300}
									height={400}
									className="absolute -bottom-6 -left-5 size-12 object-contain animate-pulse"
									style={{ animationDelay: "1s" }}
								/>
								{featured.image ? (
									<Image
										src={featured.image}
										alt={featured.name}
										fill
										sizes="(max-width: 768px) 100vw, 50vw"
										unoptimized={featured.image.includes("localhost")}
										className="object-cover object-top shadow-xl"
									/>
								) : (
									<div className="flex h-full w-full items-center justify-center bg-secondary-500/40 shadow-xl">
										<UserRound className="size-28 text-white/70" />
									</div>
								)}
							</div>
						</FadeIn>
						<FadeIn direction="right">
							<div>
								<h3 className="uppercase text-primary-500 text-lg">
									{tCareers("featuredMentor")}
								</h3>
								<h2 className="text-4xl font-semibold my-3 text-foreground">
									{featuredName}
								</h2>
								<p className="text-foreground mb-4 capitalize">
									{featured.position}
								</p>

								{featured.bio && (
									<p className="text-muted-foreground whitespace-pre-line">
										{featured.bio}
									</p>
								)}
								<div className="flex flex-col md:flex-row items-center gap-5 my-7 w-full justify-between">
									{featured.linkedin_url && (
										<Link
											href={featured.linkedin_url}
											target="_blank"
											rel="noopener noreferrer"
											className="underline text-primary-500"
										>
											{tCommon("messageOnLinkedin")}
										</Link>
									)}
									<Button
										variant="solid"
										size="lg"
										href={`/careers-corner/${featured.slug}`}
										className="w-1/2"
									>
										{tCommon("bookACall")}
									</Button>
								</div>
							</div>
						</FadeIn>
					</section>
				</section>
			)}

			<section className="bg-primary-500 py-8 md:py-12 lg:py-16 xl:py-20 px-4 sm:px-6 lg:px-8">
				<section className="container mx-auto">
					<h2 className="text-white text-4xl text-center font-semibold mb-3">
						{tCareers("bookCounseling")}
					</h2>
					<p className="text-center text-white/70">
						{tCareers("counselingDescription")}
					</p>
					<StaggerContainer className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
						{mentors.map((mentor) => (
							<StaggerItem key={mentor.id}>
								<HoverCard>
									<MentorCard mentor={mentor} />
								</HoverCard>
							</StaggerItem>
						))}
					</StaggerContainer>
				</section>
			</section>

			<FadeIn>
				<section
					id="become-a-mentor"
					className="container max-w-3xl mx-auto py-8 md:py-12 lg:py-16 xl:py-20 px-4 sm:px-6 lg:px-8 scroll-m-8"
				>
					<h2 className="text-4xl font-bold text-center mb-2">
						{tCareers("becomeMentor")}
					</h2>
					<p className="text-muted-foreground text-center mb-8">
						{tCareers("becomeMentorDescription")}
					</p>
					<BecomeAMentorForm />
				</section>
			</FadeIn>
		</section>
	);
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Career Corner — Free Mentorship & Career Guidance",
	description:
		"Book a free 10-minute call with experienced mentors in tech and business. Get career guidance, ask questions, and take the next step in your professional journey.",
};

export default CareersCorner;
