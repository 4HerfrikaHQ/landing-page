"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

type Options = IntersectionObserverInit;

export default function useIntersectionObserver(options?: Options) {
	const elementRef = useRef<Element | null>(null);
	const observerRef = useRef<IntersectionObserver | null>(null);
	const inViewRef = useRef(false);
	const listenersRef = useRef(new Set<() => void>());

	const ensureObserver = useCallback(() => {
		if (observerRef.current || typeof IntersectionObserver === "undefined") return;

		observerRef.current = new IntersectionObserver(
			([entry]) => {
				const next = entry?.isIntersecting ?? false;
				if (next === inViewRef.current) return;
				inViewRef.current = next;
				for (const listener of listenersRef.current) listener();
			},
			options,
		);

		if (elementRef.current) observerRef.current.observe(elementRef.current);
	}, [options]);

	const ref = useCallback(
		(node: Element | null) => {
			if (elementRef.current && observerRef.current) {
				observerRef.current.unobserve(elementRef.current);
			}
			elementRef.current = node;
			if (node) {
				ensureObserver();
				observerRef.current?.observe(node);
			}
		},
		[ensureObserver],
	);

	const subscribe = useCallback((listener: () => void) => {
		ensureObserver();
		listenersRef.current.add(listener);
		return () => {
			listenersRef.current.delete(listener);
			if (listenersRef.current.size === 0) {
				observerRef.current?.disconnect();
				observerRef.current = null;
			}
		};
	}, [ensureObserver]);

	const inView = useSyncExternalStore(
		subscribe,
		() => inViewRef.current,
		() => false,
	);

	return { ref, inView };
}
