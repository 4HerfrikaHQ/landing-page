"use client";

import { MentorImage } from "@/components/mentor-image";
import type { MentorImageCrop } from "@/src/lib/mentor-image";
import { CameraIcon, Loader2Icon } from "lucide-react";
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
	const [cropFile, setCropFile] = useState<File | null>(null);
	const [cropInitial, setCropInitial] = useState<MentorImageCrop | null>(null);
	const [isCropOpen, setIsCropOpen] = useState(false);
	const [isPending, setIsPending] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	// Sync preview when the server re-renders with a new image URL
	useEffect(() => {
		setPreview(image);
	}, [image]);

	useEffect(() => {
		return () => {
			if (cropFile && cropSource) URL.revokeObjectURL(cropSource);
		};
	}, [cropFile, cropSource]);

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

		setCropFile(file);
		setCropInitial(null);
		setCropSource(URL.createObjectURL(file));
		setIsCropOpen(true);
		e.currentTarget.value = "";
	}

	function clearCropState() {
		if (cropFile && cropSource) URL.revokeObjectURL(cropSource);
		setCropFile(null);
		setCropInitial(null);
		setCropSource(null);
	}

	async function handleCropSave(crop: MentorImageCrop) {
		const formData = new FormData();
		if (cropFile) formData.append("file", cropFile);
		formData.append("crop", JSON.stringify(crop));

		setIsPending(true);
		try {
			const result = await uploadMentorImage(id, formData);
			if (result.error) {
				toast.error(`Upload failed: ${result.error}`);
				return;
			}
			if (result.url) setPreview(result.url);
			setIsCropOpen(false);
			clearCropState();
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
					<MentorImage
						src={preview}
						alt={name}
						crop={null}
						className="size-full"
						sizes="32px"
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
					if (!open) clearCropState();
				}}
				imageUrl={cropSource}
				initialCrop={cropInitial}
				onSave={handleCropSave}
				isSaving={isPending}
			/>
		</>
	);
}
