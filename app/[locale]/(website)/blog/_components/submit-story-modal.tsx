"use client";

import { useActionState, useRef, useState } from "react";
import { Upload, ArrowRight, X } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/utils/cn";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitStory } from "../_actions";
import type { BlogCategoryDocument } from "@/prismicio-types";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024

type Props = {
	categories: BlogCategoryDocument[];
};

const inputClass =
	"h-12 border-[#e5e5e5] bg-white px-4 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20";

const rawInputClass =
	"w-full h-12 rounded-lg border border-[#e5e5e5] bg-white px-4 text-sm text-foreground placeholder:text-[#979797] outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors";

const labelClass = "block mb-1.5 text-foreground";

const required = <span className="text-primary-500 ml-0.5">*</span>;

export function SubmitStoryModal({ categories }: Props) {
	const [state, dispatch, isPending] = useActionState(submitStory, null);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imageSizeError, setImageSizeError] = useState<string | null>(null);
	const [open, setOpen] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0] ?? null;
		setImageSizeError(null);
		if (file && file.size > MAX_IMAGE_BYTES) {
			setImageSizeError("Image must be under 4 MB.");
			e.target.value = "";
			setImageFile(null);
			return;
		}
		setImageFile(file);
	}

	function removeImage() {
		setImageFile(null);
		setImageSizeError(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
	}

	if (state?.success && open) {
		return (
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger
					render={
						<button className="inline-flex items-center gap-2 bg-primary-500 text-white rounded-full px-8 py-4 text-lg font-medium hover:brightness-90 transition-all" />
					}
				>
					Submit a Story
					<ArrowRight className="size-5" />
				</DialogTrigger>
				<DialogContent className="w-[92vw] sm:w-[70vw] rounded-3xl p-8">
					<div className="flex flex-col items-center text-center gap-4 py-8">
						<div className="size-16 rounded-full bg-primary-500/10 flex items-center justify-center">
							<svg className="size-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<h2 className="text-2xl font-bold text-foreground">Story Submitted!</h2>
						<p className="text-foreground/60">
							Thank you for sharing your story. Our team will review it and reach out if it&apos;s selected for publication.
						</p>
						<button
							onClick={() => setOpen(false)}
							className="mt-2 inline-flex items-center gap-2 bg-primary-500 text-white rounded-full px-8 py-3 text-base font-medium hover:brightness-90 transition-all"
						>
							Close
						</button>
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				render={
					<button className="inline-flex items-center gap-2 bg-primary-500 text-white rounded-full px-8 py-4 text-lg font-medium hover:brightness-90 transition-all" />
				}
			>
				Submit a Story
				<ArrowRight className="size-5" />
			</DialogTrigger>

			<DialogContent className="max-w-[92vw] sm:max-w-[70vw] max-h-[90vh] overflow-y-auto rounded-3xl p-8">
				<DialogHeader>
					<DialogTitle className="text-[48px] font-bold leading-[48px] text-foreground">
						Submit Your Story
					</DialogTitle>
					<p className="text-xl font-normal leading-[32.5px] text-foreground/60 mt-1">
						Share your experience, insight, or story with our community. Your voice matters and can inspire others across Africa.
					</p>
				</DialogHeader>

				<form action={dispatch} className="flex flex-col gap-5 mt-6">
					<div>
						<Label className={labelClass}>
							Full Name{required}
						</Label>
						<Input
							name="name"
							type="text"
							placeholder="Enter your full name"
							className={inputClass}
							required
						/>
					</div>

					<div>
						<Label className={labelClass}>
							Email Address{required}
						</Label>
						<Input
							name="email"
							type="email"
							placeholder="your.email@example.com"
							className={inputClass}
							required
						/>
					</div>

					<div>
						<Label className={labelClass}>
							Story Title{required}
						</Label>
						<Input
							name="title"
							type="text"
							placeholder="Give your story a compelling title"
							className={inputClass}
							required
						/>
					</div>

					<div>
						<Label className={labelClass}>
							Short Description{required}
						</Label>
						<Input
							name="description"
							type="text"
							placeholder="A one-sentence summary of your story"
							className={inputClass}
							required
						/>
					</div>

					<div>
						<Label className={labelClass}>
							Category{required}
						</Label>
						<select
							name="categoryId"
							className={cn(rawInputClass, "appearance-none cursor-pointer")}
							required
							defaultValue=""
						>
							<option value="" disabled>Select a category</option>
							{categories.map((cat) => (
								<option key={cat.id} value={cat.id}>
									{cat.data.name}
								</option>
							))}
						</select>
					</div>

					<div>
						<Label className={labelClass}>
							Your Story{required}
						</Label>
						<textarea
							name="story"
							placeholder="Share your story in detail. Include what happened, how it affected you, and what you learned…"
							rows={8}
							className={cn(rawInputClass, "h-auto resize-y min-h-[160px] py-3")}
							required
						/>
					</div>

					<div>
						<Label className={labelClass}>Upload Image (Optional)</Label>
						<Input
							ref={fileInputRef}
							name="image"
							type="file"
							accept="image/jpeg,image/png"
							onChange={handleImageChange}
							className="sr-only"
							id="story-image-upload"
						/>
						{imageFile ? (
							<div className="flex items-center justify-between rounded-lg border border-[#e5e5e5] px-4 py-3 text-sm">
								<span className="text-foreground truncate">{imageFile.name}</span>
								<button
									type="button"
									onClick={removeImage}
									className="ml-3 shrink-0 text-foreground/40 hover:text-foreground/70 transition-colors"
								>
									<X className="size-4" />
								</button>
							</div>
						) : (
							<Label
								htmlFor="story-image-upload"
								className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-[#e5e5e5] px-4 py-8 cursor-pointer hover:border-primary-500/50 hover:bg-surface-pink/40 transition-colors"
							>
								<div className="size-10 rounded-full bg-primary-500/10 flex items-center justify-center">
									<Upload className="size-5 text-primary-500" />
								</div>
								<span className="text-sm text-foreground/60 text-center">
									Click to upload an image
									<br />
									<span className="text-xs">PNG, JPG up to 4 MB</span>
								</span>
							</Label>
						)}
						{imageSizeError && (
							<p className="mt-1.5 text-xs text-red-500">{imageSizeError}</p>
						)}
					</div>

					<Label className="flex items-start gap-3 cursor-pointer">
						<Input
							type="checkbox"
							name="consent"
							required
							className="mt-0.5 size-4 shrink-0 accent-primary-500"
						/>
						<span className="text-xs text-foreground/70 leading-relaxed">
							I consent to having my story reviewed and potentially published on this platform. I understand that it may be edited for clarity and length.{required}
						</span>
					</Label>

					{state && "error" in state && (
						<p className="text-sm text-red-500 text-center">{state.error}</p>
					)}

					<button
						type="submit"
						disabled={isPending || !!imageSizeError}
						className="w-full h-14 rounded-full bg-primary-500 text-white text-base font-medium hover:brightness-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
					>
						{isPending ? "Submitting…" : "Submit Story"}
					</button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
