"use client";

import type React from "react";

import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ValidationError, useForm } from "@formspree/react";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

interface FormSubmitEvent extends React.FormEvent<HTMLFormElement> {
	target: HTMLFormElement;
}

export default function MentorForm() {
	const [state, submit, reset] = useForm("xovnjbdq");
	const [receiveUpdates, setReceiveUpdates] = useState(false);
	const t = useTranslations("careers");
	const tc = useTranslations("common");

	const handleFormSubmit = (e: FormSubmitEvent) => {
		if (state.submitting) return;

		const submission = submit(e);

		toast.promise(submission, {
			success: () => {
				e.target.reset();
				setReceiveUpdates(false);
				reset();
				return t("successMessage");
			},
			description: t("successDescription"),
			error: t("errorMessage"),
		});
	};

	const inputClassName =
		"h-auto rounded-none border-0 border-b border-border px-0 py-2 focus-visible:border-border focus-visible:ring-0 placeholder:text-muted-foreground";

	return (
		<FadeIn>
		<div className="container max-w-3xl mx-auto py-8 md:py-12 lg:py-16 xl:py-20 px-4 sm:px-6 lg:px-8">
			<h1 className="text-4xl font-bold text-center mb-2">
				{t("becomeMentor")}
			</h1>
			<p className="text-muted-foreground text-center mb-8">
				{t("becomeMentorDescription")}
			</p>
			<form className="space-y-10" onSubmit={handleFormSubmit}>
				<div>
					<Input
						type="text"
						name="motivation"
						placeholder={t("whyMentor")}
						className={inputClassName}
						required
					/>
					<ValidationError prefix="Motivation" field="motivation" errors={state.errors} />
				</div>

				<div>
					<Input
						type="text"
						name="occupation"
						placeholder={t("occupation")}
						className={inputClassName}
						required
					/>
					<ValidationError prefix="Occupation" field="occupation" errors={state.errors} />
				</div>

				<div>
					<Input
						type="text"
						name="contact"
						placeholder={t("contactField")}
						className={inputClassName}
					/>
					<ValidationError prefix="Contact" field="contact" errors={state.errors} />
				</div>

				<div>
					<Input
						type="email"
						name="email"
						placeholder={t("emailPlaceholder")}
						className={inputClassName}
						required
					/>
					<ValidationError prefix="Email" field="email" errors={state.errors} />
				</div>

				<div>
					<Input
						type="url"
						name="linkedin"
						placeholder={t("linkedin")}
						className={inputClassName}
					/>
					<ValidationError prefix="LinkedIn" field="linkedin" errors={state.errors} />
				</div>

				<div>
					<div className="flex items-center gap-2 mb-2 text-muted-foreground">
						<ImageIcon className="h-4 w-4" />
						<span className="text-sm">{t("uploadHeadshot")}</span>
					</div>
					<Input
						type="url"
						name="headshotUrl"
						placeholder={t("headshotUrlPlaceholder")}
						className={inputClassName}
					/>
					<ValidationError prefix="Headshot URL" field="headshotUrl" errors={state.errors} />
				</div>

				<div className="flex items-center gap-2">
					<input type="hidden" name="receiveUpdates" value={receiveUpdates ? "yes" : "no"} />
					<Checkbox
						id="updates"
						checked={receiveUpdates}
						onCheckedChange={(checked) => setReceiveUpdates(checked as boolean)}
					/>
					<Label htmlFor="updates" className="text-foreground font-normal leading-none">
						{t("receiveUpdates")}
					</Label>
				</div>

				<Button
					type="submit"
					disabled={state.submitting}
					className="w-full bg-pink-500 text-white py-3 rounded font-medium hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{state.submitting ? t("submitting") : tc("submit")}
				</Button>
			</form>
		</div>
		</FadeIn>
	);
}
