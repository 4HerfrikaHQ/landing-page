"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useHookFormAction } from "@/src/lib/use-hook-form-action";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { toast } from "sonner";
import { joinAcademyWaitlist } from "../_actions";
import { AcademyWaitlistSchema } from "../_schema";

const academyOptions = [
	{ value: "tech", label: "techAcademy" },
	{ value: "business", label: "businessAcademy" },
	{ value: "climate", label: "climateAcademy" },
] as const;

export function WaitlistModal({
	open,
	onOpenChange,
	academy,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	academy?: "tech" | "business" | "climate";
}) {
	const t = useTranslations("academy");
	const { form, handleSubmitWithAction, action } = useHookFormAction(
		joinAcademyWaitlist,
		zodResolver(AcademyWaitlistSchema),
		{
			formProps: {
				defaultValues: {
					name: "",
					email: "",
					phone: "",
					academy: academy ?? "tech",
					location: "",
				},
			},
			actionProps: {
				onSuccess: () => {
					toast.success(t("success"));
					form.reset();
					onOpenChange(false);
				},
				onError: ({ error }) => toast.error(error.serverError ?? t("error")),
			},
		},
	);

	useEffect(() => {
		if (academy) form.setValue("academy", academy);
	}, [academy, form]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl p-6 sm:max-w-2xl sm:p-12">
				<DialogHeader>
					<DialogTitle className="text-3xl font-bold sm:text-4xl">
						{t("modalTitle")}
					</DialogTitle>
					<p className="pt-3 text-lg leading-7 text-muted-foreground">
						{t("modalDescription")}
					</p>
				</DialogHeader>

				<form onSubmit={handleSubmitWithAction} className="mt-5 space-y-5">
					{(["name", "email", "phone", "location"] as const).map((field) => (
						<div key={field} className="space-y-2">
							<Label htmlFor={field}>
								{t(`${field}Label`)} <span className="text-destructive">*</span>
							</Label>
							<Input
								id={field}
								type={field === "email" ? "email" : "text"}
								placeholder={t(`${field}Placeholder`)}
								{...form.register(field)}
								className="h-12 rounded-xl"
							/>
							{form.formState.errors[field] && (
								<p className="text-sm text-destructive">
									{form.formState.errors[field]?.message}
								</p>
							)}
						</div>
					))}

					<div className="space-y-2">
						<Label htmlFor="academy">
							{t("academyLabel")} <span className="text-destructive">*</span>
						</Label>
						<select
							id="academy"
							{...form.register("academy")}
							className="h-12 w-full rounded-xl border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
						>
							{academyOptions.map(({ value, label }) => (
								<option key={value} value={value}>
									{t(label)}
								</option>
							))}
						</select>
					</div>

					<Button
						type="submit"
						size="lg"
						className="mt-2 h-15 w-full rounded-full text-lg"
						disabled={action.isPending}
					>
						{action.isPending ? t("submitting") : t("submit")}
					</Button>
					<p className="text-center text-sm text-muted-foreground">
						{t("consent")}
					</p>
				</form>
			</DialogContent>
		</Dialog>
	);
}
