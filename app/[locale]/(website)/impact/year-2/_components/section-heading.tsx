export function SectionHeading({
	pill,
	first,
	second,
	className,
}: {
	pill: string;
	first: string;
	second: string;
	className?: string;
}) {
	return (
		<div className={className}>
			<span className="inline-flex rounded-full bg-surface-pink px-3 py-1.5 text-xs text-primary-500">
				{pill}
			</span>
			<h2 className="mt-4 text-4xl font-bold leading-tight text-secondary-500 lg:text-5xl">
				{first}{" "}
				<em className="font-playfair font-black text-primary-500">{second}</em>
			</h2>
		</div>
	);
}
