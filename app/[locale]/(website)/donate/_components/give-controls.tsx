import { SelectedHighlight } from "@/components/ui/selected-highlight";
import type { ReactNode } from "react";

const PILL_RADIUS = 9999;

const TILE_RADIUS = 16;

function ActiveHighlight({
	active,
	layoutId,
	radius,
	className,
}: {
	active: boolean;
	layoutId: string;
	radius: number;
	className: string;
}) {
	if (!active) return null;
	return (
		<SelectedHighlight
			layoutId={layoutId}
			radius={radius}
			className={className}
		/>
	);
}

export function SegmentedRadio({
	legend,
	name,
	value,
	options,
	onChange,
}: {
	legend: string;
	name: string;
	value: string;
	options: { value: string; label: string }[];
	onChange: (value: string) => void;
}) {
	return (
		<fieldset className="min-w-0">
			<legend className="text-sm font-semibold">{legend}</legend>
			<div className="mt-3 grid grid-cols-2 rounded-full bg-muted p-1">
				{options.map((option) => (
					<label key={option.value} className="relative">
						<input
							type="radio"
							name={name}
							value={option.value}
							checked={value === option.value}
							onChange={() => onChange(option.value)}
							className="peer sr-only"
						/>
						<span className="relative isolate flex h-11 cursor-pointer items-center justify-center rounded-full text-[15px] font-medium transition-colors duration-200 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-500">
							<ActiveHighlight
								active={value === option.value}
								layoutId={`${name}-highlight`}
								radius={PILL_RADIUS}
								className="bg-primary-500"
							/>
							{option.label}
						</span>
					</label>
				))}
			</div>
		</fieldset>
	);
}

export function OptionTile({
	name,
	checked,
	onChange,
	children,
}: {
	name: string;
	checked: boolean;
	onChange: () => void;
	children: ReactNode;
}) {
	return (
		<label className="relative">
			<input
				type="radio"
				name={name}
				checked={checked}
				onChange={onChange}
				className="peer sr-only"
			/>
			<span className="relative isolate flex min-h-14 cursor-pointer items-center rounded-2xl border border-border px-4 text-2xl font-semibold tabular-nums transition-colors duration-200 peer-checked:text-primary-500 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-500">
				<ActiveHighlight
					active={checked}
					layoutId={`${name}-highlight`}
					radius={TILE_RADIUS}
					className="border-2 border-primary-500 bg-surface-pink"
				/>
				{children}
			</span>
		</label>
	);
}
