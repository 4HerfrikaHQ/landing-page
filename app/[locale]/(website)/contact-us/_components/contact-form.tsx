"use client";

import { Link } from "@/i18n/navigation";
import { useSubmit } from "@formspree/react";
import { ArrowRight, ChevronDown, CircleAlert, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { FormEvent } from "react";
import { useReducer, useRef } from "react";
import { markSent, selectTopic } from "../_lib/contact-session";
import { useContactSession } from "../_lib/use-contact-session";
import {
	FORMSPREE_FORM_KEY,
	type FieldErrors,
	type FieldName,
	MESSAGE_MAX_LENGTH,
	type Topic,
	contactFieldsSchema,
	errorKeySchema,
	fieldNameSchema,
	fieldNames,
	topicSchema,
	topicSubjects,
	topics,
} from "../_schema";
import { FIELD_CONTROL_STYLES, Field } from "./field";

type FormState =
	| { status: "idle" }
	| { status: "submitting" }
	| { status: "error"; fieldErrors: FieldErrors; failed: boolean };

type FormAction =
	| { type: "SUBMIT" }
	| { type: "INVALID"; fieldErrors: FieldErrors }
	| { type: "FAILED"; fieldErrors: FieldErrors };

function formReducer(state: FormState, action: FormAction): FormState {
	switch (action.type) {
		case "SUBMIT":
			return { status: "submitting" };
		case "INVALID":
			return {
				status: "error",
				fieldErrors: action.fieldErrors,
				failed: false,
			};
		case "FAILED":
			return { status: "error", fieldErrors: action.fieldErrors, failed: true };
		default:
			return state;
	}
}

function validate(data: FormData): FieldErrors {
	const result = contactFieldsSchema.safeParse(Object.fromEntries(data));
	if (result.success) return {};
	const errors: FieldErrors = {};
	for (const issue of result.error.issues) {
		const field = fieldNameSchema.safeParse(issue.path[0]);
		const key = errorKeySchema.safeParse(issue.message);
		if (field.success && key.success) errors[field.data] ??= key.data;
	}
	return errors;
}

function serverFieldErrors(result: {
	getFieldErrors: (field: string) => readonly unknown[];
}): FieldErrors {
	const errors: FieldErrors = {};
	if (result.getFieldErrors("email").length > 0) errors.email = "emailInvalid";
	if (result.getFieldErrors("name").length > 0) errors.name = "nameRequired";
	if (result.getFieldErrors("message").length > 0)
		errors.message = "messageRequired";
	return errors;
}

function FormError({ visible }: { visible: boolean }) {
	const t = useTranslations("contact");
	if (!visible) return <div role="alert" />;
	return (
		<div
			role="alert"
			className="mt-5 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
		>
			<CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
			<p>{t("errorMessage")}</p>
		</div>
	);
}

function TopicBadge({ topic }: { topic: Topic | null }) {
	const t = useTranslations("contact");
	if (!topic) return null;
	return (
		<span className="inline-flex items-center gap-2 rounded-full bg-surface-pink px-3 py-1.5 text-sm text-primary-500">
			{t(`topics.${topic}.title`)}
			<a
				href="#topics"
				className="-my-3 inline-flex min-h-11 items-center rounded-md font-medium underline outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
			>
				{t("change")}
			</a>
		</span>
	);
}

function CertificateField({ topic }: { topic: Topic | null }) {
	const t = useTranslations("contact");
	if (topic !== "academy") return null;
	return (
		<Field
			name="certificate"
			label={t("certificateCode")}
			optionalLabel={t("optional")}
			hint={t("certificateHint")}
			className="lg:col-span-2"
			control={(props) => (
				<input
					{...props}
					name="certificate"
					type="text"
					autoComplete="off"
					placeholder="7KQ2-M9XD"
					className={FIELD_CONTROL_STYLES}
				/>
			)}
		/>
	);
}

export function ContactForm() {
	const t = useTranslations("contact");
	const submit = useSubmit(FORMSPREE_FORM_KEY);
	const { topic } = useContactSession();
	const [state, dispatch] = useReducer(formReducer, { status: "idle" });
	const formRef = useRef<HTMLFormElement>(null);

	const fieldErrors = state.status === "error" ? state.fieldErrors : {};
	const submitting = state.status === "submitting";

	const focusFirstInvalid = (errors: FieldErrors) => {
		const first = fieldNames.find((field) => errors[field]);
		if (!first) return;
		formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (submitting) return;

		const data = new FormData(event.currentTarget);
		const errors = validate(data);
		if (Object.keys(errors).length > 0) {
			dispatch({ type: "INVALID", fieldErrors: errors });
			requestAnimationFrame(() => focusFirstInvalid(errors));
			return;
		}

		const parsedTopic = topicSchema.parse(data.get("topic"));
		data.set("topic", topicSubjects[parsedTopic]);
		data.set("_subject", `4HerFrika contact: ${topicSubjects[parsedTopic]}`);
		dispatch({ type: "SUBMIT" });

		try {
			const result = await submit(data);
			if ("getFieldErrors" in result) {
				const serverErrors = serverFieldErrors(result);
				dispatch({ type: "FAILED", fieldErrors: serverErrors });
				requestAnimationFrame(() => focusFirstInvalid(serverErrors));
				return;
			}
			markSent({ topic: parsedTopic, email: String(data.get("email")) });
			window.scrollTo({ top: 0 });
		} catch {
			dispatch({ type: "FAILED", fieldErrors: {} });
		}
	};

	const errorText = (field: FieldName) => {
		const key = fieldErrors[field];
		return key ? t(`errors.${key}`) : undefined;
	};

	return (
		<form
			ref={formRef}
			onSubmit={handleSubmit}
			noValidate
			className="min-w-0 rounded-[20px] bg-white p-5 shadow-[0_12px_24px_rgba(0,0,0,0.10)] lg:rounded-[40px] lg:p-10"
		>
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h2 className="text-[28px] font-bold lg:text-[32px]">
					{t("leaveMessage")}
				</h2>
				<TopicBadge topic={topic} />
			</div>
			<p className="mt-2 text-[15px] text-muted-foreground">
				{t("requiredNote")}
			</p>

			<div className="mt-6 grid gap-5 lg:grid-cols-2">
				<Field
					name="name"
					label={t("fullName")}
					error={errorText("name")}
					control={(props) => (
						<input
							{...props}
							name="name"
							type="text"
							autoComplete="name"
							className={FIELD_CONTROL_STYLES}
						/>
					)}
				/>
				<Field
					name="email"
					label={t("emailLabel")}
					error={errorText("email")}
					control={(props) => (
						<input
							{...props}
							name="email"
							type="email"
							autoComplete="email"
							className={FIELD_CONTROL_STYLES}
						/>
					)}
				/>
				<Field
					name="topic"
					label={t("topicLabel")}
					error={errorText("topic")}
					control={(props) => (
						<span className="relative">
							<select
								{...props}
								name="topic"
								value={topic ?? ""}
								onChange={(event) => {
									const parsed = topicSchema.safeParse(event.target.value);
									selectTopic(parsed.success ? parsed.data : null);
								}}
								className={`${FIELD_CONTROL_STYLES} appearance-none pr-11`}
							>
								<option value="" disabled>
									{t("topicPlaceholder")}
								</option>
								{topics.map((option) => (
									<option key={option} value={option}>
										{t(`topics.${option}.title`)}
									</option>
								))}
							</select>
							<ChevronDown
								className="pointer-events-none absolute right-3 top-3.5 size-5 text-muted-foreground"
								aria-hidden="true"
							/>
						</span>
					)}
				/>
				<Field
					name="phone"
					label={t("phoneLabel")}
					optionalLabel={t("optional")}
					hint={t("phoneHint")}
					control={(props) => (
						<input
							{...props}
							name="phone"
							type="tel"
							inputMode="tel"
							autoComplete="tel"
							placeholder="+234 800 000 0000"
							className={FIELD_CONTROL_STYLES}
						/>
					)}
				/>
				<CertificateField topic={topic} />
				<Field
					name="message"
					label={t("yourMessage")}
					error={errorText("message")}
					className="lg:col-span-2"
					control={(props) => (
						<textarea
							{...props}
							name="message"
							maxLength={MESSAGE_MAX_LENGTH}
							className={`${FIELD_CONTROL_STYLES} h-36 resize-none p-4`}
						/>
					)}
				/>
			</div>

			<FormError visible={state.status === "error" && state.failed} />

			<button
				type="submit"
				disabled={submitting}
				className="mt-7 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary-500 px-6 text-base font-medium text-white outline-none transition hover:brightness-90 focus-visible:ring-4 focus-visible:ring-primary-500/30 disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto lg:px-10"
			>
				<SubmitLabel submitting={submitting} />
			</button>
			<p className="mt-3 text-sm text-muted-foreground">
				{t("privacyNote")}{" "}
				<Link
					href="/privacy"
					className="rounded-sm text-primary-500 underline outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
				>
					{t("privacyLink")}
				</Link>
			</p>
		</form>
	);
}

function SubmitLabel({ submitting }: { submitting: boolean }) {
	const t = useTranslations("contact");
	if (submitting) {
		return (
			<>
				<Loader2
					className="size-5 animate-spin motion-reduce:animate-none"
					aria-hidden="true"
				/>
				{t("sending")}
			</>
		);
	}
	return (
		<>
			{t("send")}
			<ArrowRight className="size-5" aria-hidden="true" />
		</>
	);
}
