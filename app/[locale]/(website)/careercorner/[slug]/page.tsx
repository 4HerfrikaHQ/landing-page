import { FadeIn } from "@/components/motion";
import { careerCornerMetadata } from "@/src/lib/careercorner-seo";
import {
	absoluteSiteUrl,
	localizedCareerCornerPath,
} from "@/src/lib/careercorner-seo";
import { isLocalImageUrl } from "@/src/lib/image-url";
import { ChevronLeft, Clock, Linkedin, UserRound } from "lucide-react";
import type { Metadata, Route } from "next";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import {
	getInitialWeekStart,
	getMentorByPreviousSlug,
	getMentorBySlug,
} from "./_actions";
import { BookingSection } from "./_components/booking-section";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
	const { locale, slug } = await params;
	const t = await getTranslations({ locale, namespace: "seo.mentorProfile" });
	const mentor = await getMentorBySlug(slug);
	if (!mentor) return { title: t("notFound") };
	const displayName = mentor.nickname || mentor.name;
	return careerCornerMetadata(
		locale,
		t("title", { name: displayName }),
		mentor.bio?.slice(0, 160) ?? t("description", { name: displayName }),
		`/${slug}`,
	);
}

export default async function MentorDetailPage({
	params,
}: {
	params: Promise<{ locale: string; slug: string }>;
}) {
	const { locale, slug } = await params;
	setRequestLocale(locale as Locale);

	const mentor = await getMentorBySlug(slug);
	if (!mentor) {
		const movedMentor = await getMentorByPreviousSlug(slug);
		if (!movedMentor) notFound();
		const localePrefix = locale === "en" ? "" : `/${locale}`;
		permanentRedirect(
			`${localePrefix}/careercorner/${movedMentor.slug}` as Route,
		);
	}
	const tc = await getTranslations("common");

	const initialWeekStart = await getInitialWeekStart(mentor.slug);
	const displayName = mentor.nickname || mentor.name;
	const pageUrl = absoluteSiteUrl(
		localizedCareerCornerPath(locale, `/${mentor.slug}`),
	);
	const structuredData = {
		"@context": "https://schema.org",
		"@type": "ProfilePage",
		"@id": `${pageUrl}#profile`,
		url: pageUrl,
		name: `Book a call with ${displayName} — 4Herfrika`,
		isPartOf: {
			"@type": "WebSite",
			name: "4Herfrika",
			url: absoluteSiteUrl("/"),
		},
		mainEntity: {
			"@type": "Person",
			name: displayName,
			jobTitle: mentor.position || undefined,
			description: mentor.bio || undefined,
			image: mentor.image ? absoluteSiteUrl(mentor.image) : undefined,
			url: pageUrl,
			sameAs: mentor.linkedin_url ? [mentor.linkedin_url] : undefined,
		},
		breadcrumb: {
			"@type": "BreadcrumbList",
			itemListElement: [
				{
					"@type": "ListItem",
					position: 1,
					name: "Career Corner",
					item: absoluteSiteUrl(localizedCareerCornerPath(locale)),
				},
				{
					"@type": "ListItem",
					position: 2,
					name: displayName,
					item: pageUrl,
				},
			],
		},
	};

	return (
		<main className="bg-muted">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
				}}
			/>
			<div className="container mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
				<FadeIn>
					<Link
						href="/careercorner"
						className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary-500 hover:no-underline!"
					>
						<ChevronLeft className="size-4" />
						Back to mentors
					</Link>
				</FadeIn>

				<div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
					{/* Left: profile */}
					<FadeIn direction="left">
						<div className="rounded-2xl border border-border/60 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] sm:p-8">
							<div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
								<div className="relative shrink-0">
									<div className="absolute -inset-2 rounded-full bg-surface-pink" />
									<div className="relative size-28 overflow-hidden rounded-full ring-4 ring-primary-500/15 sm:size-32">
										{mentor.image ? (
											<Image
												src={mentor.image}
												alt={mentor.name}
												fill
												sizes="128px"
												unoptimized={isLocalImageUrl(mentor.image)}
												className="object-cover object-top"
											/>
										) : (
											<div className="flex h-full w-full items-center justify-center bg-secondary-500/30">
												<UserRound className="size-12 text-secondary-500/70" />
											</div>
										)}
									</div>
								</div>
								<div className="min-w-0">
									<h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
										{displayName}
									</h1>
									<p className="mt-1 capitalize text-muted-foreground">
										{mentor.position}
									</p>
									{mentor.linkedin_url && (
										<a
											href={mentor.linkedin_url}
											target="_blank"
											rel="noreferrer"
											className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-white px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary-500 hover:text-primary-500 hover:no-underline!"
										>
											<Linkedin className="size-4" />
											{tc("messageOnLinkedin")}
										</a>
									)}
								</div>
							</div>

							{mentor.bio && (
								<>
									<div className="my-7 h-px bg-border/60" />
									<p className="max-w-[65ch] whitespace-pre-wrap leading-relaxed text-foreground/80">
										{mentor.bio}
									</p>
								</>
							)}
						</div>
					</FadeIn>

					{/* Right: sticky booking card */}
					<FadeIn direction="right">
						<div className="lg:sticky lg:top-24">
							<div className="rounded-2xl border border-border/60 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
								<div className="flex items-center gap-2">
									<span className="flex size-9 items-center justify-center rounded-full bg-surface-pink text-primary-500">
										<Clock className="size-5" />
									</span>
									<h2 className="text-lg font-semibold text-foreground">
										Book a 30-min call
									</h2>
								</div>
								<p className="mt-2 text-sm text-muted-foreground">
									Pick a time that works for you. Times are shown in your local
									timezone.
								</p>
								<div className="mt-6">
									<BookingSection
										mentorSlug={mentor.slug}
										mentorName={mentor.name}
										initialWeekStart={initialWeekStart}
									/>
								</div>
							</div>
						</div>
					</FadeIn>
				</div>
			</div>
		</main>
	);
}
