import { useCallback, useRef, useSyncExternalStore } from "react";

const ON_SCREEN_MARGIN = "100px";

const shown = new WeakMap<Element, boolean>();

const listeners = new WeakMap<Element, () => void>();

let observer: IntersectionObserver | null = null;

function sharedObserver(): IntersectionObserver {
	observer ??= new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				shown.set(entry.target, entry.isIntersecting);
				listeners.get(entry.target)?.();
			}
		},
		{ rootMargin: ON_SCREEN_MARGIN },
	);
	return observer;
}

function watch(element: Element, notify: () => void): () => void {
	listeners.set(element, notify);
	sharedObserver().observe(element);
	return () => {
		listeners.delete(element);
		shown.delete(element);
		observer?.unobserve(element);
	};
}

export function useOnScreen<T extends Element>() {
	const element = useRef<T | null>(null);
	const subscribe = useCallback((notify: () => void) => {
		const target = element.current;
		return target === null ? () => undefined : watch(target, notify);
	}, []);
	const onScreen = useSyncExternalStore(
		subscribe,
		() =>
			element.current === null ? false : (shown.get(element.current) ?? false),
		() => false,
	);
	return { element, onScreen };
}
