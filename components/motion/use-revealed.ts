"use client";

import { useCallback, useState } from "react";
import { REVEAL_RATIO } from "./tokens";

const listeners = new Map<Element, (inView: boolean) => void>();
let observer: IntersectionObserver | null = null;

function sharedObserver() {
	observer ??= new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				const setInView = listeners.get(entry.target);
				if (!setInView) continue;
				if (entry.intersectionRatio >= REVEAL_RATIO) setInView(true);
				else if (!entry.isIntersecting) setInView(false);
			}
		},
		{ threshold: [0, REVEAL_RATIO] },
	);
	return observer;
}

export function useRevealed<T extends Element>() {
	const [revealed, setRevealed] = useState(false);

	const ref = useCallback((el: T | null) => {
		if (!el) return;
		const rect = el.getBoundingClientRect();
		if (rect.top < window.innerHeight && rect.bottom > 0) setRevealed(true);
		listeners.set(el, setRevealed);
		const io = sharedObserver();
		io.observe(el);
		return () => {
			listeners.delete(el);
			io.unobserve(el);
		};
	}, []);

	return { ref, revealed };
}
