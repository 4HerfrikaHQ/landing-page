"use client";

import { Button } from "@base-ui/react";
import { useId, useTransition } from "react";
import { toast } from "sonner";
import { subscribeAction } from "./subscribe-action";

type SubscribeFormClientProps = {
	label: string;
	placeholder: string;
	description: string;
	submitLabel: string;
	successMessage: string;
};

export const SubscribeFormClient = ({
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
			<h2 className="text-[15px] font-bold">{label}</h2>
			<p className="mt-4 text-[15px] text-white/85">{description}</p>
			<form className="mt-4 flex min-w-0 gap-2" onSubmit={handleSubmit}>
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
					className="h-11 min-w-0 flex-1 rounded-pill bg-white/10 px-4 text-[15px] text-white placeholder:text-white/70 outline-none focus-visible:ring-2 focus-visible:ring-white"
				/>
				<Button
					type="submit"
					disabled={isPending}
					className="h-11 shrink-0 cursor-pointer rounded-pill bg-primary-bright px-5 text-[15px] font-medium text-secondary outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-secondary disabled:cursor-not-allowed disabled:opacity-50"
				>
					{submitLabel}
				</Button>
			</form>
		</div>
	);
};
