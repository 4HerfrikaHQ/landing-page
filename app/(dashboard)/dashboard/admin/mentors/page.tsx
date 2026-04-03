import { currentDbUser } from "@/src/auth";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { unauthorized } from "next/navigation";
import { Suspense } from "react";
import { getMentorsForAdmin } from "./_actions";
import { CreateMentorSheet } from "./_components/create-mentor-sheet";
import { MentorTableRow } from "./_components/mentor-table-row";
import { SearchInput } from "./_components/search-input";
import { StatusFilter } from "./_components/status-filter";

export default async function MentorsPage({
	searchParams,
}: {
	searchParams: Promise<{ q?: string; status?: "active" | "inactive" }>;
}) {
	const user = await currentDbUser();
	if (user.role !== "super_admin") unauthorized();

	const { q, status } = await searchParams;
	const mentors = await getMentorsForAdmin(q, status);

	return (
		<div className="p-8 max-w-5xl mx-auto">
			<div className="mb-6 flex items-center justify-between gap-4">
				<div>
					<h1 className="text-xl font-semibold text-gray-900">Mentors</h1>
					<p className="text-sm text-gray-500 mt-1">{mentors.length} total</p>
				</div>
				<div className="flex items-center gap-2">
					<Suspense>
						<SearchInput />
					</Suspense>
					<CreateMentorSheet />
				</div>
			</div>

			<div className="mb-4">
				<Suspense>
					<StatusFilter />
				</Suspense>
			</div>

			<div className="border rounded-lg overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow className="bg-gray-50">
							<TableHead className="w-10" />
							<TableHead className="font-medium text-gray-600">Name</TableHead>
							<TableHead className="font-medium text-gray-600">Position</TableHead>
							<TableHead className="font-medium text-gray-600">Email</TableHead>
							<TableHead className="font-medium text-gray-600">Joined</TableHead>
							<TableHead className="font-medium text-gray-600">Active</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{mentors.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className="text-center text-gray-400 py-12">
									No mentors yet.
								</TableCell>
							</TableRow>
						) : (
							mentors.map((mentor) => (
								<MentorTableRow key={mentor.id} mentor={mentor} />
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
