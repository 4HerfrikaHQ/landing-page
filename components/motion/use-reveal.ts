"use client";

import { useEffect, useRef, useState } from "react";
import { VIEWPORT_ROOT_MARGIN } from "./tokens";

/**
 * One IntersectionObserver for the whole page, shared by every reveal.
 *
 * This replaces `motion`'s `whileInView` for the entrance primitives. The
 * animation itself is now CSS keyframes — the browser runs it on the
 * compositor instead of React driving styles per frame — so all the JS has to
 * do is say "this element is on screen now". That is one attribute flip per
 * element, once, and then the observer forgets about it.
 *
 * A per-element observer would be simpler to write but allocates one observer
 * per reveal; pages here have 13-23 of them.
 */
const callbacks = new WeakMap<Element, () => void>();
let observer: IntersectionObserver | null = null;

function sharedObserver(): IntersectionObserver {
	if (observer) return observer;

	observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				callbacks.get(entry.target)?.();
				// Reveals are one-shot: stop watching as soon as it fires.
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

		// Already on screen at mount (above the fold, or a fast scroll before
		// hydration): reveal now rather than waiting for an observer callback.
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
