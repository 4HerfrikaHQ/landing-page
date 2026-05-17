import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";
import type { Content } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import { Calendar, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "../../projects/_components/breadcrumbs";
import { ProjectContent } from "../../projects/_components/project-content";
import { getCampus, getCampuses } from "../_actions";
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
		lead_ambassador,
		founded_date,
		member_count,
	} = campus.data;
	const location = [university, country].filter(Boolean).join(", ");

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

						<dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
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
							{lead_ambassador && (
								<StatTile label={t("ambassadorLabel")} value={lead_ambassador} />
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
