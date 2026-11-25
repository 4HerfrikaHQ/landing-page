"use client";

import { SearchX } from "lucide-react";
import { useTranslations } from "next-intl";
import type { FaqGroup } from "../_helpers/faq-groups";
import { countFaqItems, filterFaqGroups } from "../_helpers/filter-faq";
import { useFaqQuery } from "../_hooks/use-faq-query";
import { FaqItem } from "./faq-item";

function AccentedTitle({ title }: { title: string }) {
	const words = title.split(" ");
	if (words.length < 2) return <>{title}</>;
	const last = words[words.length - 1];
	return (
		<>
			{words.slice(0, -1).join(" ")}{" "}
			<em className="font-playfair font-black text-primary-500">{last}</em>
		</>
	);
}

function EmptyResults({ query, total }: { query: string; total: number }) {
	const [, setQuery] = useFaqQuery();
	const t = useTranslations("faq");
	if (total > 0) return null;
	return (
		<div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-[20px] bg-white px-6 py-12 text-center shadow-sm">
			<span
				aria-hidden="true"
				className="inline-flex size-12 items-center justify-center rounded-pill bg-surface-pink text-primary-500"
			>
				<SearchX className="size-6" />
			</span>
			<h2 className="text-2xl font-bold">{t("noResultsTitle")}</h2>
			<p className="break-words text-base text-muted-foreground [overflow-wrap:anywhere]">
				{t("noResultsBody", { query })}
			</p>
			<button
				type="button"
				onClick={() => setQuery("")}
				className="inline-flex h-11 items-center rounded-pill border-2 border-primary-500 px-5 font-medium text-primary-500 outline-none transition-colors hover:bg-primary-500 hover:text-white focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
			>
				{t("clearSearch")}
			</button>
		</div>
	);
}

function GroupSection({ group }: { group: FaqGroup }) {
	const t = useTranslations("faq");
	return (
		<section
			id={group.id}
			aria-labelledby={`${group.id}-title`}
			className="grid scroll-mt-28 gap-6 lg:grid-cols-[300px_1fr] lg:gap-12"
		>
			<div className="lg:sticky lg:top-28 lg:self-start">
				<span className="rounded-pill bg-surface-pink px-3 py-1.5 text-xs text-primary-500">
					{t("questionCount", { count: group.items.length })}
				</span>
				<h2
					id={`${group.id}-title`}
					className="mt-4 text-[32px] font-bold leading-tight lg:text-[40px]"
				>
					<AccentedTitle title={group.title} />
				</h2>
			</div>
			<div className="flex flex-col gap-3">
				{group.items.map((item) => (
					<FaqItem key={item.id} item={item} />
				))}
			</div>
		</section>
	);
}

function TopicNav({ groups }: { groups: FaqGroup[] }) {
	const t = useTranslations("faq");
	if (groups.length === 0) return null;
	return (
		<nav aria-label={t("topicsLabel")} className="border-b border-border">
			<ul className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] lg:flex-wrap lg:justify-center lg:px-20">
				{groups.map((group) => (
					<li key={group.id} className="shrink-0">
						<a
							href={`#${group.id}`}
							className="inline-flex h-11 items-center gap-2 rounded-pill border border-border px-4 text-[15px] font-medium outline-none transition-colors hover:border-primary-500 hover:text-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500"
						>
							{group.title}
							<span className="text-muted-foreground">
								{group.items.length}
							</span>
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
}

export function FaqResults({ groups }: { groups: FaqGroup[] }) {
	const t = useTranslations("faq");
	const [query] = useFaqQuery();
	const visible = filterFaqGroups(groups, query);
	const total = countFaqItems(visible);
	const searching = query.trim().length > 0;

	return (
		<>
			<TopicNav groups={visible} />
			<div
				id="faq-results"
				className="scroll-mt-24 bg-primary-500/2 px-4 py-12 lg:px-20 lg:py-20"
			>
				<div className="mx-auto flex max-w-6xl flex-col gap-14 lg:gap-20">
					<output aria-live="polite" className="sr-only">
						{searching ? t("resultsCount", { count: total }) : ""}
					</output>
					<EmptyResults query={query.trim()} total={total} />
					{visible.map((group) => (
						<GroupSection key={group.id} group={group} />
					))}
				</div>
			</div>
		</>
	);
}
