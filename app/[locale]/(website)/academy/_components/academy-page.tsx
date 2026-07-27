"use client";

import { Button } from "@/components/ui/button";
import {
	ArrowLeft,
	ArrowRight,
	Instagram,
	Linkedin,
	Twitter,
} from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { WaitlistModal } from "./waitlist-modal";

const academies = [
	{
		name: "Tech Academy",
		description:
			"Master product design, web development, product management, and more. Join 1000+ women already shaping Africa's tech future.",
		image: "/assets/academy/tech-source.jpg",
	},
	{
		name: "Business Academy",
		description:
			"Turn your ideas into sustainable ventures with practical business skills, mentorship, and a community built to help you grow.",
		image: "/assets/academy/business-source.png",
	},
	{
		name: "Climate Academy",
		description:
			"Shape Africa's environmental future. Build the skills to lead in green innovation, sustainability, and climate advocacy.",
		image: "/assets/academy/climate-source.jpg",
	},
] as const;

const testimonials = [
	{
		quote:
			"I came with no tech background. Now I'm a product designer at a global firm. This academy changed my entire career trajectory.",
		name: "Adesola Adewale",
		title: "Founder, ReadEvolve",
		image: "/assets/academy/adesola_crop.png",
	},
	{
		quote:
			"I walked in with an idea. I walked out with a registered business, three clients, and the confidence to lead a team.",
		name: "Adeleke Glory",
		title: "Student, Lautech Campus",
		image: "/assets/academy/glory_crop.png",
	},
	{
		quote:
			"The Climate Academy gave me the language and the network to turn frustration into a movement in my community.",
		name: "Elizabeth Akinmolayan",
		title: "Student, FUTA Campus",
		image: "/assets/academy/elizabeth_crop.png",
	},
	{
		quote:
			"The Climate Academy gave me the language and the network to turn frustration into a movement in my community.",
		name: "Olafisoye Theresa",
		title: "Campus lead, 4Herfrika FUTA campus",
		image: "/assets/academy/theresa_crop.png",
	},
] as const;

const carouselInterval = 3_000;

const navLinks = [
	["About Us", "/about-us"],
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
				<div className="ml-8 flex items-center gap-2 whitespace-nowrap text-[19px] min-[1400px]:ml-[104px]">
					<Link
						href="/donate"
						className="rounded-full border border-[#ec008c] px-[30px] py-2.5 text-[#ec008c]"
					>
						Donate
					</Link>
					<Link
						href="/contact-us"
						className="rounded-full bg-[#ec008c] px-[30px] py-2.5 text-white"
					>
						Join Us
					</Link>
				</div>
			</nav>
		</>
	);
}

