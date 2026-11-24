"use client";

import { ImageCropDialog } from "@/app/(dashboard)/dashboard/mentor/profile/_components/image-crop-dialog";
import { MentorImage } from "@/components/mentor-image";
import type { MentorImageCrop } from "@/src/lib/mentor-image";
import { cn } from "@/utils/cn";
import { CameraIcon, Loader2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { uploadOnboardingImage } from "../_actions";
import { useOnboardingErrorMessage } from "../_hooks/use-onboarding-error-message";

export function OnboardingAvatarUpload({
	token,
	labelId,
	value,
	onChange,
}: {
	token: string;
	labelId: string;
	value: string;
	onChange: (url: string) => void;
}) {
	const t = useTranslations("onboarding.avatar");
	const errorMessage = useOnboardingErrorMessage();
	const [preview, setPreview] = useState<string | null>(value || null);
	const [savedCrop, setSavedCrop] = useState<MentorImageCrop | null>(null);
	const [cropSource, setCropSource] = useState<string | null>(null);
	const [cropFile, setCropFile] = useState<File | null>(null);
	const [isCropOpen, setIsCropOpen] = useState(false);
	const [isPending, startTransition] = useTransition();
	const inputRef = useRef<HTMLInputElement>(null);

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > 4 * 1024 * 1024) {
			toast.error(t("tooLarge"));
			return;
		}

		setCropFile(file);
		setCropSource(URL.createObjectURL(file));
		setIsCropOpen(true);
		e.currentTarget.value = "";
	}

	function clearCropState() {
		if (cropFile && cropSource) URL.revokeObjectURL(cropSource);
		setCropFile(null);
		setCropSource(null);
	}

	async function handleCropSave(crop: MentorImageCrop) {
		if (!cropFile) return;
		const formData = new FormData();
		formData.append("file", cropFile);
		formData.append("crop", JSON.stringify(crop));

		startTransition(async () => {
			try {
				const result = await uploadOnboardingImage(token, formData);
				if (result.error) {
					toast.error(errorMessage(result.error, t("uploadFailed")));
				} else if (result.url) {
					setPreview(result.url);
					setSavedCrop(crop);
					onChange(result.url);
					setIsCropOpen(false);
					clearCropState();
					toast.success(t("uploaded"));
				}
			} catch {
				toast.error(t("uploadFailed"));
			}
		});
	}

	return (
		<div className="flex items-center gap-4 sm:gap-5">
			<button
				type="button"
				onClick={() => inputRef.current?.click()}
				disabled={isPending}
				aria-labelledby={labelId}
				className="group relative size-24 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-input bg-surface-pink/40 transition-[border-color,box-shadow] duration-200 hover:border-primary-500 focus-visible:border-primary-500 focus-visible:ring-3 focus-visible:ring-primary-500/30 focus-visible:outline-none motion-reduce:transition-none"
				title={t("uploadTitle")}
			>
				{preview ? (
					<MentorImage
						src={preview}
						alt={t("alt")}
						crop={savedCrop}
						aspectRatio={1}
						className="size-full"
						sizes="96px"
					/>
				) : (
					<span className="flex size-full items-center justify-center text-primary-500">
						<CameraIcon className="size-7" strokeWidth={1.75} />
					</span>
				)}

				<span
					className={cn(
						"absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity motion-reduce:transition-none",
						isPending
							? "opacity-100"
							: "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
					)}
				>
					{isPending ? (
						<Loader2Icon className="size-5 animate-spin text-white motion-reduce:animate-none" />
					) : (
						<CameraIcon className="size-5 text-white" />
					)}
				</span>
			</button>

			<div className="space-y-1.5">
				<button
					type="button"
					onClick={() => inputRef.current?.click()}
					disabled={isPending}
					className="inline-flex h-11 items-center rounded-full border border-primary-500 px-5 text-sm font-semibold text-primary-500 transition-colors hover:bg-primary-500 hover:text-white focus-visible:ring-3 focus-visible:ring-primary-500/40 focus-visible:outline-none disabled:opacity-50 motion-reduce:transition-none"
				>
					{preview ? t("change") : t("upload")}
				</button>
				<p className="text-xs text-muted-foreground">{t("hint")}</p>
			</div>

			<input
				ref={inputRef}
				type="file"
				accept="image/jpeg,image/png,image/webp"
				className="hidden"
				onChange={handleChange}
			/>
			<ImageCropDialog
				open={isCropOpen}
				onOpenChange={(open) => {
					setIsCropOpen(open);
					if (!open) clearCropState();
				}}
				imageUrl={cropSource}
				onSave={handleCropSave}
				isSaving={isPending}
			/>
		</div>
	);
}
