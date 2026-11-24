"use client";

import { Link } from "@/i18n/navigation";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import type { SentMessage } from "../_lib/contact-session";

const WAIT_LINKS = [
	{
		href: "/academy",
		image: "/assets/academy/impact-source.jpg",
		titleKey: "startCourse",
		descriptionKey: "courseDescription",
	},
	{
		href: "/careercorner",
		image: "/assets/contact/mentor.jpg",
		titleKey: "bookMentor",
		descriptionKey: "mentorDescription",
	},
] as const;

const SUMMARY_LABEL_STYLES =
	"text-xs font-semibold uppercase tracking-[0.15em] text-primary-500";

export function ContactSuccess({ sent }: { sent: SentMessage }) {
	const t = useTranslations("contact");

	return (
		<main className="bg-primary-500/2 px-4 py-14 text-foreground lg:px-20 lg:py-24">
			<output className="mx-auto block max-w-2xl rounded-[20px] bg-white p-6 text-center shadow-[0_12px_24px_rgba(0,0,0,0.10)] lg:rounded-[40px] lg:p-12">
				<span className="mx-auto inline-flex size-16 items-center justify-center rounded-full bg-emerald-700 text-white">
					<Check className="size-8" strokeWidth={2.5} aria-hidden="true" />
				</span>
				<h1 className="mt-6 text-[36px] font-bold leading-[1.1] lg:text-[52px]">
					{t("successFirst")}{" "}
					<em className="font-playfair font-black text-primary-500">
						{t("successSecond")}
					</em>
				</h1>
				<p className="mx-auto mt-4 max-w-md text-[17px] text-muted-foreground">
					{t("successDescription")}
				</p>
				<dl className="mt-8 grid gap-3 rounded-2xl bg-surface-pink p-5 text-left text-[15px] lg:grid-cols-2 lg:text-center">
					<div className="min-w-0">
						<dt className={SUMMARY_LABEL_STYLES}>{t("topicLabel")}</dt>
						<dd className="mt-1 font-medium">
							{t(`topics.${sent.topic}.title`)}
						</dd>
					</div>
					<div className="min-w-0">
						<dt className={SUMMARY_LABEL_STYLES}>{t("replyTo")}</dt>
						<dd className="mt-1 break-words font-medium">{sent.email}</dd>
					</div>
				</dl>
				<p className="mt-5 text-sm text-muted-foreground">{t("spamNote")}</p>
				<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
					<Link
						href="/"
						className="inline-flex h-12 items-center justify-center rounded-full bg-primary-500 px-6 font-medium text-white outline-none transition hover:no-underline hover:brightness-90 focus-visible:ring-4 focus-visible:ring-primary-500/30"
					>
						{t("backHome")}
					</Link>
					<Link
						href="/faq"
						className="inline-flex h-12 items-center justify-center rounded-full border-2 border-primary-500 px-6 font-medium text-primary-500 outline-none transition hover:no-underline hover:bg-primary-500 hover:text-white focus-visible:ring-4 focus-visible:ring-primary-500/30"
					>
						{t("browseFaq")}
					</Link>
				</div>
			</output>

			<div className="mx-auto mt-12 max-w-6xl">
				<h2 className="text-center text-xl font-semibold">
					{t("whileYouWait")}
				</h2>
				<ul className="mt-6 grid gap-4 lg:grid-cols-2">
					{WAIT_LINKS.map(({ href, image, titleKey, descriptionKey }) => (
						<li key={href}>
							<Link
								href={href}
								className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm outline-none transition hover:no-underline hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary-500 lg:rounded-[20px] lg:p-5"
							>
								<span className="relative size-20 shrink-0 overflow-hidden rounded-xl lg:size-24 lg:rounded-2xl">
									<Image
										src={image}
										alt=""
										fill
										sizes="96px"
										className="object-cover"
									/>
								</span>
								<span className="min-w-0 flex-1">
									<span className="block text-lg font-semibold">
										{t(titleKey)}
									</span>
									<span className="block text-[15px] text-muted-foreground">
										{t(descriptionKey)}
									</span>
								</span>
								<span className="text-primary-500" aria-hidden="true">
									→
								</span>
							</Link>
						</li>
					))}
				</ul>
			</div>
		</main>
	);
}
