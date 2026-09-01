"use client";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, Copy, Link2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// ponytail: same inline env read as every other public-URL site in the app.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://4herfrika.org";

export function mentorPublicUrl(slug: string) {
	return `${SITE_URL}/careercorner/${slug}`;
}

async function writeClipboard(text: string, message: string) {
	try {
		await navigator.clipboard.writeText(text);
		toast.success(message);
		return true;
	} catch {
		toast.error("Couldn't copy — clipboard is blocked in this browser.");
		return false;
	}
}

export function CopyMentorLinkButton({
	slug,
	name,
}: {
	slug: string;
	name: string;
}) {
	const [copied, setCopied] = useState(false);

	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<button
						type="button"
						aria-label={`Copy ${name}'s public booking link`}
						className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-muted/70 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
						onClick={async () => {
							if (!(await writeClipboard(mentorPublicUrl(slug), "Link copied")))
								return;
							setCopied(true);
							setTimeout(() => setCopied(false), 2000);
						}}
					/>
				}
			>
				{copied ? (
					<Check className="size-4 text-emerald-600" aria-hidden />
				) : (
					<Link2 className="size-4" aria-hidden />
				)}
			</TooltipTrigger>
			<TooltipContent>
				{mentorPublicUrl(slug)}
				<span className="mt-1 block text-xs opacity-80">Click to copy</span>
			</TooltipContent>
		</Tooltip>
	);
}

export function CopyAllMentorLinksButton({
	mentors,
}: {
	mentors: { name: string; slug: string }[];
}) {
	if (mentors.length === 0) return null;

	return (
		<Button
			type="button"
			variant="outline"
			size="sm"
			className="gap-2"
			onClick={() =>
				writeClipboard(
					mentors
						.map((m) => `${m.name}\t${mentorPublicUrl(m.slug)}`)
						.join("\n"),
					`${mentors.length} link${mentors.length === 1 ? "" : "s"} copied`,
				)
			}
		>
			<Copy className="size-4" />
			Copy {mentors.length} link{mentors.length === 1 ? "" : "s"}
		</Button>
	);
}
