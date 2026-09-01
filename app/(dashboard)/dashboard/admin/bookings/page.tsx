import { EmptyState } from "@/components/dashboard/empty-state";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { PageHeader } from "@/components/dashboard/page-header";
import { Pagination } from "@/components/dashboard/pagination";
import { StatCard } from "@/components/dashboard/stat-card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { currentDbUser } from "@/src/auth";
import {
	CalendarDays,
	CheckCircle2,
	Clock3,
	UserX,
	XCircle,
} from "lucide-react";
import { unauthorized } from "next/navigation";
import { Suspense } from "react";
import {
	getBookingSummaryForAdmin,
	getBookingsForAdmin,
	getMentorOptions,
} from "./_actions";
import { BookingFilters } from "./_components/booking-filters";
import { BookingRow } from "./_components/booking-row";

const PAGE_SIZE = 50;

export default async function AdminBookingsPage({
	searchParams,
}: {
	searchParams: Promise<{
		status?: string;
		mentor?: string;
		date?: string;
		from?: string;
		to?: string;
		q?: string;
		page?: string;
	}>;
}) {
	const user = await currentDbUser();
	if (user.role !== "super_admin") unauthorized();

	const sp = await searchParams;
	const page = Math.max(1, Number(sp.page) || 1);
	const filters = {
		status: sp.status,
		mentorSlug: sp.mentor,
		dateRange: sp.date,
		from: sp.from,
		to: sp.to,
		query: sp.q,
	};

	const [{ rows, total }, mentorOptions, summary] = await Promise.all([
		getBookingsForAdmin({
			...filters,
			page,
			pageSize: PAGE_SIZE,
		}),
		getMentorOptions(),
		getBookingSummaryForAdmin(filters),
	]);

	const hasFilters = Boolean(
		sp.status || sp.mentor || sp.date || sp.from || sp.to || sp.q,
	);
	const cancelledView = sp.status === "cancelled";

	return (
		<div>
			<PageHeader
				title="Bookings"
				subtitle={
					cancelledView
						? `${total} cancelled booking${total === 1 ? "" : "s"}`
						: `${total} booking${total === 1 ? "" : "s"} across all mentors`
				}
			/>

			<div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
				<StatCard
					icon={CalendarDays}
					label="Total bookings"
					value={summary.total}
				/>
				<StatCard icon={Clock3} label="Upcoming" value={summary.upcoming} />
				<StatCard
					icon={CheckCircle2}
					label="Completed"
					value={summary.completed}
				/>
				<StatCard
					icon={XCircle}
					label={`Cancelled · ${summary.cancellationRate}%`}
					value={summary.cancelled}
				/>
				<StatCard icon={UserX} label="No shows" value={summary.noShow} />
			</div>

			<div className="mb-6">
				<Suspense>
					<FilterBar>
						<BookingFilters mentors={mentorOptions} />
					</FilterBar>
				</Suspense>
			</div>

			<div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
				<Table>
					<TableHeader>
						<TableRow className="bg-muted text-xs uppercase tracking-wide text-muted-foreground hover:bg-muted">
							<TableHead className="px-4">When</TableHead>
							<TableHead className="px-4">Mentor</TableHead>
							<TableHead className="px-4">Mentee</TableHead>
							<TableHead className="px-4">Status</TableHead>
							<TableHead className="px-4 text-right">Details</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{rows.map((r) => (
							<BookingRow key={r.id} booking={r} />
						))}
						{rows.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} className="p-6">
									<EmptyState
										icon={cancelledView ? XCircle : CalendarDays}
										title={
											cancelledView
												? "No cancellations in this period"
												: hasFilters
													? "No bookings match these filters"
													: "No bookings yet"
										}
										description={
											cancelledView || hasFilters
												? "Try clearing or adjusting the filters above."
												: "Bookings will appear here as mentees book sessions."
										}
										className="border-0 bg-transparent"
									/>
								</TableCell>
							</TableRow>
						) : null}
					</TableBody>
				</Table>
			</div>

			<Suspense>
				<Pagination page={page} pageSize={PAGE_SIZE} total={total} />
			</Suspense>
		</div>
	);
}
