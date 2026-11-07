"use client";

import { ReviewsSection } from "@/components/reviews/reviews-section";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/src/lib/analytics";
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
import {
	useEffect,
	useReducer,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";
import { LocaleSwitcher } from "../../_components/locale-switcher";
import { SubscribeFormClient } from "../../_components/subscribe-client";
import { JOIN_US_URL } from "../../navigation";
import {
	type Academy,
	academies,
	academyTranslationKeys,
	navLinks,
	testimonials,
} from "../_schema";
import {
	type CarouselDirection,
	carouselReducer,
	initialCarouselState,
	withClones,
} from "../_utils/carousel-machine";
import { WaitlistModal } from "./waitlist-modal";

const ACADEMY_AUTOPLAY_MS = 3_000;

const SLIDE_DURATION_MS = 500;
const SWIPE_THRESHOLD_PX = 50;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
	const query = window.matchMedia(REDUCED_MOTION_QUERY);
	query.addEventListener("change", onChange);
	return () => query.removeEventListener("change", onChange);
}

function usePrefersReducedMotion() {
	return useSyncExternalStore(
		subscribeToReducedMotion,
		() => window.matchMedia(REDUCED_MOTION_QUERY).matches,
		() => false,
	);
}

function AcademyNav() {
	return (
		<>
			<nav className="fixed left-1/2 top-6 z-50 hidden h-16 w-[calc(100%-206px)] max-w-314.5 -translate-x-1/2 items-center rounded-full bg-white px-3 shadow-[0_4px_20px_rgba(0,0,0,0.08)] xl:flex">
				<Link href={"/" as Route} className="shrink-0">
					<Image
						src="/assets/academy/academy-logo.png"
						alt="4Herfrika"
						width={127}
						height={36}
						className="h-9 w-31.75 object-contain"
					/>
				</Link>
				<div className="ml-auto flex h-full items-center gap-5 whitespace-nowrap text-[17px] text-foreground min-[1400px]:gap-7.5">
					{navLinks.map(([label, href]) => (
						<Link
							key={label}
							href={href}
							className={
								label === "Academy" ? "text-primary-500 underline" : ""
							}
						>
							{label}
						</Link>
					))}
				</div>
				<div className="ml-6">
					<LocaleSwitcher />
				</div>
				<div className="ml-8 flex items-center gap-2 whitespace-nowrap text-[19px] min-[1400px]:ml-26">
					<Link
						href="/donate"
						className="rounded-full border border-primary-500 px-7.5 py-2.5 text-primary-500"
					>
						Donate
					</Link>
					<Button
						href={JOIN_US_URL}
						isExternal
						variant="solid"
						size="sm"
						className="bg-primary-500 px-7.5 py-2.5 text-[19px] text-white"
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
	const [waitlist, setWaitlist] = useState<{ open: boolean; academy: Academy }>(
		{
			open: false,
			academy: "tech",
		},
	);
	const reducedMotion = usePrefersReducedMotion();
	const [carousel, send] = useReducer(
		carouselReducer,
		academies.length,
		initialCarouselState,
	);
	const swipeStartX = useRef<number | null>(null);
	const pathsRef = useRef<HTMLDivElement>(null);

	const openWaitlist = (
		academy: Academy = "tech",
		source: "hero" | "academy_card" | "page_cta" = "hero",
	) => {
		trackEvent("academy_waitlist_opened", {
			academy_type: academy,
			source,
		});
		setWaitlist({ open: true, academy });
	};

	useEffect(() => {
		trackEvent("academy_viewed");
	}, []);

	useEffect(() => {
		if (waitlist.open || reducedMotion) return;
		const interval = window.setInterval(() => {
			const paths = pathsRef.current;
			const focused = document.activeElement;
			const userIsThere =
				paths?.matches(":hover") ||
				(focused &&
					paths?.contains(focused) &&
					focused.matches(":focus-visible"));
			if (!userIsThere) {
				send({ type: "MOVE", direction: "next", instant: false });
			}
		}, ACADEMY_AUTOPLAY_MS);
		return () => window.clearInterval(interval);
	}, [waitlist.open, reducedMotion]);

	useEffect(() => {
		if (carousel.status !== "sliding") return;
		const timeout = window.setTimeout(
			() => send({ type: "SLIDE_END" }),
			SLIDE_DURATION_MS,
		);
		return () => window.clearTimeout(timeout);
	}, [carousel.status]);

	const goTo = (direction: CarouselDirection) =>
		send({ type: "MOVE", direction, instant: reducedMotion });
	const slides = withClones(academies);
	const isSliding = carousel.status === "sliding";

	return (
		<main className="academy-exact-page overflow-x-clip bg-white text-foreground">
			<section className="relative h-211.25 overflow-hidden text-white max-lg:h-180">
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

				<div className="absolute left-1/2 top-65 z-10 w-243.25 max-w-[calc(100%-48px)] -translate-x-1/2 text-center max-lg:top-44">
					<h1 className="text-[64px] font-medium leading-[1.265] tracking-[-1px] max-sm:text-5xl">
						<span className="block">{t("heroFirst")}</span>
						<em className="block font-playfair font-black text-primary-500">
							{t("heroSecond")}
						</em>
					</h1>
					<p className="mx-auto mt-4 max-w-166.25 text-xl leading-8 max-sm:text-base">
						{t("heroDescription")}
					</p>
					<div className="mt-8.5 flex justify-center gap-4 max-sm:flex-col max-sm:items-center">
						<Button
							type="button"
							onClick={() => openWaitlist()}
							size="lg"
							className="h-13.25 gap-2 px-6 text-xl font-medium"
						>
							{t("joinWaitlist")} <ArrowRight className="size-5" />
						</Button>
						<Button
							href="/contact-us"
							variant="outline-white"
							size="lg"
							className="h-13.25 px-6 text-xl font-medium"
						>
							{t("contactUs")}
						</Button>
					</div>
				</div>
			</section>

			<section className="bg-[rgba(236,0,140,0.02)] px-6 py-20 lg:px-12 xl:px-12 xl:py-26.75 2xl:px-20">
				<div className="mx-auto max-w-7xl">
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
									<p className="text-5xl font-semibold leading-15 text-secondary-500">
										{value}
									</p>
									<p className="mt-2.5 text-[15px] font-medium text-foreground">
										{label}
									</p>
								</div>
								{index < 3 && (
									<span className="hidden h-23.75 w-px shrink-0 bg-primary-500 lg:block" />
								)}
							</div>
						))}
					</div>

					<div
						ref={pathsRef}
						className="mt-20 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-stretch lg:gap-8 xl:mt-28.5 xl:grid-cols-[minmax(0,1fr)_minmax(0,669px)] xl:gap-12 2xl:gap-20"
					>
						<div className="flex min-w-0 flex-col justify-between gap-12">
							<div>
								<h2 className="text-5xl font-bold leading-none text-black">
									{t("pathsFirst")}
									<br />
									<em className="font-playfair font-extrabold text-primary-500">
										{t("pathsSecond")}
									</em>
								</h2>
								<p className="mt-9 w-137 max-w-full text-xl leading-8 text-muted-foreground">
									{t("pathsDescription")}
								</p>
							</div>
							<div className="flex gap-6">
								<button
									type="button"
									onClick={() => goTo("prev")}
									aria-label={t("previous")}
									className="grid size-9.25 cursor-pointer place-items-center rounded-xl border border-primary-500 bg-primary-500/10 text-primary-500 transition-colors hover:bg-primary-500/20"
								>
									<ArrowLeft className="size-5" />
								</button>
								<button
									type="button"
									onClick={() => goTo("next")}
									aria-label={t("next")}
									className="grid size-9.25 cursor-pointer place-items-center rounded-xl border border-primary-500 bg-primary-500/10 text-primary-500 transition-colors hover:bg-primary-500/20"
								>
									<ArrowRight className="size-5" />
								</button>
							</div>
						</div>

						<div className="min-w-0">
							<section
								aria-label="Academy paths"
								onPointerDown={(event) => {
									swipeStartX.current = event.clientX;
								}}
								onPointerUp={(event) => {
									if (swipeStartX.current === null) return;
									const distance = event.clientX - swipeStartX.current;
									swipeStartX.current = null;
									if (Math.abs(distance) > SWIPE_THRESHOLD_PX) {
										goTo(distance < 0 ? "next" : "prev");
									}
								}}
								onPointerCancel={() => {
									swipeStartX.current = null;
								}}
								className="-m-8 flex touch-pan-y overflow-hidden p-8"
							>
								{slides.map((academy, slide) => (
									<div
										key={`${slide}-${academy.name}`}
										aria-hidden={slide !== carousel.slide}
										inert={slide !== carousel.slide}
										style={{
											transform: `translateX(-${carousel.slide * 100}%)`,
											transitionDuration: `${SLIDE_DURATION_MS}ms`,
										}}
										className={`w-[calc(100%-1.5rem)] max-w-118.5 shrink-0 pr-6 xl:max-w-150.5 xl:pr-8 ${isSliding ? "transition-transform ease-out" : ""} ${slide < carousel.slide - (isSliding ? 1 : 0) ? "invisible" : ""}`}
									>
										<article className="overflow-hidden rounded-2xl bg-white p-4 shadow-[0_12px_24px_rgba(0,0,0,0.10)] sm:rounded-3xl sm:p-6 xl:rounded-[40px] xl:p-8">
											<div className="relative aspect-3/2 overflow-hidden rounded-xl sm:rounded-2xl xl:rounded-[32px]">
												<Image
													src={academy.image}
													alt={t(academyTranslationKeys[academy.academy].name)}
													fill
													sizes="(max-width: 1279px) 520px, 669px"
													draggable={false}
													className="object-cover"
												/>
												<Button
													type="button"
													onClick={() =>
														openWaitlist(academy.academy, "academy_card")
													}
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
											<p className="mt-1 text-sm leading-5 text-muted-foreground sm:text-base sm:leading-6">
												{t(academyTranslationKeys[academy.academy].description)}
											</p>
										</article>
									</div>
								))}
							</section>
						</div>
					</div>
				</div>
			</section>

			<section className="flex h-184.25 overflow-hidden rounded-t-[64px] bg-white text-white max-lg:h-auto max-lg:flex-col max-lg:rounded-t-[40px]">
				<div className="relative h-full w-1/2 bg-secondary-500 max-lg:flex max-lg:h-auto max-lg:w-full max-lg:flex-col max-lg:gap-8 max-lg:px-8 max-lg:py-16 max-sm:px-6 max-sm:py-12">
					<div className="absolute left-20.5 top-24 max-w-122.75 max-lg:static max-lg:max-w-none">
						<span className="inline-flex rounded-full bg-surface-pink px-3 py-1.5 text-xs text-primary-500">
							Our Impact
						</span>
						<h2 className="mt-4 text-4xl font-bold leading-11.25 tracking-[-.9px]">
							Equipping the next generation of{" "}
							<em className="font-playfair font-extrabold">African women</em> in
							tech, business, and climate.
						</h2>
					</div>
					<Button
						type="button"
						onClick={() => openWaitlist("tech", "page_cta")}
						variant="outline-white"
						size="sm"
						className="absolute bottom-25.25 left-18 h-11 gap-2 px-6 font-medium max-lg:static max-lg:self-start"
					>
						{t("joinWaitlist")} <ArrowRight className="size-4.5" />
					</Button>
				</div>
				<div className="relative h-full w-1/2 overflow-hidden max-lg:aspect-719/737 max-lg:h-auto max-lg:w-full">
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
						<span className="text-primary-500">Don’t</span> Take our{" "}
						<span className="text-primary-500">Words</span> for it!
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
							className="pointer-events-none absolute -right-2 top-16 h-62.75 w-43.25 -rotate-24 opacity-15"
						/>
						<Image
							src="/assets/academy/decorative-logo.png"
							alt=""
							width={173}
							height={251}
							className="pointer-events-none absolute -left-26.5 -bottom-10 h-62.75 w-43.25 -rotate-40 opacity-15"
						/>
					</>
				}
			/>

			<AcademyFooter />
			<WaitlistModal
				open={waitlist.open}
				onOpenChange={(open) =>
					setWaitlist((current) => ({ ...current, open }))
				}
				academy={waitlist.academy}
			/>
		</main>
	);
}

