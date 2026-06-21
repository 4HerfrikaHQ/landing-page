"use client";

import { EmptyState } from "@/components/dashboard/empty-state";
import { FilterBar, SearchInput } from "@/components/dashboard/filter-bar";
import { Pagination } from "@/components/dashboard/pagination";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ShieldCheck } from "lucide-react";
import { useQueryState } from "nuqs";
import type { AdminRow } from "../_actions";
import { AdminTableRow } from "./admin-table-row";

export function AdminsTable({
	admins,
	currentUserId,
	page,
	pageSize,
	total,
}: {
	admins: AdminRow[];
	currentUserId: string;
	page: number;
	pageSize: number;
	total: number;
}) {
	const [query] = useQueryState("q", { defaultValue: "" });
	const hasQuery = query.trim().length > 0;

	return (
		<>
			<div className="mb-6">
				<FilterBar>
					<SearchInput paramKey="q" placeholder="Search by name or email…" />
				</FilterBar>
			</div>

			<div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
				<Table>
					<TableHeader>
						<TableRow className="bg-muted">
							<TableHead className="font-medium text-muted-foreground">
								Name
							</TableHead>
							<TableHead className="font-medium text-muted-foreground">
								Email
							</TableHead>
							<TableHead className="font-medium text-muted-foreground">
								Joined
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{admins.length === 0 ? (
							<TableRow>
								<TableCell colSpan={3} className="p-0">
									<EmptyState
										icon={ShieldCheck}
										title={
											hasQuery ? "No admins match your search" : "No admins yet"
										}
										description={
											hasQuery
												? "Try a different name or email."
												: "Invite an admin to get started."
										}
										className="border-0 bg-transparent"
									/>
								</TableCell>
							</TableRow>
						) : (
							admins.map((admin) => (
								<AdminTableRow
									key={admin.id}
									admin={admin}
									currentUserId={currentUserId}
								/>
							))
						)}
					</TableBody>
				</Table>
			</div>

			<Pagination page={page} pageSize={pageSize} total={total} />
		</>
	);
}
