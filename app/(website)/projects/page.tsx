import { Button } from "@/components/Button";
import Image from "next/image";
import React from "react";
import { GalleryGrid } from "../blog/_components/gallery-grid";

export default function ProjectsPage() {
	return (
		<main className="bg-white">
			<section className="relative">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 pb-20 md:pb-28">
					{/* Grid on desktop; stack on mobile/tablet */}
					<div className="lg:grid lg:grid-cols-12 lg:items-center lg:gap-10">
						{/* Copy */}
						<div className="lg:col-span-7 max-w-2xl">
							<span className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-pink-50 px-3 py-1 text-xs font-medium text-pink-700">
								Projects
							</span>

							<h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.05]">
								At 4HerFrika, We
								<br className="hidden sm:block" />
								Believe In Doing, Not
								<br className="hidden sm:block" />
								Just Dreaming.
							</h1>

							<p className="mt-6 max-w-xl text-lg md:text-xl text-gray-600 leading-relaxed">
								Our Projects are grassroots-driven, impact-focused, and designed
								to uplift girls across Africa through education, technology, and
								leadership.
							</p>

							<div className="mt-10 flex flex-col sm:flex-row gap-4">
								<Button
									href="/about"
									variant="solid"
									className="px-8 py-3 md:py-4 text-base md:text-xl"
								>
									Start a Chapter
								</Button>
								<Button
									href="/about"
									variant="outline"
									className="px-8 py-3 md:py-4 text-base md:text-xl"
								>
									Learn more
								</Button>
							</div>
						</div>

						{/* Art */}
						<div className="mt-10 lg:mt-0 lg:col-span-5">
							<div className="p-[10px] rounded-[30px] bg-[linear-gradient(135deg,#ff3ea5_0%,#a855f7_100%)] [clip-path:polygon(18%_0,100%_0,100%_78%,85%_100%,0_100%,0_12%)] shadow-[0_18px_40px_rgba(233,30,99,0.20)]">
								<div className="relative aspect-[4/5] rounded-[24px] overflow-hidden bg-gray-300 [clip-path:polygon(18%_0,100%_0,100%_78%,85%_100%,0_100%,0_12%)]">
									<Image
										src="https://images.unsplash.com/photo-1559323940-a48fb049eb23?q=80&auto=format&fit=crop&w=1600"
										alt="Young woman resting with thoughtful gaze"
										fill
										priority
										className="object-cover"
										sizes="(min-width:1024px) 40vw, 100vw"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
								</div>
							</div>
							<div className="mt-4 h-10 rounded-[24px] bg-pink-500/20 blur-2xl" />
						</div>
					</div>
				</div>
			</section>

			{/* INTRO */}
			<section className="px-4 sm:px-6 lg:px-8 pt-24 md:pt-28">
				<div className="mx-auto max-w-7xl text-center">
					<h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
						4HerAfrika
					</h2>
					<p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-gray-600 leading-relaxed">
						4HerAfrika is a movement dedicated to empowering young women across
						Africa through technology, leadership, and entrepreneurship. We
						build grassroots-driven programs that equip girls with digital
						skills, connect them to mentorship, and support them in becoming
						leaders and changemakers in their communities.
					</p>
				</div>
			</section>

			{/* FEATURED PROJECT A */}
			<section className="px-4 sm:px-6 lg:px-8 pt-16 md:pt-20">
				<div className="mx-auto max-w-7xl">
					<div className="rounded-3xl bg-white border border-gray-200 overflow-hidden">
						<div className="grid md:grid-cols-2">
							<div className="relative aspect-[4/3] md:h-full">
								<Image
									src="https://images.unsplash.com/photo-1635606906861-a3ac61bc1c78?w=1200&auto=format&fit=crop&q=70"
									alt="StopTheViolence project poster"
									fill
									className="object-cover md:rounded-l-3xl"
									sizes="(min-width: 1024px) 50vw, 100vw"
								/>
							</div>

							<div className="p-8 md:p-10 lg:p-12 flex flex-col justify-center">
								<p className="text-base md:text-lg lg:text-xl text-gray-500">
									17+ chapters established in 2+ African countries.
								</p>
								<h3 className="mt-3 text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900">
									The ‘StopTheViolence’ Project
								</h3>
								<p className="mt-5 text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed">
									The StopTheViolence project delves into these causes,
									exploring their effects and potential consequences on
									students’ lives.
								</p>

								<div className="mt-8">
									<Button
										href="/projects/stop-the-violence"
										variant="outline"
										className="px-6 py-3 text-base md:text-lg max-w-[max-content]"
									>
										<span className="mr-2">Explore Project</span>
										<svg
											className="h-4 w-4"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											aria-hidden="true"
										>
											<path d="M5 12h14" />
											<path d="M12 5l7 7-7 7" />
										</svg>
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* FEATURED PROJECT B */}
			<section className="px-4 sm:px-6 lg:px-8 pt-20 md:pt-24 pb-28">
				<div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
					<div>
						<p className="text-base md:text-lg lg:text-xl font-medium text-gray-700">
							200+ girls trained since launch.
						</p>
						<h3 className="mt-3 text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900">
							TechUp4Her
						</h3>
						<p className="mt-5 text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-xl">
							A digital skills bootcamp for girls, from zero knowledge to
							tech-savvy in UI/UX Design, Web Dev, and Digital Literacy.
						</p>

						<div className="mt-8">
							<Button
								href="/projects/girls-tech-bootcamp"
								variant="outline"
								className="px-6 py-3 text-base md:text-lg max-w-[max-content]"
							>
								<span className="mr-2">See Details</span>
								<svg
									className="h-4 w-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									aria-hidden="true"
								>
									<path d="M5 12h14" />
									<path d="M12 5l7 7-7 7" />
								</svg>
							</Button>
						</div>
					</div>

					<div className="relative h-64 sm:h-80 md:h-96 rounded-3xl overflow-hidden border border-gray-200">
						<Image
							src="https://images.unsplash.com/photo-1551836022-4c4c79ecde51?q=80&auto=format&fit=crop&w=1400"
							alt="TechUp4Her bootcamp session"
							fill
							className="object-cover"
							sizes="(min-width: 1024px) 50vw, 100vw"
						/>
						<div className="absolute bottom-4 right-4 rounded-full bg-pink-600 text-white text-xs font-medium px-4 py-1.5">
							4Herfrika | Campus Bootcamp
						</div>
					</div>
				</div>
			</section>

			{/* GALLERY */}
			<section>
				<GalleryGrid />
			</section>
		</main>
	);
}
