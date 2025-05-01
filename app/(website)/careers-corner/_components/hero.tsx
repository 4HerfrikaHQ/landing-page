"use client";

import Image from "next/image";
import React, { useEffect } from "react";
import { FaSearch } from "react-icons/fa";

export const CareersHero = () => {
	useEffect(() => {
		const animateProfiles = () => {
			const profiles = document.querySelectorAll<HTMLElement>(".profile-image");
			profiles.forEach((profile, index) => {
				// Create a floating animation effect
				profile.style.animation = `float ${3 + index * 0.5}s ease-in-out infinite alternate`;
			});
		};

		animateProfiles();
	}, []);

	return (
		<section className="overflow-hidden grid place-content-center relative h-[75dvh]">
			<Image
				src={"/assets/careers/Mask.png"}
				alt=" "
				width={700}
				height={1000}
				className="absolute top-0 -left-28 h-full"
			/>
			<Image
				src={"/assets/careers/Mask2.png"}
				alt=" "
				width={700}
				height={1000}
				className="absolute bottom-0 -right-10"
			/>
			<div className="w-[50vw] h-[45vh] min-w-62 relative grid place-content-center">
				{/* Add custom animations to profile images with shadows */}
				<Image
					src={"/assets/careers/Adesewa.png"}
					alt="Adesewa"
					width={700}
					height={1000}
					className="size-20 absolute top-1/4 -right-32 md:-right-32 object-cover object-top aspect-square rounded-full profile-image shadow-lg shadow-primary-300/50"
					style={{
						filter: "drop-shadow(0 0 10px rgba(156, 163, 175, 0.5))",
					}}
				/>
				<Image
					src={"/assets/careers/Dolapo.png"}
					alt="Dolapo"
					width={700}
					height={1000}
					className="size-16 absolute -top-20 right-0 md:right-20 object-cover object-top aspect-square rounded-full profile-image shadow-lg shadow-primary-300/50"
					style={{
						filter: "drop-shadow(0 0 8px rgba(156, 163, 175, 0.5))",
					}}
				/>
				<Image
					src={"/assets/careers/Ruphina.png"}
					alt="Ruphina"
					width={700}
					height={1000}
					className="size-16 object-cover object-top absolute -top-20 left-0 md:left-20 aspect-square rounded-full profile-image shadow-lg shadow-primary-300/50"
					style={{
						filter: "drop-shadow(0 0 8px rgba(156, 163, 175, 0.5))",
					}}
				/>
				<Image
					src={"/assets/careers/sharon.png"}
					alt="Sharon"
					width={700}
					height={1000}
					className="size-16 object-cover absolute -top-2 -left-20 md:-left-24 object-top aspect-square rounded-full profile-image shadow-lg shadow-primary-300/50"
					style={{
						filter: "drop-shadow(0 0 8px rgba(156, 163, 175, 0.5))",
					}}
				/>
				<Image
					src={"/assets/careers/sosanya.png"}
					alt="Sosanya"
					width={700}
					height={1000}
					className="size-12 object-cover object-top absolute bottom-8 -left-20 aspect-square rounded-full profile-image shadow-lg shadow-primary-300/50"
					style={{
						filter: "drop-shadow(0 0 6px rgba(156, 163, 175, 0.5))",
					}}
				/>
				<Image
					src={"/assets/careers/Hassanat.png"}
					alt="Hassanat"
					width={700}
					height={1000}
					className="size-12 absolute bottom-8 -right-20 object-cover object-top aspect-square rounded-full profile-image shadow-lg shadow-primary-300/50"
					style={{
						filter: "drop-shadow(0 0 6px rgba(156, 163, 175, 0.5))",
					}}
				/>
				<h1 className="z-20 text-gray-400 text-center text-2xl md:text-3xl font-normal max-w-4xl">
					Welcome to{" "}
					<span className="text-primary-500">&apos;Career Corner&apos;</span>,
					where you can book a 10 mins call with a mentor for free to ask
					questions
				</h1>
				<form className="w-72 mx-auto shadow-inner shadow-primary-200/40 mt-6 flex items-center gap-4 px-4 py-3 rounded-full">
					<span className="bg-gray-500 bg-opacity-50 rounded-full p-2 aspect-square grid place-content-center">
						<FaSearch className="text-white" />{" "}
					</span>
					<input
						type="text"
						placeholder="Search mentor"
						className="bg-transparent w-full"
					/>
				</form>
			</div>
			<style
				// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
				dangerouslySetInnerHTML={{
					__html: `
					@keyframes float {
						0% {
							transform: translateY(0) rotate(0deg);
						}
						50% {
							transform: translateY(-10px) rotate(3deg);
						}
						100% {
							transform: translateY(5px) rotate(-3deg);
						}
					}
				`,
				}}
			/>
		</section>
	);
};
