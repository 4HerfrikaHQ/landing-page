import { Link } from "@/i18n/navigation";
import { CONTACT_EMAIL } from "@/src/lib/contact";
import {
	ArrowLeft,
	BookOpen,
	GraduationCap,
	Home,
	Link2,
	MapPin,
	Users,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { ReportBrokenLink } from "./report-broken-link";

const ROUTES = [
	{
		key: "home",
		href: "/",
		Icon: Home,
		iconClassName: "bg-surface-indigo text-secondary",
	},
	{
		key: "academy",
		href: "/academy",
		Icon: GraduationCap,
		iconClassName: "bg-surface-pink text-primary",
	},
	{
		key: "mentors",
		href: "/careercorner",
		Icon: Users,
		iconClassName: "bg-amber-100 text-secondary",
	},
	{
		key: "blog",
		href: "/blog",
		Icon: BookOpen,
		iconClassName: "bg-surface-teal text-secondary",
	},
] as const;

export async function NotFoundView() {
	const t = await getTranslations("notFound");

	return (
		<main>
			<section
				data-hero="full-bleed"
				className="bg-surface-pink px-4 pb-14 pt-28 lg:px-20 lg:pb-24 xl:pt-40"
			>
				<div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
					<div className="relative order-first lg:order-last">
						<Image
							src="/assets/academy/tech-source.jpg"
							alt={t("photoAlt")}
							width={1400}
							height={875}
							priority
							sizes="(max-width: 1024px) 100vw, 520px"
							className="aspect-[4/3] w-full rounded-[20px] object-cover shadow-[0_12px_24px_rgba(0,0,0,0.10)] lg:aspect-[5/4] lg:rounded-[40px]"
						/>
						<span
							aria-hidden="true"
							className="absolute -top-3 right-4 inline-flex rotate-6 items-center rounded-pill bg-amber-300 px-4 py-2 text-lg font-bold text-secondary shadow-md lg:-right-4 lg:-top-5 lg:px-5 lg:text-2xl"
						>
							404
						</span>
						<div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl bg-white py-3 pl-3 pr-5 shadow-lg lg:-left-8 lg:bottom-10">
							<span className="inline-flex size-10 items-center justify-center rounded-pill bg-surface-pink text-primary">
								<MapPin className="size-5" aria-hidden="true" />
							</span>
							<span className="text-sm leading-tight">
								<b className="block">{t("hereTitle")}</b>
								<span className="text-muted-foreground">{t("hereBody")}</span>
							</span>
						</div>
					</div>
					<div className="pt-4 lg:pt-0">
						<span className="inline-flex rounded-pill bg-white px-3 py-1.5 text-xs font-medium text-primary">
							{t("eyebrow")}
						</span>
						<h1 className="mt-4 break-words text-[40px] font-medium leading-[1.05] tracking-tight sm:text-[44px] lg:text-[72px]">
							{t("titleLead")}
							<br />
							<em className="font-playfair font-black text-primary-500">
								{t("titleAccent")}
							</em>
						</h1>
						<p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-muted-foreground lg:text-xl">
							{t("body")}
						</p>
						<Link
							href="/"
							className="mt-6 inline-flex min-h-11 items-center gap-2 font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
						>
							<ArrowLeft className="size-5" aria-hidden="true" />
							{t("takeMeHome")}
						</Link>
					</div>
				</div>
			</section>

			<section className="px-4 py-12 lg:px-20 lg:py-20">
				<div className="mx-auto max-w-6xl">
					<h2 className="text-[28px] font-semibold leading-tight tracking-tight lg:text-4xl">
						{t("routesTitle")}
					</h2>
					<ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:mt-8 lg:grid-cols-4 lg:gap-4">
						{ROUTES.map(({ key, href, Icon, iconClassName }) => (
							<li key={key} className="flex">
								<Link
									href={href}
									className="flex w-full flex-col rounded-[24px] bg-white p-5 shadow-[0_12px_24px_rgba(0,0,0,0.08)] outline-none ring-1 ring-border hover:no-underline focus-visible:ring-2 focus-visible:ring-primary motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 lg:rounded-[20px] lg:p-6"
								>
									<span
										className={`inline-flex size-12 items-center justify-center rounded-2xl ${iconClassName}`}
									>
										<Icon className="size-6" aria-hidden="true" />
									</span>
									<h3 className="mt-4 text-xl font-semibold lg:mt-5">
										{t(`${key}.title`)}
									</h3>
									<p className="mt-1 flex-1 text-[15px] leading-relaxed text-muted-foreground">
										{t(`${key}.body`)}
									</p>
									<span className="mt-4 inline-flex min-h-6 items-center text-[15px] font-semibold text-primary lg:mt-5">
										{t(`${key}.cta`)} →
									</span>
								</Link>
							</li>
						))}
					</ul>
					<p className="mt-10 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border pt-6 text-[15px] text-muted-foreground">
						<Link2 className="size-5 text-primary" aria-hidden="true" />
						{t("reportLead")}
						<ReportBrokenLink
							email={CONTACT_EMAIL}
							subject={t("reportSubject")}
						/>
						{t("reportTail")}
					</p>
				</div>
			</section>
		</main>
	);
}
