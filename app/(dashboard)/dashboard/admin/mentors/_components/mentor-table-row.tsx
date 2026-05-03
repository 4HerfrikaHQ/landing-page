"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { useState } from "react";
import { AvatarUpload } from "./avatar-upload";
import { EditMentorSheet } from "./edit-mentor-sheet";
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
};

export function MentorTableRow({ mentor }: { mentor: Mentor }) {
	const [editIsOpen, setEditIsOpen] = useState(false);

	return (
		<>
			<TableRow
				onClick={() => setEditIsOpen(true)}
				className="cursor-pointer"
			>
				<TableCell className="w-10" onClick={(e) => e.stopPropagation()}>
					<AvatarUpload id={mentor.id} name={mentor.name} image={mentor.image} />
				</TableCell>
				<TableCell className="font-medium text-gray-900">{mentor.name}</TableCell>
				<TableCell className="text-gray-600 capitalize">{mentor.position}</TableCell>
				<TableCell className="text-gray-600">{mentor.email}</TableCell>
				<TableCell className="text-gray-400 text-sm">
					{format(mentor.created_at, "MMM d, yyyy")}
				</TableCell>
				<TableCell onClick={(e) => e.stopPropagation()}>
					<ToggleActiveButton id={mentor.id} active={mentor.active} />
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
