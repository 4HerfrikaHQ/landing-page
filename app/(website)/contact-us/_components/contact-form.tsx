"use client";

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

	return (
		<form
			className="w-full md:col-span-3 flex flex-col gap-3"
			onSubmit={handleFormSubmit}
		>
			<h3 className="text-md md:text-xl text-gray-400 font-semibold mb-4 tracking-wider">
				Leave us a message
			</h3>

			<input
				type="text"
				name="name"
				className="border w-full px-3 py-2 border-gray-300/50 bg-transparent text-gray-300 placeholder:text-gray-300 rounded"
				placeholder="Name"
				required
			/>
			<ValidationError prefix="Name" field="name" errors={state.errors} />

			<input
				type="email"
				name="email"
				className="border w-full px-3 my-7 py-2 border-gray-300/50 bg-transparent text-gray-300 placeholder:text-gray-300 rounded"
				placeholder="Email Address"
				required
			/>
			<ValidationError prefix="Email" field="email" errors={state.errors} />

			<textarea
				name="message"
				className="border w-full px-3 py-2 h-32 border-gray-300/50 bg-transparent text-gray-300 placeholder:text-gray-300 rounded"
				placeholder="Your Message"
				required
			/>
			<ValidationError prefix="Message" field="message" errors={state.errors} />

			<button
				type="submit"
				disabled={state.submitting}
				className="bg-primary-500 rounded-md w-full text-center text-white hover:bg-opacity-80 mt-5 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{state.submitting ? "Sending..." : "Send"}
			</button>
		</form>
	);
};

export default ContactForm;
