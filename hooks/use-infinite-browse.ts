"use client";

import { type QueryKey, useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import useIntersectionObserver from "./use-intersection-observer";

interface UseInfiniteBrowseOptions<T> {
	initialData?: T[];
	pageSize?: number;
	queryKey: QueryKey;
	enabled?: boolean;
	fetchItems: (pageParam: number, pageSize: number) => Promise<T[]>;
}

const ITEMS_PER_PAGE = 12;

export const useInfiniteBrowse = <T>({
	initialData,
	pageSize = ITEMS_PER_PAGE,
	queryKey,
	enabled = true,
	fetchItems,
}: UseInfiniteBrowseOptions<T>) => {
	const { ref, inView } = useIntersectionObserver();

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isFetching,
		status,
	} = useInfiniteQuery({
		queryKey,
		queryFn: ({ pageParam = 0 }) => fetchItems(pageParam, pageSize),
		getNextPageParam: (lastPage, allPages) =>
			lastPage.length === pageSize ? allPages.length : undefined,
		initialData: initialData
			? { pages: [initialData], pageParams: [0] }
			: undefined,
		initialPageParam: 0,
		refetchOnWindowFocus: false,
		enabled,
		staleTime: Number.POSITIVE_INFINITY,
	});

	useEffect(() => {
		if (!inView || !hasNextPage || isFetchingNextPage) return;
		const timeoutId = setTimeout(() => {
			fetchNextPage();
		}, 300);
		return () => clearTimeout(timeoutId);
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

	return {
		items: data?.pages.flat() ?? [],
		ref,
		hasNextPage,
		isFetchingNextPage,
		isFetching,
		status,
		fetchNextPage,
	};
};
