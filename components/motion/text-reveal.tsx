import { cn } from "@/utils/cn";

interface TextRevealProps {
	children: string;
	className?: string;
	/** Seconds to wait before the first word starts. */
	delay?: number;
}

const STAGGER_MS = 60;

/**
 * Word-by-word entrance for headings.
 *
 * CSS rather than motion, for the same reason as the hero: both call sites are
 * page-hero `<h1>`s, and the motion version rendered every word at `opacity: 0`
 * into the SSR'd HTML, waiting on hydration plus an IntersectionObserver before
 * revealing the largest text on the page. Per-word `animation-delay` gets the
 * identical effect off the first paint, in every browser, with no JS — and the
 * global `prefers-reduced-motion` rule collapses it for anyone who opts out.
 *
 * The trade-off versus the old version: this fires on load rather than on
 * scroll-into-view. For a heading that is either above the fold or read in
 * passing, arriving already-visible beats arriving late.
 */
export function TextReveal({
	children,
	className,
	delay = 0,
}: TextRevealProps) {
	const words = children.split(" ");

	return (
		<span className={className}>
			{/* The visible text is per-word spans; expose the whole string once to
			    assistive tech instead of a stream of fragments. */}
			<span className="sr-only">{children}</span>
			<span aria-hidden="true">
				{words.map((word, i) => (
					<span
						// biome-ignore lint/suspicious/noArrayIndexKey: the word list is derived from a static string and never reorders; the index is also the stagger position
						key={`${word}-${i}`}
						className={cn("animate-enter inline-block", "mr-[0.25em]")}
						style={{ animationDelay: `${delay * 1000 + i * STAGGER_MS}ms` }}
					>
						{word}
					</span>
				))}
			</span>
		</span>
	);
}
