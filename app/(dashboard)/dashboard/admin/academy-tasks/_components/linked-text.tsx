import { linkSegments } from "../_helpers";

export function LinkedText({ text }: { text: string }) {
	return (
		<p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/80">
			{linkSegments(text).map((segment) =>
				segment.kind === "link" ? (
					<a
						key={segment.offset}
						href={segment.href}
						target="_blank"
						rel="noopener noreferrer"
						className="text-primary-500 hover:underline"
					>
						{segment.value}
					</a>
				) : (
					<span key={segment.offset}>{segment.value}</span>
				),
			)}
		</p>
	);
}
