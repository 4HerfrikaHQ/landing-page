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
	url,
	name,
	active,
}: {
	url: string;
	name: string;
	active: boolean;
}) {
	const [copied, setCopied] = useState(false);

	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<button
						type="button"
						aria-label={`Copy ${name}'s public booking link${active ? "" : " (page is offline while they're inactive)"}`}
						className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-muted/70 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
						onClick={async () => {
							if (!(await writeClipboard(url, "Link copied"))) return;
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
				{url}
				<span className="mt-1 block text-xs opacity-80">
					{active
						? "Click to copy"
						: "Click to copy — but this page 404s until the mentor is active."}
				</span>
			</TooltipContent>
		</Tooltip>
	);
}

export function CopyAllMentorLinksButton({
	mentors,
}: {
	mentors: { name: string; url: string }[];
}) {
	if (mentors.length === 0) return null;

	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="gap-2"
						onClick={() =>
							writeClipboard(
								mentors.map((m) => `${m.name}\t${m.url}`).join("\n"),
								`${mentors.length} link${mentors.length === 1 ? "" : "s"} copied`,
							)
						}
					>
						<Copy className="size-4" />
						Copy {mentors.length} link{mentors.length === 1 ? "" : "s"}
					</Button>
				}
			/>
			<TooltipContent>
				Active mentors matching your filters — one “Name → URL” per line,
				tab-separated.
				<span className="mt-1 block text-xs opacity-80">
					Inactive mentors are left out; their public pages 404.
				</span>
			</TooltipContent>
		</Tooltip>
	);
}
