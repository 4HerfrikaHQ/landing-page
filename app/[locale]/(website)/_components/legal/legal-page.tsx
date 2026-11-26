import { SiteImage as Image } from "@/components/ui/site-image";
import { Link } from "@/i18n/navigation";
import decorativeLogoImage from "@/public/assets/academy/decorative-logo.png";
import { CONTACT_EMAIL } from "@/src/lib/contact";
import { CalendarDays, Mail } from "lucide-react";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { LegalKind } from "./_schema";
import { legalMdxComponents } from "./legal-mdx-components";
import { LegalSidebar } from "./legal-sidebar";
import { legalLocale, readLegalSource } from "./legal-source";

const OTHER_KIND = { privacy: "/terms", terms: "/privacy" } as const;

function UpdatedBadge({ updated }: { updated: string | null }) {
	if (!updated) return null;

	return (
		<p className="mt-7 inline-flex min-h-9 items-center gap-2 rounded-pill bg-white px-4 text-sm shadow-xs ring-1 ring-border">
			<CalendarDays className="size-4 text-primary" aria-hidden="true" />
			{updated}
		</p>
	);
}

const ARTICLE_STYLES = [
	"prose prose-gray max-w-[620px] text-foreground prose-p:leading-[1.75] prose-li:leading-[1.7] prose-li:marker:text-primary",
	"prose-h2:mb-4 prose-h2:mt-14 prose-h2:scroll-mt-28 prose-h2:text-[26px] prose-h2:font-semibold prose-h2:leading-tight prose-h2:tracking-tight prose-h2:text-foreground lg:prose-h2:text-[30px]",
	"prose-strong:text-foreground prose-code:break-all prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.85em] prose-code:font-normal prose-code:before:content-none prose-code:after:content-none",
	"prose-a:font-medium prose-a:text-primary prose-a:underline-offset-4",
	"[&>p:first-child]:hidden",
	"[&>p:nth-child(2)]:mt-0 [&>p:nth-child(2)]:rounded-[20px] [&>p:nth-child(2)]:bg-surface-pink [&>p:nth-child(2)]:p-6 [&>p:nth-child(2)]:text-lg [&>p:nth-child(2)]:font-medium [&>p:nth-child(2)]:leading-snug lg:[&>p:nth-child(2)]:rounded-[20px] lg:[&>p:nth-child(2)]:p-8 lg:[&>p:nth-child(2)]:text-xl",
].join(" ");

