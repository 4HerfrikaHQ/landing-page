"use client";

import { StaggerContainer, StaggerItem } from "@/components/motion";
import { useInfiniteBrowse } from "@/hooks/use-infinite-browse";
import type { Content } from "@prismicio/client";
import { Loader2, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { searchCampuses } from "../_actions";
import { CampusCard } from "./campus-card";
import { CampusesNoResults } from "./empty-state";

const PAGE_SIZE = 12;

export function CampusesBrowser({
	initialCampuses,
}: {
	initialCampuses: Content.CampusDocument[];
}) {
	const t = useTranslations("campuses");
	const tc = useTranslations("common");
	const [input, setInput] = useState("");
	const [query, setQuery] = useState("");

	useEffect(() => {
		const id = setTimeout(() => setQuery(input.trim()), 300);
		return () => clearTimeout(id);
	}, [input]);

	const { items, ref, hasNextPage, isFetchingNextPage, isFetching } = useInfiniteBrowse<
		Content.CampusDocument
	>({
		queryKey: ["campuses", query],
		pageSize: PAGE_SIZE,
		initialData: query === "" ? initialCampuses : undefined,
		fetchItems: (pageParam, pageSize) =>
			searchCampuses({ page: pageParam, pageSize, query }),
	});

	const isInitialLoading = isFetching && items.length === 0;

	return (
		<div className="flex flex-col gap-8">
			<div className="flex gap-3 border border-primary-500 rounded-[20px] items-center px-6 max-w-xl">
				<Search className="h-5 w-5 text-muted-foreground" strokeWidth={2} />
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					className="py-3.5 flex-1 rounded-[20px] bg-transparent outline-0 text-base"
					placeholder={t("searchPlaceholder")}
					aria-label={t("searchPlaceholder")}
				/>
			</div>

			{isInitialLoading ? (
				<div className="flex justify-center py-16">
					<Loader2 className="h-8 w-8 animate-spin text-primary-500" />
				</div>
			) : items.length === 0 ? (
				<CampusesNoResults
					query={query}
					label={t("noResultsTitle")}
					hint={t("noResultsHint")}
				/>
			) : (
				<>
					<StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{items.map((campus) => (
							<StaggerItem key={campus.id}>
								<CampusCard campus={campus} readMoreLabel={tc("readMore")} />
							</StaggerItem>
						))}
					</StaggerContainer>

					<div ref={ref} className="flex justify-center py-8">
						{isFetchingNextPage ? (
							<Loader2 className="h-6 w-6 animate-spin text-primary-500" />
						) : hasNextPage ? (
							<span className="text-sm text-muted-foreground">
								{t("loadingMore")}
							</span>
						) : items.length > PAGE_SIZE ? (
							<span className="text-sm text-muted-foreground">{t("endOfList")}</span>
						) : null}
					</div>
				</>
			)}
		</div>
	);
}
