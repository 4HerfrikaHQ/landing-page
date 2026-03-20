"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/utils/cn";
import { ValidationError, useForm } from "@formspree/react";
import type React from "react";
import { toast } from "sonner";

interface FormSubmitEvent extends React.FormEvent<HTMLFormElement> {
	target: HTMLFormElement;
}

const ContactForm = () => {
	const [state, submit, reset] = useForm("xovnjbdq");

	const handleFormSubmit = (e: FormSubmitEvent) => {
		if (state.submitting) return;

		const submission = submit(e);

		toast.promise(submission, {
			success: () => {
				e.target.reset();
				reset();
				return "Message sent successfully!";
			},
			description:
				"Thank you for getting in touch. We'll get back to you soon.",
			error: "Failed to send message. Please check your inputs and try again.",
		});
	};

	const inputClassName =
		"border border-border bg-transparent text-muted-foreground placeholder:text-muted-foreground rounded";

	return (
		<form
			className="w-full md:col-span-3 flex flex-col gap-3"
			onSubmit={handleFormSubmit}
		>
			<h3 className="text-md md:text-xl text-foreground font-semibold mb-4 tracking-wider">
				Leave us a message
			</h3>

			<Input
				type="text"
				name="name"
				className={inputClassName}
				placeholder="Name"
				required
			/>
			<ValidationError prefix="Name" field="name" errors={state.errors} />

			<Input
				type="email"
				name="email"
				className={cn(inputClassName, "my-7")}
				placeholder="Email Address"
				required
			/>
			<ValidationError prefix="Email" field="email" errors={state.errors} />

			<Textarea
				name="message"
				className={cn(inputClassName, "h-32 resize-none")}
				placeholder="Your Message"
				required
			/>
			<ValidationError prefix="Message" field="message" errors={state.errors} />

			<Button
				type="submit"
				disabled={state.submitting}
				className="bg-primary-500 rounded-md w-full text-center text-white hover:bg-opacity-80 mt-5 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{state.submitting ? "Sending..." : "Send"}
			</Button>
		</form>
	);
};

export default ContactForm;
