import type { ReactNode } from "react";

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
						<span className="flex h-11 cursor-pointer items-center justify-center rounded-full text-[15px] font-medium transition-colors peer-checked:bg-primary-500 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-500 motion-reduce:transition-none">
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
			<span className="flex min-h-14 cursor-pointer items-center rounded-2xl border border-border px-4 text-2xl font-semibold tabular-nums transition-colors peer-checked:border-2 peer-checked:border-primary-500 peer-checked:bg-surface-pink peer-checked:text-primary-500 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-500 motion-reduce:transition-none">
				{children}
			</span>
		</label>
	);
}
