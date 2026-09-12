import { cn } from "@/utils/cn";

interface TextRevealProps {
	children: string;
	className?: string;
	delay?: number;
}

const STAGGER_MS = 60;

export function TextReveal({
	children,
	className,
	delay = 0,
}: TextRevealProps) {
	const words = children.split(" ");

	return (
		<span className={className}>
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
