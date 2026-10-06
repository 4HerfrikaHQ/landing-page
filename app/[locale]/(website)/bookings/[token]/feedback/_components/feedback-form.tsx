"use client";

import { JOIN_US_URL } from "@/app/[locale]/(website)/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useHookFormAction } from "@/src/lib/use-hook-form-action";
import { cn } from "@/utils/cn";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Star } from "lucide-react";
import type { Route } from "next";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { submitFeedback } from "../_actions";
import { SubmitFeedbackSchema } from "../_schema";

const CALL_OPTIONS = [
	{ value: "yes", labelKey: "optionYes" },
	{ value: "mentor_no_show", labelKey: "optionMentorNoShow" },
	{ value: "mentee_no_show", labelKey: "optionMenteeNoShow" },
	{ value: "rescheduled_externally", labelKey: "optionRescheduled" },
] as const;

export function FeedbackForm({
	token,
	mentorName,
	mentorSlug,
}: {
	token: string;
	mentorName: string;
	mentorSlug: string;
}) {
	const t = useTranslations("feedback");
	const [hovered, setHovered] = useState(0);
	const [submitted, setSubmitted] = useState(false);

	const { form, handleSubmitWithAction, action } = useHookFormAction(
		submitFeedback,
		zodResolver(SubmitFeedbackSchema),
		{
			formProps: {
				defaultValues: {
					token,
					call_happened: "yes",
					rating: 5,
					comment: "",
					testimonial_consent: false,
				},
			},
			actionProps: {
				onSuccess: () => {
					toast.success(t("success"));
					setSubmitted(true);
				},
				onError: () => toast.error(t("error")),
			},
		},
	);

	const happened = form.watch("call_happened");
	const rating = form.watch("rating") ?? 0;

	if (submitted) {
		return (
			<div className="rounded-2xl border border-border/60 bg-white px-6 py-8 text-center shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
				<span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-surface-pink text-primary-500">
					<CheckCircle2 className="size-6" />
				</span>
				<h2 className="text-lg font-semibold text-foreground">
					{t("thanksTitle")}
				</h2>
				<p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
					{t("thanksDescription")}
				</p>
				<div className="mt-6 flex flex-col gap-3">
					<Button
						href={`/careercorner/${mentorSlug}` as Route}
						className="w-full"
					>
						{t("bookAgain", { name: mentorName })}
					</Button>
					<Button
						href={JOIN_US_URL}
						isExternal
						variant="outline"
						className="w-full"
					>
						{t("joinCommunityFull")}
					</Button>
				</div>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmitWithAction} className="space-y-6">
			<input type="hidden" {...form.register("token")} />

			<div className="space-y-1.5">
				<Label>{t("callHappened")}</Label>
				<Select
					value={form.watch("call_happened")}
					onValueChange={(v) =>
						v &&
						form.setValue(
							"call_happened",
							v as (typeof CALL_OPTIONS)[number]["value"],
							{ shouldDirty: true },
						)
					}
				>
					<SelectTrigger className="h-10 w-full rounded-lg bg-white">
						<SelectValue placeholder={t("select")} />
					</SelectTrigger>
					<SelectContent>
						{CALL_OPTIONS.map((o) => (
							<SelectItem key={o.value} value={o.value}>
								{t(o.labelKey)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{happened === "yes" && (
				<div className="space-y-2">
					<Label>{t("rating")}</Label>
					<div className="flex items-center gap-1.5">
						{[1, 2, 3, 4, 5].map((n) => {
							const active = (hovered || rating) >= n;
							return (
								<button
									key={n}
									type="button"
									aria-label={t("stars", { count: n })}
									onMouseEnter={() => setHovered(n)}
									onMouseLeave={() => setHovered(0)}
									onClick={() =>
										form.setValue("rating", n, { shouldDirty: true })
									}
									className="flex size-11 items-center justify-center rounded-xl transition-transform hover:scale-110 active:scale-95"
								>
									<Star
										className={cn(
											"size-8 transition-colors",
											active
												? "fill-primary-500 text-primary-500"
												: "text-border",
										)}
									/>
								</button>
							);
						})}
					</div>
				</div>
			)}

			<div className="space-y-1.5">
				<Label>{t("comment")}</Label>
				<Textarea
					rows={4}
					placeholder={t("commentPlaceholder")}
					{...form.register("comment")}
				/>
			</div>

			<label className="flex items-start gap-2.5 text-sm text-foreground/80">
				<input
					type="checkbox"
					{...form.register("testimonial_consent")}
					className="mt-0.5 size-4 accent-primary-500"
				/>
				<span>{t("consent")}</span>
			</label>

			<Button type="submit" disabled={action.isPending} className="w-full">
				{action.isPending ? t("submitting") : t("submit")}
			</Button>
		</form>
	);
}
