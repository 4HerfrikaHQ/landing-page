import { Button } from "@/components/Button";
import FrequentlyAskedQuestion from "@/components/FAQ/FAQ";
import { createClient } from "@/prismicio";
import { cn } from "@/utils/cn";
import type { Content } from "@prismicio/client";
import { PrismicImage } from "@prismicio/react";
import type { ImageField, KeyTextField } from "@prismicio/types";
import Image from "next/image";
import Link from "next/link";
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
						About 4HerFrika
					</h1>
					<p className="capitalize text-xl max-w-3xl mx-auto md:text-2xl font-semibold mb-14 text-center">
						At 4HerFrika, we strive to train, mentor, and empower women to
						become transformative leaders across Africa.
					</p>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
						<Button variant="outline-white">Make an impact</Button>
						<Button href="/contact-us">Contact Us</Button>
					</div>
				</div>
			</section>

			<section className="py-12 md:py-20 px-4 md:px-28 relative flex flex-col items-center">
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

			<section className="bg-primary-500/30 w-full py-12 md:py-20">
				<div className="container mx-auto px-4 flex flex-col md:flex-row gap-8">
					<div className="flex flex-col gap-10 justify-center items-center md:w-1/3">
						<h1 className="text-4xl md:text-5xl text-secondary-500 font-bold text-center">
							Core Values
						</h1>
						<Link
							href="/join-us"
							className="py-2 px-6 text-primary-500 border border-primary-500 w-fit rounded-full bg-transparent hover:bg-transparent hover:border-primary-500 hover:no-underline"
						>
							Join Us
						</Link>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center text-[#03065C] md:w-2/3">
						<div className="h-[242px] px-3.5 gap-4 border rounded border-secondary-500 justify-center flex flex-col items-center">
							<Image
								src="/assets/about/Empowerment.png"
								alt="Empowerment icon"
								width={70}
								height={70}
								className="rounded-3xl"
							/>
							<p className="text-base">Empowerment</p>
						</div>
						<div className="h-[242px] px-3.5 gap-4 border rounded border-secondary-500 justify-center flex flex-col items-center">
							<Image
								src="/assets/about/Growth.png"
								alt="Community Development icon"
								width={70}
								height={70}
								className="rounded-3xl"
							/>
							<p className="text-base">Community Development</p>
						</div>
						<div className="h-[242px] px-3.5 gap-4 border rounded border-secondary-500 justify-center flex flex-col items-center">
							<Image
								src="/assets/about/Leader.png"
								alt="Leadership icon"
								width={70}
								height={70}
								className="rounded-3xl"
							/>
							<p className="text-base">Leadership</p>
						</div>
						<div className="h-[242px] px-3.5 gap-4 border rounded border-secondary-500 justify-center flex flex-col items-center">
							<Image
								src="/assets/about/Conversation.png"
								alt="Mentorship icon"
								width={70}
								height={70}
								className="rounded-3xl"
							/>
							<p className="text-base">Mentorship</p>
						</div>
					</div>
				</div>
			</section>

			<section className="py-12 md:pt-20 md:pb-14 px-4 md:px-[90px] flex flex-col items-center">
				<h2 className="text-4xl md:text-[68px] text-gray-400 font-semibold mb-8 text-center">
					<span className="text-primary-500">F</span>requently{" "}
					<span className="text-primary-500">A</span>sked{" "}
					<span className="text-primary-500">Q</span>uestions
				</h2>
				<p className="text-md font-medium text-gray-400 max-w-[625px] text-center mb-12 md:mb-24">
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
			{/* <FaqBody /> */}
		</>
	);
}
