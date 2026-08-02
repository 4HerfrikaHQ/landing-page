"use client";

import {
	type Review,
	ReviewsSection,
} from "@/components/reviews/reviews-section";
import { Button } from "@/components/ui/button";
import {
	ArrowLeft,
	ArrowRight,
	Instagram,
	Linkedin,
	Twitter,
} from "lucide-react";
import type { Route } from "next";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { LocaleSwitcher } from "../../_components/locale-switcher";
import { SubscribeFormClient } from "../../_components/subscribe-client";
import { JOIN_US_URL } from "../../navigation";
import { WaitlistModal } from "./waitlist-modal";

const academies = [
	{
		academy: "tech",
		name: "Tech Academy",
		description:
			"Master product design, web development, product management, and more. Join 1000+ women already shaping Africa's tech future.",
		image: "/assets/academy/tech-source.jpg",
	},
	{
		academy: "business",
		name: "Business Academy",
		description:
			"Turn your ideas into sustainable ventures with practical business skills, mentorship, and a community built to help you grow.",
		image: "/assets/academy/business-source.png",
	},
	{
		academy: "climate",
		name: "Climate Academy",
		description:
			"Shape Africa's environmental future. Build the skills to lead in green innovation, sustainability, and climate advocacy.",
		image: "/assets/academy/climate-source.jpg",
	},
] as const;

type Academy = (typeof academies)[number]["academy"];

const ACADEMY_CARD_GAP = 32;
const ACADEMY_CARD_BLEED = 24;
const ACADEMY_COPY_COUNT = 3;

function getAcademyStep(carousel: HTMLDivElement) {
	const cards = carousel.querySelectorAll<HTMLElement>("article");
	const firstCard = cards[0];
	const secondCard = cards[1];

	if (firstCard && secondCard) {
		return (
			secondCard.getBoundingClientRect().left -
			firstCard.getBoundingClientRect().left
		);
	}

	return (firstCard?.getBoundingClientRect().width ?? 0) + ACADEMY_CARD_GAP;
}

function getAcademyScrollPosition(position: number, step: number) {
	return Math.max(0, position * step - ACADEMY_CARD_BLEED);
}

const academyTranslationKeys = {
	tech: { name: "techAcademy", description: "techDescription" },
	business: { name: "businessAcademy", description: "businessDescription" },
	climate: { name: "climateAcademy", description: "climateDescription" },
} as const;

const testimonials: readonly Review[] = [
	{
		id: "adesola-adewale",
		quote:
			"I came with no tech background. Now I'm a product designer at a global firm. This academy changed my entire career trajectory.",
		name: "Adesola Adewale",
		title: "Founder, ReadEvolve",
		image: { src: "/assets/academy/adesola_crop.png", alt: "Adesola Adewale" },
	},
	{
		id: "adeleke-glory",
		quote:
			"I walked in with an idea. I walked out with a registered business, three clients, and the confidence to lead a team.",
		name: "Adeleke Glory",
		title: "Student, Lautech Campus",
		image: { src: "/assets/academy/glory_crop.png", alt: "Adeleke Glory" },
	},
	{
		id: "elizabeth-akinmolayan",
		quote:
			"The Climate Academy gave me the language and the network to turn frustration into a movement in my community.",
		name: "Elizabeth Akinmolayan",
		title: "Student, FUTA Campus",
		image: {
			src: "/assets/academy/elizabeth_crop.png",
			alt: "Elizabeth Akinmolayan",
		},
	},
	{
		id: "olafisoye-theresa",
		quote:
			"The Climate Academy gave me the language and the network to turn frustration into a movement in my community.",
		name: "Olafisoye Theresa",
		title: "Campus lead, 4Herfrika FUTA campus",
		image: {
			src: "/assets/academy/theresa_crop.png",
			alt: "Olafisoye Theresa",
		},
	},
] as const;

const navLinks = [
	["About Us", "/about"],
	["Projects", "/projects"],
	["Academy", "/academy"],
	["Career Corner", "/careers-corner"],
	["Blog", "/blog"],
	["Contact Us", "/contact-us"],
] as const;

