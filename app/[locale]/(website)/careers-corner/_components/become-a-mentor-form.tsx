"use client";

import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useHookFormAction } from "@/src/lib/use-hook-form-action";
import { cn } from "@/utils/cn";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	CheckCircle2Icon,
	FileIcon,
	Loader2Icon,
	UploadCloudIcon,
	XIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { uploadMentorCv } from "../apply/_upload-cv";
import { submitMentorApplication } from "../apply/_actions";
import { SubmitApplicationSchema } from "../apply/_schema";

export function BecomeAMentorForm() {
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
			actionProps: {
				onError: ({ error }) =>
					toast.error(error.serverError ?? "Something went wrong. Try again."),
			},
		},
	);

	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);

	const errors = form.formState.errors;
	const isSubmitting = isUploading || action.isPending;

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		if (!selectedFile) {
			form.setError("cv_path", { message: "Please upload your CV." });
			// Still let handleSubmitWithAction run so other field errors surface too
			await handleSubmitWithAction();
			return;
		}

		setIsUploading(true);
		const fd = new FormData();
		fd.append("file", selectedFile);
		const result = await uploadMentorCv(fd);
		setIsUploading(false);

		if (result.error) {
			form.setError("cv_path", { message: result.error });
			return;
		}

		form.setValue("cv_path", result.path!, { shouldValidate: false });
		await handleSubmitWithAction();
	}

	if (action.hasSucceeded) {
		return (
			<EmptyState
				className="border-solid bg-surface-pink/40"
				icon={CheckCircle2Icon}
				title="Application received — here's what happens next"
				description="Our team reviews each application personally and gets back to you within a few days. If it's a match, we'll send you a link to set up your mentor profile and availability."
				action={
					<Button href="/careers-corner" variant="outline" size="sm">
						Back to mentors
					</Button>
				}
			/>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-5">
			<FormField label="Full name" error={errors.name?.message}>
				<Input {...form.register("name")} />
			</FormField>

			<FormField label="Email address" error={errors.email?.message}>
				<Input type="email" {...form.register("email")} />
			</FormField>

			<FormField label="Phone / WhatsApp" error={errors.phone?.message}>
				<Input {...form.register("phone")} />
			</FormField>

			<FormField label="Country" error={errors.country?.message}>
				<Input {...form.register("country")} />
			</FormField>

			<FormField label="LinkedIn Profile URL" error={errors.linkedin_url?.message}>
				<Input type="url" {...form.register("linkedin_url")} />
			</FormField>

			<FormField label="About you" error={errors.bio?.message}>
				<Textarea
					rows={6}
					className="min-h-[120px] resize-none"
					placeholder="Tell us a bit about your background, what you do, and why you want to mentor young African women."
					{...form.register("bio")}
				/>
			</FormField>

			<FormField label="Primary Industry" error={errors.industry?.message}>
				<Input placeholder="e.g. Tech, Healthcare, Finance…" {...form.register("industry")} />
			</FormField>

			<FormField label="CV" error={errors.cv_path?.message}>
				<CvUpload
					selectedFile={selectedFile}
					onFileSelect={(file) => {
						setSelectedFile(file);
						if (file) form.clearErrors("cv_path");
					}}
					isUploading={isUploading}
					error={errors.cv_path?.message}
				/>
			</FormField>

			<Button
				type="submit"
				disabled={isSubmitting}
				className="w-full"
				size="lg"
			>
				{isUploading
					? "Uploading CV…"
					: action.isPending
						? "Submitting…"
						: "Submit application"}
			</Button>
		</form>
	);
}

function CvUpload({
	selectedFile,
	onFileSelect,
	isUploading,
	error,
}: {
	selectedFile: File | null;
	onFileSelect: (file: File | null) => void;
	isUploading: boolean;
	error?: string;
}) {
	const inputRef = useRef<HTMLInputElement>(null);

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0] ?? null;
		onFileSelect(file);
	}

	function handleRemove() {
		onFileSelect(null);
		if (inputRef.current) inputRef.current.value = "";
	}

	return (
		<div className="space-y-1.5">
			<input
				ref={inputRef}
				type="file"
				accept=".pdf,.doc,.docx"
				className="sr-only"
				onChange={handleFileChange}
				disabled={isUploading}
			/>

			{selectedFile ? (
				<div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
					{isUploading ? (
						<Loader2Icon className="size-4 shrink-0 animate-spin text-primary-500" />
					) : (
						<FileIcon className="size-4 shrink-0 text-muted-foreground" />
					)}
					<span className="min-w-0 flex-1 truncate text-sm text-foreground">
						{selectedFile.name}
					</span>
					{!isUploading && (
						<button
							type="button"
							onClick={handleRemove}
							className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
							aria-label="Remove file"
						>
							<XIcon className="size-4" />
						</button>
					)}
				</div>
			) : (
				<button
					type="button"
					onClick={() => inputRef.current?.click()}
					disabled={isUploading}
					className={cn(
						"flex w-full flex-col items-center gap-2 rounded-lg border border-dashed border-border px-6 py-8 text-center transition-colors hover:border-primary-500 hover:bg-surface-pink/30 disabled:pointer-events-none disabled:opacity-60",
						error && "border-destructive",
					)}
				>
					<UploadCloudIcon className="size-6 text-muted-foreground" />
					<span className="text-sm font-medium text-foreground">Upload CV</span>
					<span className="text-xs text-muted-foreground">
						PDF, DOC, DOCX · max 10 MB
					</span>
				</button>
			)}
		</div>
	);
}

function FormField({
	label,
	hint,
	helper,
	error,
	children,
}: {
	label: string;
	hint?: string;
	helper?: string;
	error?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-1.5">
			<div className="flex items-baseline justify-between gap-2">
				<Label>{label}</Label>
				{hint ? (
					<span className="text-xs text-muted-foreground">{hint}</span>
				) : null}
			</div>
			{children}
			{helper && !error ? (
				<p className="text-xs text-muted-foreground">{helper}</p>
			) : null}
			{error ? <p className="text-sm text-destructive">{error}</p> : null}
		</div>
	);
}
