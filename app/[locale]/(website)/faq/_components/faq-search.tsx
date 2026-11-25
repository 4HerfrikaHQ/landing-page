"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import type { FormEvent } from "react";
import { useFaqQuery } from "../_hooks/use-faq-query";

export function FaqSearch() {
	const t = useTranslations("faq");
	const [query, setQuery] = useFaqQuery();

	const jumpToResults = (event: FormEvent) => {
		event.preventDefault();
		document
			.getElementById("faq-results")
			?.scrollIntoView({ behavior: "smooth", block: "start" });
	};

	return (
		<search className="mt-4 w-full max-w-xl">
			<form
				onSubmit={jumpToResults}
				className="flex w-full items-center gap-2 rounded-pill bg-white p-1.5 pl-5 text-foreground shadow-lg focus-within:ring-2 focus-within:ring-white focus-within:ring-offset-2 focus-within:ring-offset-black/60"
			>
				<label htmlFor="faq-search" className="sr-only">
					{t("searchLabel")}
				</label>
				<Search
					aria-hidden="true"
					className="size-5 shrink-0 text-muted-foreground"
				/>
				<input
					id="faq-search"
					type="search"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					placeholder={t("searchPlaceholder")}
					autoComplete="off"
					className="h-11 min-w-0 flex-1 bg-transparent text-base placeholder:text-muted-foreground focus:outline-none"
				/>
				<button
					type="submit"
					className="inline-flex h-11 shrink-0 items-center rounded-pill bg-primary-500 px-5 font-medium text-white outline-none transition-[filter] hover:brightness-90 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
				>
					{t("searchButton")}
				</button>
			</form>
		</search>
	);
}
