"use client";

import { MentorImage } from "@/components/mentor-image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trackEvent } from "@/src/lib/analytics";
import type { MentorImageCrop } from "@/src/lib/mentor-image";
import { useHookFormAction } from "@/src/lib/use-hook-form-action";
import { cn } from "@/utils/cn";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, CircleAlert, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useId, useRef } from "react";
import { createBooking } from "../_actions";
import {
	CAREER_STAGE_OPTIONS,
	CreateBookingSchema,
	GENDER_OPTIONS,
} from "../_schema";

const FIELD_CLASS =
	"h-12 rounded-full border-border bg-white px-4 text-base md:text-base focus-visible:border-primary focus-visible:ring-primary/30";
const SELECT_CLASS =
	"h-12 w-full rounded-full border-border data-[size=default]:h-12 bg-white px-4 text-base focus-visible:border-primary focus-visible:ring-primary/30";

function focusOnMount(element: HTMLElement | null) {
	element?.focus();
}

export function BookingForm({
	mentorSlug,
	displayName,
	mentorImage,
	mentorImageCrop,
	whenLabel,
	startAtUtc,
	menteeTimezone,
	onChangeTime,
	onSuccess,
}: {
	mentorSlug: string;
	displayName: string;
	mentorImage: string | null;
	mentorImageCrop: MentorImageCrop | null;
	whenLabel: string;
	startAtUtc: string;
	menteeTimezone: string;
	onChangeTime: () => void;
	onSuccess: (email: string) => void;
}) {
	const t = useTranslations("mentorProfile");
	const queryClient = useQueryClient();
	const startedRef = useRef(false);
	const completedRef = useRef(false);

	const { form, handleSubmitWithAction, action } = useHookFormAction(
		createBooking,
		zodResolver(CreateBookingSchema),
		{
			formProps: {
				defaultValues: {
					mentorSlug,
					startAtUtc,
					menteeTimezone,
					mentee_name: "",
					mentee_email: "",
					mentee_gender: "female",
					purpose: "",
					mentee_phone: "",
					mentee_linkedin: "",
					mentee_country: "",
				},
			},
			actionProps: {
				onSuccess: () => {
					completedRef.current = true;
					trackEvent("booking_completed", { mentor_slug: mentorSlug });
					queryClient.invalidateQueries({ queryKey: ["slots", mentorSlug] });
					onSuccess(form.getValues("mentee_email"));
				},
				onError: () => {
					trackEvent("booking_failed", { mentor_slug: mentorSlug });
					queryClient.invalidateQueries({ queryKey: ["slots", mentorSlug] });
				},
			},
		},
	);

	const errors = form.formState.errors;
	const serverError = action.result?.serverError;
	const failed = action.hasErrored;

	useEffect(
		() => () => {
			if (startedRef.current && !completedRef.current) {
				trackEvent("booking_form_abandoned", { mentor_slug: mentorSlug });
			}
		},
		[mentorSlug],
	);

	function markStarted() {
		if (startedRef.current) return;
		startedRef.current = true;
		trackEvent("booking_form_started", { mentor_slug: mentorSlug });
	}

	const submitLabel = action.isPending
		? t("form.confirming")
		: t("form.confirm");

	return (
		<form
			onFocusCapture={markStarted}
			onSubmit={(event) => {
				trackEvent("booking_submitted", { mentor_slug: mentorSlug });
				handleSubmitWithAction(event);
			}}
			noValidate
			className="flex min-h-0 flex-1 flex-col"
		>
			<input type="hidden" {...form.register("mentorSlug")} />
			<input type="hidden" {...form.register("startAtUtc")} />
			<input type="hidden" {...form.register("menteeTimezone")} />

			<div className="flex-1 space-y-5 overflow-y-auto px-4 pb-6 sm:px-6">
				<FailureAlert
					failed={failed}
					message={serverError ?? t("form.errorFallback")}
					onChangeTime={onChangeTime}
				/>

				<div className="flex items-center gap-3 rounded-[24px] border border-primary/20 bg-surface-pink p-3">
					<span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-pill bg-white text-primary">
						<MentorAvatar image={mentorImage} crop={mentorImageCrop} />
					</span>
					<div className="min-w-0 flex-1">
						<p className="text-[15px] font-semibold leading-tight">
							{t("booking.summaryTitle", { name: displayName })}
						</p>
						<p className="mt-0.5 text-sm text-muted-foreground">
							{whenLabel} · {t("hero.meet")}
						</p>
					</div>
					<button
						type="button"
						onClick={onChangeTime}
						className="inline-flex h-11 shrink-0 items-center rounded-pill px-3 text-[15px] font-semibold text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
					>
						{t("booking.change")}
					</button>
				</div>

				<Field
					label={t("form.name")}
					message={errors.mentee_name ? t("form.errors.name") : undefined}
				>
					{(props) => (
						<Input
							{...props}
							autoComplete="name"
							placeholder={t("form.namePlaceholder")}
							className={FIELD_CLASS}
							{...form.register("mentee_name")}
						/>
					)}
				</Field>
				<Field
					label={t("form.email")}
					message={errors.mentee_email ? t("form.errors.email") : undefined}
				>
					{(props) => (
						<Input
							{...props}
							type="email"
							autoComplete="email"
							placeholder={t("form.emailPlaceholder")}
							className={FIELD_CLASS}
							{...form.register("mentee_email")}
						/>
					)}
				</Field>
				<Field label={t("form.gender")}>
					{(props) => (
						<Select
							value={form.watch("mentee_gender")}
							onValueChange={(v) =>
								v &&
								form.setValue(
									"mentee_gender",
									v as (typeof GENDER_OPTIONS)[number]["value"],
									{ shouldDirty: true },
								)
							}
						>
							<SelectTrigger id={props.id} className={SELECT_CLASS}>
								<SelectValue placeholder={t("form.select")}>
									{(value: string) => {
										const option = GENDER_OPTIONS.find(
											(o) => o.value === value,
										);
										return option ? t(`form.${option.labelKey}`) : value;
									}}
								</SelectValue>
							</SelectTrigger>
							<SelectContent>
								{GENDER_OPTIONS.map((o) => (
									<SelectItem key={o.value} value={o.value} className="py-2.5">
										{t(`form.${o.labelKey}`)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				</Field>
				<Field
					label={t("form.discuss")}
					hint={t("form.discussHint")}
					message={errors.purpose ? t("form.errors.purpose") : undefined}
				>
					{(props) => (
						<Textarea
							{...props}
							rows={4}
							placeholder={t("form.discussPlaceholder")}
							className="min-h-28 rounded-[20px] border-border bg-white px-4 py-3 text-base md:text-base focus-visible:border-primary focus-visible:ring-primary/30"
							{...form.register("purpose")}
						/>
					)}
				</Field>

				<details className="group rounded-[24px] border border-border bg-white">
					<summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-[24px] px-4 font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
						{t("form.more")}
						<span className="flex items-center gap-1 text-sm font-normal text-muted-foreground">
							{t("form.optional")}
							<ChevronDown
								className="size-4 transition-transform group-open:rotate-180 motion-reduce:transition-none"
								aria-hidden="true"
							/>
						</span>
					</summary>
					<div className="space-y-5 px-4 pb-5 pt-2">
						<Field label={t("form.country")} optional>
							{(props) => (
								<Input
									{...props}
									autoComplete="country-name"
									className={FIELD_CLASS}
									{...form.register("mentee_country")}
								/>
							)}
						</Field>
						<Field label={t("form.careerStage")} optional>
							{(props) => (
								<Select
									value={form.watch("mentee_career_stage") ?? ""}
									onValueChange={(v) =>
										form.setValue(
											"mentee_career_stage",
											(v || undefined) as
												| (typeof CAREER_STAGE_OPTIONS)[number]["value"]
												| undefined,
											{ shouldDirty: true },
										)
									}
								>
									<SelectTrigger id={props.id} className={SELECT_CLASS}>
										<SelectValue placeholder={t("form.select")}>
											{(value: string) => {
												const option = CAREER_STAGE_OPTIONS.find(
													(o) => o.value === value,
												);
												return option ? t(`form.${option.labelKey}`) : value;
											}}
										</SelectValue>
									</SelectTrigger>
									<SelectContent>
										{CAREER_STAGE_OPTIONS.map((o) => (
											<SelectItem
												key={o.value}
												value={o.value}
												className="py-2.5"
											>
												{t(`form.${o.labelKey}`)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</Field>
						<Field label={t("form.phone")} optional>
							{(props) => (
								<Input
									{...props}
									type="tel"
									autoComplete="tel"
									className={FIELD_CLASS}
									{...form.register("mentee_phone")}
								/>
							)}
						</Field>
						<Field
							label={t("form.linkedin")}
							optional
							message={
								errors.mentee_linkedin ? t("form.errors.linkedin") : undefined
							}
						>
							{(props) => (
								<Input
									{...props}
									type="url"
									className={FIELD_CLASS}
									{...form.register("mentee_linkedin")}
								/>
							)}
						</Field>
					</div>
				</details>
			</div>

			<div className="border-t border-border bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-6">
				<button
					type="submit"
					disabled={action.isPending}
					className="inline-flex h-12 w-full items-center justify-center rounded-pill bg-primary px-6 font-medium text-primary-foreground outline-none transition-colors hover:bg-primary-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60"
				>
					{submitLabel}
				</button>
			</div>
		</form>
	);
}

type FieldControlProps = {
	id: string;
	"aria-invalid": boolean;
	"aria-describedby": string | undefined;
};

function FailureAlert({
	failed,
	message,
	onChangeTime,
}: {
	failed: boolean;
	message: string;
	onChangeTime: () => void;
}) {
	const t = useTranslations("mentorProfile");
	if (!failed) return null;
	return (
		<div
			key={message}
			role="alert"
			tabIndex={-1}
			ref={focusOnMount}
			className="rounded-[20px] border border-[#e8a595] bg-[#fdf0ec] p-4 text-[#8f1d0b] outline-none focus-visible:ring-2 focus-visible:ring-[#8f1d0b]"
		>
			<p className="flex items-center gap-2 font-semibold">
				<CircleAlert className="size-5 shrink-0" aria-hidden="true" />
				{t("form.errorTitle")}
			</p>
			<p className="mt-1 text-[15px] leading-relaxed">{message}</p>
			<button
				type="button"
				onClick={onChangeTime}
				className="mt-2 inline-flex min-h-11 items-center py-2 font-semibold underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-[#8f1d0b]"
			>
				{t("form.pickAnother")}
			</button>
		</div>
	);
}

function MentorAvatar({
	image,
	crop,
}: {
	image: string | null;
	crop: MentorImageCrop | null;
}) {
	if (!image) return <UserRound className="size-6" aria-hidden="true" />;
	return (
		<MentorImage
			src={image}
			alt=""
			crop={crop}
			aspectRatio={1}
			sizes="48px"
			className="size-full"
		/>
	);
}

function OptionalMark({ optional }: { optional: boolean }) {
	const t = useTranslations("mentorProfile.form");
	if (!optional) return null;
	return (
		<span className="font-normal text-muted-foreground">
			({t("optional").toLowerCase()})
		</span>
	);
}

function FieldText({
	id,
	tone,
	role,
	children,
}: {
	id: string;
	tone: string;
	role?: "alert";
	children: string | undefined;
}) {
	if (!children) return null;
	return (
		<p id={id} role={role} className={cn("text-sm", tone)}>
			{children}
		</p>
	);
}

function Field({
	label,
	optional = false,
	hint,
	message,
	children,
}: {
	label: string;
	optional?: boolean;
	hint?: string;
	message?: string;
	children: (props: FieldControlProps) => ReactNode;
}) {
	const id = useId();
	const describedBy = [
		hint ? `${id}-hint` : null,
		message ? `${id}-error` : null,
	]
		.filter(Boolean)
		.join(" ");
	return (
		<div className="space-y-1.5">
			<Label htmlFor={id} className="text-base font-medium leading-snug">
				{label}
				<OptionalMark optional={optional} />
			</Label>
			{children({
				id,
				"aria-invalid": message !== undefined,
				"aria-describedby": describedBy || undefined,
			})}
			<FieldText id={`${id}-hint`} tone="text-muted-foreground">
				{hint}
			</FieldText>
			<FieldText id={`${id}-error`} tone="text-destructive" role="alert">
				{message}
			</FieldText>
		</div>
	);
}
