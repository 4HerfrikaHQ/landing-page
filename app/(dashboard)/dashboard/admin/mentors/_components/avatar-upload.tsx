"use client";

import { CameraIcon, Loader2Icon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ImageCropDialog } from "../../../mentor/profile/_components/image-crop-dialog";
import { uploadMentorImage } from "../_actions";

export function AvatarUpload({
	id,
	name,
	image,
}: {
	id: string;
	name: string;
	image: string | null;
}) {
	const [preview, setPreview] = useState<string | null>(image);
	const [cropSource, setCropSource] = useState<string | null>(null);
	const [isCropOpen, setIsCropOpen] = useState(false);
	const [isPending, setIsPending] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	// Sync preview when the server re-renders with a new image URL
	useEffect(() => {
		setPreview(image);
	}, [image]);

	useEffect(() => {
		return () => {
			if (cropSource) URL.revokeObjectURL(cropSource);
		};
	}, [cropSource]);

	const initials = name
		.split(" ")
		.map((w) => w[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > 4 * 1024 * 1024) {
			toast.error("Image must be under 4MB.");
			return;
		}

		setCropSource(URL.createObjectURL(file));
		setIsCropOpen(true);
		e.currentTarget.value = "";
	}

	async function handleCropSave(file: File) {
		const formData = new FormData();
		formData.append("file", file);

		setIsPending(true);
		try {
			const result = await uploadMentorImage(id, formData);
			if (result.error) {
				toast.error(`Upload failed: ${result.error}`);
				return;
			}
			if (result.url) setPreview(result.url);
			setIsCropOpen(false);
			setCropSource(null);
			toast.success("Successfully updated avatar");
		} catch (err) {
			toast.error(`Upload failed: ${String(err)}`);
		} finally {
			setIsPending(false);
		}
	}

	return (
		<>
			<button
				type="button"
				onClick={() => inputRef.current?.click()}
				className="group relative size-8 rounded-full overflow-hidden cursor-pointer shrink-0"
				title="Upload photo"
			>
				{preview ? (
					<Image
						src={preview}
						alt={name}
						fill
						className="object-cover object-top"
						sizes="32px"
						unoptimized
					/>
				) : (
					<span className="flex size-full items-center justify-center bg-gray-100 text-gray-500 text-xs font-medium">
						{initials}
					</span>
				)}

				<span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
					{isPending ? (
						<Loader2Icon className="size-3.5 text-white animate-spin" />
					) : (
						<CameraIcon className="size-3.5 text-white" />
					)}
				</span>
			</button>

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
					if (!open) setCropSource(null);
				}}
				imageUrl={cropSource}
				onSave={handleCropSave}
				isSaving={isPending}
			/>
		</>
	);
}
