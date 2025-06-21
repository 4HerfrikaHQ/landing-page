import FrequentlyAskedQuestion from "@/components/FAQ/FAQ";
import { createClient } from "@/prismicio";
import { cn } from "@/utils/cn";
import type { Content } from "@prismicio/client";
import { PrismicImage } from "@prismicio/react";
import type { ImageField, KeyTextField } from "@prismicio/types";
import Link from "next/link";
import Sponsors from "../_components/sponsors";
import { CallForAction } from "./_components/call-for-action";
import { OurCore } from "./_components/our-core";
import { OurReach } from "./_components/our-reach";
import Squiggle from "./squiggle.svg";
import UnderlineSquiggle from "./underline-squiggle.svg";

const StatementSection = ({
	title,
	description,
	image,
	position,
}: {
	title: KeyTextField;
	description: KeyTextField;
	image: ImageField;
	position: null | "Left" | "Right";
}) => (
	<div
		className={cn("flex flex-col md:flex-row items-center gap-8", {
			"md:flex-row-reverse": position === "Left",
		})}
	>
		<div className="w-full md:w-1/2">
			<h4 className="text-2xl md:text-3xl text-gray-400 w-fit font-semibold border-b-[3px] border-primary-500 mb-6 outline-offset-2">
				{title}
			</h4>
			<p className="text-lg md:text-xl text-gray-300">{description}</p>
		</div>
		<figure className="rounded-xl overflow-hidden w-full md:w-1/2">
			<PrismicImage className="aspect-[2.09] w-full" field={image} />
		</figure>
	</div>
);

export default async function About() {
	const client = createClient();

	const page = await client.getSingle<Content.AboutPageDocument>("about_page");

	const { hero_image, statement_section, frequently_asked_questions } =
		page.data;

	return (
		<>
			<section className="relative min-h-[500px] xl:min-h-[70vh] w-full flex items-center justify-center">
				<div className="absolute top-0 left-0 size-full">
					<PrismicImage
						field={hero_image}
						className="object-cover object-center size-full"
					/>
					<div className="absolute top-0 left-0 size-full bg-black/70" />
				</div>
				<div className="container mx-auto px-4 flex flex-col items-center min-h-full h-full justify-center text-white relative">
					<h1 className="text-4xl md:text-[64px] font-bold mb-6 text-center">
						Who We Are
					</h1>
					<p className="capitalize text-xl max-w-3xl mx-auto md:text-2xl font-semibold mb-14 text-center">
						At 4HerFrika, we strive to train, mentor, and empower women to
						become transformative leaders across Africa.
					</p>
				</div>
			</section>

			<section className="py-12 md:py-20 px-4 xl:px-28 relative flex flex-col items-center">
				<Squiggle className="absolute top-0 right-2.5 hidden md:block" />
				<h2 className="text-2xl md:text-3xl font-semibold mb-4 text-center">
					Where Every Girl Achieves Their Goal
				</h2>
				<UnderlineSquiggle width={284} className="mb-12" />
				<div className="space-y-12 w-full max-w-7xl">
					{statement_section.map((section) => (
						<StatementSection
							key={section.title}
							title={section.title}
							description={section.description}
							image={section.image}
							position={section.image_position}
						/>
					))}
				</div>
			</section>

			<OurReach />
			<OurCore />
			<Sponsors />
			<CallForAction />

			<section className="py-12 md:pt-20 md:pb-14 px-4 md:px-[90px] flex flex-col items-center">
				<h2 className="text-4xl md:text-[68px] text-gray-400 font-semibold mb-8 text-center">
					<span className="text-primary-500">F</span>requently{" "}
					<span className="text-primary-500">A</span>sked{" "}
					<span className="text-primary-500">Q</span>uestions
				</h2>
				<p className="text-md md:text-lg font-medium text-gray-400 max-w-[625px] text-center mb-12 md:mb-24">
					In this section you can find all the answers you are probably looking
					for. If you still struggle with finding one - don&apos;t hesitate to{" "}
					<Link className="underline text-primary-500" href="/contact-us">
						contact us
					</Link>{" "}
					directly.
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
					href="/faq"
					className="text-primary-500 underline pr-5 self-end mt-8 md:mt-16"
				>
					See All FAQs
				</Link>
			</section>
		</>
	);
}
