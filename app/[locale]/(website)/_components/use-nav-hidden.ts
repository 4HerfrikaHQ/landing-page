import { useSyncExternalStore } from "react";

const HIDE_AFTER_SCROLL_PX = 120;
const MIN_SCROLL_DELTA_PX = 8;

const listeners = new Set<() => void>();
let hidden = false;
let lastScrollY = 0;

function handleScroll() {
	const scrollY = window.scrollY;
	const delta = scrollY - lastScrollY;
	if (Math.abs(delta) < MIN_SCROLL_DELTA_PX) return;
	lastScrollY = scrollY;
	const nextHidden = delta > 0 && scrollY > HIDE_AFTER_SCROLL_PX;
	if (nextHidden === hidden) return;
	hidden = nextHidden;
	for (const listener of listeners) listener();
}

function subscribe(onChange: () => void) {
	if (listeners.size === 0) {
		lastScrollY = window.scrollY;
		window.addEventListener("scroll", handleScroll, { passive: true });
	}
	listeners.add(onChange);
	return () => {
		listeners.delete(onChange);
		if (listeners.size === 0) {
			window.removeEventListener("scroll", handleScroll);
			hidden = false;
		}
	};
}

export function useNavHidden() {
	return useSyncExternalStore(
		subscribe,
		() => hidden,
		() => false,
	);
}
