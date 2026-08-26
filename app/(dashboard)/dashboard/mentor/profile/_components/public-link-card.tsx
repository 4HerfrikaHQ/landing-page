"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { DataCard, DataCardSection } from "@/components/dashboard/data-card";
import { Button } from "@/components/ui/button";

export function PublicLinkCard({ url }: { url: string }) {
	const [copied, setCopied] = useState(false);

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

	return (
		<DataCard>
			<DataCardSection className="space-y-4 p-6 sm:p-8">
				<div>
					<h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						Your public link
					</h2>
					<p className="mt-1 text-sm text-muted-foreground">
						Share this exact link — it's how mentees find and book you.
					</p>
				</div>
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
					<code className="min-w-0 flex-1 truncate rounded-md border border-border/60 bg-muted px-3.5 py-2.5 text-sm text-foreground">
						{url}
					</code>
					<div className="grid grid-cols-2 gap-2 sm:flex">
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="w-full gap-2 px-3.5 sm:min-w-20 sm:w-auto"
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
							className="w-full gap-2 px-3.5 sm:min-w-20 sm:w-auto"
						>
							<ExternalLink className="size-4" />
							Open
						</Button>
					</div>
				</div>
			</DataCardSection>
		</DataCard>
	);
}
