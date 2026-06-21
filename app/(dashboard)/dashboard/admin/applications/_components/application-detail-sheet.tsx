"use client";

import { StatusBadge } from "@/components/dashboard/status-badge";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { format } from "date-fns";
import type { ReactNode } from "react";
import type { ApplicationRow } from "../_actions";
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

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="flex flex-col overflow-y-auto px-4 sm:max-w-xl sm:px-6">
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
						<Field label="Position">{a.position}</Field>
						<Field label="Email">
							<a
								href={`mailto:${a.email}`}
								className="text-primary-500 hover:underline"
							>
								{a.email}
							</a>
						</Field>
						{a.phone && <Field label="Phone / WhatsApp">{a.phone}</Field>}
						{a.country && <Field label="Country">{a.country}</Field>}
						{a.gender && (
							<Field label="Gender">
								<span className="capitalize">{a.gender.replace(/_/g, " ")}</span>
							</Field>
						)}
						{a.linkedin_url && (
							<Field label="LinkedIn">
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
						{a.expertise_areas && a.expertise_areas.length > 0 && (
							<Field label="Expertise" full>
								<div className="flex flex-wrap gap-1.5">
									{a.expertise_areas.map((area) => (
										<span
											key={area}
											className="rounded-full bg-surface-pink px-2.5 py-0.5 text-xs font-medium text-primary-500"
										>
											{area}
										</span>
									))}
								</div>
							</Field>
						)}
					</dl>

					{a.bio && (
						<Section title="Bio">
							<p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/80">
								{a.bio}
							</p>
						</Section>
					)}

					<Section title="Motivation">
						<p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/80">
							{a.motivation}
						</p>
					</Section>

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
