import { Link } from "@/i18n/navigation";
import type { Route } from "next";
import { getTranslations } from "next-intl/server";
import { PROJECTS_CATEGORY, categoryHref } from "../_feed";

export async function ProjectsMovedBand() {
	const t = await getTranslations("blogPage");

	return (
		<section className="px-4 pb-16 lg:px-20 lg:pb-24">
			<div className="mx-auto grid max-w-6xl items-center gap-6 rounded-[20px] bg-surface-pink p-6 lg:grid-cols-[1fr_auto] lg:rounded-[40px] lg:p-12">
				<div>
					<span className="rounded-pill bg-white px-3 py-1.5 text-xs text-primary-500">
						{t("movedBadge")}
					</span>
					<h2 className="mt-4 text-[28px] font-bold leading-tight lg:text-4xl">
						{t("movedTitle")}{" "}
						<em className="font-playfair font-black text-primary-500">
							{t("movedEm")}
						</em>
					</h2>
					<p className="mt-3 text-[15px] text-muted-foreground lg:text-lg">
						{t("movedDescription")}
					</p>
				</div>
				<Link
					href={categoryHref(PROJECTS_CATEGORY) as Route}
					className="press inline-flex h-12 items-center justify-center rounded-pill bg-primary-500 px-6 font-medium text-white no-underline outline-none hover:brightness-90 hover:no-underline! focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
				>
					{t("movedCta")} <span aria-hidden="true">&nbsp;→</span>
				</Link>
			</div>
		</section>
	);
}
