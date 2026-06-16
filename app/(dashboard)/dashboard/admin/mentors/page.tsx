import { EmptyState } from "@/components/dashboard/empty-state";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { PageHeader } from "@/components/dashboard/page-header";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { currentDbUser } from "@/src/auth";
import { Users } from "lucide-react";
import { unauthorized } from "next/navigation";
import { Suspense } from "react";
import { getFeaturedMentorId, getMentorsForAdmin } from "./_actions";
import { CreateMentorSheet } from "./_components/create-mentor-sheet";
import { MentorFilters } from "./_components/mentor-filters";
import { MentorTableRow } from "./_components/mentor-table-row";
import {
	MentorFeaturedFilter,
	MentorSortValue,
	MentorStatusFilter,
} from "./_schema";

export default async function MentorsPage({
	searchParams,
}: {
	searchParams: Promise<{
		q?: string;
		status?: string;
		sort?: string;
		featured?: string;
	}>;
}) {
	const user = await currentDbUser();
	if (user.role !== "super_admin") unauthorized();

	const sp = await searchParams;
	const status = MentorStatusFilter.safeParse(sp.status);
	const sort = MentorSortValue.safeParse(sp.sort);
	const featured = MentorFeaturedFilter.safeParse(sp.featured);

	const [mentors, currentFeaturedId] = await Promise.all([
		getMentorsForAdmin({
			query: sp.q,
			status: status.success ? status.data : undefined,
			sort: sort.success ? sort.data : undefined,
			featured: featured.success ? featured.data : undefined,
		}),
		getFeaturedMentorId(),
	]);

	return (
		<div className="mx-auto max-w-5xl p-6 sm:p-8">
			<PageHeader
				title="Mentors"
				subtitle={`${mentors.length} mentor${mentors.length === 1 ? "" : "s"}`}
				action={<CreateMentorSheet />}
			/>

			<div className="mb-6">
				<Suspense>
					<FilterBar>
						<MentorFilters />
					</FilterBar>
				</Suspense>
			</div>

			<div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
				<Table>
					<TableHeader>
						<TableRow className="bg-muted">
							<TableHead className="w-10" />
							<TableHead className="font-medium text-muted-foreground">
								Name
							</TableHead>
							<TableHead className="font-medium text-muted-foreground">
								Position
							</TableHead>
							<TableHead className="font-medium text-muted-foreground">
								Email
							</TableHead>
							<TableHead className="font-medium text-muted-foreground">
								Bookings
							</TableHead>
							<TableHead className="font-medium text-muted-foreground">
								Joined
							</TableHead>
							<TableHead className="font-medium text-muted-foreground">
								Active
							</TableHead>
							<TableHead className="font-medium text-muted-foreground">
								Featured
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{mentors.length === 0 ? (
							<TableRow>
								<TableCell colSpan={8} className="p-0">
									<EmptyState
										icon={Users}
										title="No mentors match these filters"
										description="Try adjusting the search or filters above."
										className="border-0 bg-transparent"
									/>
								</TableCell>
							</TableRow>
						) : (
							mentors.map((mentor) => (
								<MentorTableRow
									key={mentor.id}
									mentor={mentor}
									currentFeaturedId={currentFeaturedId}
								/>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
