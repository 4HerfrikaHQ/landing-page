"use client";

import { Search } from "lucide-react";
import { debounce, parseAsString, useQueryState } from "nuqs";
import type { ReactNode } from "react";
import { useId } from "react";

import { cn } from "@/utils/cn";

/**
 * Responsive container for filter controls (search + pill groups).
 * Wraps onto multiple rows on small screens.
 */
export function FilterBar({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center",
				className,
			)}
		>
			{children}
		</div>
	);
}

export interface FilterOption {
	value: string;
	label: string;
	count?: number;
}

interface FilterPillsProps {
	/** Visually-hidden / leading label describing the group. */
	label?: string;
	options: FilterOption[];
	/** nuqs query param to read/write. */
	paramKey: string;
	/** Value treated as "no filter". Default "all". */
	defaultValue?: string;
	/** Whether to prepend an "All" pill. Default true. */
	includeAll?: boolean;
	allLabel?: string;
	/**
	 * When false (default), the URL update re-runs server components so a server
	 * query reading this param refetches. Set true for purely client-side filtering.
	 */
	shallow?: boolean;
	/** Clear the URL page when this filter changes. */
	resetPageOnChange?: boolean;
	className?: string;
}

/**
 * Pill button group backed by a `nuqs` query param.
 * Uses the blog filter recipe: active = pink, inactive = bordered white.
 */
export function FilterPills({
	label,
	options,
	paramKey,
	defaultValue = "all",
	includeAll = true,
	allLabel = "All",
	shallow = false,
	resetPageOnChange = false,
	className,
}: FilterPillsProps) {
	const [active, setActive] = useQueryState(paramKey, {
		defaultValue,
		shallow,
	});
	const [, setPage] = useQueryState(
		"page",
		parseAsString.withOptions({ shallow }),
	);
	const pills: FilterOption[] = includeAll
		? [{ value: defaultValue, label: allLabel }, ...options]
		: options;

	const pillClass = (value: string) =>
		cn(
			"inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer",
			active === value
				? "bg-primary-500 text-white"
				: "bg-white border border-[#E0E0E0] text-[#636363] hover:border-primary-500 hover:text-primary-500",
		);

	return (
		<div className={cn("flex flex-wrap items-center gap-2", className)}>
			{label ? (
				<span className="mr-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
					{label}
				</span>
			) : null}
			{pills.map((opt) => (
				<button
					key={opt.value}
					type="button"
					onClick={() => {
						void setActive(opt.value);
						if (resetPageOnChange) void setPage(null);
					}}
					className={pillClass(opt.value)}
				>
					{opt.label}
					{typeof opt.count === "number" ? (
						<span
							className={cn(
								"tabular-nums text-xs",
								active === opt.value ? "text-white/80" : "text-[#9a9a9a]",
							)}
						>
							{opt.count}
						</span>
					) : null}
				</button>
			))}
		</div>
	);
}

interface SearchInputProps {
	/** nuqs query param to write the search term to. */
	paramKey?: string;
	placeholder?: string;
	/** Optional controlled value for screens that filter local data immediately. */
	value?: string;
	/** Called when a controlled search value changes. */
	onValueChange?: (value: string) => void;
	/** Debounce delay in ms before writing the URL param. Default 300. */
	debounceMs?: number;
	/**
	 * When false (default), the URL update re-runs server components so a server
	 * query reading this param refetches. Set true for purely client-side filtering.
	 */
	shallow?: boolean;
	/** Clear the URL page when the search term changes. */
	resetPageOnChange?: boolean;
	className?: string;
}

/**
 * Search box bound to a `nuqs` query param. nuqs returns the value optimistically
 * (so typing stays responsive) and debounces only the URL write — no local state,
 * mirror effect, or manual timer needed.
 */
export function SearchInput({
	paramKey = "q",
	placeholder = "Search…",
	value: controlledValue,
	onValueChange,
	debounceMs = 300,
	shallow = false,
	resetPageOnChange = false,
	className,
}: SearchInputProps) {
	const id = useId();
	const [queryValue, setQueryValue] = useQueryState(
		paramKey,
		parseAsString
			.withDefault("")
			.withOptions({ limitUrlUpdates: debounce(debounceMs), shallow }),
	);
	const value = controlledValue ?? queryValue;
	const [, setPage] = useQueryState(
		"page",
		parseAsString.withOptions({ shallow }),
	);
	const handleValueChange = (nextValue: string) => {
		if (onValueChange) {
			onValueChange(nextValue);
		} else {
			void setQueryValue(nextValue || null);
		}
		if (resetPageOnChange) void setPage(null);
	};

	return (
		<div className={cn("relative w-full sm:w-64", className)}>
			<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
			<input
				id={id}
				type="search"
				value={value}
				placeholder={placeholder}
				onInput={(e) => handleValueChange(e.currentTarget.value)}
				className="h-10 w-full rounded-full border border-[#E0E0E0] bg-white pl-9 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground hover:border-primary-500 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
			/>
		</div>
	);
}
