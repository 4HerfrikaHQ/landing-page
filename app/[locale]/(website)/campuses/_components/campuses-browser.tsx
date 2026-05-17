"use client";

import { BlogCard } from "@/components/blog-card";
import { useInfiniteBrowse } from "@/hooks/use-infinite-browse";
import { cn } from "@/utils/cn";
import type { Content } from "@prismicio/client";
import { Loader2, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { searchCampuses } from "../_actions";
import { CampusesNoResults } from "./empty-state";

const PAGE_SIZE = 12;

export function CampusesBrowser({
	initialCampuses,
	countries,
}: {
	initialCampuses: Content.CampusDocument[];
	countries: string[];
}) {
	const t = useTranslations("campuses");
	const tc = useTranslations("common");
	const [query, setQuery] = useQueryState("q", {
		defaultValue: "",
		clearOnDefault: true,
	});
	const [country, setCountry] = useQueryState("country", {
		defaultValue: "all",
		clearOnDefault: true,
	});
	const [input, setInput] = useState(query);

	useEffect(() => {
		const id = setTimeout(() => setQuery(input.trim() || null), 300);
		return () => clearTimeout(id);
	}, [input, setQuery]);

	const activeCountry = country === "all" ? undefined : country;

	const { items, ref, hasNextPage, isFetchingNextPage, isFetching } =
		useInfiniteBrowse<Content.CampusDocument>({
			queryKey: ["campuses", query, country],
			pageSize: PAGE_SIZE,
			initialData:
				query === "" && country === "all" ? initialCampuses : undefined,
			fetchItems: (pageParam, pageSize) =>
				searchCampuses({
					page: pageParam,
					pageSize,
					query,
					country: activeCountry,
				}),
		});

	const isInitialLoading = isFetching && items.length === 0;

	return (
		<div className="flex flex-col gap-8">
			<div className="flex flex-col lg:flex-row lg:items-center gap-4">
				<div className="flex gap-3 border border-[#E0E0E0] focus-within:border-primary-500 rounded-full items-center px-6 bg-white transition-colors lg:flex-1">
					<Search className="h-5 w-5 text-[#999999]" strokeWidth={2} />
					<input
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						className="py-3.5 flex-1 min-w-0 rounded-full bg-transparent outline-0 text-base placeholder:text-[#999999]"
						placeholder={t("searchPlaceholder")}
						aria-label={t("searchPlaceholder")}
					/>
					{input && (
						<button
							type="button"
							onClick={() => setInput("")}
							className="text-sm text-[#999999] hover:text-primary-500 transition-colors shrink-0"
						>
							{t("clearSearch")}
						</button>
					)}
				</div>

				{countries.length > 0 && (
					<CountryPills
						label={t("filterByCountry")}
						pills={[
							{ value: "all", label: t("allCountries") },
							...countries.map((c) => ({ value: c, label: c })),
						]}
						active={country}
						onChange={(v) => setCountry(v === "all" ? null : v)}
					/>
				)}
			</div>

			{isInitialLoading ? (
				<div className="flex justify-center py-16">
					<Loader2 className="h-8 w-8 animate-spin text-primary-500" />
				</div>
			) : items.length === 0 ? (
				<CampusesNoResults
					query={query || country}
					label={t("noResultsTitle")}
					hint={t("noResultsHint")}
				/>
			) : (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{items.map((campus) => (
							<BlogCard
								key={campus.id}
								uid={campus.uid ?? ""}
								href={`/campuses/${campus.uid}`}
								category={campus.data.country ?? campus.data.university ?? ""}
								title={campus.data.name ?? ""}
								description={campus.data.summary ?? ""}
								date={new Date(campus.last_publication_date).toLocaleDateString(undefined, {
									year: "numeric",
									month: "short",
									day: "numeric",
								})}
								imageUrl={campus.data.cover_image?.url ?? ""}
								readMoreLabel={tc("readMore")}
							/>
						))}
					</div>

					<div ref={ref} className="flex justify-center py-8">
						{isFetchingNextPage ? (
							<Loader2 className="h-6 w-6 animate-spin text-primary-500" />
						) : hasNextPage ? (
							<span className="text-sm text-[#999999]">{t("loadingMore")}</span>
						) : items.length > PAGE_SIZE ? (
							<span className="text-sm text-[#999999]">{t("endOfList")}</span>
						) : null}
					</div>
				</>
			)}
		</div>
	);
}

type Pill = { value: string; label: string };

function CountryPills({
	pills,
	active,
	onChange,
	label,
}: {
	pills: Pill[];
	active: string;
	onChange: (value: string) => void;
	label: string;
}) {
	const scrollerRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);

	useEffect(() => {
		const el = scrollerRef.current;
		if (!el) return;
		const update = () => {
			const max = el.scrollWidth - el.clientWidth;
			setCanScrollLeft(el.scrollLeft > 2);
			setCanScrollRight(el.scrollLeft < max - 2);
		};
		update();
		el.addEventListener("scroll", update, { passive: true });
		const ro = new ResizeObserver(update);
		ro.observe(el);
		return () => {
			el.removeEventListener("scroll", update);
			ro.disconnect();
		};
	}, []);

	return (
		<div className="relative lg:max-w-[60%]">
			<div
				ref={scrollerRef}
				role="tablist"
				aria-label={label}
				className="flex gap-3 overflow-x-auto snap-x snap-proximity scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1"
			>
				{pills.map((p) => (
					<button
						key={p.value}
						type="button"
						role="tab"
						aria-selected={active === p.value}
						onClick={() => onChange(p.value)}
						className={cn(
							"snap-start rounded-full h-9 sm:h-12 px-4 sm:px-6 text-sm sm:text-base font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap shrink-0",
							active === p.value
								? "bg-primary-500 text-white"
								: "bg-white border border-[#E0E0E0] text-[#636363] hover:border-primary-500 hover:text-primary-500",
						)}
					>
						{p.label}
					</button>
				))}
			</div>

			<div
				aria-hidden
				className={cn(
					"pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent transition-opacity duration-200",
					canScrollLeft ? "opacity-100" : "opacity-0",
				)}
			/>
			<div
				aria-hidden
				className={cn(
					"pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent transition-opacity duration-200",
					canScrollRight ? "opacity-100" : "opacity-0",
				)}
			/>
		</div>
	);
}
