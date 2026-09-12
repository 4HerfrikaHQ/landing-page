"use client";

import { Search } from "lucide-react";
import { debounce, parseAsString, useQueryStates } from "nuqs";
import type { ReactNode } from "react";
import { useId } from "react";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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

export function FilterSelect({
	label,
	value,
	options,
	onValueChange,
	className,
}: {
	label: string;
	value: string;
	options: FilterOption[];
	onValueChange: (value: string | null) => void;
	className?: string;
}) {
	return (
		<Select value={value} onValueChange={onValueChange}>
			<SelectTrigger
				aria-label={label}
				className={cn(
					"h-10 w-full rounded-full border-[#E0E0E0] bg-white px-4 sm:w-auto sm:min-w-40",
					className,
				)}
			>
				<span className="text-muted-foreground">{label}:</span>
				<SelectValue>
					{(selectedValue) =>
						options.find((option) => option.value === selectedValue)?.label ??
						options[0].label
					}
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				{options.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

interface DashboardFilterProps {
	/** Label shown within the trigger to keep nearby filters easy to scan. */
	label: string;
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
	/** Runs alongside the URL update for filters with dependent state. */
	onValueChange?: (value: string) => void;
	className?: string;
}

/**
 * Reusable dashboard dropdown backed by a `nuqs` query param. Individual
 * instances can be rendered together while keeping URL state and pagination
 * behavior consistent across admin and mentor screens.
 */
export function DashboardFilter({
	label,
	options,
	paramKey,
	defaultValue = "all",
	includeAll = true,
	allLabel = "All",
	shallow = false,
	resetPageOnChange = false,
	onValueChange,
	className,
}: DashboardFilterProps) {
	const [query, setQuery] = useQueryStates(
		{
			[paramKey]: parseAsString.withDefault(defaultValue),
			page: parseAsString,
		},
		{ shallow },
	);
	const active = query[paramKey] ?? defaultValue;
	const selectOptions: FilterOption[] = includeAll
		? [{ value: defaultValue, label: allLabel }, ...options]
		: options;

	return (
		<FilterSelect
			label={label}
			value={active}
			options={selectOptions.map((option) => ({
				...option,
				label:
					typeof option.count === "number"
						? `${option.label} (${option.count})`
						: option.label,
			}))}
			className={className}
			onValueChange={(value) => {
				if (!value) return;
				onValueChange?.(value);
				void setQuery({
					[paramKey]: value === defaultValue ? null : value,
					...(resetPageOnChange ? { page: null } : {}),
				});
			}}
		/>
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
	const [query, setQuery] = useQueryStates(
		{
			[paramKey]: parseAsString.withDefault(""),
			page: parseAsString,
		},
		{ shallow },
	);
	const value = controlledValue ?? query[paramKey] ?? "";
	const handleValueChange = (nextValue: string) => {
		if (onValueChange) {
			onValueChange(nextValue);
			if (resetPageOnChange) void setQuery({ page: null });
			return;
		}
		void setQuery(
			{
				[paramKey]: nextValue || null,
				...(resetPageOnChange ? { page: null } : {}),
			},
			{ limitUrlUpdates: debounce(debounceMs) },
		);
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
