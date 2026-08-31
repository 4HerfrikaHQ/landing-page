"use client";

import { EmptyState } from "@/components/dashboard/empty-state";
import { SearchInput } from "@/components/dashboard/filter-bar";
import { HoverCard, StaggerContainer, StaggerItem } from "@/components/motion";
import { Button } from "@/components/ui/button";
import type { DbMentorWithAvailability } from "@/src/db/schema/tables";
import { cn } from "@/utils/cn";
import { SearchX } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import { filterMentors } from "../_utils/mentor-directory-filters";
import { MentorCard } from "./mentor-modal";

export function MentorDirectory({
	mentors,
	searchPlaceholder,
	availableLabel,
}: {
	mentors: DbMentorWithAvailability[];
	searchPlaceholder: string;
	availableLabel: string;
}) {
	const [q, setQ] = useQueryState(
		"q",
		parseAsString.withDefault("").withOptions({ shallow: true }),
	);
	const [available, setAvailable] = useQueryState("available", {
		defaultValue: "",
	});
	const [hasInteracted, setHasInteracted] = useState(false);
	const onlyAvailable = available === "1";

	const filtered = useMemo(
		() => filterMentors(mentors, q, onlyAvailable),
		[mentors, q, onlyAvailable],
	);

	function clearFilters() {
		setHasInteracted(true);
		void setQ(null);
		void setAvailable(null);
	}

	return (
		<>
			<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
				<SearchInput
					placeholder={searchPlaceholder}
					value={q}
					onValueChange={(value) => {
						setHasInteracted(true);
						void setQ(value || null);
					}}
					shallow
				/>
				<button
					type="button"
					onClick={() => {
						setHasInteracted(true);
						void setAvailable(onlyAvailable ? null : "1");
					}}
					className={cn(
						"inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer",
						onlyAvailable
							? "bg-primary-500 text-white"
							: "bg-white border border-[#E0E0E0] text-[#636363] hover:border-primary-500 hover:text-primary-500",
					)}
				>
					{availableLabel}
				</button>
			</div>

			{filtered.length > 0 ? (
				<StaggerContainer className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
					{filtered.map((mentor) => (
						<StaggerItem key={mentor.id} immediate={hasInteracted}>
							<HoverCard>
								<MentorCard mentor={mentor} />
							</HoverCard>
						</StaggerItem>
					))}
				</StaggerContainer>
			) : (
				<div className="mt-8">
					<EmptyState
						icon={SearchX}
						title="No mentors match that filter yet"
						description="Try a different name or role, or clear the filters to see everyone."
						action={
							<Button variant="outline" size="sm" onClick={clearFilters}>
								Clear filters
							</Button>
						}
					/>
				</div>
			)}
		</>
	);
}
