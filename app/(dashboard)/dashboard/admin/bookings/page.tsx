import { EmptyState } from "@/components/dashboard/empty-state";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { currentDbUser } from "@/src/auth";
import { CalendarDays } from "lucide-react";
import { unauthorized } from "next/navigation";
import { Suspense } from "react";
import { getBookingsForAdmin, getMentorOptions } from "./_actions";
import { BookingFilters } from "./_components/booking-filters";
import { BookingRow } from "./_components/booking-row";
import { Pagination } from "@/components/dashboard/pagination";

const PAGE_SIZE = 50;

export default async function AdminBookingsPage({
	searchParams,
}: {
	searchParams: Promise<{
		status?: string;
		mentor?: string;
		from?: string;
		to?: string;
		q?: string;
		page?: string;
	}>;
}) {
	const user = await currentDbUser();
	// if (user.role !== "super_admin") unauthorized();

	const sp = await searchParams;
	const page = Math.max(1, Number(sp.page) || 1);

	const [{ rows, total }, mentorOptions] = await Promise.all([
		getBookingsForAdmin({
			status: sp.status,
			mentorSlug: sp.mentor,
			from: sp.from,
			to: sp.to,
			query: sp.q,
			page,
			pageSize: PAGE_SIZE,
		}),
		getMentorOptions(),
	]);

	const hasFilters = Boolean(
		sp.status || sp.mentor || sp.from || sp.to || sp.q,
	);

	return (
		<div>
			<PageHeader
				title="All bookings"
				subtitle={`${total} booking${total === 1 ? "" : "s"} across all mentors`}
			/>

			<div className="mb-6">
				<Suspense>
					<FilterBar>
						<BookingFilters mentors={mentorOptions} />
					</FilterBar>
				</Suspense>
			</div>

			<div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
				<table className="w-full text-sm">
					<thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
						<tr>
							<th className="px-4 py-3 font-medium">When</th>
							<th className="px-4 py-3 font-medium">Mentor</th>
							<th className="px-4 py-3 font-medium">Mentee</th>
							<th className="px-4 py-3 font-medium">Status</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((r) => (
							<BookingRow key={r.id} booking={r} />
						))}
					</tbody>
				</table>

				{rows.length === 0 ? (
					<div className="p-6">
						<EmptyState
							icon={CalendarDays}
							title={
								hasFilters
									? "No bookings match these filters"
									: "No bookings yet"
							}
							description={
								hasFilters
									? "Try clearing or adjusting the filters above."
									: "Bookings will appear here as mentees book sessions."
							}
						/>
					</div>
				) : null}
			</div>

			<Suspense>
				<Pagination page={page} pageSize={PAGE_SIZE} total={total} />
			</Suspense>
		</div>
	);
}
