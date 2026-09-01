"use client";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, Copy, Link2, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
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
	const [isPending, startTransition] = useTransition();
	const [loaded, setLoaded] = useState<{
		key: string;
		mentors: Awaited<ReturnType<typeof getMentorLinksForAdmin>>;
	} | null>(null);
	const filtersKey = `${filters.query ?? ""}\u0000${filters.status ?? ""}\u0000${filters.calendar ?? ""}`;
	const cachedMentors = loaded?.key === filtersKey ? loaded.mentors : null;

	if (count === 0) return null;

	function copyAll() {
		if (isPending) return;

		// Clipboard writes must start in this click handler. If the filtered set
		// has not been loaded yet, make this gesture load it and ask for one
		// explicit follow-up click rather than losing Safari/Firefox activation.
		if (!cachedMentors) {
			startTransition(async () => {
				try {
					const mentors = await getMentorLinksForAdmin(filters);
					setLoaded({ key: filtersKey, mentors });
					toast.success(
						`${mentors.length} link${mentors.length === 1 ? "" : "s"} ready — click Copy again to copy`,
					);
				} catch {
					toast.error("Couldn't load mentor links. Try again.");
				}
			});
			return;
		}

		// Do not await a server action or wrap this call in a transition: the
		// second user gesture is what authorizes clipboard access in strict browsers.
		void writeClipboard(
			cachedMentors
				.map((m) => `${m.name}\t${mentorPublicUrl(m.slug)}`)
				.join("\n"),
			`${cachedMentors.length} link${cachedMentors.length === 1 ? "" : "s"} copied`,
		);
	}

	return (
		<Button
			type="button"
			variant="outline"
			size="sm"
			className="gap-2"
			disabled={isPending}
			onClick={copyAll}
		>
			{isPending ? (
				<Loader2 className="size-4 animate-spin" />
			) : (
				<Copy className="size-4" />
			)}
			{isPending
				? "Loading links…"
				: `Copy ${count} link${count === 1 ? "" : "s"}`}
		</Button>
	);
}
