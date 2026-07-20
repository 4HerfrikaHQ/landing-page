"use client";

import { Button } from "@/components/ui/button";
import {
	ArrowRight,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import { WaitlistModal } from "./waitlist-modal";

const paths = [
	{ key: "tech", image: "/assets/tech-divas.png" },
	{ key: "business", image: "/assets/boss-divas.png" },
	{ key: "climate", image: "/assets/about/Growth.png" },
] as const;

export function AcademyPage() {
	const t = useTranslations("academy");
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedAcademy, setSelectedAcademy] = useState<
		"tech" | "business" | "climate"
	>("tech");
	const [active, setActive] = useState(0);
	const open = (academy = paths[active].key) => {
		setSelectedAcademy(academy);
		setModalOpen(true);
	};
	const path = paths[active];
	return (
		<main>
			<section className="relative isolate flex min-h-[700px] items-center justify-center overflow-hidden bg-slate-900 px-6 py-28 text-white sm:min-h-[780px]">
				<Image
					src="/assets/home/hero.webp"
					alt=""
					fill
					priority
					className="-z-20 object-cover"
				/>
				<div className="absolute inset-0 -z-10 bg-black/65" />
				<div className="max-w-4xl text-center">
					<h1 className="text-5xl font-medium tracking-tight sm:text-7xl">
						{t("heroFirst")}
						<br />
						<em className="font-serif font-black text-primary-500">
							{t("heroSecond")}
						</em>
					</h1>
					<p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/90 sm:text-xl">
						{t("heroDescription")}
					</p>
					<div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
						<Button size="lg" onClick={() => open()} className="gap-2">
							{t("joinWaitlist")} <ArrowRight className="size-5" />
						</Button>
						<Button variant="outline-white" size="lg" href="/contact-us">
							{t("contactUs")}
						</Button>
					</div>
				</div>
			</section>
			<section className="bg-primary-50/30 px-6 py-20 sm:py-28">
				<div className="mx-auto max-w-7xl">
					<div className="grid items-start gap-12 lg:grid-cols-[.85fr_1.15fr]">
						<div>
							<h2 className="text-4xl font-bold leading-tight sm:text-5xl">
								{t("pathsFirst")}
								<br />
								<em className="font-serif text-primary-500">
									{t("pathsSecond")}
								</em>
							</h2>
							<p className="mt-8 max-w-md text-lg leading-8 text-muted-foreground">
								{t("pathsDescription")}
							</p>
							<div className="mt-10 flex gap-5">
								<button
									type="button"
									aria-label={t("previous")}
									onClick={() =>
										setActive((active + paths.length - 1) % paths.length)
									}
									className="grid size-11 place-items-center rounded-xl border border-border bg-white"
								>
									<ChevronLeft />
								</button>
								<button
									type="button"
									aria-label={t("next")}
									onClick={() => setActive((active + 1) % paths.length)}
									className="grid size-11 place-items-center rounded-xl border border-primary-500 bg-primary-50 text-primary-500"
								>
									<ChevronRight />
								</button>
							</div>
						</div>
						<article className="overflow-hidden rounded-[2rem] bg-white p-5 shadow-xl sm:p-8">
							<div className="relative aspect-[1.15] overflow-hidden rounded-[1.5rem]">
								<Image src={path.image} alt="" fill className="object-cover" />
							</div>
							<button
								type="button"
								onClick={() => open(path.key)}
								className="group mt-7 flex w-full items-start justify-between gap-5 text-left"
							>
								<div>
									<h3 className="text-2xl font-semibold">
										{t(`${path.key}Academy`)}
									</h3>
									<p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
										{t(`${path.key}Description`)}
									</p>
								</div>
								<span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-500 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1">
									<ArrowRight className="size-6" />
								</span>
							</button>
						</article>
					</div>
				</div>
			</section>
			<section className="bg-white px-6 py-20 sm:py-28">
				<div className="mx-auto max-w-6xl">
					<div className="text-center">
						<p className="text-sm font-semibold uppercase tracking-[.2em] text-primary-500">
							{t("howItWorksEyebrow")}
						</p>
						<h2 className="mt-4 text-4xl font-bold sm:text-5xl">
							{t("howItWorks")}
						</h2>
					</div>
					<div className="mt-14 grid gap-7 md:grid-cols-3">
						{["learn", "build", "lead"].map((item, i) => (
							<div
								key={item}
								className="rounded-3xl border border-border/60 p-7"
							>
								<span className="grid size-11 place-items-center rounded-full bg-primary-50 font-bold text-primary-500">
									0{i + 1}
								</span>
								<h3 className="mt-6 text-xl font-semibold">
									{t(`${item}Title`)}
								</h3>
								<p className="mt-3 leading-7 text-muted-foreground">
									{t(`${item}Description`)}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>
			<section className="bg-[#36398e] px-6 py-20 text-white">
				<div className="mx-auto grid max-w-6xl gap-10 text-center sm:grid-cols-3">
					{[
						["3000+", "girlsMentored", Users],
						["25+", "campuses", CheckCircle2],
						["1000+", "graduates", CheckCircle2],
					].map(([value, label, Icon]) => {
						const I = Icon as typeof Users;
						return (
							<div key={String(label)}>
								<I className="mx-auto size-7 text-primary-500" />
								<p className="mt-3 text-5xl font-bold">{value}</p>
								<p className="mt-2 text-white/80">{t(String(label))}</p>
							</div>
						);
					})}
				</div>
			</section>
			<section className="bg-primary-50 px-6 py-20 text-center">
				<h2 className="text-4xl font-bold">{t("ctaTitle")}</h2>
				<p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
					{t("ctaDescription")}
				</p>
				<Button size="lg" className="mt-8" onClick={() => open()}>
					{t("joinWaitlist")}
				</Button>
			</section>
			<WaitlistModal
				open={modalOpen}
				onOpenChange={setModalOpen}
				academy={selectedAcademy}
			/>
		</main>
	);
}
