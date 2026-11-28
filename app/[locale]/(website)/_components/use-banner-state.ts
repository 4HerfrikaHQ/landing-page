import { useSyncExternalStore } from "react";

export type BannerState = "pending" | "open" | "collapsed";

const listeners = new Set<() => void>();

function read(key: string): BannerState {
	try {
		return window.sessionStorage.getItem(key) === "collapsed"
			? "collapsed"
			: "open";
	} catch {
		return "open";
	}
}

function subscribe(listener: () => void) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

function write(key: string, state: Exclude<BannerState, "pending">) {
	try {
		window.sessionStorage.setItem(key, state);
	} catch {}
	for (const listener of listeners) listener();
}

export function useBannerState(key: string) {
	const state = useSyncExternalStore<BannerState>(
		subscribe,
		() => read(key),
		() => "pending",
	);

	return {
		state,
		collapse: () => write(key, "collapsed"),
		open: () => write(key, "open"),
	};
}
