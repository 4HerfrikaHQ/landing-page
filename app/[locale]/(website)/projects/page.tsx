import { Button } from "@/components/ui/button";
import { FadeIn, TextReveal } from "@/components/motion";
import { ArrowRight } from "lucide-react";
import type { Route } from "next";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import React from "react";
import { GalleryGrid } from "../blog/_components/gallery-grid";

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;
	setRequestLocale(locale as Locale);
	const t = await getTranslations("projects");
	const tc = await getTranslations("common");

	return (
		<main className="bg-background">
			<section className="relative">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 pb-20 md:pb-28">
					{/* Grid on desktop; stack on mobile/tablet */}
					<div className="lg:grid lg:grid-cols-12 lg:items-center lg:gap-10">
						{/* Copy */}
						<div className="lg:col-span-7 max-w-2xl">
							<span className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-pink-50 px-3 py-1 text-xs font-medium text-pink-700">
								{t("title")}
							</span>

							<h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.05]">
								<TextReveal>{t("heroTitle")}</TextReveal>
							</h1>

							<p className="mt-6 max-w-xl text-lg md:text-xl text-muted-foreground leading-relaxed">
								{t("heroDescription")}
							</p>

							<div className="mt-10 flex flex-col sm:flex-row gap-4">
								<Button
									href={"/about" as Route}
									variant="solid"
									className="px-8 py-3 md:py-4 text-base md:text-xl"
								>
									{tc("startAChapter")}
								</Button>
								<Button
									href={"/about" as Route}
									variant="outline"
									className="px-8 py-3 md:py-4 text-base md:text-xl"
								>
									{tc("learnMore")}
								</Button>
							</div>
						</div>

						{/* Art */}
						<FadeIn direction="right" delay={0.2} className="mt-10 lg:mt-0 lg:col-span-5">
							<div className="p-2.5 rounded-[30px] bg-[linear-gradient(135deg,#ff3ea5_0%,#a855f7_100%)] [clip-path:polygon(18%_0,100%_0,100%_78%,85%_100%,0_100%,0_12%)] shadow-[0_18px_40px_rgba(233,30,99,0.20)]">
								<div className="relative aspect-4/5 rounded-[24px] overflow-hidden bg-accent [clip-path:polygon(18%_0,100%_0,100%_78%,85%_100%,0_100%,0_12%)]">
									<Image
										src="https://images.unsplash.com/photo-1559323940-a48fb049eb23?q=80&auto=format&fit=crop&w=1600"
										alt="Young woman resting with thoughtful gaze"
										fill
										priority
										className="object-cover"
										sizes="(min-width:1024px) 40vw, 100vw"
									/>
									<div className="absolute inset-0 bg-linear-to-t from-black/15 via-transparent to-transparent" />
								</div>
							</div>
							<div className="mt-4 h-10 rounded-[24px] bg-pink-500/20 blur-2xl" />
						</FadeIn>
					</div>
				</div>
			</section>

			{/* INTRO */}
			<section className="px-4 sm:px-6 lg:px-8 pt-24 md:pt-28">
				<FadeIn>
					<div className="mx-auto max-w-7xl text-center">
						<h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
							{t("intro")}
						</h2>
						<p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed">
							{t("introFullDescription")}
						</p>
					</div>
				</FadeIn>
			</section>

			{/* FEATURED PROJECT A */}
			<section className="px-4 sm:px-6 lg:px-8 pt-16 md:pt-20">
				<div className="mx-auto max-w-7xl">
					<div className="rounded-3xl bg-background border border-border overflow-hidden">
						<div className="grid md:grid-cols-2">
							<FadeIn direction="left">
								<div className="relative aspect-4/3 md:h-full">
									<Image
										src="https://images.unsplash.com/photo-1635606906861-a3ac61bc1c78?w=1200&auto=format&fit=crop&q=70"
										alt="StopTheViolence project poster"
										fill
										className="object-cover md:rounded-l-3xl"
										sizes="(min-width: 1024px) 50vw, 100vw"
									/>
								</div>
							</FadeIn>

							<FadeIn direction="right" delay={0.15}>
								<div className="p-8 md:p-10 lg:p-12 flex flex-col justify-center">
									<p className="text-base md:text-lg lg:text-xl text-muted-foreground">
										{t("stopTheViolenceStats")}
									</p>
									<h3 className="mt-3 text-2xl md:text-3xl lg:text-4xl font-extrabold text-foreground">
										{t("stopTheViolenceTitle")}
									</h3>
									<p className="mt-5 text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed">
										{t("stopTheViolenceDescription")}
									</p>

									<div className="mt-8">
										<Button
											href={"/projects/stop-the-violence" as Route}
											variant="outline"
											className="px-6 py-3 text-base md:text-lg max-w-max"
										>
											<span className="mr-2">{tc("exploreProject")}</span>
											<ArrowRight className="h-4 w-4" aria-hidden="true" />
										</Button>
									</div>
								</div>
							</FadeIn>
						</div>
					</div>
				</div>
			</section>

			<section className="px-4 sm:px-6 lg:px-8 pt-20 md:pt-24 pb-28">
				<div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
					<FadeIn direction="left">
						<div>
							<p className="text-base md:text-lg lg:text-xl font-medium text-foreground">
								{t("techUp4HerStats")}
							</p>
							<h3 className="mt-3 text-2xl md:text-3xl lg:text-4xl font-extrabold text-foreground">
								{t("techUp4HerTitle")}
							</h3>
							<p className="mt-5 text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl">
								{t("techUp4HerDescription")}
							</p>

							<div className="mt-8">
								<Button
									href={"/projects/girls-tech-bootcamp" as Route}
									variant="outline"
									className="px-6 py-3 text-base md:text-lg max-w-max"
								>
									<span className="mr-2">{tc("seeDetails")}</span>
									<ArrowRight className="h-4 w-4" aria-hidden="true" />
								</Button>
							</div>
						</div>
					</FadeIn>

					<FadeIn direction="right" delay={0.15}>
						<div className="relative h-64 sm:h-80 md:h-96 rounded-3xl overflow-hidden border border-border">
							<Image
								src="https://images.unsplash.com/photo-1551836022-4c4c79ecde51?q=80&auto=format&fit=crop&w=1400"
								alt="TechUp4Her bootcamp session"
								fill
								className="object-cover"
								sizes="(min-width: 1024px) 50vw, 100vw"
							/>
							<div className="absolute bottom-4 right-4 rounded-full bg-pink-600 text-white text-xs font-medium px-4 py-1.5">
								{t("campusBootcamp")}
							</div>
						</div>
					</FadeIn>
				</div>
			</section>
			<section>
				<GalleryGrid />
			</section>
		</main>
	);
}
