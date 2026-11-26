"use client";

import { useMemo, useSyncExternalStore } from "react";

export function useElementInView(id: string): boolean {
	const store = useMemo(() => {
		let visible = false;
		return {
			subscribe(onChange: () => void) {
				const element = document.getElementById(id);
				if (!element) return () => {};
				const observer = new IntersectionObserver((entries) => {
					const latest = entries.at(-1);
					if (!latest || latest.isIntersecting === visible) return;
					visible = latest.isIntersecting;
					onChange();
				});
				observer.observe(element);
				return () => observer.disconnect();
			},
			getSnapshot: () => visible,
		};
	}, [id]);

	return useSyncExternalStore(store.subscribe, store.getSnapshot, () => false);
}
