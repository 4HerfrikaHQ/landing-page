"use client";

import {
	useCallback,
	useEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";
import { useTextMorph } from "torph/react";
import { CYCLE_INTERVAL_MS } from "../_schema";
import { useOnScreen } from "./use-on-screen";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const HTML_ESCAPES: Record<string, string> = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#39;",
};

function escapeHtml(text: string) {
	return text.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);
}

function subscribeReducedMotion(notify: () => void) {
	const query = window.matchMedia(REDUCED_MOTION_QUERY);
	query.addEventListener("change", notify);
	return () => query.removeEventListener("change", notify);
}

function subscribeVisibility(notify: () => void) {
	document.addEventListener("visibilitychange", notify);
	return () => document.removeEventListener("visibilitychange", notify);
}

function usePageActive() {
	const reducedMotion = useSyncExternalStore(
		subscribeReducedMotion,
		() => window.matchMedia(REDUCED_MOTION_QUERY).matches,
		() => true,
	);
	const tabVisible = useSyncExternalStore(
		subscribeVisibility,
		() => document.visibilityState === "visible",
		() => false,
	);
	return tabVisible && !reducedMotion;
}

export function HeroMorphWord({ words }: { words: string[] }) {
	const [index, setIndex] = useState(0);
	const { element, onScreen } = useOnScreen<HTMLSpanElement>();
	const pageActive = usePageActive();
	const morph = useTextMorph({ disabled: !onScreen });
	const initial = useRef({ __html: escapeHtml(words[0] ?? "") });
	const running = onScreen && pageActive && words.length > 1;
	const { update } = morph;

	const attach = useCallback(
		(node: HTMLSpanElement | null) => {
			element.current = node;
			morph.ref.current = node;
		},
		[element, morph.ref],
	);

	useEffect(() => {
		if (!running) return;
		const timer = setInterval(
			() => setIndex((current) => (current + 1) % words.length),
			CYCLE_INTERVAL_MS,
		);
		return () => clearInterval(timer);
	}, [running, words.length]);

	useEffect(() => {
		update(words[index] ?? "");
	}, [index, words, update]);

	return (
		<span className="inline-grid justify-items-center">
			{words.map((word) => (
				<span
					key={word}
					aria-hidden="true"
					className="invisible col-start-1 row-start-1 motion-reduce:hidden"
				>
					{word}
				</span>
			))}
			<span
				ref={attach}
				aria-hidden="true"
				className="col-start-1 row-start-1 whitespace-nowrap"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: torph owns this node; the initial text is escaped
				dangerouslySetInnerHTML={initial.current}
			/>
		</span>
	);
}
