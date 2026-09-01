"use client";

import { Check, Copy, ExternalLink, Loader2, Pencil, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { DataCard, DataCardSection } from "@/components/dashboard/data-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { updateMySlug } from "../../_actions";

export function PublicLinkCard({
	siteUrl,
	slug,
}: {
	siteUrl: string;
	slug: string;
}) {
	const [savedSlug, setSavedSlug] = useState(slug);
	const [draftSlug, setDraftSlug] = useState(slug);
	const [editing, setEditing] = useState(false);
	const [copied, setCopied] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();
	const baseUrl = `${siteUrl}/careercorner/`;
	const url = `${baseUrl}${savedSlug}`;

	async function copy() {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			toast.success("Link copied");
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Couldn't copy — copy it manually.");
		}
	}

	function cancelEditing() {
		setDraftSlug(savedSlug);
		setError(null);
		setEditing(false);
	}

	function saveSlug() {
		if (isPending || draftSlug === savedSlug) return;
		setError(null);
		startTransition(async () => {
			const result = await updateMySlug(draftSlug);
			if (result.error || !result.slug) {
				setError(result.error ?? "Couldn't update the profile link.");
				return;
			}

			setSavedSlug(result.slug);
			setDraftSlug(result.slug);
			setEditing(false);
			toast.success("Public link updated");
		});
	}

	return (
		<DataCard>
			<DataCardSection className="space-y-4 p-6 sm:p-8">
				<div className="flex items-start justify-between gap-4">
					<div>
						<h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							Your public link
						</h2>
						<p className="mt-1 text-sm text-muted-foreground">
							Share this exact link — it's how mentees find and book you.
						</p>
					</div>
					{!editing ? (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="gap-1.5"
							onClick={() => setEditing(true)}
						>
							<Pencil className="size-3.5" />
							Edit
						</Button>
					) : null}
				</div>

				{editing ? (
					<div className="space-y-3">
						<div className="flex min-w-0 items-center overflow-hidden rounded-lg border border-border bg-muted focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
							<span className="hidden shrink-0 pl-3 font-mono text-sm text-muted-foreground sm:inline">
								{baseUrl}
							</span>
							<Input
								aria-label="Profile link"
								autoFocus
								value={draftSlug}
								onChange={(event) => setDraftSlug(event.target.value)}
								onKeyDown={(event) => {
									if (event.key === "Enter") saveSlug();
									if (event.key === "Escape") cancelEditing();
								}}
								autoCapitalize="none"
								autoCorrect="off"
								spellCheck={false}
								className="h-10 rounded-none border-0 bg-transparent px-1 font-mono shadow-none focus-visible:ring-0 sm:px-0"
							/>
						</div>
						<p className="text-xs text-amber-700">
							Changing this immediately breaks links you previously shared. Use
							only letters, numbers, and single hyphens.
						</p>
						{error ? <p className="text-sm text-destructive">{error}</p> : null}
						<div className="flex justify-end gap-2">
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="gap-1.5"
								onClick={cancelEditing}
								disabled={isPending}
							>
								<X className="size-3.5" />
								Cancel
							</Button>
							<Button
								type="button"
								variant="solid"
								size="sm"
								onClick={saveSlug}
								disabled={isPending || draftSlug === savedSlug}
							>
								{isPending ? (
									<Loader2 className="mr-1.5 size-3.5 animate-spin" />
								) : null}
								{isPending ? "Saving…" : "Save link"}
							</Button>
						</div>
					</div>
				) : (
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
						<code className="min-w-0 flex-1 truncate rounded-md border border-border/60 bg-muted px-3.5 py-2.5 text-sm text-foreground">
							{url}
						</code>
						<div className="grid grid-cols-2 gap-2 sm:flex">
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="w-full gap-2 px-3.5 sm:w-auto sm:min-w-20"
								onClick={copy}
							>
								{copied ? (
									<Check className="size-4" />
								) : (
									<Copy className="size-4" />
								)}
								{copied ? "Copied" : "Copy"}
							</Button>
							<Button
								href={url}
								isExternal
								variant="outline"
								size="sm"
								className="w-full gap-2 px-3.5 sm:w-auto sm:min-w-20"
							>
								<ExternalLink className="size-4" />
								Open
							</Button>
						</div>
					</div>
				)}
			</DataCardSection>
		</DataCard>
	);
}
