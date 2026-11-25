import { Link } from "@/i18n/navigation";
import type { Route } from "next";
import { type FeedCategory, categoryHref } from "../_feed";

type Chip = { href: string; label: string; active: boolean };

const BASE =
	"inline-flex h-11 items-center rounded-pill px-5 text-[15px] font-medium no-underline outline-none hover:no-underline! focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2";
const ACTIVE = "bg-secondary-500 text-white";
const IDLE =
	"border border-border bg-white text-foreground hover:border-primary-500 hover:text-primary-500";

export function CategoryChips({
	label,
	allLabel,
	categories,
	active,
}: {
	label: string;
	allLabel: string;
	categories: FeedCategory[];
	active: string | null;
}) {
	const chips: Chip[] = [
		{ href: "/blog", label: allLabel, active: active === null },
		...categories.map((category) => ({
			href: categoryHref(category.slug),
			label: category.name,
			active: active === category.slug,
		})),
	];

	return (
		<nav aria-label={label} className="mt-6">
			<ul className="-mx-4 flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4 py-2 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0">
				{chips.map((chip) => (
					<li key={chip.href} className="shrink-0 snap-start">
						<Link
							href={chip.href as Route}
							aria-current={chip.active ? "page" : undefined}
							className={`${BASE} ${chip.active ? ACTIVE : IDLE}`}
						>
							{chip.label}
						</Link>
					</li>
				))}
			</ul>
		</nav>
	);
}
