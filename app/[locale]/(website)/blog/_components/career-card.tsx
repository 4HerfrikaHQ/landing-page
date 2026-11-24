import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function CareerCard() {
	const t = await getTranslations("blogPage");

	return (
		<aside className="rounded-[28px] bg-surface-pink p-6 lg:sticky lg:top-28 lg:self-start lg:rounded-[32px]">
			<span className="rounded-pill bg-white px-3 py-1.5 text-xs text-primary-500">
				{t("careerBadge")}
			</span>
			<h2 className="mt-4 text-xl font-bold leading-snug">
				{t("careerTitle")}
			</h2>
			<p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
				{t("careerBody")}
			</p>
			<Link
				href="/careercorner"
				className="mt-5 flex h-12 items-center justify-center rounded-pill bg-primary-500 font-medium text-white no-underline outline-none hover:brightness-90 hover:no-underline! focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
			>
				{t("careerCta")}
			</Link>
		</aside>
	);
}
