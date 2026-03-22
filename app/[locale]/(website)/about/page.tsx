import type { Metadata } from "next";
import { cn } from "@/utils/cn";
import { FadeIn } from "@/components/motion";
import { PrismicImage } from "@prismicio/react";
import type { ImageField, KeyTextField } from "@prismicio/types";
import type { Route } from "next";
import Link from "next/link";
import { hasLocale } from "next-intl";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import FrequentlyAskedQuestion from "../(home)/_components/faq-section";
import Sponsors from "../_components/sponsors";
import { CallForAction } from "./_components/call-for-action";
import { OurCore } from "./_components/our-core";
import { OurReach } from "./_components/our-reach";
import Squiggle from "./squiggle";
import UnderlineSquiggle from "./underline-squiggle";
import { getAboutPage } from "./_actions";

const statementKeys = [
	{ title: "missionTitle", description: "missionDescription" },
	{ title: "visionTitle", description: "visionDescription" },
] as const;

const StatementSection = ({
	title,
	description,
	image,
	position,
	index,
}: {
	title: string;
	description: string;
	image: ImageField;
	position: null | "Left" | "Right";
	index: number;
}) => (
	<FadeIn direction={index % 2 === 0 ? "left" : "right"}>
		<div
			className={cn("flex flex-col md:flex-row items-center gap-8", {
				"md:flex-row-reverse": position === "Left",
			})}
		>
			<div className="w-full md:w-1/2">
				<h4 className="text-2xl md:text-3xl text-foreground w-fit font-semibold border-b-[3px] border-primary-500 mb-6 outline-offset-2">
					{title}
				</h4>
				<p className="text-lg md:text-xl text-muted-foreground">{description}</p>
			</div>
			<figure className="rounded-xl overflow-hidden w-full md:w-1/2">
				<PrismicImage className="aspect-[2.09] w-full" field={image} />
			</figure>
		</div>
	</FadeIn>
);

export const metadata: Metadata = {
	title: "About Us — Our Mission, Vision & Core Values",
	description:
		"4Herfrika trains, mentors, and empowers women to become transformative leaders across Africa. Our vision: impact 2 million women with tech and entrepreneurship by 2030.",
};

export default async function About({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) return null;
	setRequestLocale(locale as Locale);
	const t = await getTranslations("about");
	const page = await getAboutPage();

	const { hero_image, statement_section, frequently_asked_questions } =
		page.data;

	return (
		<>
			<section className="relative min-h-125 xl:min-h-[70vh] w-full flex items-center justify-center">
				<div className="absolute top-0 left-0 size-full">
					<PrismicImage
						field={hero_image}
						className="object-cover object-center size-full"
					/>
					<div className="absolute top-0 left-0 size-full bg-black/70" />
				</div>
				<div className="container mx-auto px-4 flex flex-col items-center min-h-full h-full justify-center text-white relative">
					<FadeIn delay={0.2}>
						<h1 className="text-4xl md:text-[64px] font-bold mb-6 text-center">
							{t("whoWeAre")}
						</h1>
						<p className="capitalize text-xl max-w-3xl mx-auto md:text-2xl font-semibold mb-14 text-center">
							{t("aboutDescription")}
						</p>
					</FadeIn>
				</div>
			</section>

			<section className="py-12 md:py-20 px-4 xl:px-28 relative flex flex-col items-center overflow-hidden">
				<Squiggle className="absolute -top-2 -right-6 hidden md:block w-48 lg:w-56 opacity-60" />
				<h2 className="text-2xl md:text-3xl font-semibold mb-4 text-center">
					{t("whereEveryGirl")}
				</h2>
				<UnderlineSquiggle width={284} className="mb-12" />
				<div className="space-y-12 w-full max-w-7xl">
					{statement_section.map((section, index) => (
						<StatementSection
							key={section.title}
							title={statementKeys[index] ? t(statementKeys[index].title) : String(section.title)}
							description={statementKeys[index] ? t(statementKeys[index].description) : String(section.description)}
							image={section.image}
							position={section.image_position}
							index={index}
						/>
					))}
				</div>
			</section>

			<OurReach />
			<OurCore />
			<Sponsors />
			<CallForAction />

			<section className="py-12 md:pt-20 md:pb-14 px-4 md:px-22.5 flex flex-col items-center">
				<h2 className="text-4xl md:text-[68px] text-foreground font-semibold mb-8 text-center">
					{t("faq")}
				</h2>
				<p className="text-md md:text-lg font-medium text-foreground max-w-156.25 text-center mb-12 md:mb-24">
					{t("faqDescription")}
				</p>
				<div className="space-y-6 w-full max-w-4xl">
					{frequently_asked_questions.map((question) => (
						<FrequentlyAskedQuestion
							question={String(question.question)}
							answer={String(question.answer)}
							key={question.question}
						/>
					))}
				</div>
				<Link
					href={"/faq" as Route}
					className="text-primary-500 underline pr-5 self-end mt-8 md:mt-16"
				>
					{t("seeAllFaqs")}
				</Link>
			</section>
		</>
	);
}
