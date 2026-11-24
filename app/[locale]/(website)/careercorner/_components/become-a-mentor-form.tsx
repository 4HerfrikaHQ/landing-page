"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useHookFormAction } from "@/src/lib/use-hook-form-action";
import { cn } from "@/utils/cn";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	CheckCircle2Icon,
	CircleAlertIcon,
	FileIcon,
	Loader2Icon,
	UploadCloudIcon,
	XIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import type { FieldError } from "react-hook-form";
import { submitMentorApplication } from "../apply/_actions";
import { SubmitApplicationSchema } from "../apply/_schema";
import { uploadMentorCv } from "../apply/_upload-cv";
import {
	MENTOR_INPUT_CLASS,
	MENTOR_TEXTAREA_CLASS,
	MentorFormField,
} from "./mentor-form-field";

const CV_MIME_TYPES = new Set([
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const CV_MAX_BYTES = 10 * 1024 * 1024;

const SUCCESS_STEPS = [
	{ title: "step1Title", body: "step1Body" },
	{ title: "step2Title", body: "step2Body" },
] as const;

type FieldName = keyof typeof SubmitApplicationSchema.shape;

export function BecomeAMentorForm() {
	const t = useTranslations("mentorApply");
	const { form, handleSubmitWithAction, action } = useHookFormAction(
		submitMentorApplication,
		zodResolver(SubmitApplicationSchema),
		{
			formProps: {
				defaultValues: {
					name: "",
					email: "",
					phone: "",
					linkedin_url: "",
					country: "",
					bio: "",
					industry: "",
					cv_path: "",
				},
			},
		},
	);

	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);

	const errors = form.formState.errors;
	const isSubmitting = isUploading || action.isPending;
	const bioLength = form.watch("bio").length;

	function errorMessage(field: FieldName, error: FieldError | undefined) {
		if (!error) return undefined;
		if (field === "cv_path") {
			if (error.type === "fileType") return t("cv.fileType");
			if (error.type === "fileSize") return t("cv.fileSize");
			if (error.type === "uploadFailed") return t("cv.uploadFailed");
			return t("errors.cv_path");
		}
		if (error.type === "too_big") {
			return field === "bio" ? t("errors.bioTooLong") : t("errors.tooLong");
		}
		return t(`errors.${field}`);
	}

	function handleFileSelect(file: File | null) {
		if (!file) {
			setSelectedFile(null);
			return;
		}
		if (!CV_MIME_TYPES.has(file.type)) {
			form.setError("cv_path", { type: "fileType" });
			return;
		}
		if (file.size > CV_MAX_BYTES) {
			form.setError("cv_path", { type: "fileSize" });
			return;
		}
		setSelectedFile(file);
		form.clearErrors("cv_path");
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		if (!selectedFile) {
			form.setError("cv_path", { type: "required" });
			await handleSubmitWithAction();
			return;
		}

		setIsUploading(true);
		const fd = new FormData();
		fd.append("file", selectedFile);
		const result = await uploadMentorCv(fd);
		setIsUploading(false);

		if (result.error) {
			form.setError("cv_path", { type: "uploadFailed" });
			return;
		}

		form.setValue("cv_path", result.path as string, { shouldValidate: false });
		await handleSubmitWithAction();
	}

	if (action.hasSucceeded) {
		return (
			<section
				aria-labelledby="mentor-apply-success-title"
				className="rounded-[20px] bg-white p-6 shadow-[0_12px_24px_rgba(0,0,0,0.10)] lg:p-8"
			>
				<span
					aria-hidden="true"
					className="grid size-14 place-items-center rounded-full bg-surface-pink text-primary-500"
				>
					<CheckCircle2Icon className="size-7" strokeWidth={1.75} />
				</span>
				<h2
					id="mentor-apply-success-title"
					tabIndex={-1}
					ref={(node) => node?.focus()}
					className="mt-5 text-2xl font-bold leading-tight text-secondary-500 outline-none lg:text-3xl"
				>
					{t("success.title")}
				</h2>
				<p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
					{t("success.description")}
				</p>
				<ol className="mt-6 space-y-4">
					{SUCCESS_STEPS.map((step, index) => (
						<li key={step.title} className="flex gap-4">
							<span
								aria-hidden="true"
								className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-500 text-sm font-semibold text-white"
							>
								{index + 1}
							</span>
							<div>
								<h3 className="font-semibold text-secondary-500">
									{t(`success.${step.title}`)}
								</h3>
								<p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
									{t(`success.${step.body}`)}
								</p>
							</div>
						</li>
					))}
				</ol>
				<Button
					href="/careercorner"
					variant="outline"
					size="lg"
					className="mt-8 h-12 px-6 py-0 text-base focus-visible:ring-3 focus-visible:ring-primary-500/30 md:py-0 md:text-base"
				>
					{t("success.back")}
				</Button>
			</section>
		);
	}

	return (
		<form
			onSubmit={handleSubmit}
			noValidate
			aria-busy={isSubmitting}
			className="rounded-[20px] bg-white p-6 shadow-[0_12px_24px_rgba(0,0,0,0.10)] lg:p-8"
		>
			<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
				<h2 className="text-2xl font-bold text-secondary-500">
					{t("formTitle")}
				</h2>
				<p className="text-xs text-muted-foreground">{t("allRequired")}</p>
			</div>

			<div className="mt-6 grid gap-5 sm:grid-cols-2">
				<MentorFormField
					label={t("fields.name")}
					error={errorMessage("name", errors.name)}
				>
					{(control) => (
						<Input
							autoComplete="name"
							className={MENTOR_INPUT_CLASS}
							{...control}
							{...form.register("name")}
						/>
					)}
				</MentorFormField>

				<MentorFormField
					label={t("fields.email")}
					error={errorMessage("email", errors.email)}
				>
					{(control) => (
						<Input
							type="email"
							autoComplete="email"
							className={MENTOR_INPUT_CLASS}
							{...control}
							{...form.register("email")}
						/>
					)}
				</MentorFormField>

				<MentorFormField
					label={t("fields.phone")}
					error={errorMessage("phone", errors.phone)}
				>
					{(control) => (
						<Input
							type="tel"
							autoComplete="tel"
							className={MENTOR_INPUT_CLASS}
							{...control}
							{...form.register("phone")}
						/>
					)}
				</MentorFormField>

				<MentorFormField
					label={t("fields.country")}
					error={errorMessage("country", errors.country)}
				>
					{(control) => (
						<Input
							autoComplete="country-name"
							className={MENTOR_INPUT_CLASS}
							{...control}
							{...form.register("country")}
						/>
					)}
				</MentorFormField>

				<div className="sm:col-span-2">
					<MentorFormField
						label={t("fields.linkedin")}
						error={errorMessage("linkedin_url", errors.linkedin_url)}
					>
						{(control) => (
							<Input
								type="url"
								inputMode="url"
								autoComplete="url"
								placeholder={t("fields.linkedinPlaceholder")}
								className={MENTOR_INPUT_CLASS}
								{...control}
								{...form.register("linkedin_url")}
							/>
						)}
					</MentorFormField>
				</div>

				<div className="sm:col-span-2">
					<MentorFormField
						label={t("fields.industry")}
						error={errorMessage("industry", errors.industry)}
					>
						{(control) => (
							<Input
								placeholder={t("fields.industryPlaceholder")}
								className={MENTOR_INPUT_CLASS}
								{...control}
								{...form.register("industry")}
							/>
						)}
					</MentorFormField>
				</div>

				<div className="sm:col-span-2">
					<MentorFormField
						label={t("fields.bio")}
						error={errorMessage("bio", errors.bio)}
						hint={t("fields.bioCount", { count: bioLength })}
					>
						{(control) => (
							<Textarea
								rows={6}
								placeholder={t("fields.bioPlaceholder")}
								className={MENTOR_TEXTAREA_CLASS}
								{...control}
								{...form.register("bio")}
							/>
						)}
					</MentorFormField>
				</div>

				<div className="sm:col-span-2">
					<MentorFormField
						label={t("fields.cv")}
						error={errorMessage("cv_path", errors.cv_path)}
					>
						{(control) => (
							<CvUpload
								control={control}
								selectedFile={selectedFile}
								onFileSelect={handleFileSelect}
								isUploading={isUploading}
								hasError={Boolean(errors.cv_path)}
							/>
						)}
					</MentorFormField>
				</div>
			</div>

			{action.hasErrored ? (
				<div
					role="alert"
					className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
				>
					<CircleAlertIcon className="mt-0.5 size-4 shrink-0" />
					<p>{t("serverError")}</p>
				</div>
			) : null}

			<Button
				type="submit"
				disabled={isSubmitting}
				size="lg"
				className="mt-6 h-12 w-full gap-2 px-6 py-0 text-base font-semibold focus-visible:ring-3 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 md:py-0 md:text-base"
			>
				{isSubmitting ? (
					<Loader2Icon className="size-4 animate-spin motion-reduce:animate-none" />
				) : null}
				{isUploading
					? t("uploadingCv")
					: action.isPending
						? t("submitting")
						: t("submit")}
			</Button>
		</form>
	);
}

function CvUpload({
	control,
	selectedFile,
	onFileSelect,
	isUploading,
	hasError,
}: {
	control: {
		id: string;
		"aria-describedby": string | undefined;
	};
	selectedFile: File | null;
	onFileSelect: (file: File | null) => void;
	isUploading: boolean;
	hasError: boolean;
}) {
	const t = useTranslations("mentorApply.cv");
	const inputRef = useRef<HTMLInputElement>(null);

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		onFileSelect(e.target.files?.[0] ?? null);
		e.target.value = "";
	}

	return (
		<div>
			<input
				ref={inputRef}
				type="file"
				accept=".pdf,.doc,.docx"
				className="sr-only"
				tabIndex={-1}
				aria-hidden="true"
				onChange={handleFileChange}
				disabled={isUploading}
			/>

			{selectedFile ? (
				<div className="flex min-h-14 items-center gap-3 rounded-xl border border-primary-500/30 bg-surface-pink px-4 py-2">
					{isUploading ? (
						<Loader2Icon className="size-5 shrink-0 animate-spin text-primary-500 motion-reduce:animate-none" />
					) : (
						<FileIcon className="size-5 shrink-0 text-primary-500" />
					)}
					<span
						id={control.id}
						className="min-w-0 flex-1 truncate text-sm font-medium text-secondary-500"
					>
						{selectedFile.name}
					</span>
					{isUploading ? (
						<span className="text-xs text-muted-foreground">
							{t("uploading")}
						</span>
					) : (
						<button
							type="button"
							onClick={() => onFileSelect(null)}
							className="-mr-2 grid size-11 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:text-destructive focus-visible:ring-3 focus-visible:ring-primary-500/40 focus-visible:outline-none"
							aria-label={t("remove")}
						>
							<XIcon className="size-4" />
						</button>
					)}
				</div>
			) : (
				<button
					id={control.id}
					type="button"
					aria-describedby={control["aria-describedby"]}
					onClick={() => inputRef.current?.click()}
					disabled={isUploading}
					className={cn(
						"flex min-h-28 w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-input bg-surface-pink/40 px-6 py-6 text-center transition-[border-color,background-color,box-shadow] duration-200 hover:border-primary-500 hover:bg-surface-pink focus-visible:border-primary-500 focus-visible:ring-3 focus-visible:ring-primary-500/20 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none",
						hasError && "border-destructive bg-destructive/5",
					)}
				>
					<UploadCloudIcon className="size-6 text-primary-500" />
					<span className="text-sm font-semibold text-secondary-500">
						{t("upload")}
					</span>
					<span className="text-xs text-muted-foreground">{t("hint")}</span>
				</button>
			)}
		</div>
	);
}
