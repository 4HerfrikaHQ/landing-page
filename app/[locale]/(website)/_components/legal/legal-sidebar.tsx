"use client";

import { useState, useSyncExternalStore } from "react";
import type { LegalHeading } from "./legal-source";

const ACTIVE_ROOT_MARGIN = "-112px 0px -60% 0px";

function createActiveStore(ids: string[]) {
	let active = ids[0] ?? "";

	return {
		getSnapshot: () => active,
		getServerSnapshot: () => ids[0] ?? "",
		subscribe: (onChange: () => void) => {
			const visible = new Set<string>();
			const observer = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (entry.isIntersecting) visible.add(entry.target.id);
						else visible.delete(entry.target.id);
					}
					const next = ids.find((id) => visible.has(id));
					if (next && next !== active) {
						active = next;
						onChange();
					}
				},
				{ rootMargin: ACTIVE_ROOT_MARGIN },
			);
			for (const id of ids) {
				const element = document.getElementById(id);
				if (element) observer.observe(element);
			}
			return () => observer.disconnect();
		},
	};
}

export function LegalSidebar({
	headings,
	label,
}: {
	headings: LegalHeading[];
	label: string;
}) {
	const [store] = useState(() => createActiveStore(headings.map((h) => h.id)));
	const active = useSyncExternalStore(
		store.subscribe,
		store.getSnapshot,
		store.getServerSnapshot,
	);

	return (
		<nav aria-label={label}>
			<p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
				{label}
			</p>
			<ol className="mt-4 border-l border-border text-[15px]">
				{headings.map((heading, index) => {
					const current = heading.id === active;
					return (
						<li key={heading.id}>
							<a
								href={`#${heading.id}`}
								aria-current={current ? "location" : undefined}
								className={`-ml-px flex min-h-11 items-center gap-3 border-l-2 py-2 pl-4 outline-none hover:text-foreground hover:no-underline focus-visible:ring-2 focus-visible:ring-ring ${current ? "border-primary font-medium text-primary hover:text-primary" : "border-transparent text-muted-foreground"}`}
							>
								<span className="w-5 shrink-0 tabular-nums">
									{String(index + 1).padStart(2, "0")}
								</span>
								{heading.text}
							</a>
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