function AcademyNav() {
	return (
		<>
			<nav className="fixed left-1/2 top-6 z-50 hidden h-16 w-[calc(100%-206px)] max-w-[1258px] -translate-x-1/2 items-center rounded-full bg-white px-3 shadow-[0_4px_20px_rgba(0,0,0,0.08)] xl:flex">
				<Link href={"/" as Route} className="shrink-0">
					<Image
						src="/assets/academy/academy-logo.png"
						alt="4Herfrika"
						width={127}
						height={36}
						className="h-9 w-[127px] object-contain"
					/>
				</Link>
				<div className="ml-auto flex h-full items-center gap-5 whitespace-nowrap text-[17px] text-[#333] min-[1400px]:gap-[30px]">
					{navLinks.map(([label, href]) => (
						<Link
							key={label}
							href={href}
							className={label === "Academy" ? "text-[#ec008c] underline" : ""}
						>
							{label}
						</Link>
					))}
				</div>
				<div className="ml-6">
					<LocaleSwitcher />
				</div>
				<div className="ml-8 flex items-center gap-2 whitespace-nowrap text-[19px] min-[1400px]:ml-[104px]">
					<Link
						href="/donate"
						className="rounded-full border border-[#ec008c] px-[30px] py-2.5 text-[#ec008c]"
					>
						Donate
					</Link>
					<Button
						href={JOIN_US_URL}
						isExternal
						variant="solid"
						size="sm"
						className="bg-[#ec008c] px-[30px] py-2.5 text-[19px] text-white"
					>
						Join Us
					</Button>
				</div>
			</nav>
		</>
	);
}

