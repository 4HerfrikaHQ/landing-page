import { SiteImage as Image } from "@/components/ui/site-image";
import { Link } from "@/i18n/navigation";
import impactSourceImage from "@/public/assets/academy/impact-source.jpg";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

export const PILL_PRIMARY =
	"inline-flex h-12 items-center justify-center rounded-pill bg-primary px-7 font-medium text-primary-foreground outline-none hover:brightness-90 hover:no-underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export const PILL_OUTLINE =
	"inline-flex h-12 items-center justify-center rounded-pill border-2 border-border px-7 font-medium outline-none hover:border-primary hover:no-underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export async function UnsubscribeCard({
	icon,
	iconClassName,
	eyebrow,
	eyebrowClassName,
	titleLead,
	titleAccent,
	children,
}: {
	icon: ReactNode;
	iconClassName: string;
	eyebrow: string;
	eyebrowClassName: string;
	titleLead: string;
	titleAccent: string;
	children: ReactNode;
}) {
	const t = await getTranslations("unsubscribe");

	return (
		<main
			data-hero="full-bleed"
			className="overflow-x-clip bg-[#fffaf5] px-4 pb-16 pt-28 lg:px-20 lg:pb-24 xl:pt-40"
		>
			<div className="mx-auto max-w-5xl">
				<div className="grid overflow-hidden rounded-[20px] bg-white shadow-[0_12px_24px_rgba(0,0,0,0.10)] lg:grid-cols-[0.9fr_1.1fr] lg:rounded-[40px]">
					<div className="relative hidden lg:block">
						<Image
							src={impactSourceImage}
							alt={t("photoAlt")}
							fill
							sizes="460px"
							className="object-cover"
						/>
						<div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
						<p className="absolute inset-x-8 bottom-8 text-lg font-medium leading-snug text-white">
							{t("photoCaption")}
						</p>
					</div>
					<div className="min-w-0 p-6 sm:p-10 lg:p-14">
						<span
							className={`inline-flex size-14 items-center justify-center rounded-2xl ${iconClassName}`}
						>
							{icon}
						</span>
						<p
							className={`mt-6 text-xs font-semibold uppercase tracking-[0.18em] ${eyebrowClassName}`}
						>
							{eyebrow}
						</p>
						<h1 className="mt-2 break-words text-[32px] font-semibold leading-[1.1] tracking-tight lg:text-[44px]">
							{titleLead}{" "}
							<em className="font-playfair font-black text-primary-500">
								{titleAccent}
							</em>
						</h1>
						{children}
					</div>
				</div>
				<p className="mt-6 text-center text-sm text-muted-foreground">
					{t.rich("dataNote", {
						link: (chunks) => (
							<Link
								href="/privacy"
								className="inline-flex min-h-11 items-center font-medium text-primary underline underline-offset-2"
							>
								{chunks}
							</Link>
						),
					})}
				</p>
			</div>
		</main>
	);
}
