import { getTranslations } from "next-intl/server";

const SECTIONS = ["numbers", "stories", "academy", "howWeCount"] as const;

export async function SectionMenu() {
	const t = await getTranslations("impactYear2");

	return (
		<nav
			aria-label={t("menuLabel")}
			className="sticky top-0 z-10 border-b border-foreground/10 bg-white/95 backdrop-blur"
		>
			<ul className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-2 [scrollbar-width:none] lg:justify-center">
				{SECTIONS.map((section) => (
					<li key={section} className="shrink-0">
						<a
							href={`#${section}`}
							className="inline-flex h-11 items-center rounded-full px-4 text-sm font-medium text-secondary-500 hover:bg-surface-pink focus-visible:outline-2 focus-visible:outline-primary-500"
						>
							{t(`menu.${section}`)}
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
}
