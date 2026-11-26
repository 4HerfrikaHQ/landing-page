"use client";

import Image, { type ImageProps, type StaticImageData } from "next/image";
import { type SyntheticEvent, useCallback } from "react";
import { SHIMMER_PLACEHOLDER } from "./shimmer";

function hasBlur(src: ImageProps["src"]): boolean {
	return (
		typeof src === "object" &&
		"blurDataURL" in (src as StaticImageData) &&
		Boolean((src as StaticImageData).blurDataURL)
	);
}

function isSvg(src: ImageProps["src"]): boolean {
	const path = typeof src === "string" ? src : (src as StaticImageData).src;
	return path.split("?")[0].endsWith(".svg");
}

function defaultPlaceholder(src: ImageProps["src"]): ImageProps["placeholder"] {
	if (isSvg(src)) return "empty";
	return hasBlur(src) ? "blur" : SHIMMER_PLACEHOLDER;
}

function markLoaded(img: HTMLImageElement, how: "cached" | "fresh") {
	img.dataset.loaded = how;
}

export function SiteImage({ placeholder, onLoad, alt, ...props }: ImageProps) {
	const ref = useCallback((img: HTMLImageElement | null) => {
		if (img?.complete && img.naturalWidth > 0) markLoaded(img, "cached");
	}, []);

	const handleLoad = useCallback(
		(event: SyntheticEvent<HTMLImageElement>) => {
			const img = event.currentTarget;
			if (img.dataset.loaded !== "cached") markLoaded(img, "fresh");
			onLoad?.(event);
		},
		[onLoad],
	);

	return (
		<Image
			{...props}
			alt={alt}
			ref={ref}
			onLoad={handleLoad}
			placeholder={placeholder ?? defaultPlaceholder(props.src)}
		/>
	);
}
