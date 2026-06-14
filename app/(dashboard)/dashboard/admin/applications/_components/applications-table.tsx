"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	type DbMentorApplication,
	MentorApplicationStatus,
} from "@/src/db/schema/tables/mentor-applications";
import { useState } from "react";
import { RowActions } from "./row-actions";

type Row = DbMentorApplication;
type Status = MentorApplicationStatus;

export function ApplicationsTable({ rows }: { rows: Row[] }) {
	const [tab, setTab] = useState<Status>("pending");
	const filtered = rows.filter((r) => r.status === tab);
	const pendingCount = rows.filter((r) => r.status === "pending").length;

	return (
		<Tabs value={tab} onValueChange={(v) => setTab(v as Status)}>
			<TabsList>
				<TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
				<TabsTrigger value="approved">Approved</TabsTrigger>
				<TabsTrigger value="rejected">Rejected</TabsTrigger>
			</TabsList>
			{MentorApplicationStatus.options.map((s) => (
				<TabsContent key={s} value={s}>
					<div className="mt-4 space-y-3">
						{filtered.length === 0 && (
							<p className="text-sm text-gray-500">No applications.</p>
						)}
						{filtered.map((row) => (
							<article key={row.id} className="rounded-lg border p-4 bg-white">
								<header className="flex items-start justify-between gap-4">
									<div>
										<h3 className="font-medium text-lg text-gray-900">{row.name}</h3>
										<p className="text-sm text-gray-500">
											<b>Email:</b> {row.email} · <b>Position:</b> {row.position}
										</p>
									</div>
									<StatusBadge status={row.status} />
                </header>
								<p className="mt-3 text-sm whitespace-pre-wrap text-gray-700 wrap-break-word">
                  <b>Motivation:</b><br />
                  {row.motivation}
								</p>
								{row.linkedin_url && (
									<p className="mt-2 text-xs text-gray-500">
										LinkedIn:{" "}
										<a
											className="underline"
											href={row.linkedin_url}
											target="_blank"
											rel="noreferrer"
										>
											{row.linkedin_url}
										</a>
									</p>
								)}
								{row.status === "pending" && (
									<div className="mt-4">
										<RowActions applicationId={row.id} />
									</div>
								)}
								{row.status === "rejected" && row.reject_reason && (
									<p className="mt-3 text-xs text-gray-500">
										Reason: {row.reject_reason}
									</p>
								)}
							</article>
						))}
					</div>
				</TabsContent>
			))}
		</Tabs>
	);
}

function StatusBadge({ status }: { status: Status }) {
	const styles: Record<Status, string> = {
		pending: "bg-amber-50 text-amber-700 border-amber-200",
		approved: "bg-green-50 text-green-700 border-green-200",
		rejected: "bg-gray-100 text-gray-600 border-gray-200",
	};
	return (
		<span
			className={`text-xs uppercase tracking-wide px-2 py-0.5 rounded border ${styles[status]}`}
		>
			{status}
		</span>
	);
}
