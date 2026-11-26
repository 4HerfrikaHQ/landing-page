"use client";

import { useCallback, useState } from "react";
import { REVEAL_RATIO } from "./tokens";

const listeners = new Map<Element, (inView: boolean) => void>();
const observers = new Map<number, IntersectionObserver>();

function observerFor(bottomInset: number) {
	let observer = observers.get(bottomInset);
	if (!observer) {
		observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const setInView = listeners.get(entry.target);
					if (!setInView) continue;
					if (entry.intersectionRatio >= REVEAL_RATIO) setInView(true);
					else if (!entry.isIntersecting) setInView(false);
				}
			},
			{
				threshold: [0, REVEAL_RATIO],
				rootMargin: `0px 0px -${bottomInset * 100}% 0px`,
			},
		);
		observers.set(bottomInset, observer);
	}
	return observer;
}

export function useRevealed<T extends Element>({
	bottomInset = 0,
}: { bottomInset?: number } = {}) {
	const [revealed, setRevealed] = useState(false);

	const ref = useCallback(
		(el: T | null) => {
			if (!el) return;
			const rect = el.getBoundingClientRect();
			const visibleBottom = window.innerHeight * (1 - bottomInset);
			if (rect.top < visibleBottom && rect.bottom > 0) setRevealed(true);
			listeners.set(el, setRevealed);
			const io = observerFor(bottomInset);
			io.observe(el);
			return () => {
				listeners.delete(el);
				io.unobserve(el);
			};
		},
		[bottomInset],
	);

	return { ref, revealed };
}
