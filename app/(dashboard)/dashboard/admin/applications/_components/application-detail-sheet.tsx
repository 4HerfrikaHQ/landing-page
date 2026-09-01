"use client";

import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { format } from "date-fns";
import { FileDown } from "lucide-react";
import { type ReactNode, useState } from "react";
import type { ApplicationRow } from "../_actions";
import { getCvSignedUrl } from "../_actions";
import { RowActions } from "./row-actions";

export function ApplicationDetailSheet({
	application,
	open,
	onOpenChange,
}: {
	application: ApplicationRow;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const a = application;
	const [downloadingCv, setDownloadingCv] = useState(false);

	async function handleCvDownload() {
		if (!a.cv_path) return;
		setDownloadingCv(true);
		try {
			const url = await getCvSignedUrl(a.cv_path);
			if (url) window.open(url, "_blank");
		} finally {
			setDownloadingCv(false);
		}
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="flex flex-col overflow-y-auto px-4 sm:w-[64rem] sm:max-w-[calc(100vw-2rem)] sm:px-6">
				<SheetHeader className="px-0">
					<SheetTitle>{a.name}</SheetTitle>
				</SheetHeader>

				<div className="flex flex-1 flex-col gap-6 pb-4">
					<div className="flex flex-wrap items-center gap-3">
						<StatusBadge status={a.status} />
						<span className="text-sm text-muted-foreground">
							Submitted {format(a.created_at, "MMM d, yyyy")}
						</span>
					</div>

					<dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
						<Field label="Email" full>
							<a
								href={`mailto:${a.email}`}
								className="text-primary-500 hover:underline"
							>
								{a.email}
							</a>
						</Field>
						{a.phone && <Field label="Phone / WhatsApp">{a.phone}</Field>}
						{a.country && <Field label="Country">{a.country}</Field>}
						{a.industry && (
							<Field label="Industry">
								<span className="capitalize">{a.industry}</span>
							</Field>
						)}
						{a.linkedin_url && (
							<Field label="LinkedIn" full>
								<a
									href={a.linkedin_url}
									target="_blank"
									rel="noreferrer"
									className="break-all text-primary-500 hover:underline"
								>
									{a.linkedin_url}
								</a>
							</Field>
						)}
						{a.cv_path && (
							<Field label="CV" full>
								<Button
									variant="outline"
									size="sm"
									onClick={handleCvDownload}
									disabled={downloadingCv}
									className="mt-1 gap-1.5"
								>
									<FileDown className="size-3.5" />
									{downloadingCv ? "Getting link…" : "Download CV"}
								</Button>
							</Field>
						)}
					</dl>

					{a.bio && (
						<Section title="About">
							<p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/80">
								{a.bio}
							</p>
						</Section>
					)}

					{a.status === "rejected" && a.reject_reason && (
						<Section title="Reason for rejection">
							<p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">
								{a.reject_reason}
							</p>
						</Section>
					)}
				</div>

				{a.status === "pending" && (
					<div className="sticky bottom-0 -mx-4 border-t border-border/60 bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
						<RowActions
							applicationId={a.id}
							onDone={() => onOpenChange(false)}
						/>
					</div>
				)}
			</SheetContent>
		</Sheet>
	);
}

function Field({
	label,
	children,
	full,
}: {
	label: string;
	children: ReactNode;
	full?: boolean;
}) {
	return (
		<div className={full ? "sm:col-span-2" : undefined}>
			<dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
				{label}
			</dt>
			<dd className="mt-1 text-sm text-foreground">{children}</dd>
		</div>
	);
}

function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<div className="space-y-2">
			<h4 className="text-xs font-semibold uppercase tracking-wide text-primary-500">
				{title}
			</h4>
			{children}
		</div>
	);
}
