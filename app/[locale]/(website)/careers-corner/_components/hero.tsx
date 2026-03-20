"use client";

import { Search } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { PROFILE_IMAGES } from "../_schema";

export const CareersHero = () => {
	const t = useTranslations("careers");

	return (
		<section className="overflow-hidden grid place-content-center relative h-screen w-screen">
			<Image
				src="/assets/careers/Mask.png"
				alt=" "
				width={700}
				height={1000}
				className="absolute top-0 -left-28 h-full"
			/>
			<Image
				src="/assets/careers/Mask2.png"
				alt=" "
				width={700}
				height={1000}
				className="absolute bottom-0 -right-10"
			/>

			<div className="w-[50vw] h-[50vh] min-w-62 relative grid place-content-center">
				{PROFILE_IMAGES.map((profile, index) => (
					<motion.div
						key={profile.alt}
						className={`absolute ${profile.position}`}
						animate={{
							y: [0, -10, 5, 0],
							rotate: [0, 3, -3, 0],
						}}
						transition={{
							duration: profile.duration,
							repeat: Number.POSITIVE_INFINITY,
							ease: "easeInOut",
							delay: index * 0.3,
						}}
					>
						<Image
							src={profile.src}
							alt={profile.alt}
							width={700}
							height={1000}
							className={`${profile.size} object-cover object-top aspect-square rounded-full shadow-lg shadow-primary-300/50`}
							style={{
								filter: "drop-shadow(0 0 8px rgba(156, 163, 175, 0.5))",
							}}
						/>
					</motion.div>
				))}

				<h1 className="z-20 text-foreground text-center text-2xl md:text-3xl font-normal max-w-4xl">
					{t("heroText")}
				</h1>
				<form className="w-72 mx-auto shadow-inner shadow-primary-200/40 mt-6 flex items-center gap-4 px-4 py-3 rounded-full">
					<span className="bg-muted bg-opacity-50 rounded-full p-2 aspect-square grid place-content-center">
						<Search className="h-4 w-4 text-white" />{" "}
					</span>
					<input
						type="text"
						placeholder={t("searchMentor")}
						className="bg-transparent w-full"
					/>
				</form>
			</div>
		</section>
	);
};
