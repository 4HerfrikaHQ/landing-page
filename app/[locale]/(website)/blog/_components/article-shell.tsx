import { SiteImage as Image } from "@/components/ui/site-image";
import { Link } from "@/i18n/navigation";
import { User } from "lucide-react";
import type { Route } from "next";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { categoryHref, shareLinks, splitTitle } from "../_feed";
import { CareerCard } from "./career-card";
import type { CardData } from "./feed-card";
import { InboxBand } from "./inbox-band";
import { RelatedSection } from "./related-section";
import { ShareButtons } from "./share-buttons";

type Props = {
	title: string;
	categorySlug: string;
	categoryName: string;
	meta: string;
	author: string;
	imageSrc: string;
	imageAlt: string;
	url: string;
	related: CardData[];
	children: ReactNode;
};

function HeroImage({ src, alt }: { src: string; alt: string }) {
	if (!src) return null;
	return (
		<>
			<Image
				src={src}
				alt={alt}
				fill
				priority
				sizes="100vw"
				className="object-cover object-[center_15%]"
			/>
			<div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/60 to-black/45" />
		</>
	);
}

function Byline({ author, label }: { author: string; label: string }) {
	if (!author) return null;
	return (
		<p className="mt-6 flex items-center gap-3 text-sm">
			<span
				className="grid size-11 place-items-center rounded-pill bg-white/20 ring-2 ring-white/60"
				aria-hidden="true"
			>
				<User className="size-6" />
			</span>
			<span>
				<span className="block text-white/90">{label}</span>
				<b className="font-semibold">{author}</b>
			</span>
		</p>
	);
}

export async function ArticleShell({
	title,
	categorySlug,
	categoryName,
	meta,
	author,
	imageSrc,
	imageAlt,
	url,
	related,
	children,
}: Props) {
	const [t, tn] = await Promise.all([
		getTranslations("blogPage"),
		getTranslations("nav"),
	]);
	const { lead, accent } = splitTitle(title);

	return (
		<main className="overflow-x-clip bg-white text-foreground">
			<header
				data-hero="full-bleed"
				className="relative flex min-h-[560px] items-end overflow-hidden bg-secondary-500 text-white lg:min-h-[620px]"
			>
				<HeroImage src={imageSrc} alt={imageAlt} />
				<div className="relative w-full px-4 pb-10 pt-36 lg:px-20 lg:pb-16">
					<div className="mx-auto max-w-6xl">
						<nav aria-label={t("breadcrumb")} className="text-sm text-white/90">
							<Link
								href="/blog"
								className="text-white underline underline-offset-4"
							>
								{tn("blog")}
							</Link>{" "}
							<span aria-hidden="true">/</span>{" "}
							<Link
								href={categoryHref(categorySlug) as Route}
								className="text-white underline underline-offset-4"
							>
								{categoryName}
							</Link>
						</nav>
						<div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
							<span className="rounded-pill bg-surface-pink px-3 py-1.5 text-xs text-primary-500">
								{categoryName}
							</span>
							<span className="text-white/90">{meta}</span>
						</div>
						<h1 className="mt-4 max-w-4xl text-[36px] font-medium leading-[1.08] tracking-tight text-balance lg:text-[64px]">
							{lead}{" "}
							<em className="font-playfair font-black text-primary-bright">
								{accent}
							</em>
						</h1>
						<Byline author={author} label={t("writtenBy")} />
					</div>
				</div>
			</header>

			<div className="px-4 py-10 lg:px-20 lg:py-20">
				<div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
					<article className="min-w-0 max-w-[680px]">
						{children}
						<ShareButtons
							url={url}
							links={shareLinks(url, title)}
							labels={{
								heading: t("shareHeading"),
								whatsapp: t("shareWhatsapp"),
								x: t("shareX"),
								linkedin: t("shareLinkedin"),
								copy: t("copyLink"),
								copied: t("linkCopied"),
								newTab: t("opensInNewTab"),
							}}
						/>
					</article>
					<CareerCard />
				</div>
			</div>

			<RelatedSection
				cards={related}
				categorySlug={categorySlug}
				categoryName={categoryName}
			/>
			<InboxBand />
		</main>
	);
}
