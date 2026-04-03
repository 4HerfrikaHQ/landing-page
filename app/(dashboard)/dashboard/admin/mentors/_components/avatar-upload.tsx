"use client";

import { CameraIcon, Loader2Icon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
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
	const [isPending, startTransition] = useTransition();
	const inputRef = useRef<HTMLInputElement>(null);

	// Sync preview when the server re-renders with a new image URL
	useEffect(() => {
		setPreview(image);
	}, [image]);

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
			alert("Image must be under 4MB.");
			return;
		}

		setPreview(URL.createObjectURL(file));

		const formData = new FormData();
		formData.append("file", file);

		startTransition(async () => {
			try {
				const result = await uploadMentorImage(id, formData);
				if (result.error) {
					setPreview(image);
					alert(`Upload failed: ${result.error}`);
				} else if (result.url) {
					setPreview(result.url);
				}
			} catch (err) {
				setPreview(image);
				alert(`Upload failed: ${String(err)}`);
			}
		});
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
		</>
	);
}
