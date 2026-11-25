"use client";

import { Check, Link2 } from "lucide-react";
import { useState } from "react";
import type { shareLinks } from "../_feed";

type Props = {
	url: string;
	links: ReturnType<typeof shareLinks>;
	labels: {
		heading: string;
		whatsapp: string;
		x: string;
		linkedin: string;
		copy: string;
		copied: string;
		newTab: string;
	};
};

const BUTTON =
	"inline-flex h-11 items-center justify-center gap-1.5 rounded-pill border-2 px-2 text-[15px] font-medium no-underline outline-none hover:no-underline! focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 lg:px-4";

function WhatsAppIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			className="size-[18px] shrink-0"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3a.5.5 0 0 0 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3z" />
		</svg>
	);
}

function LinkedInIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			className="size-[18px] shrink-0"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4V21H3zM9.5 9.75h3.8v1.6h.1a4.2 4.2 0 0 1 3.8-2c4 0 4.8 2.6 4.8 6V21h-4v-5c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4z" />
		</svg>
	);
}

function XIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			className="size-4 shrink-0"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M18.2 2.25h3.3l-7.2 8.26 8.5 11.24h-6.66l-5.2-6.82-5.97 6.82H1.66l7.7-8.8L1.25 2.25h6.83l4.7 6.23zm-1.16 17.52h1.83L7.08 4.13H5.12z" />
		</svg>
	);
}

function CopyContent({
	copied,
	labels,
}: { copied: boolean; labels: Props["labels"] }) {
	if (copied) {
		return (
			<>
				<Check className="size-[18px] shrink-0" aria-hidden="true" />
				<output>{labels.copied}</output>
			</>
		);
	}
	return (
		<>
			<Link2 className="size-[18px] shrink-0" aria-hidden="true" />
			<output>{labels.copy}</output>
		</>
	);
}

function NewTab({ label }: { label: string }) {
	return <span className="sr-only">{label}</span>;
}

export function ShareButtons({ url, links, labels }: Props) {
	const [copied, setCopied] = useState(false);

	const copyLink = async () => {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			setCopied(false);
		}
	};

	return (
		<div className="mt-12 flex flex-col gap-4 border-y border-border py-6 lg:flex-row lg:items-center lg:justify-between">
			<p className="font-semibold">{labels.heading}</p>
			<div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
				<a
					href={links.whatsapp}
					target="_blank"
					rel="noopener noreferrer"
					className={`${BUTTON} border-[#1f7a4d] text-[#1f7a4d]`}
				>
					<WhatsAppIcon />
					{labels.whatsapp}
					<NewTab label={labels.newTab} />
				</a>
				<a
					href={links.x}
					target="_blank"
					rel="noopener noreferrer"
					className={`${BUTTON} border-foreground text-foreground`}
				>
					<XIcon />
					{labels.x}
					<NewTab label={labels.newTab} />
				</a>
				<a
					href={links.linkedin}
					target="_blank"
					rel="noopener noreferrer"
					className={`${BUTTON} border-[#0a66c2] text-[#0a66c2]`}
				>
					<LinkedInIcon />
					{labels.linkedin}
					<NewTab label={labels.newTab} />
				</a>
				<button
					type="button"
					onClick={copyLink}
					className={`${BUTTON} cursor-pointer border-border text-foreground`}
				>
					<CopyContent copied={copied} labels={labels} />
				</button>
			</div>
		</div>
	);
}
