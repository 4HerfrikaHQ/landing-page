"use client";

import { PendingLabel } from "@/components/ui/pending-label";
import { Button } from "@base-ui/react";
import { useId, useTransition } from "react";
import { toast } from "sonner";
import { subscribeAction } from "./subscribe-action";

const TONES = {
	dark: {
		input:
			"bg-white/10 text-white placeholder:text-white/70 focus-visible:ring-white",
		button:
			"bg-primary-bright text-secondary focus-visible:ring-white focus-visible:ring-offset-secondary",
	},
	light: {
		input:
			"bg-white text-foreground ring-1 ring-input placeholder:text-[#5c5f7a] focus-visible:ring-2 focus-visible:ring-primary-500",
		button:
			"bg-primary-500 text-white focus-visible:ring-primary-500 focus-visible:ring-offset-surface-pink",
	},
} as const;

export type SubscribeTone = keyof typeof TONES;

type SubscribeFormClientProps = {
	tone?: SubscribeTone;
	showCopy?: boolean;
	label: string;
	placeholder: string;
	description: string;
	submitLabel: string;
	successMessage: string;
};

export const SubscribeFormClient = ({
	tone = "dark",
	showCopy = true,
	label,
	placeholder,
	description,
	submitLabel,
	successMessage,
}: SubscribeFormClientProps) => {
	const [isPending, startTransition] = useTransition();
	const emailId = useId();

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.currentTarget;
		const formData = new FormData(form);
		startTransition(async () => {
			const result = await subscribeAction(formData);
			if (result?.error) {
				toast.error(result.error);
			} else {
				toast.success(successMessage);
				form.reset();
			}
		});
	};

	return (
		<div className="min-w-0">
			{showCopy ? (
				<>
					<h2 className="text-[15px] font-bold">{label}</h2>
					<p className="mt-4 text-[15px] text-white/85">{description}</p>
				</>
			) : null}
			<form
				className={`flex min-w-0 gap-2 ${showCopy ? "mt-4" : ""}`}
				onSubmit={handleSubmit}
			>
				<label htmlFor={emailId} className="sr-only">
					{placeholder}
				</label>
				<input
					id={emailId}
					name="email"
					type="email"
					size={1}
					autoComplete="email"
					placeholder={placeholder}
					required
					className={`h-11 min-w-0 flex-1 rounded-pill px-4 text-[15px] outline-none focus-visible:ring-2 ${TONES[tone].input}`}
				/>
				<Button
					type="submit"
					disabled={isPending}
					className={`h-11 shrink-0 cursor-pointer rounded-pill px-5 text-[15px] font-medium press outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${TONES[tone].button}`}
				>
					<PendingLabel pending={isPending} pendingLabel={submitLabel}>
						{submitLabel}
					</PendingLabel>
				</Button>
			</form>
		</div>
	);
};
