import TestimonialCarouselDots from "@/app/(website)/testimonial-carousel-dots";
import { Button } from "@/components/Button";
import { TestimonialCard } from "@/components/TestimonialCard";
import { createClient } from "@/prismicio";
import { JOIN_FORM_LINK } from "@/utils/constants";
import type { Content } from "@prismicio/client";
import { PrismicImage } from "@prismicio/react";
import Image from "next/image";
import Link from "next/link";
import { FaArrowRightLong } from "react-icons/fa6";
import AfricaLogo from "./africa-logo.svg";
import CurvedArrowIcon from "./curved-arrow.svg";
import HeroCurveIcon from "./hero-curve.svg";

const Statistic = ({
	value,
	label,
}: { value: number | null; label: string }) => (
	<div className="text-gray-400">
		<h3 className="text-4xl lg:text-5xl font-bold text-center">
			{value}
			<span className="text-primary-500">+</span>
		</h3>
		<p className="text-base text-center mt-2 font-medium capitalize">{label}</p>
	</div>
);

const Community = ({
	image,
	name,
	description,
}: { image: string; name: string; description: string }) => (
	<div className="px-4 py-4 sm:px-6 md:px-8 lg:px-12 rounded-3xl w-full">
		<Image
			src={image}
			alt="person"
			width={1030}
			height={1000}
			className="w-24 lg:w-32 object-cover aspect-square rounded-full"
		/>
		<h3 className="text-gray-400 text-2xl lg:text-3xl font-bold mt-3 capitalize">
			{name}
		</h3>
		<p className="text-base lg:text-xl text-gray-300 mt-2 mb-4">
			{description}
		</p>
		<Link
			href={"/"}
			className="text-primary-500 flex capitalize items-center gap-2 text-base lg:text-xl"
		>
			Explore community <FaArrowRightLong className="text-md" />
		</Link>
	</div>
);

