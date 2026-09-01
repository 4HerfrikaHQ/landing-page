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
import { cn } from "@/utils/cn";
import { Check, ImageIcon, Loader2, Minus, Move, Plus } from "lucide-react";
import {
	type PointerEvent as ReactPointerEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";

type Point = { x: number; y: number };

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
	const frameRef = useRef<HTMLDivElement>(null);
	const imageRef = useRef<HTMLImageElement>(null);
	const cropInitializedRef = useRef(false);
	const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
	const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });
	const [zoom, setZoom] = useState(1);
	const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
	const dragStartRef = useRef<{
		pointer: Point;
		pan: Point;
	} | null>(null);
	const [isDragging, setIsDragging] = useState(false);

	const baseScale =
		imageSize.width && imageSize.height && frameSize.width && frameSize.height
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
	const currentCrop: MentorImageCrop | null =
		imageSize.width && imageSize.height && sourceWidth && sourceHeight
			? {
					x: sourceX / imageSize.width,
					y: sourceY / imageSize.height,
					width: sourceWidth / imageSize.width,
					height: sourceHeight / imageSize.height,
				}
			: null;

	const clampPan = useCallback(
		(next: Point): Point => ({
			x: Math.max(-maxPan.x, Math.min(maxPan.x, next.x)),
			y: Math.max(-maxPan.y, Math.min(maxPan.y, next.y)),
		}),
		[maxPan.x, maxPan.y],
	);

	useEffect(() => {
		if (!open) return;

		let resizeObserver: ResizeObserver | null = null;
		const frameRequest = requestAnimationFrame(() => {
			const frame = frameRef.current;
			if (!frame) return;

			const updateFrameSize = () => {
				const width = frame.clientWidth;
				if (width) {
					setFrameSize({ width, height: width / MENTOR_IMAGE_ASPECT_RATIO });
				}
			};

			resizeObserver = new ResizeObserver(updateFrameSize);
			updateFrameSize();
			resizeObserver.observe(frame);
		});

		return () => {
			cancelAnimationFrame(frameRequest);
			resizeObserver?.disconnect();
		};
	}, [open]);

	useEffect(() => {
		if (!open) return;
		setZoom(1);
		setPan({ x: 0, y: 0 });
		setImageSize({ width: 0, height: 0 });
		setFrameSize({ width: 0, height: 0 });
		cropInitializedRef.current = false;
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
		if (
			!open ||
			cropInitializedRef.current ||
			!imageSize.width ||
			!imageSize.height ||
			!frameSize.width
		) {
			return;
		}

		if (initialCrop) {
			const baseScale = Math.max(
				frameSize.width / imageSize.width,
				frameSize.height / imageSize.height,
			);
			const cropScale = frameSize.width / (imageSize.width * initialCrop.width);
			const nextZoom = Math.max(1, Math.min(3, cropScale / baseScale));
			const nextScale = baseScale * nextZoom;
			const nextRenderedWidth = imageSize.width * nextScale;
			const nextRenderedHeight = imageSize.height * nextScale;
			setZoom(nextZoom);
			setPan(
				clampPan({
					x:
						(nextRenderedWidth - frameSize.width) / 2 -
						initialCrop.x * imageSize.width * nextScale,
					y:
						(nextRenderedHeight - frameSize.height) / 2 -
						initialCrop.y * imageSize.height * nextScale,
				}),
			);
		}
		cropInitializedRef.current = true;
	}, [
		clampPan,
		frameSize.height,
		frameSize.width,
		imageSize.height,
		imageSize.width,
		initialCrop,
		open,
	]);

	useEffect(() => {
		setPan((current) => clampPan(current));
	}, [clampPan]);

	function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
		if (isSaving) return;
		event.preventDefault();
		event.currentTarget.setPointerCapture(event.pointerId);
		dragStartRef.current = {
			pointer: { x: event.clientX, y: event.clientY },
			pan,
		};
		setIsDragging(true);
	}

	function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
		const dragStart = dragStartRef.current;
		if (!dragStart) return;
		event.preventDefault();
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
		dragStartRef.current = null;
		setIsDragging(false);
	}

	async function handleSave() {
		if (!currentCrop) return;
		await onSave(currentCrop);
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
									: isDragging
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
						{imageUrl && currentCrop ? (
							<MentorImage
								src={imageUrl}
								alt=""
								crop={currentCrop}
								className="aspect-[4/5] rounded-xl bg-surface-pink ring-1 ring-border/60"
								sizes="180px"
							/>
						) : (
							<div className="flex aspect-[4/5] items-center justify-center rounded-xl bg-surface-pink ring-1 ring-border/60">
								<ImageIcon className="size-6 text-primary-500/60" />
							</div>
						)}
						<p className="text-center text-xs font-medium text-muted-foreground">
							Mentor profile preview
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
						onClick={handleSave}
						disabled={isSaving || !currentCrop}
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
