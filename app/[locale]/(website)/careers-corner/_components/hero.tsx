"use client";

import { isLocalImageUrl } from "@/src/lib/image-url";
// import { Search } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import type { HeroMentor } from "../_actions";
import { HERO_SLOTS } from "../_schema";

type CareersHeroProps = {
	mentors: HeroMentor[];
};

export const CareersHero = ({ mentors }: CareersHeroProps) => {
	const t = useTranslations("careers");

	const floatingMentors = mentors.slice(0, HERO_SLOTS.length);

	return (
		<section className="overflow-hidden grid place-content-center relative min-h-[60vh] w-full pt-28 pb-16">
			<Image
				src="/assets/careers/Mask.png"
				alt=""
				width={700}
				height={1000}
				className="absolute top-0 -left-28 h-full"
				style={{ width: "auto" }}
			/>
			<Image
				src="/assets/careers/Mask2.png"
				alt=""
				width={700}
				height={1000}
				className="absolute bottom-0 -right-10"
				style={{ width: "auto" }}
			/>

			<div className="w-[50vw] min-w-62 relative grid place-content-center">
				{floatingMentors.map((mentor, index) => {
					const slot = HERO_SLOTS[index];

					return (
						<motion.div
							key={mentor.slug}
							className={`absolute ${slot.position}`}
							animate={{
								y: [0, -10, 5, 0],
								rotate: [0, 3, -3, 0],
							}}
							transition={{
								duration: slot.duration,
								repeat: Number.POSITIVE_INFINITY,
								ease: "easeInOut",
								delay: index * 0.3,
							}}
						>
							<Image
								src={mentor.image}
								alt={mentor.name}
								width={700}
								height={1000}
								unoptimized={isLocalImageUrl(mentor.image)}
								className={`${slot.size} object-cover object-top aspect-square rounded-full shadow-lg shadow-primary-300/50`}
								style={{
									filter: "drop-shadow(0 0 8px rgba(156, 163, 175, 0.5))",
								}}
							/>
						</motion.div>
					);
				})}

				<h1 className="z-20 text-foreground text-center text-2xl md:text-3xl font-normal max-w-4xl">
					{t("heroText")}
				</h1>
				{/* <form className="w-72 mx-auto shadow-inner shadow-primary-200/40 mt-6 flex items-center gap-4 px-4 py-3 rounded-full">
					<span className="bg-muted bg-opacity-50 rounded-full p-2 aspect-square grid place-content-center">
						<Search className="h-4 w-4 text-white" />{" "}
					</span>
					<input
						type="text"
						placeholder={t("searchMentor")}
						className="bg-transparent w-full"
					/>
				</form> */}
			</div>
		</section>
	);
};
