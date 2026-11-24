import { optionalUserCapabilities } from "@/src/auth";
import { careerCornerMetadata } from "@/src/lib/careercorner-seo";
import {
	absoluteSiteUrl,
	localizedCareerCornerPath,
} from "@/src/lib/careercorner-seo";
import { startOfWeek } from "date-fns";
import { Clock, Eye } from "lucide-react";
import type { Metadata, Route } from "next";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, permanentRedirect } from "next/navigation";
import {
	getInactiveMentorBySlug,
	getInitialWeekStart,
	getMentorByPreviousSlug,
	getMentorBySlug,
} from "./_actions";
import { BookingSection } from "./_components/booking-section";
import { MoreMentors } from "./_components/more-mentors";
import { NextSteps } from "./_components/next-steps";
import { ProfileHero } from "./_components/profile-hero";
import { Testimonials } from "./_components/testimonials";
import { VolunteerBand } from "./_components/volunteer-band";
import { getSimilarMentors } from "./_similar-mentors";
import { getMentorTestimonials } from "./_testimonials";

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

	let mentor = await getMentorBySlug(slug);
	let isInactivePreview = false;
	let isAdminPreview = false;

	if (!mentor) {
		const inactiveMentor = await getInactiveMentorBySlug(slug);
		if (inactiveMentor) {
			const viewer = await optionalUserCapabilities();
			mentor = inactiveMentor;
			isInactivePreview = true;
			isAdminPreview = viewer?.isAdmin === true;
		}
	}

	if (!mentor) {
		const movedMentor = await getMentorByPreviousSlug(slug);
		if (!movedMentor) notFound();
		const localePrefix = locale === "en" ? "" : `/${locale}`;
		permanentRedirect(
			`${localePrefix}/careercorner/${movedMentor.slug}` as Route,
		);
	}
	const t = await getTranslations("mentorProfile");

	const canCreateBooking = !isInactivePreview || isAdminPreview;
	const [initialWeekStart, testimonials, similarMentors] = await Promise.all([
		getInitialWeekStart(mentor.slug),
		getMentorTestimonials(mentor.id),
		getSimilarMentors(mentor.slug),
	]);
	const freeThisWeek =
		initialWeekStart !== null &&
		new Date(initialWeekStart).getTime() ===
			startOfWeek(new Date(), { weekStartsOn: 1 }).getTime();
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
		<main className="overflow-x-clip bg-background text-foreground">
			{isInactivePreview && (
				<div className="border-b border-amber-500/20 bg-amber-50 text-amber-950">
					<div className="mx-auto flex max-w-6xl items-start gap-3 px-4 py-3 sm:px-6 lg:px-8">
						<Eye
							className="mt-0.5 size-5 shrink-0 text-amber-700"
							aria-hidden="true"
						/>
						<p className="text-sm leading-6">
							<span className="font-semibold">
								{t("inactivePreview.title")}
							</span>{" "}
							{isAdminPreview
								? t("inactivePreview.adminBody")
								: t("inactivePreview.ownerBody")}
						</p>
					</div>
				</div>
			)}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
				}}
			/>
			<section className="px-4 lg:px-20">
				<ProfileHero
					displayName={displayName}
					position={mentor.position}
					image={mentor.image}
					imageCrop={mentor.image_crop}
					linkedinUrl={mentor.linkedin_url}
					freeThisWeek={freeThisWeek}
					canBook={canCreateBooking}
				/>
			</section>

			<section className="px-4 py-12 lg:px-20 lg:py-20">
				<div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_420px] lg:items-start lg:gap-14">
					<aside
						id="book"
						aria-label={t("booking.title")}
						className="scroll-mt-28 lg:sticky lg:top-28 lg:col-start-2 lg:row-start-1"
					>
						<div className="rounded-[20px] bg-white p-5 shadow-[0_12px_24px_rgba(0,0,0,0.10)] ring-1 ring-border lg:p-7">
							<div className="flex items-center gap-3">
								<span className="grid size-11 shrink-0 place-items-center rounded-pill bg-surface-pink text-primary">
									<Clock className="size-5" aria-hidden="true" />
								</span>
								<div>
									<h2 className="text-xl font-semibold">
										{canCreateBooking
											? t("booking.title")
											: t("booking.previewTitle")}
									</h2>
									<p className="text-sm text-muted-foreground">
										{t("booking.subtitle")}
									</p>
								</div>
							</div>
							<div className="mt-6">
								<BookingSection
									mentorSlug={mentor.slug}
									mentorName={mentor.name}
									displayName={displayName}
									mentorImage={mentor.image}
									mentorImageCrop={mentor.image_crop}
									initialWeekStart={initialWeekStart}
									readOnly={!canCreateBooking}
								/>
							</div>
						</div>
					</aside>

					<div className="flex flex-col gap-12 lg:col-start-1 lg:row-start-1 lg:gap-16">
						{mentor.bio && (
							<div>
								<span className="rounded-pill bg-surface-pink px-3 py-1.5 text-xs text-primary">
									{t("about.tag")}
								</span>
								<h2 className="mt-4 text-[28px] font-bold leading-tight lg:text-4xl">
									{t.rich("about.title", {
										name: displayName,
										em: (chunks) => (
											<em className="font-playfair font-black text-primary">
												{chunks}
											</em>
										),
									})}
								</h2>
								<p className="mt-5 max-w-[62ch] whitespace-pre-wrap text-[16px] leading-relaxed text-foreground/80 lg:text-[17px]">
									{mentor.bio}
								</p>
							</div>
						)}
						{testimonials.length > 0 && (
							<Testimonials testimonials={testimonials} />
						)}
						<NextSteps displayName={displayName} />
					</div>
				</div>
			</section>

			{similarMentors.length > 0 && <MoreMentors mentors={similarMentors} />}
			<VolunteerBand />
		</main>
	);
}
