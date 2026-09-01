"use client";

import { CameraIcon, CheckCircle2, Loader2Icon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { DataCard, DataCardSection } from "@/components/dashboard/data-card";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import type { DbMentorWithAvailability } from "@/src/db/schema/tables";

import { updateMyProfile, uploadMyImage } from "../../_actions";

export function ProfileForm({
	mentor: dbMentor,
}: { mentor: DbMentorWithAvailability }) {
	const [fields, setFields] = useState({
		name: dbMentor.name,
		position: dbMentor.position ?? "",
		nickname: dbMentor.nickname ?? "",
		slug: dbMentor.slug,
		bio: dbMentor.bio ?? "",
		linkedin_url: dbMentor.linkedin_url ?? "",
	});

	const [preview, setPreview] = useState<string | null>(dbMentor.image);
	const [error, setError] = useState<string | null>(null);
	const [saved, setSaved] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [isUploading, startUploadTransition] = useTransition();
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Sync controlled state when the server re-renders with fresh data after revalidatePath
	useEffect(() => {
		setFields({
			name: dbMentor.name,
			position: dbMentor.position ?? "",
			nickname: dbMentor.nickname ?? "",
			slug: dbMentor.slug,
			bio: dbMentor.bio ?? "",
			linkedin_url: dbMentor.linkedin_url ?? "",
		});
	}, [dbMentor]);

	const initials = fields.name
		.split(" ")
		.map((w) => w[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();

	function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > 4 * 1024 * 1024) {
			toast.error("Image must be under 4MB.");
			return;
		}

		setPreview(URL.createObjectURL(file));
		const formData = new FormData();
		formData.append("file", file);

		startUploadTransition(async () => {
			try {
				const result = await uploadMyImage(formData);
				if (result.error) {
					setPreview(dbMentor.image);
					toast.error(`Upload failed: ${result.error}`);
				} else if (result.url) {
					setPreview(result.url);
				}
			} catch (err) {
				setPreview(dbMentor.image);
				toast.error(`Upload failed: ${String(err)}`);
			}
		});
	}

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		setSaved(false);
		startTransition(async () => {
			const result = await updateMyProfile(new FormData(e.currentTarget));
			if (result.error) {
				setError(result.error);
			} else {
				setSaved(true);
			}
		});
	}

	return (
		<form onSubmit={handleSubmit}>
			<DataCard>
				<DataCardSection className="space-y-8 p-6 sm:p-8">
					{/* Avatar */}
					<div className="flex items-center gap-5">
						<button
							type="button"
							onClick={() => fileInputRef.current?.click()}
							className="group relative size-24 shrink-0 cursor-pointer overflow-hidden rounded-full ring-1 ring-border/60"
						>
							{preview ? (
								<Image
									src={preview}
									alt={fields.name}
									fill
									className="object-cover object-top"
									sizes="96px"
									unoptimized
								/>
							) : (
								<span className="flex size-full items-center justify-center bg-surface-pink text-xl font-medium text-primary-500">
									{initials}
								</span>
							)}
							<span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
								{isUploading ? (
									<Loader2Icon className="size-5 animate-spin text-white" />
								) : (
									<CameraIcon className="size-5 text-white" />
								)}
							</span>
						</button>
						<div>
							<p className="font-heading text-base font-medium text-foreground">
								{fields.name}
							</p>
							<p className="text-sm text-muted-foreground">
								Click the photo to upload a new one (under 4MB).
							</p>
						</div>
					</div>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/jpeg,image/png,image/webp"
						className="hidden"
						onChange={handleImageChange}
					/>

					{/* About you */}
					<section className="space-y-5">
						<h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							About you
						</h2>
						<div className="grid gap-5 sm:grid-cols-2">
							<Field
								label="Name"
								name="name"
								required
								value={fields.name}
								onChange={(e) =>
									setFields((f) => ({ ...f, name: e.target.value }))
								}
							/>
							<Field
								label="Position"
								name="position"
								required
								value={fields.position}
								onChange={(e) =>
									setFields((f) => ({ ...f, position: e.target.value }))
								}
							/>
							<Field
								label="Nickname"
								name="nickname"
								value={fields.nickname}
								onChange={(e) =>
									setFields((f) => ({ ...f, nickname: e.target.value }))
								}
							/>
							<div className="sm:col-span-2">
								<Field
									label="Profile link"
									name="slug"
									required
									value={fields.slug}
									onChange={(e) =>
										setFields((f) => ({ ...f, slug: e.target.value }))
									}
								/>
								<p className="mt-1.5 text-xs text-amber-700">
									Changing this immediately breaks any profile links you have
									previously shared. Use only letters, numbers, and hyphens.
								</p>
							</div>
							<Field
								label="LinkedIn URL"
								name="linkedin_url"
								type="url"
								value={fields.linkedin_url}
								onChange={(e) =>
									setFields((f) => ({ ...f, linkedin_url: e.target.value }))
								}
							/>
						</div>
						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="bio"
								className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
							>
								Bio
							</label>
							<Textarea
								id="bio"
								name="bio"
								rows={4}
								className="resize-none text-sm"
								placeholder="A short introduction mentees will read first."
								value={fields.bio}
								onChange={(e) =>
									setFields((f) => ({ ...f, bio: e.target.value }))
								}
							/>
						</div>
					</section>

					{error ? (
						<p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
							{error}
						</p>
					) : null}

					<div className="flex items-center justify-end gap-3 border-t border-border/60 pt-5">
						{saved ? (
							<span className="inline-flex items-center gap-1.5 text-sm text-green-600">
								<CheckCircle2 className="size-4" />
								Saved
							</span>
						) : null}
						<Button
							type="submit"
							variant="solid"
							size="sm"
							disabled={isPending}
						>
							{isPending ? "Saving…" : "Save changes"}
						</Button>
					</div>
				</DataCardSection>
			</DataCard>
		</form>
	);
}
