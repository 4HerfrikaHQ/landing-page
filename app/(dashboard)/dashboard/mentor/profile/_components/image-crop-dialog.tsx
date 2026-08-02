"use client";

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
import { cn } from "@/utils/cn";
import { Check, ImageIcon, Loader2, Minus, Move, Plus } from "lucide-react";
import {
	type PointerEvent as ReactPointerEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";

export const MENTOR_IMAGE_ASPECT_RATIO = 4 / 5;
const OUTPUT_WIDTH = 1200;
const OUTPUT_HEIGHT = 1500;

type Point = { x: number; y: number };

type ImageCropDialogProps = {
	open: boolean;
	imageUrl: string | null;
	onOpenChange: (open: boolean) => void;
	onSave: (file: File) => Promise<void>;
	isSaving?: boolean;
};

export function ImageCropDialog({
	open,
	imageUrl,
	onOpenChange,
	onSave,
	isSaving = false,
}: ImageCropDialogProps) {
	const frameRef = useRef<HTMLDivElement>(null);
	const imageRef = useRef<HTMLImageElement>(null);
	const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
	const [frameSize, setFrameSize] = useState({ width: 320, height: 400 });
	const [zoom, setZoom] = useState(1);
	const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
	const [dragStart, setDragStart] = useState<{
		pointer: Point;
		pan: Point;
	} | null>(null);

	const baseScale =
		imageSize.width && imageSize.height
			? Math.max(
					frameSize.width / imageSize.width,
					frameSize.height / imageSize.height,
				)
			: 1;
	const scale = baseScale * zoom;
	const renderedSize = {
		width: imageSize.width * scale,
		height: imageSize.height * scale,
	};

	const maxPan = {
		x: Math.max(0, (renderedSize.width - frameSize.width) / 2),
		y: Math.max(0, (renderedSize.height - frameSize.height) / 2),
	};
	const sourceWidth = imageSize.width
		? Math.min(imageSize.width, frameSize.width / scale)
		: 0;
	const sourceHeight = imageSize.height
		? Math.min(imageSize.height, frameSize.height / scale)
		: 0;
	const sourceX = sourceWidth
		? Math.max(
				0,
				Math.min(
					imageSize.width - sourceWidth,
					(renderedSize.width - frameSize.width) / 2 / scale - pan.x / scale,
				),
			)
		: 0;
	const sourceY = sourceHeight
		? Math.max(
				0,
				Math.min(
					imageSize.height - sourceHeight,
					(renderedSize.height - frameSize.height) / 2 / scale - pan.y / scale,
				),
			)
		: 0;

	const clampPan = useCallback(
		(next: Point): Point => ({
			x: Math.max(-maxPan.x, Math.min(maxPan.x, next.x)),
			y: Math.max(-maxPan.y, Math.min(maxPan.y, next.y)),
		}),
		[maxPan.x, maxPan.y],
	);

	useEffect(() => {
		if (!open || !frameRef.current) return;
		const frame = frameRef.current;
		const resizeObserver = new ResizeObserver(() => {
			const width = frame.clientWidth;
			setFrameSize({ width, height: width / MENTOR_IMAGE_ASPECT_RATIO });
		});
		resizeObserver.observe(frame);
		return () => resizeObserver.disconnect();
	}, [open]);

	useEffect(() => {
		if (!open) return;
		setZoom(1);
		setPan({ x: 0, y: 0 });
		setImageSize({ width: 0, height: 0 });
	}, [open]);

	useEffect(() => {
		if (!open || !imageUrl) return;
		// A blob URL can finish loading before the dialog's first paint. In that
		// case onLoad has already fired, so read the dimensions here as well.
		const image = imageRef.current;
		if (image?.complete && image.naturalWidth > 0) {
			setImageSize({
				width: image.naturalWidth,
				height: image.naturalHeight,
			});
		}
	}, [open, imageUrl]);

	useEffect(() => {
		setPan((current) => clampPan(current));
	}, [clampPan]);

	function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
		if (isSaving) return;
		event.currentTarget.setPointerCapture(event.pointerId);
		setDragStart({
			pointer: { x: event.clientX, y: event.clientY },
			pan,
		});
	}

	function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
		if (!dragStart) return;
		setPan(
			clampPan({
				x: dragStart.pan.x + event.clientX - dragStart.pointer.x,
				y: dragStart.pan.y + event.clientY - dragStart.pointer.y,
			}),
		);
	}

	function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}
		setDragStart(null);
	}

	async function handleSave() {
		if (!imageUrl || !imageSize.width || !imageSize.height) return;

		const image = imageRef.current;
		if (!image) return;

		const canvas = document.createElement("canvas");
		canvas.width = OUTPUT_WIDTH;
		canvas.height = OUTPUT_HEIGHT;
		const context = canvas.getContext("2d");
		if (!context) return;
		context.imageSmoothingEnabled = true;
		context.imageSmoothingQuality = "high";
		context.drawImage(
			image,
			sourceX,
			sourceY,
			sourceWidth,
			sourceHeight,
			0,
			0,
			OUTPUT_WIDTH,
			OUTPUT_HEIGHT,
		);

		const blob = await new Promise<Blob | null>((resolve) =>
			canvas.toBlob(resolve, "image/webp", 0.9),
		);
		if (!blob) return;
		await onSave(new File([blob], "mentor-photo.webp", { type: "image/webp" }));
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl p-0 sm:max-w-3xl">
				<div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_240px]">
					<div className="bg-[#171717] p-5 sm:p-8">
						<DialogHeader className="mb-5 pr-8 text-white">
							<DialogTitle className="text-xl text-white">
								Frame your profile photo
							</DialogTitle>
							<DialogDescription className="text-white/65">
								Drag to reposition · use the slider to zoom
							</DialogDescription>
						</DialogHeader>

						<div
							ref={frameRef}
							className={cn(
								"relative mx-auto aspect-[4/5] w-full max-w-[360px] touch-none select-none overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/10",
								isSaving
									? "cursor-wait"
									: dragStart
										? "cursor-grabbing"
										: "cursor-grab",
							)}
							onPointerDown={handlePointerDown}
							onPointerMove={handlePointerMove}
							onPointerUp={handlePointerUp}
							onPointerCancel={handlePointerUp}
						>
							{imageUrl ? (
								<img
									ref={imageRef}
									src={imageUrl}
									alt=""
									onLoad={(event) =>
										setImageSize({
											width: event.currentTarget.naturalWidth,
											height: event.currentTarget.naturalHeight,
										})
									}
									className="pointer-events-none absolute max-w-none"
									style={{
										width: renderedSize.width,
										height: renderedSize.height,
										left: (frameSize.width - renderedSize.width) / 2 + pan.x,
										top: (frameSize.height - renderedSize.height) / 2 + pan.y,
									}}
								/>
							) : null}
							<div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/30" />
							<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
								<span className="flex size-10 items-center justify-center rounded-full bg-black/35 text-white/80 backdrop-blur-sm">
									<Move className="size-4" />
								</span>
							</div>
						</div>

						<div className="mx-auto mt-6 flex max-w-[360px] items-center gap-3 text-white">
							<Minus className="size-4 shrink-0 text-white/55" />
							<input
								aria-label="Zoom"
								type="range"
								min="1"
								max="3"
								step="0.01"
								value={zoom}
								onChange={(event) => setZoom(Number(event.target.value))}
								className="h-1.5 w-full accent-[#ec008c]"
							/>
							<Plus className="size-4 shrink-0 text-white/55" />
						</div>
						<p className="mx-auto mt-3 max-w-[360px] text-center text-xs text-white/45">
							Your crop is saved as a portrait that works across your mentor
							cards.
						</p>
					</div>

					<aside className="space-y-5 bg-white p-5 sm:p-6">
						<div>
							<p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
								Live preview
							</p>
							<p className="mt-1 text-sm text-foreground">
								This is how your photo will appear.
							</p>
						</div>
						<div className="grid grid-cols-2 gap-3 md:grid-cols-1">
							<PreviewCard
								imageUrl={imageUrl}
								label="Mentor card"
								imageSize={imageSize}
								source={{
									x: sourceX,
									y: sourceY,
									width: sourceWidth,
									height: sourceHeight,
								}}
							/>
							<PreviewCard
								imageUrl={imageUrl}
								label="Featured"
								imageSize={imageSize}
								source={{
									x: sourceX,
									y: sourceY,
									width: sourceWidth,
									height: sourceHeight,
								}}
							/>
						</div>
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
						onClick={handleSave}
						disabled={isSaving || !imageSize.width}
					>
						{isSaving ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<Check className="size-4" />
						)}
						{isSaving ? "Uploading…" : "Use this crop"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function PreviewCard({
	imageUrl,
	label,
	imageSize,
	source,
}: {
	imageUrl: string | null;
	label: string;
	imageSize: { width: number; height: number };
	source: { x: number; y: number; width: number; height: number };
}) {
	return (
		<div>
			<div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-surface-pink ring-1 ring-border/60">
				{imageUrl ? (
					<img
						src={imageUrl}
						alt=""
						className="absolute max-w-none"
						style={
							imageSize.width && source.width
								? {
										width: `${(imageSize.width / source.width) * 100}%`,
										height: `${(imageSize.height / source.height) * 100}%`,
										left: `${-(source.x / source.width) * 100}%`,
										top: `${-(source.y / source.height) * 100}%`,
									}
								: undefined
						}
					/>
				) : (
					<div className="flex h-full items-center justify-center">
						<ImageIcon className="size-6 text-primary-500/60" />
					</div>
				)}
			</div>
			<p className="mt-2 text-center text-xs font-medium text-muted-foreground">
				{label}
			</p>
		</div>
	);
}
