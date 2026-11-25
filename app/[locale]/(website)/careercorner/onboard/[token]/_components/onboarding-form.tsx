"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useHookFormAction } from "@/src/lib/use-hook-form-action";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
	MENTOR_INPUT_CLASS,
	MENTOR_TEXTAREA_CLASS,
	MentorFormField,
} from "../../../_components/mentor-form-field";
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
	const imageError = errors.image
		? errorMessage(errors.image.message, errors.image.message)
		: undefined;
	const photoLabelId = "onboarding-photo-label";

	return (
		<form
			onSubmit={handleSubmitWithAction}
			aria-busy={action.isPending}
			className="space-y-6"
		>
			<input type="hidden" {...form.register("token")} />
			<input type="hidden" {...form.register("image")} />

			<div className="space-y-3">
				<p
					id={photoLabelId}
					className="text-sm leading-none font-semibold text-secondary-500"
				>
					{t("photo")}
				</p>
				<OnboardingAvatarUpload
					token={token}
					labelId={photoLabelId}
					value={form.watch("image") ?? ""}
					onChange={(url) =>
						form.setValue("image", url, { shouldValidate: true })
					}
				/>
				<ImageError message={imageError} />
			</div>

			<MentorFormField
				label={t("bio")}
				error={
					errors.bio
						? errorMessage(errors.bio.message, errors.bio.message)
						: undefined
				}
			>
				{(control) => (
					<Textarea
						rows={5}
						className={MENTOR_TEXTAREA_CLASS}
						{...control}
						{...form.register("bio")}
					/>
				)}
			</MentorFormField>

			<MentorFormField label={t("displayName")}>
				{(control) => (
					<Input
						className={MENTOR_INPUT_CLASS}
						{...control}
						{...form.register("nickname")}
					/>
				)}
			</MentorFormField>

			<Button
				type="submit"
				disabled={action.isPending}
				size="lg"
				className="h-12 w-full gap-2 px-6 py-0 text-base font-semibold focus-visible:ring-3 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 md:py-0 md:text-base"
			>
				<SavingSpinner pending={action.isPending} />
				{action.isPending ? t("saving") : t("save")}
			</Button>
		</form>
	);
}

function ImageError({ message }: { message: string | undefined }) {
	if (!message) return null;

	return (
		<p role="alert" className="text-sm font-medium text-destructive">
			{message}
		</p>
	);
}

function SavingSpinner({ pending }: { pending: boolean }) {
	if (!pending) return null;

	return (
		<Loader2Icon
			aria-hidden="true"
			className="size-4 animate-spin motion-reduce:animate-none"
		/>
	);
}