export function AcademyPage() {
	const t = useTranslations("academy");
	const [modalOpen, setModalOpen] = useState(false);
	const [academyIndex, setAcademyIndex] = useState(0);
	const [selectedAcademy, setSelectedAcademy] = useState<Academy>("tech");
	const [isAcademyControlsPaused, setIsAcademyControlsPaused] = useState(false);
	const academyCarouselRef = useRef<HTMLDivElement>(null);
	const academyScrollEndTimer = useRef<number | null>(null);

	const openWaitlist = (academy: Academy = "tech") => {
		setSelectedAcademy(academy);
		setModalOpen(true);
	};

	useEffect(() => {
		document.body.dataset.academyPage = "true";

		return () => {
			delete document.body.dataset.academyPage;
		};
	}, []);

	const moveAcademy = useCallback((direction: -1 | 1) => {
		const carousel = academyCarouselRef.current;
		if (!carousel) return;

		const step = getAcademyStep(carousel);
		if (!step) return;

		let currentPosition = Math.round(
			(carousel.scrollLeft + ACADEMY_CARD_BLEED) / step,
		);
		if (direction === -1 && currentPosition < academies.length) {
			currentPosition += academies.length;
			carousel.scrollLeft = getAcademyScrollPosition(currentPosition, step);
		} else if (
			direction === 1 &&
			currentPosition >= academies.length * (ACADEMY_COPY_COUNT - 1)
		) {
			currentPosition -= academies.length;
			carousel.scrollLeft = getAcademyScrollPosition(currentPosition, step);
		}

		carousel.scrollTo({
			left: getAcademyScrollPosition(currentPosition + direction, step),
			behavior: "smooth",
		});
	}, []);

	const normalizeAcademyPosition = useCallback(() => {
		const carousel = academyCarouselRef.current;
		if (!carousel) return;

		const step = getAcademyStep(carousel);
		if (!step) return;

		const position = Math.round(
			(carousel.scrollLeft + ACADEMY_CARD_BLEED) / step,
		);
		if (
			position >= academies.length &&
			position < academies.length * (ACADEMY_COPY_COUNT - 1)
		) {
			return;
		}

		const wrappedPosition =
			position < academies.length
				? position + academies.length
				: position - academies.length;
		carousel.scrollLeft = getAcademyScrollPosition(wrappedPosition, step);
	}, []);

	const scheduleAcademyLoop = useCallback(() => {
		if (academyScrollEndTimer.current !== null) {
			window.clearTimeout(academyScrollEndTimer.current);
		}

		academyScrollEndTimer.current = window.setTimeout(
			normalizeAcademyPosition,
			160,
		);
	}, [normalizeAcademyPosition]);

	useEffect(() => {
		const carousel = academyCarouselRef.current;
		if (!carousel) return;

		const frame = window.requestAnimationFrame(() => {
			const step = getAcademyStep(carousel);
			carousel.scrollLeft = getAcademyScrollPosition(academies.length, step);
		});

		return () => {
			window.cancelAnimationFrame(frame);
			if (academyScrollEndTimer.current !== null) {
				window.clearTimeout(academyScrollEndTimer.current);
			}
		};
	}, []);

	useEffect(() => {
		const carousel = academyCarouselRef.current;
		if (!carousel) return;

		carousel.addEventListener("scrollend", normalizeAcademyPosition);
		return () =>
			carousel.removeEventListener("scrollend", normalizeAcademyPosition);
	}, [normalizeAcademyPosition]);

	useEffect(() => {
		if (
			isAcademyControlsPaused ||
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		) {
			return;
		}

		const interval = window.setInterval(() => moveAcademy(1), 3_000);
		return () => window.clearInterval(interval);
	}, [isAcademyControlsPaused, moveAcademy]);

	return (
		<main className="academy-exact-page bg-white text-[#333]">
			<section className="relative h-[845px] overflow-hidden text-white max-lg:h-[720px]">
				<Image
					src="/assets/academy/hero-source.jpg"
					alt="Three women collaborating at 4Herfrika Academy"
					fill
					priority
					sizes="100vw"
					className="object-cover"
				/>
				<div className="absolute inset-0 bg-black/60" />
				<AcademyNav />

				<div className="absolute left-1/2 top-[260px] z-10 w-[973px] max-w-[calc(100%-48px)] -translate-x-1/2 text-center max-lg:top-44">
					<h1 className="text-[64px] font-medium leading-[1.265] tracking-[-1px] max-sm:text-5xl">
						<span className="block">{t("heroFirst")}</span>
						<em className="block font-playfair font-black text-[#ec008c]">
							{t("heroSecond")}
						</em>
					</h1>
					<p className="mx-auto mt-4 max-w-[665px] text-xl leading-8 max-sm:text-base">
						{t("heroDescription")}
					</p>
					<div className="mt-[34px] flex justify-center gap-4 max-sm:flex-col max-sm:items-center">
						<Button
							type="button"
							onClick={() => openWaitlist()}
							size="lg"
							className="h-[53px] gap-2 bg-[#e91e63] px-6 text-xl font-medium hover:bg-[#d91757]"
						>
							{t("joinWaitlist")} <ArrowRight className="size-5" />
						</Button>
						<Button
							href="/contact-us"
							variant="outline-white"
							size="lg"
							className="h-[53px] border-[#ccc] px-6 text-xl font-medium text-[#eee] hover:border-[#ec008c]"
						>
							{t("contactUs")}
						</Button>
					</div>
				</div>
			</section>

			<section className="bg-[rgba(236,0,140,0.02)] px-6 py-20 lg:px-12 xl:px-12 xl:py-[107px] 2xl:px-20">
				<div className="mx-auto max-w-[1280px]">
					<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
						{[
							["3000+", t("girlsMentored")],
							["1000+", t("graduates")],
							["3+", t("academies")],
							["5+", t("countries")],
						].map(([value, label], index) => (
							<div
								key={label}
								className="flex min-w-0 items-center justify-center gap-8 lg:gap-11"
							>
								<div className="min-w-0 text-center">
									<p className="text-5xl font-semibold leading-[60px] text-[#03065c]">
										{value}
									</p>
									<p className="mt-2.5 text-[15px] font-medium text-[#333]">
										{label}
									</p>
								</div>
								{index < 3 && (
									<span className="hidden h-[95px] w-px shrink-0 bg-[#ec008c] lg:block" />
								)}
							</div>
						))}
					</div>

					<div className="mt-20 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-start lg:gap-8 xl:mt-[114px] xl:grid-cols-[minmax(0,1fr)_minmax(0,669px)] xl:gap-12 2xl:gap-20">
						<div className="flex min-w-0 flex-col justify-between gap-12 lg:min-h-[478px] xl:min-h-[746px]">
							<div>
								<h2 className="text-5xl font-bold leading-[1] text-black">
									{t("pathsFirst")}
									<br />
									<em className="font-playfair font-extrabold text-[#ec008c]">
										{t("pathsSecond")}
									</em>
								</h2>
								<p className="mt-9 w-[548px] max-w-full text-xl leading-8 text-[#4b4b4b]">
									{t("pathsDescription")}
								</p>
							</div>
							<div
								className="flex gap-6"
								onPointerEnter={() => setIsAcademyControlsPaused(true)}
								onPointerLeave={() => setIsAcademyControlsPaused(false)}
								onFocusCapture={() => setIsAcademyControlsPaused(true)}
								onBlurCapture={(event) => {
									if (
										!event.currentTarget.contains(
											event.relatedTarget as Node | null,
										)
									) {
										setIsAcademyControlsPaused(false);
									}
								}}
							>
								<button
									type="button"
									onClick={() => moveAcademy(-1)}
									aria-label={t("previous")}
									className="grid size-[37px] cursor-pointer place-items-center rounded-xl border border-[#ec008c] bg-[#ec008c]/10 text-[#ec008c] transition-colors hover:bg-[#ec008c]/20"
								>
									<ArrowLeft className="size-5" />
								</button>
								<button
									type="button"
									onClick={() => moveAcademy(1)}
									aria-label={t("next")}
									className="grid size-[37px] cursor-pointer place-items-center rounded-xl border border-[#ec008c] bg-[#ec008c]/10 text-[#ec008c] transition-colors hover:bg-[#ec008c]/20"
								>
									<ArrowRight className="size-5" />
								</button>
							</div>
						</div>

						<div className="min-w-0">
							<div
								ref={academyCarouselRef}
								onScroll={(event) => {
									const carousel = event.currentTarget;
									const step = getAcademyStep(carousel);
									if (!step) return;

									const position = Math.round(
										(carousel.scrollLeft + ACADEMY_CARD_BLEED) / step,
									);
									setAcademyIndex(position % academies.length);
									scheduleAcademyLoop();
								}}
								aria-label="Academy paths"
								className="-m-6 flex snap-x snap-mandatory scroll-px-6 gap-0 overflow-x-auto overscroll-x-contain py-6 xl:gap-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
							>
								{Array.from({ length: ACADEMY_COPY_COUNT }, (_, copy) =>
									academies.map((academy, index) => (
										<article
											key={`${copy}-${academy.name}`}
											aria-hidden={copy !== 1 || index !== academyIndex}
											inert={copy !== 1 || index !== academyIndex}
											className="mx-6 w-[calc(100%-3rem)] max-w-[450px] shrink-0 snap-start overflow-hidden rounded-2xl bg-white p-4 shadow-[0_12px_32px_rgba(0,0,0,0.10)] sm:rounded-3xl sm:p-6 xl:max-w-[570px] xl:rounded-[40px] xl:p-8"
										>
											<div className="relative aspect-[3/2] overflow-hidden rounded-xl sm:rounded-2xl xl:rounded-[32px]">
												<Image
													src={academy.image}
													alt={t(academyTranslationKeys[academy.academy].name)}
													fill
													sizes="(max-width: 1279px) 520px, 669px"
													className="object-cover"
												/>
												<Button
													type="button"
													onClick={() => openWaitlist(academy.academy)}
													variant="outline-white"
													size="icon"
													aria-label={`${t("joinWaitlist")} — ${t(academyTranslationKeys[academy.academy].name)}`}
													className="absolute bottom-5 right-5 size-10 border-2 text-white sm:bottom-6 sm:right-6 sm:size-12 xl:bottom-9 xl:right-9"
												>
													<ArrowRight className="size-5 -rotate-45 sm:size-6" />
												</Button>
											</div>
											<h3 className="mt-4 text-lg font-semibold leading-7 text-black sm:text-xl sm:leading-8 xl:mt-5">
												{t(academyTranslationKeys[academy.academy].name)}
											</h3>
											<p className="mt-1 text-sm leading-5 text-[#4b4b4b] sm:text-base sm:leading-6">
												{t(academyTranslationKeys[academy.academy].description)}
											</p>
										</article>
									)),
								)}
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="flex h-[737px] overflow-hidden rounded-t-[64px] bg-white text-white max-lg:h-auto max-lg:flex-col max-lg:rounded-t-[40px]">
				<div className="relative h-full w-1/2 bg-[#03065c] max-lg:flex max-lg:h-auto max-lg:w-full max-lg:flex-col max-lg:gap-8 max-lg:px-8 max-lg:py-16 max-sm:px-6 max-sm:py-12">
					<div className="absolute left-[82px] top-24 max-w-[491px] max-lg:static max-lg:max-w-none">
						<span className="inline-flex rounded-full bg-[#fff0f9] px-3 py-1.5 text-xs text-[#ec008c]">
							Our Impact
						</span>
						<h2 className="mt-4 text-4xl font-bold leading-[45px] tracking-[-.9px]">
							Equipping the next generation of{" "}
							<em className="font-playfair font-extrabold">African women</em> in
							tech, business, and climate.
						</h2>
					</div>
					<Button
						type="button"
						onClick={() => openWaitlist()}
						variant="outline-white"
						size="sm"
						className="absolute bottom-[101px] left-[72px] h-11 gap-2 px-6 font-medium max-lg:static max-lg:self-start"
					>
						{t("joinWaitlist")} <ArrowRight className="size-[18px]" />
					</Button>
				</div>
				<div className="relative h-full w-1/2 overflow-hidden max-lg:aspect-[719/737] max-lg:h-auto max-lg:w-full">
					<Image
						src="/assets/academy/impact-source.jpg"
						alt="4Herfrika participant working on a laptop"
						fill
						sizes="(max-width: 1024px) 100vw, 50vw"
						className="object-cover object-center"
					/>
				</div>
			</section>

			<ReviewsSection
				heading={
					<>
						<span className="text-[#ec008c]">Don’t</span> Take our{" "}
						<span className="text-[#ec008c]">Words</span> for it!
					</>
				}
				subheading="Take a look at what our learners say!"
				reviews={testimonials}
				decorations={
					<>
						<Image
							src="/assets/academy/decorative-logo.png"
							alt=""
							width={173}
							height={251}
							className="pointer-events-none absolute -right-2 top-16 h-[251px] w-[173px] -rotate-[24deg] opacity-15"
						/>
						<Image
							src="/assets/academy/decorative-logo.png"
							alt=""
							width={173}
							height={251}
							className="pointer-events-none absolute -left-[106px] bottom-[-40px] h-[251px] w-[173px] -rotate-[40deg] opacity-15"
						/>
					</>
				}
			/>

			<AcademyFooter />
			<WaitlistModal
				open={modalOpen}
				onOpenChange={setModalOpen}
				academy={selectedAcademy}
			/>
		</main>
	);
}

