"use client";

import { Label } from "@/components/ui/label";
import { useId } from "react";

export const MENTOR_INPUT_CLASS =
	"h-12 rounded-xl bg-white px-4 text-base placeholder:text-muted-foreground/70 focus-visible:border-primary-500 focus-visible:ring-primary-500/20";

export const MENTOR_TEXTAREA_CLASS =
	"min-h-36 resize-y rounded-xl bg-white px-4 py-3 text-base leading-relaxed placeholder:text-muted-foreground/70 focus-visible:border-primary-500 focus-visible:ring-primary-500/20";

type FieldControlProps = {
	id: string;
	"aria-invalid": true | undefined;
	"aria-describedby": string | undefined;
};

export function MentorFormField({
	label,
	error,
	hint,
	children,
}: {
	label: string;
	error?: string;
	hint?: string;
	children: (control: FieldControlProps) => React.ReactNode;
}) {
	const id = useId();
	const errorId = `${id}-error`;
	const hintId = `${id}-hint`;
	const describedBy =
		[error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
		undefined;

	return (
		<div className="space-y-2">
			<Label htmlFor={id} className="text-sm font-semibold text-secondary-500">
				{label}
			</Label>
			{children({
				id,
				"aria-invalid": error ? true : undefined,
				"aria-describedby": describedBy,
			})}
			{hint ? (
				<p id={hintId} className="text-xs text-muted-foreground">
					{hint}
				</p>
			) : null}
			{error ? (
				<p id={errorId} className="text-sm font-medium text-destructive">
					{error}
				</p>
			) : null}
		</div>
	);
}
