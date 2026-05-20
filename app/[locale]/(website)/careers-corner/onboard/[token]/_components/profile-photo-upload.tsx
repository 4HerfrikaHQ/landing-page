"use client";

import { CameraIcon, Loader2Icon } from "lucide-react";
import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { uploadOnboardingPhoto } from "../_actions";

export function ProfilePhotoUpload({
	token,
	value,
	onChange,
}: {
	token: string;
	value: string;
	onChange: (url: string) => void;
}) {
	const [preview, setPreview] = useState<string>(value);
	const [isPending, startTransition] = useTransition();
	const inputRef = useRef<HTMLInputElement>(null);

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > 4 * 1024 * 1024) {
			toast.error("Image must be under 4MB.");
			return;
		}

		const objectUrl = URL.createObjectURL(file);
		setPreview(objectUrl);

		const formData = new FormData();
		formData.append("file", file);

		startTransition(async () => {
			try {
				const result = await uploadOnboardingPhoto(token, formData);
				if (result.error) {
					setPreview(value);
					toast.error(`Upload failed: ${result.error}`);
				} else if (result.url) {
					setPreview(result.url);
					onChange(result.url);
					toast.success("Photo uploaded.");
				}
			} catch (err) {
				setPreview(value);
				toast.error(`Upload failed: ${String(err)}`);
			}
		});
	}

	return (
		<div className="flex items-center gap-4">
			<button
				type="button"
				onClick={() => inputRef.current?.click()}
				className="group relative size-20 rounded-full overflow-hidden cursor-pointer shrink-0 border border-gray-200 bg-gray-50"
				title="Upload photo"
			>
				{preview ? (
					<Image
						src={preview}
						alt="Profile photo"
						fill
						className="object-cover object-top"
						sizes="80px"
						unoptimized
					/>
				) : (
					<span className="flex size-full items-center justify-center text-gray-400">
						<CameraIcon className="size-6" />
					</span>
				)}

				<span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
					{isPending ? (
						<Loader2Icon className="size-5 text-white animate-spin" />
					) : (
						<CameraIcon className="size-5 text-white" />
					)}
				</span>
			</button>

			<div className="text-sm text-gray-500">
				<button
					type="button"
					onClick={() => inputRef.current?.click()}
					className="font-medium text-gray-900 hover:underline disabled:opacity-50"
					disabled={isPending}
				>
					{preview ? "Change photo" : "Upload photo"}
				</button>
				<p className="mt-0.5 text-xs">JPG, PNG, or WebP. Max 4MB.</p>
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
