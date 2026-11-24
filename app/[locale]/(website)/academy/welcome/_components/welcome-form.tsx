"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { useHookFormAction } from "@/src/lib/use-hook-form-action";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { AuthError } from "../../sign-in/_components/auth-error";
import { createLearner } from "../_actions";
import type { countryOptions } from "../_helpers";
import { CreateLearnerSchema } from "../_schema";

export function WelcomeForm({
	next,
	minAge,
	countries,
}: {
	next: string;
	minAge: number;
	countries: ReturnType<typeof countryOptions>;
}) {
	const t = useTranslations("academyAuth.welcome");
	const create = useHookFormAction(
		createLearner,
		zodResolver(CreateLearnerSchema),
		{
			formProps: {
				defaultValues: {
					certificateName: "",
					campus: "",
					ageConfirmed: false,
					next,
				},
			},
		},
	);
	const { register, formState } = create.form;
	const submitting = create.action.isPending || create.action.hasSucceeded;
	const submitLabel = submitting ? t("saving") : t("submit");
	const serverError = create.action.result.serverError;

	return (
		<form
			noValidate
			onSubmit={create.handleSubmitWithAction}
			className="flex flex-col gap-6"
		>
			<div className="flex gap-1.5" aria-hidden="true">
				<span className="h-1 flex-1 rounded-full bg-primary-500" />
				<span className="h-1 flex-1 rounded-full bg-primary-500" />
				<span className="h-1 flex-1 rounded-full bg-muted" />
			</div>

			<div className="flex flex-col gap-2">
				<h1 className="font-heading text-[28px] leading-[1.15] font-medium tracking-tight text-secondary-500">
					{t("title")}
				</h1>
				<p className="text-base text-muted-foreground">{t("subtitle")}</p>
			</div>

			<div className="flex flex-col gap-5">
				<div className="flex flex-col gap-2">
					<label htmlFor="certificate-name" className="text-sm font-medium">
						{t("nameLabel")}
					</label>
					<Input
						id="certificate-name"
						autoComplete="name"
						autoFocus
						placeholder={t("namePlaceholder")}
						aria-invalid={Boolean(formState.errors.certificateName)}
						aria-describedby="certificate-name-hint"
						className="h-12 px-4 text-base md:text-base"
						{...register("certificateName")}
					/>
					<p
						id="certificate-name-hint"
						className="text-sm text-muted-foreground"
					>
						{t("nameHint")}
					</p>
					<AuthError
						message={formState.errors.certificateName?.message}
						id="certificate-name-error"
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label htmlFor="country" className="text-sm font-medium">
						{t("countryLabel")}
					</label>
					<NativeSelect
						id="country"
						autoComplete="country"
						aria-invalid={Boolean(formState.errors.country)}
						{...register("country")}
					>
						<option value="">{t("countryPlaceholder")}</option>
						<optgroup label={t("countryGroupAfrica")}>
							{countries.africa.map(({ code, label }) => (
								<option key={code} value={code}>
									{label}
								</option>
							))}
						</optgroup>
						<optgroup label={t("countryGroupOther")}>
							{countries.other.map(({ code, label }) => (
								<option key={code} value={code}>
									{label}
								</option>
							))}
						</optgroup>
					</NativeSelect>
					<AuthError
						message={formState.errors.country?.message}
						id="country-error"
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label htmlFor="campus" className="text-sm font-medium">
						{t("campusLabel")}
					</label>
					<Input
						id="campus"
						placeholder={t("campusPlaceholder")}
						aria-invalid={Boolean(formState.errors.campus)}
						className="h-12 px-4 text-base md:text-base"
						{...register("campus")}
					/>
					<AuthError
						message={formState.errors.campus?.message}
						id="campus-error"
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label
						htmlFor="age-confirmed"
						className="flex cursor-pointer items-start gap-3 rounded-lg bg-surface-pink p-4"
					>
						<input
							id="age-confirmed"
							type="checkbox"
							aria-invalid={Boolean(formState.errors.ageConfirmed)}
							className="mt-0.5 size-6 shrink-0 cursor-pointer accent-primary-500"
							{...register("ageConfirmed")}
						/>
						<span className="text-sm">
							{t.rich("ageLabel", {
								minAge,
								strong: (chunks) => <b>{chunks}</b>,
							})}{" "}
							<span className="text-muted-foreground">{t("ageNote")}</span>
						</span>
					</label>
					<AuthError
						message={formState.errors.ageConfirmed?.message}
						id="age-error"
					/>
				</div>
			</div>

			<AuthError message={serverError} id="welcome-error" />

			<Button
				type="submit"
				size="lg"
				disabled={submitting}
				className="h-12 w-full py-0 text-base md:py-0 md:text-base"
			>
				{submitLabel}
			</Button>
		</form>
	);
}