function AcademyFooter() {
	const t = useTranslations("footer");

	return (
		<footer className="relative h-[555px] bg-[#03065c] text-white max-lg:h-auto max-lg:px-6 max-lg:py-16">
			<div className="absolute left-1/2 top-[94px] w-[1088px] -translate-x-1/2 max-lg:static max-lg:w-full max-lg:translate-x-0">
				<div className="grid grid-cols-[166px_112px_176px_338px] justify-between gap-10 max-lg:grid-cols-2 max-sm:grid-cols-1">
					<div>
						<h2 className="text-[15px] font-bold">Quick Links</h2>
						<ul className="mt-6 space-y-2.5 text-[15px] opacity-90">
							<li>
								<Link href="/projects">Projects</Link>
							</li>
							<li>
								<Link href="/careers-corner">Become an Ambassador</Link>
							</li>
							<li>
								<Link href="/careers-corner">Volunteer as a Mentor</Link>
							</li>
							<li>
								<Link href="/donate">Donate</Link>
							</li>
							<li>
								<Link href="/faq">FAQs</Link>
							</li>
						</ul>
					</div>
					<div>
						<h2 className="text-[15px] font-bold">Legal</h2>
						<ul className="mt-6 space-y-2.5 text-[15px] opacity-90">
							<li>
								<Link href="/terms">Terms</Link>
							</li>
							<li>
								<Link href="/privacy">Privacy</Link>
							</li>
							<li>Cookies</li>
						</ul>
					</div>
					<div>
						<h2 className="text-[15px] font-bold">Contact Us</h2>
						<ul className="mt-6 space-y-2.5 text-[15px]">
							<li>
								<a href="tel:+2349082009908">+234(0)9082009908</a>
							</li>
							<li>
								<a href="mailto:4herfrika@gmail.com">4herfrika@gmail.com</a>
							</li>
							<li>
								<Link href="/contact-us">Support</Link>
							</li>
						</ul>
					</div>
					<SubscribeFormClient
						label={t("subscribe")}
						placeholder={t("emailPlaceholder")}
						description={t("subscribeDescription")}
					/>
				</div>
				<div className="mt-[51px] h-px bg-white/10" />
				<div className="mt-7 flex items-center justify-between max-sm:flex-col max-sm:gap-6">
					<div className="rounded bg-white px-2 py-1">
						<Image
							src="/assets/academy/footer-logo.png"
							alt="4Herfrika"
							width={145}
							height={41}
							className="h-[41px] w-[145px] object-contain"
						/>
					</div>
					<p className="text-[13px] font-medium">
						© 2024 4HerFrika. All Rights Reserved
					</p>
					<div className="flex gap-4">
						<a
							href="https://www.linkedin.com/company/4herfrika"
							aria-label="LinkedIn"
							className="grid size-[35px] place-items-center rounded-full border border-white/10"
						>
							<Linkedin className="size-3" />
						</a>
						<a
							href="https://www.instagram.com/4herfrika"
							aria-label="Instagram"
							className="grid size-[35px] place-items-center rounded-full border border-white/10"
						>
							<Instagram className="size-3" />
						</a>
						<a
							href="https://x.com/4herfrika"
							aria-label="X"
							className="grid size-[35px] place-items-center rounded-full border border-white/10"
						>
							<Twitter className="size-3" />
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}
