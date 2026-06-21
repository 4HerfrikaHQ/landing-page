import { PageHeader } from "@/components/dashboard/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { loadMentorBookings } from "./_actions";
import { BookingsTabs } from "./_components/bookings-tabs";

export default async function MentorBookingsPage({
	searchParams,
}: {
	searchParams: Promise<{
		tab?: string;
		q?: string;
		status?: string;
		stage?: string;
		page?: string;
	}>;
}) {
	const sp = await searchParams;
	const result = await loadMentorBookings({
		tab: sp.tab,
		query: sp.q,
		status: sp.status,
		stage: sp.stage,
		page: Number(sp.page) || 1,
	});

	if (!result.ok) {
		return (
			<div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
				<p className="text-sm text-muted-foreground">
					No mentor profile linked to your account.
				</p>
			</div>
		);
	}

	const hasFilters = Boolean(
		(sp.q ?? "") !== "" ||
			(sp.status && sp.status !== "all") ||
			(sp.stage && sp.stage !== "all"),
	);

	return (
		<div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
			<FadeIn>
				<PageHeader
					title="Bookings"
					subtitle="Mentees who have booked a call with you."
				/>
			</FadeIn>
			<FadeIn delay={0.05}>
				<BookingsTabs
					tab={result.tab}
					rows={result.rows}
					feedbackByBooking={result.feedbackByBooking}
					upcomingCount={result.upcomingCount}
					pastCount={result.pastCount}
					page={result.page}
					pageSize={result.pageSize}
					total={result.total}
					hasFilters={hasFilters}
					mentorSlug={result.mentorSlug}
				/>
			</FadeIn>
		</div>
	);
}
