import type { ReactNode } from "react";

export const FIELD_CONTROL_STYLES =
	"h-12 w-full rounded-md border border-input bg-white px-4 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15 aria-invalid:border-2 aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/15";

type ControlProps = {
	id: string;
	"aria-describedby": string | undefined;
	"aria-invalid": true | undefined;
};

type FieldProps = {
	name: string;
	label: string;
	optionalLabel?: string;
	hint?: ReactNode;
	error?: string;
	className?: string;
	control: (props: ControlProps) => ReactNode;
};

function OptionalMark({ label }: { label?: string }) {
	if (!label) return null;
	return <span className="font-normal text-muted-foreground"> {label}</span>;
}

function FieldHint({ id, children }: { id: string; children?: ReactNode }) {
	if (!children) return null;
	return (
		<p id={id} className="text-sm text-muted-foreground">
			{children}
		</p>
	);
}

export function Field({
	name,
	label,
	optionalLabel,
	hint,
	error,
	className,
	control,
}: FieldProps) {
	const id = `contact-${name}`;
	const hintId = `${id}-hint`;
	const errorId = `${id}-error`;
	const describedBy =
		[hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") ||
		undefined;

	return (
		<div className={`flex min-w-0 flex-col gap-2 ${className ?? ""}`}>
			<label htmlFor={id} className="text-sm font-medium">
				{label}
				<OptionalMark label={optionalLabel} />
			</label>
			{control({
				id,
				"aria-describedby": describedBy,
				"aria-invalid": error ? true : undefined,
			})}
			<FieldHint id={hintId}>{hint}</FieldHint>
			<p
				id={errorId}
				aria-live="polite"
				className="text-sm text-destructive empty:hidden"
			>
				{error}
			</p>
		</div>
	);
}
