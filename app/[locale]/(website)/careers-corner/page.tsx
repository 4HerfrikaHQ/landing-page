import type { Metadata } from "next";
import { FadeIn, StaggerContainer, StaggerItem, HoverCard } from "@/components/motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import type { Route } from "next";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { CareersHero } from "./_components/hero";
import MentorForm from "./_components/mentor-form";
import { MentorCard } from "./_components/mentor-modal";
import { getMentors } from "./_actions";

const CareersCorner = async ({ params }: { params: Promise<{ locale: string }> }) => {
	const { locale } = await params;
	setRequestLocale(locale as Locale);

  const [tCareers, tCommon, mentors] = await Promise.all([
		getTranslations("careers"),
		getTranslations("common"),
		getMentors()
	]);

	return (
		<section className="overflow-x-hidden">
			<CareersHero />

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
						<Image
							src={"/assets/careers/Adesewa.png"}
							alt="/"
							fill
							sizes="(max-width: 768px) 100vw, 50vw"
							className="object-cover object-top shadow-xl"
						/>
					</div>
					</FadeIn>
					<FadeIn direction="right">
					<div>
						<h3 className="uppercase text-primary-500 text-lg">
							{tCareers("featuredMentor")}
						</h3>
						<h2 className="text-4xl font-semibold my-3 flex justify-between items-end gap-4 flex-wrap text-foreground">
							Adesewa
							<span className="text-primary-500 text-sm">
								{tCareers("availability")}
							</span>{" "}
						</h2>
						<p className="text-foreground mb-4 capitalize">
							Product Manager & Product Designer
						</p>

						<p className="text-muted-foreground">
							Adesewa is a growth driven product designer and product manager.
							Over the last 3 years, she has designed, elevated and contributed
							to build products for thousands of users in different sectors like
							Web3, Fintech, Health, Education, Beauty, Logistics, Community and
							Gaming.
						</p>
						<div className="flex flex-col md:flex-row items-center gap-5 my-7 w-full justify-between">
							<Link href={"/" as Route} className="underline text-primary-500">
								{" "}
								{tCommon("messageOnLinkedin")}
							</Link>
							<Button variant="solid" size="lg" className="w-1/2">
								{tCommon("bookACall")}
							</Button>
						</div>
					</div>
					</FadeIn>
				</section>
			</section>

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

			<MentorForm />
		</section>
	);
};

export const metadata: Metadata = {
	title: "Career Corner — Free Mentorship & Career Guidance",
	description:
		"Book a free 10-minute call with experienced mentors in tech and business. Get career guidance, ask questions, and take the next step in your professional journey.",
};

export default CareersCorner;