export default async function HomePage() {
	const client = createClient();

	const page = await client.getSingle<Content.HomepageDocument>("homepage");

	const {
		testimonials,
		ambassador_description,
		ambassador_image,
		ambassador_link,
		hero_image,
		members,
		campuses,
		countries,
	} = page.data;

	return (
		<section className="bg-white w-screen overflow-hidden">
			<section className="px-4 sm:px-6 md:px-7 relative">
				<div className="w-60 sm:w-72 md:w-80 h-60 sm:h-72 md:h-80 rounded-full top-0 left-0 bg-primary-500/20 absolute blur-[374px]" />
				<div className="w-60 sm:w-72 md:w-80 h-60 sm:h-72 md:h-80 rounded-full top-0 right-0 bg-primary-500/20 absolute blur-[374px]" />
				<HeroCurveIcon
					width="100%"
					className="w-full h-full left-0 -bottom-4 sm:-bottom-6 md:-bottom-8 lg:bottom-20 absolute -z-1"
				/>

				<section className="grid lg:grid-cols-[1fr_1.2fr] justify-between gap-6 sm:gap-8 w-full pt-6 sm:pt-8 md:pt-16 lg:pt-32 mx-auto relative z-1 md:container">
					<div className="w-full">
						<h1 className="text-gray-400 text-center lg:text-left text-4xl lg:text-6xl leading-normal lg:leading-[96px] mb-3 lg:mb-8 lg:tracking-widest font-bold capitalize">
							Raising{" "}
							<span className="text-primary-500">
								World<span className="hidden lg:inline">-</span> <br /> class
							</span>{" "}
							women
						</h1>
						<PrismicImage
							field={hero_image}
							className="aspect-[1.16] mx-auto object-cover lg:hidden mb-4 w-full max-w-md"
							width={278}
						/>
						<p className="text-lg lg:text-2xl text-gray-300 mb-6 lg:mb-14 tracking-wider max-w-[730px] text-center lg:text-left">
							4HERFRIKA is raising world class female leaders at the
							intersection of business and technology
						</p>
						<div className="flex items-center gap-3 sm:gap-4 lg:gap-5 justify-center lg:justify-start flex-wrap">
							<Button
								href="/about"
								variant="outline"
								className="w-40 md:w-auto px-8 py-3 md:py-4 text-base md:text-xl"
							>
								Learn more
							</Button>
							<Button
								href={JOIN_FORM_LINK}
								isExternal
								variant="solid"
								className="w-40 md:w-auto px-8 py-3 md:py-4 text-base md:text-xl"
							>
								Get started
							</Button>
						</div>
					</div>
					<div className="hidden lg:block relative aspect-square self-end max-w-2xl">
						<PrismicImage
							field={hero_image}
							className="aspect-[1.16] object-cover"
							width={723}
						/>
					</div>
				</section>
				<section className="py-12 md:py-16 mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-0 z-10 relative">
					<Statistic value={members} label="members" />
					<hr className="hidden sm:block border h-16 md:h-20 lg:h-24 w-0 border-primary-500 mx-4 md:mx-8 lg:mx-24" />
					<Statistic value={campuses} label="campuses" />
					<hr className="hidden sm:block border h-16 md:h-20 lg:h-24 w-0 border-primary-500 mx-4 md:mx-8 lg:mx-24" />
					<Statistic value={countries} label="african countries" />
				</section>
				<CurvedArrowIcon className="text-center mt-4 mx-auto mb-7 w-24 lg:w-32" />
			</section>

			{/* Explore Community Section */}
			<section className="px-5 lg:px-0 container my-6 lg:my-8 gap-5 flex flex-col lg:flex-row lg:gap-x-11 items-start lg:items-center mx-auto relative">
				<Community
					image="/assets/boss-divas.png"
					name="Boss Divas"
					description="A sub-community that caters to young female entrepreneurs with an extended vision to reach young girls in marginalized communities."
				/>
				<div className="hidden lg:block h-[240px] w-[2px] bg-primary-500" />
				<Community
					image="/assets/tech-divas.png"
					name="Tech Divas"
					description="A sub-community that caters to women in tech with an extended vision to reach rural communities with digital skills."
				/>
				<div className="absolute size-[306px] bottom-0 right-0 bg-primary-500 opacity-30 blur-[374px]" />
			</section>
			{/* Words of the street */}
			{testimonials.length > 0 && (
				<section className="relative bg-neutral-400 px-4 py-12 lg:px-7 lg:pt-20 lg:pb-24">
					<AfricaLogo className="w-24 absolute -right-12 top-24 lg:w-[270px] lg:-right-8 lg:top-8" />
					<AfricaLogo className="hidden lg:block w-[270px] absolute left-4 bottom-0" />

					<h1 className="text-center text-gray-400 text-3xl lg:text-4xl font-semibold mb-4 lg:mb-8">
						<span className="text-primary-500">Words</span> on The{" "}
						<span className="text-primary-500">Street</span>
					</h1>

					<p className="text-center text-gray-400 text-lg mb-8 lg:text-xl">
						Take a look at what our members say!
					</p>

					<div className="container mx-auto px-2">
						<div className="flex gap-8 overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-2 md:gap-12 md:overflow-visible md:snap-none h-full">
							{/* Spacer for mobile snapping */}
							<div className="flex-shrink-0 w-4 md:hidden" />

							{testimonials.map((testimonial) => (
								<div className="flex-shrink-0 h-full " key={testimonial.name}>
									<TestimonialCard testimonial={testimonial} />
								</div>
							))}
						</div>
					</div>
					<TestimonialCarouselDots dotsCount={testimonials.length} />
				</section>
			)}

			<section className="px-4 sm:px-6 md:px-7 container mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-6 sm:gap-8 w-full lg:pt-20 py-12 lg:pb-28">
				<div>
					<h3 className="text-gray-400 text-center lg:text-left text-3xl lg:text-4xl font-bold capitalize tracking-wide mb-3 sm:mb-4 lg:mb-6">
						Become an ambassador{" "}
					</h3>
					<p className=" text-center lg:text-left text-lg lg:text-xl text-gray-300 mb-4 sm:mb-6 lg:mb-9">
						{ambassador_description}
					</p>
					<div className="lg:hidden relative w-full aspect-[1.16]">
						<PrismicImage
							field={ambassador_image}
							className="object-cover rounded-xl w-full h-full"
						/>
					</div>
					<div className="flex items-center gap-3 sm:gap-4 mt-8 lg:mt-0 lg:gap-6 flex-wrap justify-center lg:justify-start">
						<Button
							href="/"
							variant="outline"
							className="px-8 py-3 md:py-4 text-base md:text-xl"
						>
							View Projects
						</Button>

						<Button
							className=" px-8 py-3 md:py-4 text-base md:text-xl"
							href={ambassador_link.text || "/"}
							isExternal
						>
							Join Us
						</Button>
					</div>
				</div>
				<div className="hidden lg:block relative w-full aspect-[1.16]">
					<PrismicImage
						field={ambassador_image}
						className="object-cover rounded-xl w-full h-full"
					/>
				</div>
			</section>
		</section>
	);
}
