import { currentDbUser } from "@/src/auth";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { unauthorized } from "next/navigation";
import { Suspense } from "react";
import { getMentorsForAdmin } from "./_actions";
import { CreateMentorSheet } from "./_components/create-mentor-sheet";
import { SearchInput } from "./_components/search-input";
import { StatusFilter } from "./_components/status-filter";
import { ToggleActiveButton } from "./_components/toggle-active-button";

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
								<TableCell colSpan={5} className="text-center text-gray-400 py-12">
									No mentors yet.
								</TableCell>
							</TableRow>
						) : (
							mentors.map((mentor) => (
								<TableRow key={mentor.id}>
									<TableCell className="font-medium text-gray-900">
										{mentor.name}
									</TableCell>
									<TableCell className="text-gray-600 capitalize">
										{mentor.position}
									</TableCell>
									<TableCell className="text-gray-600">{mentor.email}</TableCell>
									<TableCell className="text-gray-400 text-sm">
										{format(mentor.created_at, "MMM d, yyyy")}
									</TableCell>
									<TableCell>
										<ToggleActiveButton id={mentor.id} active={mentor.active} />
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
