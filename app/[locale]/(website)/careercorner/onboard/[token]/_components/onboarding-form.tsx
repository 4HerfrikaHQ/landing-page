"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useHookFormAction } from "@/src/lib/use-hook-form-action";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { saveMentorOnboardingProfile } from "../_actions";
import { useOnboardingErrorMessage } from "../_hooks/use-onboarding-error-message";
import { CompleteOnboardingSchema } from "../_schema";
import { OnboardingAvatarUpload } from "./onboarding-avatar-upload";

export function OnboardingForm({
	token,
	defaultBio,
	defaultDisplayName,
	defaultImage,
	onSaved,
}: {
	token: string;
	defaultBio: string;
	defaultDisplayName: string;
	defaultImage: string;
	onSaved: () => void;
}) {
	const t = useTranslations("onboarding.form");
	const errorMessage = useOnboardingErrorMessage();
	const { form, handleSubmitWithAction, action } = useHookFormAction(
		saveMentorOnboardingProfile,
		zodResolver(CompleteOnboardingSchema),
		{
			formProps: {
				defaultValues: {
					token,
					bio: defaultBio,
					nickname: defaultDisplayName,
					image: defaultImage,
				},
			},
			actionProps: {
				onSuccess: () => {
					toast.success(t("saved"));
					onSaved();
				},
				onError: ({ error }) =>
					toast.error(errorMessage(error.serverError, t("saveFailed"))),
			},
		},
	);

	const errors = form.formState.errors;

	return (
		<form onSubmit={handleSubmitWithAction} className="space-y-5">
			<input type="hidden" {...form.register("token")} />

			<input type="hidden" {...form.register("image")} />
			<div className="space-y-1.5">
				<Label>{t("photo")}</Label>
				<OnboardingAvatarUpload
					token={token}
					value={form.watch("image") ?? ""}
					onChange={(url) =>
						form.setValue("image", url, { shouldValidate: true })
					}
				/>
				{errors.image && (
					<p className="text-sm text-destructive">
						{errorMessage(errors.image.message, errors.image.message)}
					</p>
				)}
			</div>

			<div className="space-y-1.5">
				<Label>{t("bio")}</Label>
				<Textarea rows={4} {...form.register("bio")} />
				{errors.bio && (
					<p className="text-sm text-destructive">
						{errorMessage(errors.bio.message, errors.bio.message)}
					</p>
				)}
			</div>

			<div className="space-y-1.5">
				<Label>{t("displayName")}</Label>
				<Input {...form.register("nickname")} />
			</div>

			<Button type="submit" disabled={action.isPending} className="w-full">
				{action.isPending ? t("saving") : t("save")}
			</Button>
		</form>
	);
}
