import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

function read(key: string) {
	try {
		return window.localStorage.getItem(key) === "1";
	} catch {
		return false;
	}
}

function subscribe(listener: () => void) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

export function useDismissed(key: string) {
	const dismissed = useSyncExternalStore(
		subscribe,
		() => read(key),
		() => true,
	);

	const dismiss = () => {
		try {
			window.localStorage.setItem(key, "1");
		} catch {}
		for (const listener of listeners) listener();
	};

	return { dismissed, dismiss };
}
