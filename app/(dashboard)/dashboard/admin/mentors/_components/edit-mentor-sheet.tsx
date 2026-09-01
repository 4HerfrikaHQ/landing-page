import { AvailabilityEditor } from "@/components/availability-editor";
import { MentorImage } from "@/components/mentor-image";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
	getAvailabilityForAdmin,
	saveAvailabilityForAdmin,
} from "@/src/db/actions/availability";
import type { DbAvailability } from "@/src/db/schema/tables";
import type { MentorImageCrop } from "@/src/lib/mentor-image";
import {
	normalizeMentorSlugInput,
	parseMentorSlug,
} from "@/src/lib/mentor-slug";
import { DownloadIcon, ImagePlusIcon, Loader2Icon } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { ImageCropDialog } from "../../../mentor/profile/_components/image-crop-dialog";
import { updateMentor, uploadMentorImage } from "../_actions";

type Tab = "details" | "availability";

type Mentor = {
	id: string;
	name: string;
	slug: string;
	image: string | null;
	image_crop: MentorImageCrop | null;
	position: string | null;
	bio: string | null;
	nickname: string | null;
	linkedin_url: string | null;
};

export function EditMentorSheet({
	mentor,
	open,
	onOpenChange: _onOpenChange,
}: {
	mentor: Mentor;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [tab, setTab] = useState<Tab>("details");
	const [slug, setSlug] = useState(mentor.slug);
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();
	const [isDownloading, setIsDownloading] = useState(false);
	const [imagePreview, setImagePreview] = useState(mentor.image);
	const [imageCrop, setImageCrop] = useState<MentorImageCrop | null>(
		mentor.image_crop,
	);
	const [cropSource, setCropSource] = useState<string | null>(null);
	const [cropFile, setCropFile] = useState<File | null>(null);
	const [cropInitial, setCropInitial] = useState<MentorImageCrop | null>(null);
	const [isCropOpen, setIsCropOpen] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const imageInputRef = useRef<HTMLInputElement>(null);
	const [availabilitySlots, setAvailabilitySlots] = useState<
		DbAvailability[] | null
	>(null);
	const [availabilityError, setAvailabilityError] = useState<string | null>(
		null,
	);
	const parsedSlug = parseMentorSlug(slug);
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://4herfrika.org";
	const publicLinkPrefix = `${siteUrl}/careercorner/`;

	useEffect(() => {
		setSlug(mentor.slug);
	}, [mentor.slug]);

	// Load availability lazily on first switch to that tab
	useEffect(() => {
		if (tab === "availability" && availabilitySlots === null) {
			getAvailabilityForAdmin(mentor.id)
				.then(setAvailabilitySlots)
				.catch(() => {
					setAvailabilityError(
						"Availability could not be loaded. Please close this panel and try again.",
					);
				});
		}
	}, [tab, mentor.id, availabilitySlots]);

	useEffect(() => {
		setImagePreview(mentor.image);
		setImageCrop(mentor.image_crop);
	}, [mentor.image, mentor.image_crop]);

	useEffect(() => {
		return () => {
			if (cropFile && cropSource) URL.revokeObjectURL(cropSource);
		};
	}, [cropFile, cropSource]);

	const onOpenChange = (open: boolean) => {
		if (open === false) {
			// Reset state
			setTab("details");
			setSlug(mentor.slug);
			setError(null);
			setAvailabilitySlots(null);
			setAvailabilityError(null);
		}

		return _onOpenChange(open);
	};

	function handleSubmit(formData: FormData) {
		setError(null);
		if (!parsedSlug.success) {
			setError(parsedSlug.error);
			return;
		}
		startTransition(async () => {
			const result = await updateMentor(mentor.id, formData);
			if (result.error) {
				setError(result.error);
			} else {
				onOpenChange(false);
			}
		});
	}

	function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
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

	function handleReframe() {
		if (!imagePreview) return;
		setCropFile(null);
		setCropInitial(imageCrop);
		setCropSource(imagePreview);
		setIsCropOpen(true);
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

		setIsUploading(true);
		try {
			const result = await uploadMentorImage(mentor.id, formData);
			if (result.error) {
				toast.error(`Upload failed: ${result.error}`);
				return;
			}
			if (result.url) setImagePreview(result.url);
			setImageCrop(crop);
			setIsCropOpen(false);
			clearCropState();
			toast.success("Profile photo updated");
		} catch (err) {
			toast.error(`Upload failed: ${String(err)}`);
		} finally {
			setIsUploading(false);
		}
	}

	async function handleImageDownload() {
		if (!imagePreview) return;

		const extension =
			imagePreview
				.split("?")[0]
				.split(".")
				.pop()
				?.match(/^[a-z0-9]+$/i)?.[0] ?? "jpg";
		const filename = `${mentor.name
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")}-profile.${extension}`;

		setIsDownloading(true);
		try {
			const response = await fetch(imagePreview);
			if (!response.ok) throw new Error("Image download failed");

			const blob = await response.blob();
			const downloadUrl = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = downloadUrl;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			link.remove();
			URL.revokeObjectURL(downloadUrl);
		} catch {
			// Keep a native fallback for environments that block cross-origin fetches.
			const link = document.createElement("a");
			link.href = imagePreview;
			link.download = filename;
			link.target = "_blank";
			link.rel = "noreferrer";
			document.body.appendChild(link);
			link.click();
			link.remove();
		} finally {
			setIsDownloading(false);
		}
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				className="flex w-full! max-w-none! flex-col p-0 sm:w-180!"
				showCloseButton={false}
			>
				<SheetHeader className="px-6 pt-6 pb-4 border-b">
					<SheetTitle className="text-base font-semibold text-gray-900">
						Edit mentor
					</SheetTitle>

					{/* Tab toggle */}
					<div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 mt-2 w-fit">
						{(["details", "availability"] as Tab[]).map((t) => (
							<button
								key={t}
								type="button"
								onClick={() => setTab(t)}
								className={`px-3 py-1 text-xs font-medium rounded-md transition-all capitalize ${
									tab === t
										? "bg-white text-gray-900 shadow-sm"
										: "text-gray-500 hover:text-gray-700"
								}`}
							>
								{t}
							</button>
						))}
					</div>
				</SheetHeader>

				{tab === "details" ? (
					<>
						<form
							id="edit-mentor-form"
							action={handleSubmit}
							className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4"
						>
							<Field
								label="Name"
								name="name"
								required
								defaultValue={mentor.name}
							/>

							<div className="flex flex-col gap-1.5">
								<span className="text-xs font-medium uppercase tracking-wide text-gray-500">
									Profile photo
								</span>
								<div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
									<div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
										{imagePreview ? (
											<MentorImage
												src={imagePreview}
												alt={mentor.name}
												crop={null}
												className="size-full"
												sizes="64px"
											/>
										) : (
											<span className="flex size-full items-center justify-center text-sm font-medium text-gray-500">
												{mentor.name
													.split(" ")
													.map((word) => word[0])
													.slice(0, 2)
													.join("")
													.toUpperCase()}
											</span>
										)}
									</div>
									<div className="min-w-0">
										<p className="truncate text-sm text-gray-700">
											{imagePreview
												? "Current profile photo"
												: "No profile photo uploaded"}
										</p>
										<input
											ref={imageInputRef}
											type="file"
											accept="image/jpeg,image/png,image/webp"
											className="hidden"
											onChange={handleImageChange}
										/>
										<div className="mt-2 flex flex-wrap gap-2">
											<Button
												type="button"
												variant="outline"
												size="sm"
												className="gap-1.5"
												onClick={() => imageInputRef.current?.click()}
												disabled={isUploading}
											>
												{isUploading ? (
													<Loader2Icon className="size-3.5 animate-spin" />
												) : (
													<ImagePlusIcon className="size-3.5" />
												)}
												{isUploading
													? "Uploading…"
													: imagePreview
														? "Replace photo"
														: "Upload photo"}
											</Button>
											{imagePreview ? (
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="gap-1.5"
													onClick={handleReframe}
													disabled={isUploading}
												>
													Adjust framing
												</Button>
											) : null}
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="gap-1.5"
												onClick={handleImageDownload}
												disabled={!imagePreview || isDownloading || isUploading}
											>
												{isDownloading ? (
													<Loader2Icon className="size-3.5 animate-spin" />
												) : (
													<DownloadIcon className="size-3.5" />
												)}
												{isDownloading ? "Downloading…" : "Download"}
											</Button>
										</div>
									</div>
								</div>
							</div>

							<div className="flex flex-col gap-1.5">
								<label
									htmlFor="mentor-public-link"
									className="text-xs font-medium uppercase tracking-wide text-gray-500"
								>
									Public link
								</label>
								<div className="flex min-w-0 items-center overflow-hidden rounded-lg border border-input bg-transparent focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
									<span className="hidden shrink-0 pl-2.5 font-mono text-sm text-muted-foreground sm:inline">
										{publicLinkPrefix}
									</span>
									<Input
										id="mentor-public-link"
										name="slug"
										required
										value={slug}
										onChange={(event) => {
											setSlug(normalizeMentorSlugInput(event.target.value));
											setError(null);
										}}
										autoCapitalize="none"
										autoCorrect="off"
										spellCheck={false}
										aria-invalid={!parsedSlug.success}
										className="h-9 min-w-0 rounded-none border-0 bg-transparent px-1 font-mono shadow-none focus-visible:ring-0 sm:px-0"
									/>
								</div>
								{!parsedSlug.success ? (
									<p className="text-xs text-red-500">{parsedSlug.error}</p>
								) : null}
								{slug !== mentor.slug ? (
									<p className="text-xs text-amber-700">
										Changing this breaks links previously shared for this
										mentor.
									</p>
								) : null}
							</div>

							<div className="flex items-center gap-3 py-1">
								<div className="h-px flex-1 bg-gray-100" />
								<span className="text-xs text-gray-400">Optional details</span>
								<div className="h-px flex-1 bg-gray-100" />
							</div>

							<Field
								label="Position"
								name="position"
								defaultValue={mentor.position ?? ""}
							/>
							<Field
								label="Display Name"
								name="nickname"
								defaultValue={mentor.nickname ?? ""}
							/>

							<div className="flex flex-col gap-1.5">
								<label
									htmlFor="bio"
									className="text-xs font-medium text-gray-500 uppercase tracking-wide"
								>
									Bio
								</label>
								<Textarea
									id="bio"
									name="bio"
									rows={3}
									className="text-sm resize-none"
									placeholder="Short bio…"
									defaultValue={mentor.bio ?? ""}
								/>
							</div>

							<Field
								label="LinkedIn URL"
								name="linkedin_url"
								type="url"
								defaultValue={mentor.linkedin_url ?? ""}
							/>

							{error && (
								<p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-md px-3 py-2">
									{error}
								</p>
							)}
						</form>

						<SheetFooter className="px-6 py-4 border-t flex-row justify-end gap-2">
							<SheetClose render={<Button variant="ghost" size="sm" />}>
								Cancel
							</SheetClose>
							<Button
								type="submit"
								form="edit-mentor-form"
								variant="solid"
								size="sm"
								disabled={isPending || !parsedSlug.success}
							>
								{isPending ? "Saving…" : "Save changes"}
							</Button>
						</SheetFooter>
					</>
				) : (
					<div className="flex-1 overflow-y-auto px-6 py-5">
						{availabilityError ? (
							<p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
								{availabilityError}
							</p>
						) : availabilitySlots === null ? (
							<div className="flex items-center justify-center py-12">
								<div className="size-5 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
							</div>
						) : (
							<AvailabilityEditor
								mentorId={mentor.id}
								initialSlots={availabilitySlots}
								onSave={saveAvailabilityForAdmin}
							/>
						)}
					</div>
				)}
			</SheetContent>
			<ImageCropDialog
				open={isCropOpen}
				onOpenChange={(open) => {
					setIsCropOpen(open);
					if (!open) clearCropState();
				}}
				imageUrl={cropSource}
				initialCrop={cropInitial}
				onSave={handleCropSave}
				isSaving={isUploading}
			/>
		</Sheet>
	);
}
