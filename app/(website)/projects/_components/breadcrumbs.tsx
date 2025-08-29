import type { Route } from "next";
import Link from "next/link";

type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
	return (
		<nav aria-label="Breadcrumb" className="mb-6 md:mb-8">
			<ol className="flex flex-wrap items-center gap-1 text-xs md:text-sm text-gray-500">
				{items.map((item, i) => {
					const isLast = i === items.length - 1;
					return (
						<li key={item.href} className="inline-flex items-center">
							{item.href && !isLast ? (
								<Link
									href={item.href as Route}
									className="rounded px-1.5 py-1 hover:bg-gray-50 hover:text-gray-700 transition"
								>
									{item.label}
								</Link>
							) : (
								<span className="px-1.5 py-1 text-gray-400">{item.label}</span>
							)}
							{!isLast && <span className="mx-1 text-gray-300">/</span>}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
