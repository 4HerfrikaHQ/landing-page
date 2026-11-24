export function ProgressBar({
	percent,
	label,
	trackClass,
}: {
	percent: number;
	label: string;
	trackClass: string;
}) {
	return (
		<>
			<progress
				className="sr-only"
				value={percent}
				max={100}
				aria-label={label}
			/>
			<div
				aria-hidden
				className={`h-1.5 overflow-hidden rounded-full ${trackClass}`}
			>
				<div
					className="h-full rounded-full bg-primary-500 motion-safe:transition-[width]"
					style={{ width: `${percent}%` }}
				/>
			</div>
		</>
	);
}
