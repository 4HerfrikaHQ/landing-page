"use client";

import { useSyncExternalStore } from "react";

const TICK_MS = 1000;
const MS_PER_SECOND = 1000;

function subscribe(onChange: () => void) {
	const timer = setInterval(onChange, TICK_MS);
	return () => clearInterval(timer);
}

export function useSecondsUntil(targetMs: number) {
	return useSyncExternalStore(
		subscribe,
		() => Math.max(0, Math.ceil((targetMs - Date.now()) / MS_PER_SECOND)),
		() => 0,
	);
}
