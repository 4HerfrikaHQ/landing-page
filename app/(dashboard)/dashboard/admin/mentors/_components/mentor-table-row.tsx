"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { useState } from "react";
import { AvatarUpload } from "./avatar-upload";
import { EditMentorSheet } from "./edit-mentor-sheet";
import { FeatureMentorButton } from "./feature-mentor-button";
import { ToggleActiveButton } from "./toggle-active-button";

type Mentor = {
	id: string;
	name: string;
	position: string;
	image: string | null;
	email: string;
	bio: string | null;
	nickname: string | null;
	linkedin_url: string | null;
	active: boolean;
	created_at: Date;
	booking_count: number;
};

export function MentorTableRow({
	mentor,
	currentFeaturedId,
}: {
	mentor: Mentor;
	currentFeaturedId: string | null;
}) {
	const [editIsOpen, setEditIsOpen] = useState(false);
	const eligibleToFeature = mentor.active && !!mentor.image;

	return (
		<>
			<TableRow onClick={() => setEditIsOpen(true)} className="cursor-pointer">
				<TableCell className="w-10" onClick={(e) => e.stopPropagation()}>
					<AvatarUpload
						id={mentor.id}
						name={mentor.name}
						image={mentor.image}
					/>
				</TableCell>
				<TableCell className="font-medium text-foreground">
					{mentor.name}
					{mentor.nickname ? (
						<span className="block text-xs font-normal text-muted-foreground">
							“{mentor.nickname}”
						</span>
					) : null}
				</TableCell>
				<TableCell className="capitalize text-muted-foreground">
					{mentor.position}
				</TableCell>
				<TableCell className="text-muted-foreground">{mentor.email}</TableCell>
				<TableCell className="text-sm tabular-nums text-muted-foreground">
					{Number(mentor.booking_count)}
				</TableCell>
				<TableCell className="text-sm text-muted-foreground">
					{format(mentor.created_at, "MMM d, yyyy")}
				</TableCell>
				<TableCell onClick={(e) => e.stopPropagation()}>
					<ToggleActiveButton id={mentor.id} active={mentor.active} />
				</TableCell>
				<TableCell onClick={(e) => e.stopPropagation()}>
					<FeatureMentorButton
						id={mentor.id}
						isFeatured={currentFeaturedId === mentor.id}
						eligible={eligibleToFeature}
					/>
				</TableCell>
			</TableRow>

			<EditMentorSheet
				mentor={mentor}
				open={editIsOpen}
				onOpenChange={setEditIsOpen}
			/>
		</>
	);
}
