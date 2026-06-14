"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { completeMentorOnboarding } from "../_actions";
import { CompleteOnboardingSchema } from "../_schema";
import { OnboardingAvatarUpload } from "./onboarding-avatar-upload";

export function OnboardingForm({
	token,
	defaultBio,
	defaultNickname,
	defaultImage,
}: {
	token: string;
	defaultBio: string;
	defaultNickname: string;
	defaultImage: string;
}) {
	const router = useRouter();

	const { form, handleSubmitWithAction, action } = useHookFormAction(
		completeMentorOnboarding,
		zodResolver(CompleteOnboardingSchema),
		{
			formProps: {
				defaultValues: {
					token,
					bio: defaultBio,
					nickname: defaultNickname,
					image: defaultImage,
				},
			},
			actionProps: {
				onSuccess: ({ data }) => {
					toast.success("All set! Your profile is live.");
					if (data?.slug) {
						router.push(`/careers-corner/${data.slug}` as Route);
					}
				},
				onError: ({ error }) =>
					toast.error(error.serverError ?? "Failed to save."),
			},
		},
	);

	const errors = form.formState.errors;

	return (
		<form onSubmit={handleSubmitWithAction} className="space-y-5">
			<input type="hidden" {...form.register("token")} />

			<div className="space-y-1.5">
				<Label>Bio</Label>
				<Textarea rows={4} {...form.register("bio")} />
				{errors.bio && (
					<p className="text-sm text-red-500">{errors.bio.message}</p>
				)}
			</div>

			<div className="space-y-1.5">
				<Label>Nickname (optional)</Label>
				<Input {...form.register("nickname")} />
			</div>

			<input type="hidden" {...form.register("image")} />
			<div className="space-y-1.5">
				<Label>Profile photo (optional)</Label>
				<OnboardingAvatarUpload
					token={token}
					value={form.watch("image") ?? ""}
					onChange={(url) =>
						form.setValue("image", url, { shouldValidate: true })
					}
				/>
				{errors.image && (
					<p className="text-sm text-red-500">{errors.image.message}</p>
				)}
			</div>

			<Button type="submit" disabled={action.isPending} className="w-full">
				{action.isPending ? "Saving…" : "Save profile & go live"}
			</Button>
		</form>
	);
}
