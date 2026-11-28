"use client";

import { useCallback, useState } from "react";
import { REVEAL_RATIO } from "./tokens";

const listeners = new Map<Element, (inView: boolean) => void>();
const observers = new Map<number, IntersectionObserver>();

function observerFor(ratio: number) {
	let observer = observers.get(ratio);
	if (!observer) {
		observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const setInView = listeners.get(entry.target);
					if (!setInView) continue;
					if (entry.intersectionRatio >= ratio) setInView(true);
					else if (!entry.isIntersecting) setInView(false);
				}
			},
			{ threshold: [0, ratio] },
		);
		observers.set(ratio, observer);
	}
	return observer;
}

function visibleRatio(rect: DOMRect) {
	if (rect.height === 0) return 0;
	const visible =
		Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
	return Math.max(0, visible) / rect.height;
}

export function useRevealed<T extends Element>({
	ratio = REVEAL_RATIO,
}: { ratio?: number } = {}) {
	const [revealed, setRevealed] = useState(false);

	const ref = useCallback(
		(el: T | null) => {
			if (!el) return;
			if (visibleRatio(el.getBoundingClientRect()) >= ratio) setRevealed(true);
			listeners.set(el, setRevealed);
			const io = observerFor(ratio);
			io.observe(el);
			return () => {
				listeners.delete(el);
				io.unobserve(el);
			};
		},
		[ratio],
	);

	return { ref, revealed };
}