export function AcademyPage() {
	const [modalOpen, setModalOpen] = useState(false);
	const [academyIndex, setAcademyIndex] = useState(0);
	const [carouselRevision, setCarouselRevision] = useState(0);

	useEffect(() => {
		const interval = window.setInterval(() => {
			setAcademyIndex((index) => (index + 1) % academies.length);
		}, carouselInterval);

		return () => window.clearInterval(interval);
	}, [carouselRevision]);

	useEffect(() => {
		document.body.dataset.academyPage = "true";

		return () => {
			delete document.body.dataset.academyPage;
		};
	}, []);

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
						<span className="block">Trained. Built.</span>
						<em className="block font-playfair font-black text-[#ec008c]">
							Unstoppable
						</em>
					</h1>
					<p className="mx-auto mt-4 max-w-[665px] text-xl leading-8 max-sm:text-base">
						Our Academies combine practical skills, industry mentorship, and
						real-world projects. No prior experience needed. Just readiness to
						grow.
					</p>
					<div className="mt-[34px] flex justify-center gap-4 max-sm:flex-col max-sm:items-center">
						<Button
							type="button"
							onClick={() => setModalOpen(true)}
							size="lg"
							className="h-[53px] gap-2 bg-[#e91e63] px-6 text-xl font-medium hover:bg-[#d91757]"
						>
							Join the waitlist <ArrowRight className="size-5" />
						</Button>
						<Button
							href="/contact-us"
							variant="outline-white"
							size="lg"
							className="h-[53px] border-[#ccc] px-6 text-xl font-medium text-[#eee] hover:border-[#ec008c]"
						>
							Contact us
						</Button>
					</div>
				</div>
			</section>

			<section className="bg-[rgba(236,0,140,0.02)] px-6 py-20 lg:px-12 xl:px-12 xl:py-[107px] 2xl:px-20">
				<div className="mx-auto max-w-[1280px]">
					<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
						{[
							["3000+", "Girls Mentored"],
							["25+", "Tech Academy Graduates"],
							["3+", "Academies"],
							["5+", "African Countries"],
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

					<div className="mt-20 grid gap-12 xl:mt-[114px] xl:grid-cols-[minmax(0,1fr)_minmax(0,669px)] xl:items-end xl:gap-12 2xl:gap-20">
						<div className="flex min-w-0 flex-col justify-between gap-12 xl:min-h-[746px]">
							<div>
								<h2 className="text-5xl font-bold leading-[1] text-black">
									Three paths.
									<br />
									<em className="font-playfair font-extrabold text-[#ec008c]">
										One mission
									</em>
								</h2>
								<p className="mt-9 w-[548px] max-w-full text-xl leading-8 text-[#4b4b4b]">
									Whether you are a student or a woman ready to take up
									something new, 4Herfrika Academy is the right place for you.
								</p>
							</div>
							<div className="flex gap-6">
								<button
									type="button"
									onClick={() => {
										setAcademyIndex((index) => Math.max(0, index - 1));
										setCarouselRevision((revision) => revision + 1);
									}}
									disabled={academyIndex === 0}
									aria-label="Previous academy"
									className={`grid size-[37px] place-items-center rounded-xl border transition-colors ${academyIndex === 0 ? "cursor-not-allowed border-[#8e8e8e] text-[#8e8e8e]" : "cursor-pointer border-[#ec008c] bg-[#ec008c]/10 text-[#ec008c] hover:bg-[#ec008c]/20"}`}
								>
									<ArrowLeft className="size-5" />
								</button>
								<button
									type="button"
									onClick={() => {
										setAcademyIndex((index) =>
											Math.min(academies.length - 1, index + 1),
										);
										setCarouselRevision((revision) => revision + 1);
									}}
									disabled={academyIndex === academies.length - 1}
									aria-label="Next academy"
									className={`grid size-[37px] place-items-center rounded-xl border transition-colors ${academyIndex === academies.length - 1 ? "cursor-not-allowed border-[#8e8e8e] text-[#8e8e8e]" : "cursor-pointer border-[#ec008c] bg-[#ec008c]/10 text-[#ec008c] hover:bg-[#ec008c]/20"}`}
								>
									<ArrowRight className="size-5" />
								</button>
							</div>
						</div>

						<div className="min-w-0">
							<div className="grid">
								{academies.map((academy, index) => (
									<article
										key={academy.name}
										aria-hidden={index !== academyIndex}
										inert={index !== academyIndex}
										className={`col-start-1 row-start-1 mx-auto h-[860px] w-full max-w-[669px] overflow-hidden rounded-[54px] bg-white p-[46px] shadow-[0_0_45px_rgba(0,0,0,0.10)] transition-opacity duration-500 ease-out motion-reduce:transition-none xl:mx-0 max-lg:h-auto max-sm:rounded-3xl max-sm:p-6 ${index === academyIndex ? "z-10 opacity-100" : "pointer-events-none opacity-0"}`}
									>
										<div className="relative h-[564px] overflow-hidden rounded-[54px] max-lg:aspect-[4/5] max-lg:h-auto max-lg:rounded-2xl">
											<Image
												src={academy.image}
												alt={academy.name}
												fill
												sizes="669px"
												className="object-cover"
											/>
											<span className="absolute bottom-9 right-9 grid size-12 place-items-center rounded-full border-2 border-white text-white">
												<ArrowRight className="size-6 -rotate-45" />
											</span>
										</div>
										<h3 className="mt-6 text-2xl font-semibold leading-[38px] text-black">
											{academy.name}
										</h3>
										<p className="mt-1 text-xl leading-[25px] text-[#4b4b4b]">
											{academy.description}
										</p>
									</article>
								))}
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
						onClick={() => setModalOpen(true)}
						variant="outline-white"
						size="sm"
						className="absolute bottom-[101px] left-[72px] h-11 gap-2 px-6 font-medium max-lg:static max-lg:self-start"
					>
						Join the waitlist <ArrowRight className="size-[18px]" />
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

			<section className="relative overflow-x-clip bg-[#f5f5f5] px-6 py-20 xl:px-12 xl:py-[75px] 2xl:px-20">
				<div className="relative z-10 mx-auto max-w-[1280px]">
					<div className="mx-auto max-w-[880px] text-center">
						<h2 className="text-[63px] font-semibold leading-[66px] max-sm:text-4xl max-sm:leading-tight">
							<span className="text-[#ec008c]">Don’t</span> Take our{" "}
							<span className="text-[#ec008c]">Words</span> for it!
						</h2>
						<p className="mt-6 text-xl font-medium leading-[27px]">
							Take a look at what our learners say!
						</p>
					</div>

					<Image
						src="/assets/academy/decorative-logo.png"
						alt=""
						width={173}
						height={251}
						className="absolute -right-2 top-16 h-[251px] w-[173px] -rotate-[24deg] opacity-15"
					/>
					<Image
						src="/assets/academy/decorative-logo.png"
						alt=""
						width={173}
						height={251}
						className="absolute -left-[106px] bottom-[-40px] h-[251px] w-[173px] -rotate-[40deg] opacity-15"
					/>

					<div className="mt-14 grid grid-cols-1 gap-x-[52px] gap-y-14 xl:grid-cols-2">
						{testimonials.map((testimonial) => (
							<article
								key={testimonial.name}
								className="relative min-w-0 pl-10 sm:pl-[41px]"
							>
								<div className="flex min-h-[209px] min-w-0 flex-col rounded-2xl bg-[#c62979] py-8 pl-16 pr-8 text-white shadow-[2px_10px_25px_rgba(0,0,0,0.18)] sm:pl-[57px] sm:pr-[41px]">
									<p className="text-base font-medium leading-6 sm:text-lg sm:leading-[23px]">
										{testimonial.quote}
									</p>
									<div className="mt-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
										<div className="min-w-0">
											<h3 className="text-xl font-semibold leading-[25px]">
												{testimonial.name}
											</h3>
											<p className="mt-2 text-sm leading-[18px]">
												{testimonial.title}
											</p>
										</div>
										<span
											aria-label="5 out of 5 stars"
											className="whitespace-nowrap text-base tracking-[3px]"
										>
											★★★★★
										</span>
									</div>
								</div>
								<Image
									src={testimonial.image}
									alt={testimonial.name}
									width={82}
									height={82}
									className="absolute left-0 top-1/2 size-[82px] -translate-y-1/2 rounded-full object-cover"
								/>
							</article>
						))}
					</div>
				</div>
			</section>

			<AcademyFooter />
			<WaitlistModal
				open={modalOpen}
				onOpenChange={setModalOpen}
				academy="tech"
			/>
		</main>
	);
}

function AcademyFooter() {
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
					<div className="rounded-[19px] bg-white/20 px-[42px] py-[30px]">
						<h2 className="text-[15px] font-bold">Subscribe</h2>
						<form className="mt-3 flex h-[47px] overflow-hidden rounded-md bg-white">
							<input
								type="email"
								aria-label="Email address"
								placeholder="Email address"
								className="min-w-0 flex-1 px-4 text-sm text-[#ec008c] outline-none"
							/>
							<button
								type="submit"
								aria-label="Subscribe"
								className="grid w-[50px] cursor-pointer place-items-center bg-[rgba(236,0,140,0.6)]"
							>
								<ArrowRight className="size-4" />
							</button>
						</form>
						<p className="mt-5 text-xs leading-5 opacity-80">
							Subscribe to our newsletter for the latest updates and news
						</p>
					</div>
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
