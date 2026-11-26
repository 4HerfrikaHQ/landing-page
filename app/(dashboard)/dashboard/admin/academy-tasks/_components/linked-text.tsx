import { type TextSegment, linkSegments } from "../_helpers";

export function LinkedText({ text }: { text: string }) {
	return (
		<p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/80">
			{linkSegments(text).map((segment) => (
				<Segment key={segment.offset} segment={segment} />
			))}
		</p>
	);
}

function Segment({ segment }: { segment: TextSegment }) {
	if (segment.kind === "text") return <span>{segment.value}</span>;
	return (
		<a
			href={segment.href}
			target="_blank"
			rel="noopener noreferrer"
			className="text-primary-500 hover:underline"
		>
			{segment.value}
		</a>
	);
}
