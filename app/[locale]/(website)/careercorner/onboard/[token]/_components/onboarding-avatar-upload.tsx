"use client";

import { cn } from "@/utils/cn";
import { CameraIcon, Loader2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { uploadOnboardingImage } from "../_actions";
import { useOnboardingErrorMessage } from "../_hooks/use-onboarding-error-message";

export function OnboardingAvatarUpload({
	token,
	value,
	onChange,
}: {
	token: string;
	value: string;
	onChange: (url: string) => void;
}) {
	const t = useTranslations("onboarding.avatar");
	const errorMessage = useOnboardingErrorMessage();
	const [preview, setPreview] = useState<string | null>(value || null);
	const [isPending, startTransition] = useTransition();
	const inputRef = useRef<HTMLInputElement>(null);

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > 4 * 1024 * 1024) {
			toast.error(t("tooLarge"));
			return;
		}

		const previous = preview;
		setPreview(URL.createObjectURL(file));

		const formData = new FormData();
		formData.append("file", file);

		startTransition(async () => {
			try {
				const result = await uploadOnboardingImage(token, formData);
				if (result.error) {
					setPreview(previous);
					toast.error(errorMessage(result.error, t("uploadFailed")));
				} else if (result.url) {
					setPreview(result.url);
					onChange(result.url);
					toast.success(t("uploaded"));
				}
			} catch {
				setPreview(previous);
				toast.error(t("uploadFailed"));
			}
		});
	}

	return (
		<div className="flex items-center gap-4">
			<button
				type="button"
				onClick={() => inputRef.current?.click()}
				className="group relative size-20 rounded-full overflow-hidden cursor-pointer shrink-0 border border-border"
				title={t("uploadTitle")}
			>
				{preview ? (
					<Image
						src={preview}
						alt={t("alt")}
						fill
						className="object-cover object-top"
						sizes="80px"
						unoptimized
					/>
				) : (
					<span className="flex size-full items-center justify-center bg-gray-100 text-gray-400">
						<CameraIcon className="size-6" />
					</span>
				)}

				<span
					className={cn(
						"absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity",
						isPending ? "opacity-100" : "opacity-0 group-hover:opacity-100",
					)}
				>
					{isPending ? (
						<Loader2Icon className="size-5 text-white animate-spin" />
					) : (
						<CameraIcon className="size-5 text-white" />
					)}
				</span>
			</button>

			<div className="space-y-1">
				<button
					type="button"
					onClick={() => inputRef.current?.click()}
					className="text-sm font-medium text-primary-500 hover:underline"
				>
					{preview ? t("change") : t("upload")}
				</button>
				<p className="text-xs text-gray-500">{t("hint")}</p>
			</div>

			<input
				ref={inputRef}
				type="file"
				accept="image/jpeg,image/png,image/webp"
				className="hidden"
				onChange={handleChange}
			/>
		</div>
	);
}
