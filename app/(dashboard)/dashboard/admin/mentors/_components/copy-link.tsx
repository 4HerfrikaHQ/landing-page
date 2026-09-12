"use client";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, Copy, Link2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type MentorAdminFilters, getMentorLinksForAdmin } from "../_actions";

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
	count,
	filters,
}: {
	count: number;
	filters: Pick<MentorAdminFilters, "query" | "status" | "calendar">;
}) {
	const [isCopying, setIsCopying] = useState(false);

	if (count === 0) return null;

	async function copyAll() {
		if (isCopying) return;
		setIsCopying(true);
		try {
			const mentors = await getMentorLinksForAdmin(filters);
			await writeClipboard(
				mentors
				.map((m) => `${m.name}\t${mentorPublicUrl(m.slug)}`)
				.join("\n"),
				`${mentors.length} link${mentors.length === 1 ? "" : "s"} copied`,
			);
		} catch {
			toast.error("Couldn't load mentor links. Try again.");
		} finally {
			setIsCopying(false);
		}
	}

	return (
		<Button
			type="button"
			variant="outline"
			size="sm"
			className="gap-2"
			disabled={isCopying}
			onClick={copyAll}
		>
			{isCopying ? (
				<Loader2 className="size-4 animate-spin" />
			) : (
				<Copy className="size-4" />
			)}
			{isCopying
				? "Loading links…"
				: `Copy ${count} link${count === 1 ? "" : "s"}`}
		</Button>
	);
}
