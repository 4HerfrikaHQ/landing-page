"use client";

import { MentorImage } from "@/components/mentor-image";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	MENTOR_IMAGE_ASPECT_RATIO,
	type MentorImageCrop,
} from "@/src/lib/mentor-image";
import { Check, ImageIcon, Loader2, Minus, Plus } from "lucide-react";
import { useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const PERCENT = 100;

const toCrop = (area: Area): MentorImageCrop => ({
	x: area.x / PERCENT,
	y: area.y / PERCENT,
	width: area.width / PERCENT,
	height: area.height / PERCENT,
});

const toArea = (crop: MentorImageCrop): Area => ({
	x: crop.x * PERCENT,
	y: crop.y * PERCENT,
	width: crop.width * PERCENT,
	height: crop.height * PERCENT,
});

type ImageCropDialogProps = {
	open: boolean;
	imageUrl: string | null;
	initialCrop?: MentorImageCrop | null;
	onOpenChange: (open: boolean) => void;
	onSave: (crop: MentorImageCrop) => Promise<void>;
	isSaving?: boolean;
};

export function ImageCropDialog({
	open,
	imageUrl,
	initialCrop = null,
	onOpenChange,
	onSave,
	isSaving = false,
}: ImageCropDialogProps) {
	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next && isSaving) return;
				onOpenChange(next);
			}}
		>
			<DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl p-0 data-open:zoom-in-100 sm:max-w-3xl">
				<CropEditor
					imageUrl={imageUrl}
					initialCrop={initialCrop}
					onSave={onSave}
					isSaving={isSaving}
				/>
			</DialogContent>
		</Dialog>
	);
}

function CropEditor({
	imageUrl,
	initialCrop,
	onSave,
	isSaving,
}: Pick<ImageCropDialogProps, "imageUrl" | "onSave"> & {
	initialCrop: MentorImageCrop | null;
	isSaving: boolean;
}) {
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(MIN_ZOOM);
	const [crop, setCrop] = useState<MentorImageCrop | null>(null);

	return (
		<>
			<div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_240px]">
				<div className="bg-foreground p-5 sm:p-8">
					<DialogHeader className="mb-5 pr-8 text-white">
						<DialogTitle className="text-xl text-white">
							Frame your profile photo
						</DialogTitle>
						<DialogDescription className="text-white/65">
							Drag to reposition · use the slider to zoom
						</DialogDescription>
					</DialogHeader>

					<div className="relative mx-auto aspect-4/5 w-full max-w-90 overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/10">
						{imageUrl ? (
							<Cropper
								image={imageUrl}
								crop={position}
								zoom={zoom}
								minZoom={MIN_ZOOM}
								maxZoom={MAX_ZOOM}
								aspect={MENTOR_IMAGE_ASPECT_RATIO}
								objectFit="cover"
								showGrid={false}
								initialCroppedAreaPercentages={
									initialCrop ? toArea(initialCrop) : undefined
								}
								onCropChange={setPosition}
								onZoomChange={setZoom}
								onCropAreaChange={(area) => setCrop(toCrop(area))}
							/>
						) : null}
					</div>

					<div className="mx-auto mt-6 flex max-w-90 items-center gap-3 text-white">
						<Minus className="size-4 shrink-0 text-white/55" />
						<input
							aria-label="Zoom"
							type="range"
							min={MIN_ZOOM}
							max={MAX_ZOOM}
							step="0.01"
							value={zoom}
							onChange={(event) => setZoom(Number(event.target.value))}
							className="h-1.5 w-full accent-primary-500"
						/>
						<Plus className="size-4 shrink-0 text-white/55" />
					</div>
					<p className="mx-auto mt-3 max-w-90 text-center text-xs text-white/45">
						Your framing is saved as a 4:5 portrait for your mentor profile.
					</p>
				</div>

				<aside className="space-y-5 bg-white p-5 sm:p-6">
					<div>
						<p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
							Live preview
						</p>
						<p className="mt-1 text-sm text-foreground">
							Your saved framing will be used across your mentor profile.
						</p>
					</div>
					{imageUrl && crop ? (
						<div className="grid grid-cols-[1fr_88px] items-end gap-3">
							<MentorImage
								src={imageUrl}
								alt=""
								crop={crop}
								className="aspect-4/5 rounded-xl bg-surface-pink ring-1 ring-border/60"
								sizes="140px"
							/>
							<MentorImage
								src={imageUrl}
								alt=""
								crop={crop}
								aspectRatio={1}
								className="aspect-square rounded-full bg-surface-pink ring-4 ring-primary-500/15"
								sizes="88px"
							/>
						</div>
					) : (
						<div className="flex aspect-4/5 items-center justify-center rounded-xl bg-surface-pink ring-1 ring-border/60">
							<ImageIcon className="size-6 text-primary-500/60" />
						</div>
					)}
					<p className="text-center text-xs font-medium text-muted-foreground">
						Card and profile previews
					</p>
				</aside>
			</div>

			<DialogFooter className="flex-row justify-between border-t border-border/60 bg-white p-4 sm:p-5">
				<DialogClose
					render={<Button variant="ghost" size="sm" disabled={isSaving} />}
				>
					Cancel
				</DialogClose>
				<Button
					type="button"
					size="sm"
					onClick={() => crop && onSave(crop)}
					disabled={isSaving || !crop}
				>
					{isSaving ? (
						<Loader2 className="size-4 animate-spin" />
					) : (
						<Check className="size-4" />
					)}
					{isSaving ? "Uploading…" : "Use this crop"}
				</Button>
			</DialogFooter>
		</>
	);
}