const PILL_BUTTON =
	"inline-flex h-12 items-center justify-center gap-2 rounded-pill px-6 font-medium outline-none hover:no-underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export async function LegalPage({
	kind,
	locale,
}: { kind: LegalKind; locale: Locale }) {
	const key = legalLocale(locale);
	const [t, source, { default: Content }] = await Promise.all([
		getTranslations({ locale, namespace: "legal" }),
		readLegalSource(kind, key),
		import(`@/content/${kind}/${key}.mdx`).catch(
			() => import(`@/content/${kind}/en.mdx`),
		),
	]);
	const words = source.title.split(" ");
	const accent = words.pop();
	const lead = words.join(" ");

	return (
		<main>
			<section
				data-hero="full-bleed"
				className="relative overflow-hidden bg-[#fffaf5] px-4 pb-10 pt-28 lg:px-20 lg:pb-16 xl:pt-40"
			>
				<Image
					src={decorativeLogoImage}
					alt=""
					width={173}
					height={251}
					className="pointer-events-none absolute bottom-6 right-24 hidden w-[300px] -rotate-6 opacity-[0.08] lg:block"
				/>
				<div className="relative mx-auto max-w-6xl">
					<nav
						aria-label={t("breadcrumbLabel")}
						className="text-sm text-muted-foreground"
					>
						<Link
							href="/"
							className="inline-flex min-h-11 items-center hover:text-primary"
						>
							{t("breadcrumbHome")}
						</Link>
						<span className="mx-1" aria-hidden="true">
							/
						</span>
						<span aria-current="page" className="text-foreground">
							{t(`${kind}.breadcrumb`)}
						</span>
					</nav>
					<h1 className="mt-2 break-words text-[40px] font-medium leading-[1.05] tracking-tight sm:text-[44px] lg:text-[72px]">
						{lead}{" "}
						<em className="font-playfair font-black text-primary-500">
							{accent}
						</em>
					</h1>
					<UpdatedBadge updated={source.updated} />
				</div>
			</section>

			<section className="px-4 pb-16 pt-8 lg:px-20 lg:pb-24 lg:pt-14">
				<div className="mx-auto max-w-6xl lg:grid lg:grid-cols-[248px_minmax(0,1fr)] lg:gap-20">
					<aside className="hidden lg:block">
						<div className="sticky top-28">
							<LegalSidebar
								headings={source.headings}
								label={t("onThisPage")}
							/>
							<div className="mt-8 rounded-2xl bg-surface-pink p-5">
								<p className="font-semibold">{t("questionsTitle")}</p>
								<p className="mt-1 text-sm text-muted-foreground">
									{t("questionsBody")}
								</p>
								<a
									href={`mailto:${CONTACT_EMAIL}`}
									className="mt-3 inline-flex min-h-11 items-center text-[15px] font-semibold text-primary underline underline-offset-4"
								>
									{CONTACT_EMAIL}
								</a>
							</div>
						</div>
					</aside>

					<div className="min-w-0">
						<details className="group mb-8 rounded-2xl border border-border bg-white shadow-xs lg:hidden">
							<summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 rounded-2xl px-5 outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
								<span className="font-semibold">{t("onThisPage")}</span>
								<span className="ml-auto text-sm text-muted-foreground">
									{t("sectionCount", { count: source.headings.length })}
								</span>
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									className="size-5 text-muted-foreground motion-safe:transition-transform group-open:rotate-180"
									aria-hidden="true"
								>
									<path d="m6 9 6 6 6-6" />
								</svg>
							</summary>
							<ol className="border-t border-border px-2 py-2 text-[15px]">
								{source.headings.map((heading, index) => (
									<li key={heading.id}>
										<a
											href={`#${heading.id}`}
											className="flex min-h-11 items-center gap-3 rounded-lg px-3 outline-none hover:bg-muted hover:no-underline focus-visible:ring-2 focus-visible:ring-ring"
										>
											<span className="w-5 shrink-0 tabular-nums text-primary">
												{String(index + 1).padStart(2, "0")}
											</span>
											{heading.text}
										</a>
									</li>
								))}
							</ol>
						</details>

						<article className={ARTICLE_STYLES}>
							<Content components={legalMdxComponents(source.headings)} />
						</article>

						<div className="mt-14 max-w-[620px] rounded-[20px] bg-white p-6 shadow-[0_12px_24px_rgba(0,0,0,0.10)] lg:rounded-[20px] lg:p-8">
							<h2 className="text-[26px] font-semibold leading-tight tracking-tight lg:text-[30px]">
								{t(`${kind}.contactTitle`)}
							</h2>
							<p className="mt-3 text-[16px] leading-relaxed text-muted-foreground lg:text-[17px]">
								{t(`${kind}.contactBody`)}
							</p>
							<div className="mt-6 flex flex-col gap-3 sm:flex-row">
								<a
									href={`mailto:${CONTACT_EMAIL}`}
									className={`${PILL_BUTTON} bg-primary text-primary-foreground hover:brightness-90`}
								>
									<Mail className="size-5" aria-hidden="true" />
									{CONTACT_EMAIL}
								</a>
								<Link
									href={OTHER_KIND[kind]}
									className={`${PILL_BUTTON} border-2 border-border hover:border-primary`}
								>
									{t(`${kind}.otherLink`)}
								</Link>
							</div>
						</div>
						<p className="mt-6 text-sm">
							<a
								href="#top"
								className="inline-flex min-h-11 items-center font-medium text-primary underline underline-offset-4"
							>
								{t("backToTop")} ↑
							</a>
						</p>
					</div>
				</div>
			</section>
		</main>
	);
}
