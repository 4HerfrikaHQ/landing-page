import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";
import type { Content } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import { Calendar, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { BlogCard } from "@/components/blog-card";
import { Breadcrumbs } from "../../projects/_components/breadcrumbs";
import { ProjectContent } from "../../projects/_components/project-content";
import { getCampus, getCampuses } from "../_actions";
import { MeetTheLead } from "../_components/meet-the-lead";
import { MilestonesTimeline } from "../_components/milestones-timeline";
import { OtherCampuses } from "../_components/other-campuses";
import { QuickActions } from "../_components/quick-actions";

function StatTile({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-2xl border border-[#E0E0E0] bg-white p-5 md:p-6">
			<dt className="text-xs font-medium uppercase tracking-wide text-primary-500">
				{label}
			</dt>
			<dd className="mt-2 text-xl md:text-2xl font-semibold text-foreground leading-tight">
				{value}
			</dd>
		</div>
	);
}

export async function generateStaticParams() {
	const campuses = await getCampuses().catch(() => []);
	return campuses.map((c) => ({ uid: c.uid }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ uid: string }>;
}): Promise<Metadata> {
	const { uid } = await params;
	const campus = await getCampus(uid).catch(() => null);
	if (!campus) return {};
	return {
		title: `${campus.data.name} — 4Herfrika Campus`,
		description: campus.data.summary ?? undefined,
	};
}

export default async function CampusPage({
	params,
}: {
	params: Promise<{ uid: string }>;
}) {
	const { uid } = await params;
	const campus = await getCampus(uid).catch(() => null);
	if (!campus) notFound();

	const tc = await getTranslations("common");
	const t = await getTranslations("campuses");
	const {
		name,
		university,
		country,
		cover_image,
		body,
		gallery,
		programs,
		milestones,
		events,
		testimonials,
		related_projects,
		lead_ambassador,
		lead_ambassador_role,
		lead_ambassador_bio,
		lead_ambassador_photo,
		lead_ambassador_socials,
		founded_date,
		member_count,
	} = campus.data;
	const location = [university, country].filter(Boolean).join(", ");
	const upcomingEvents = (events ?? []).filter(
		(e: Content.CampusDocumentDataEventsItem) =>
			e.date ? new Date(e.date).getTime() >= Date.now() : false,
	);

	return (
		<main className="bg-background">
			<section className="px-4 pt-6 md:pt-10 pb-12 md:pb-20">
				<div className="mx-auto max-w-4xl">
					<Breadcrumbs
						items={[
							{ label: tc("home"), href: "/" },
							{ label: t("breadcrumb"), href: "/campuses" },
							{ label: name ?? "" },
						]}
					/>

					<header className="space-y-4 md:space-y-6">
						{country && (
							<span className="text-xs font-semibold tracking-wider text-primary-500 uppercase">
								{country}
							</span>
						)}
						<h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-foreground">
							{name}
						</h1>
						{location && location !== name && (
							<p className="text-base md:text-lg text-foreground/60 inline-flex items-center gap-2">
								<MapPin className="h-4 w-4" aria-hidden />
								{location}
							</p>
						)}

						<div className="relative rounded-2xl overflow-hidden border border-border h-44 sm:h-56 md:h-90 lg:h-110">
							<PrismicNextImage
								field={cover_image}
								fill
								priority
								sizes="(min-width:1280px) 1100px, (min-width:1024px) 900px, 100vw"
								className="object-cover object-top"
							/>
						</div>

						<dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
							{founded_date && (
								<StatTile
									label={t("foundedLabel")}
									value={new Date(founded_date).toLocaleDateString(undefined, {
										year: "numeric",
										month: "short",
									})}
								/>
							)}
							{typeof member_count === "number" && (
								<StatTile
									label={t("membersLabel")}
									value={member_count.toLocaleString()}
								/>
							)}
						</dl>

						<p className="text-xs text-foreground/60 inline-flex items-center gap-2">
							<Calendar className="h-3.5 w-3.5" aria-hidden />
							{t("lastUpdatedLabel")}:{" "}
							{new Date(campus.last_publication_date).toLocaleDateString(undefined, {
								year: "numeric",
								month: "short",
								day: "numeric",
							})}
						</p>
					</header>

					<div className="mt-8 md:mt-10 border-t border-border pt-8">
						<ProjectContent>
							<PrismicRichText field={body} />
						</ProjectContent>
					</div>

					{lead_ambassador && (
						<MeetTheLead
							heading={t("meetTheLeadTitle")}
							name={lead_ambassador}
							role={lead_ambassador_role}
							bio={lead_ambassador_bio}
							photo={lead_ambassador_photo}
							socials={lead_ambassador_socials}
						/>
					)}

					{milestones && milestones.length > 0 && (
						<section className="mt-12 md:mt-16">
							<FadeIn>
								<h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
									{t("milestonesTitle")}
								</h2>
							</FadeIn>
							<MilestonesTimeline
								milestones={milestones}
								label={t("milestonesTitle")}
							/>
						</section>
					)}

					{programs && programs.length > 0 && (
						<section className="mt-12 md:mt-16">
							<FadeIn>
								<h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
									{t("programsTitle")}
								</h2>
							</FadeIn>
							<ul className="divide-y divide-[#E0E0E0] border-y border-[#E0E0E0]">
								{programs.map(
									(
										program: Content.CampusDocumentDataProgramsItem,
										i: number,
									) => (
										<li
											key={`program-${i + 1}`}
											className="grid grid-cols-[64px_1fr] md:grid-cols-[140px_1fr] gap-5 md:gap-10 py-6 md:py-8 group transition-colors hover:bg-muted/40 px-2 md:px-4 -mx-2 md:-mx-4"
										>
											<span className="text-4xl md:text-6xl font-extrabold text-primary-500 leading-none tracking-tight">
												{`0${i + 1}`}
											</span>
											<div>
												<h3 className="text-xl md:text-3xl font-semibold text-foreground leading-tight">
													{program.name}
												</h3>
												{program.description && (
													<p className="mt-3 text-base md:text-lg text-[#636363] max-w-3xl">
														{program.description}
													</p>
												)}
											</div>
										</li>
									),
								)}
							</ul>
						</section>
					)}

					{related_projects && related_projects.length > 0 && (
						<section className="mt-12 md:mt-16">
							<FadeIn>
								<h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
									{t("relatedProjectsTitle")}
								</h2>
							</FadeIn>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
								{related_projects.map(
									(
										p: Content.CampusDocumentDataRelatedProjectsItem,
										i: number,
									) => (
										<BlogCard
											key={`related-${i + 1}`}
											uid={p.slug ?? ""}
											href={`/projects/${p.slug}`}
											category={p.category ?? ""}
											title={p.title ?? ""}
											description={p.summary ?? ""}
											date=""
											imageUrl={p.cover_image?.url ?? ""}
											readMoreLabel={tc("readMore")}
										/>
									),
								)}
							</div>
						</section>
					)}

					{testimonials && testimonials.length > 0 && (
						<section className="mt-12 md:mt-16">
							<FadeIn>
								<h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
									{t("testimonialsTitle")}
								</h2>
							</FadeIn>
							<ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
								{testimonials.map(
									(
										tst: Content.CampusDocumentDataTestimonialsItem,
										i: number,
									) => (
										<li
											key={`testimonial-${i + 1}`}
											className="rounded-2xl bg-muted p-6 md:p-7 flex flex-col"
										>
											<svg
												aria-hidden
												className="size-8 text-primary-500 mb-3"
												viewBox="0 0 24 24"
												fill="currentColor"
											>
												<path d="M7 7h3v3H7v3H4V7h3zm10 0h3v3h-3v3h-3V7h3z" />
											</svg>
											<p className="text-base md:text-lg text-foreground leading-relaxed">
												{tst.quote}
											</p>
											<div className="mt-5 flex items-center gap-3">
												{tst.photo?.url ? (
													<div className="relative size-10 rounded-full overflow-hidden shrink-0">
														<PrismicNextImage
															field={tst.photo}
															fill
															sizes="40px"
															className="object-cover"
														/>
													</div>
												) : (
													<div className="size-10 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center font-bold shrink-0">
														{(tst.name ?? "").charAt(0)}
													</div>
												)}
												<div className="min-w-0">
													<p className="text-sm font-semibold text-foreground truncate">
														{tst.name}
													</p>
													{tst.role && (
														<p className="text-xs text-[#636363] truncate">
															{tst.role}
														</p>
													)}
												</div>
											</div>
										</li>
									),
								)}
							</ul>
						</section>
					)}

					{upcomingEvents.length > 0 && (
						<section className="mt-12 md:mt-16">
							<FadeIn>
								<h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
									{t("upcomingEventsTitle")}
								</h2>
							</FadeIn>
							<ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
								{upcomingEvents.map(
									(e: Content.CampusDocumentDataEventsItem, i: number) => {
										const d = e.date ? new Date(e.date) : null;
										return (
											<li
												key={`event-${i + 1}`}
												className="rounded-2xl border border-[#E0E0E0] bg-white p-5 md:p-6 flex gap-5 items-start"
											>
												{d && (
													<div className="shrink-0 rounded-2xl bg-primary-500/10 text-primary-500 w-16 md:w-20 text-center py-3 md:py-4">
														<div className="text-xs font-semibold uppercase tracking-wide">
															{d.toLocaleDateString(undefined, { month: "short" })}
														</div>
														<div className="text-2xl md:text-3xl font-bold leading-none mt-1">
															{d.getDate()}
														</div>
													</div>
												)}
												<div className="flex-1 min-w-0">
													<h3 className="text-base md:text-lg font-semibold text-foreground leading-tight">
														{e.title}
													</h3>
													{e.location && (
														<p className="mt-1 text-sm text-[#636363]">{e.location}</p>
													)}
												</div>
											</li>
										);
									},
								)}
							</ul>
						</section>
					)}

					{gallery && gallery.length > 0 && (
						<section className="mt-12 md:mt-16">
							<FadeIn>
								<h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
									{t("galleryTitle")}
								</h2>
							</FadeIn>
							<StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
								{gallery.map(
									(item: Content.CampusDocumentDataGalleryItem, i: number) => (
										<StaggerItem key={`gallery-${i + 1}`}>
											<figure className="relative rounded-xl overflow-hidden border border-border aspect-4/3">
												<PrismicNextImage
													field={item.image}
													fill
													sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
													className="object-cover"
												/>
												{item.caption && (
													<figcaption className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs md:text-sm px-3 py-2">
														{item.caption}
													</figcaption>
												)}
											</figure>
										</StaggerItem>
									),
								)}
							</StaggerContainer>
						</section>
					)}
				</div>
			</section>

			<OtherCampuses currentUid={campus.uid ?? ""} />
			<QuickActions />
		</main>
	);
}
