"use client";

import { useEffect, useRef, useState } from "react";
import { VIEWPORT_ROOT_MARGIN } from "./tokens";

const callbacks = new WeakMap<Element, () => void>();
let observer: IntersectionObserver | null = null;

function sharedObserver(): IntersectionObserver {
	if (observer) return observer;

	observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				callbacks.get(entry.target)?.();
				observer?.unobserve(entry.target);
				callbacks.delete(entry.target);
			}
		},
		{ rootMargin: VIEWPORT_ROOT_MARGIN },
	);

	return observer;
}

export function useReveal<T extends HTMLElement>() {
	const ref = useRef<T>(null);
	const [revealed, setRevealed] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el || revealed) return;

		const rect = el.getBoundingClientRect();
		if (rect.top < window.innerHeight && rect.bottom > 0) {
			setRevealed(true);
			return;
		}

		const io = sharedObserver();
		callbacks.set(el, () => setRevealed(true));
		io.observe(el);

		return () => {
			io.unobserve(el);
			callbacks.delete(el);
		};
	}, [revealed]);

	return { ref, revealed };
}
