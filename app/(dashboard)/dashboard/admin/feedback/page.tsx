import { EmptyState } from "@/components/dashboard/empty-state";
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
import { Megaphone, MessageSquareText, Star } from "lucide-react";
import { unauthorized } from "next/navigation";
import { Suspense } from "react";
import { getFeedbackForAdmin, getFeedbackSummaryForAdmin } from "./_actions";
import { FeedbackRow } from "./_components/feedback-row";

const PAGE_SIZE = 50;

export default async function AdminFeedbackPage({
	searchParams,
}: {
	searchParams: Promise<{ page?: string }>;
}) {
	const user = await currentDbUser();
	if (user.role !== "super_admin") unauthorized();

	const sp = await searchParams;
	const page = Math.max(1, Number(sp.page) || 1);

	const [{ rows, total }, summary] = await Promise.all([
		getFeedbackForAdmin({ page, pageSize: PAGE_SIZE }),
		getFeedbackSummaryForAdmin(),
	]);

	return (
		<div>
			<PageHeader
				title="Session feedback"
				subtitle={`${total} response${total === 1 ? "" : "s"} from mentees`}
			/>

			<div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
				<StatCard
					compact
					icon={MessageSquareText}
					label="Responses"
					value={summary.responses}
				/>
				<StatCard
					compact
					icon={Star}
					label="Average rating"
					value={summary.avgRating ?? 0}
					formatValue={(v) =>
						summary.avgRating === null ? "—" : `${v.toFixed(1)}/5`
					}
				/>
				<StatCard
					compact
					icon={Megaphone}
					label="Testimonial opt-ins"
					value={summary.testimonialConsent}
				/>
			</div>

			<div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
				<Table>
					<TableHeader>
						<TableRow className="bg-muted text-xs uppercase tracking-wide text-muted-foreground hover:bg-muted">
							<TableHead className="px-4">When</TableHead>
							<TableHead className="px-4">Mentor</TableHead>
							<TableHead className="px-4">Mentee</TableHead>
							<TableHead className="px-4">Outcome</TableHead>
							<TableHead className="px-4">Rating</TableHead>
							<TableHead className="px-4">Comment</TableHead>
							<TableHead className="px-4 text-right">Details</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{rows.map((r) => (
							<FeedbackRow key={r.booking_id} feedback={r} />
						))}
						{rows.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7} className="p-6">
									<EmptyState
										icon={MessageSquareText}
										title="No feedback yet"
										description="Mentee responses will appear here after sessions are completed."
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
