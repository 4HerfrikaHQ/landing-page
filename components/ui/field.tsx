import { Input } from "@/components/ui/input";

export function Field({
	label,
	name,
	type = "text",
	required,
	defaultValue,
}: {
	label: string;
	name: string;
	type?: string;
	required?: boolean;
	defaultValue?: string;
}) {
	return (
		<div className="flex flex-col gap-1.5">
			<label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
				{label}
				{required && <span className="text-red-400 ml-0.5">*</span>}
			</label>
			<Input
				name={name}
				type={type}
				required={required}
				defaultValue={defaultValue}
				className="h-9 text-sm"
			/>
		</div>
	);
}