function AcademyFooter() {
	const t = useTranslations("footer");

	return (
		<footer className="relative h-138.75 bg-secondary-500 text-white max-lg:h-auto max-lg:px-6 max-lg:py-16">
			<div className="absolute left-1/2 top-23.5 w-272 -translate-x-1/2 max-lg:static max-lg:w-full max-lg:translate-x-0">
				<div className="grid grid-cols-[166px_112px_176px_338px] justify-between gap-10 max-lg:grid-cols-2 max-sm:grid-cols-1">
					<div>
						<h2 className="text-[15px] font-bold">Quick Links</h2>
						<ul className="mt-6 space-y-2.5 text-[15px] opacity-90">
							<li>
								<Link href="/projects">Projects</Link>
							</li>
							<li>
								<Link href="/careercorner">Become an Ambassador</Link>
							</li>
							<li>
								<Link href="/careercorner">Volunteer as a Mentor</Link>
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
				<div className="mt-12.75 h-px bg-white/10" />
				<div className="mt-7 flex items-center justify-between max-sm:flex-col max-sm:gap-6">
					<div className="rounded bg-white px-2 py-1">
						<Image
							src="/assets/academy/footer-logo.png"
							alt="4Herfrika"
							width={145}
							height={41}
							className="h-10.25 w-36.25 object-contain"
						/>
					</div>
					<p className="text-[13px] font-medium">
						© 2024 4HerFrika. All Rights Reserved
					</p>
					<div className="flex gap-4">
						<a
							href="https://www.linkedin.com/company/4herfrika"
							aria-label="LinkedIn"
							className="grid size-8.75 place-items-center rounded-full border border-white/10"
						>
							<Linkedin className="size-3" />
						</a>
						<a
							href="https://www.instagram.com/4herfrika"
							aria-label="Instagram"
							className="grid size-8.75 place-items-center rounded-full border border-white/10"
						>
							<Instagram className="size-3" />
						</a>
						<a
							href="https://x.com/4herfrika"
							aria-label="X"
							className="grid size-8.75 place-items-center rounded-full border border-white/10"
						>
							<Twitter className="size-3" />
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}
