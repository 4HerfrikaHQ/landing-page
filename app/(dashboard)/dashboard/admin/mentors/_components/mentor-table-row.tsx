"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/utils/cn";
import { format } from "date-fns";
import { useState } from "react";
import { AvatarUpload } from "./avatar-upload";
import { EditMentorSheet } from "./edit-mentor-sheet";
import { ToggleActiveButton } from "./toggle-active-button";

type Mentor = {
	id: string;
	name: string;
	position: string | null;
	image: string | null;
	email: string;
	bio: string | null;
	nickname: string | null;
	linkedin_url: string | null;
	active: boolean;
	google_connection_status:
		| "connected"
		| "reauth_required"
		| "revoked"
		| "disconnected"
		| null;
	google_reauthorization_state: "not_required" | "required" | null;
	created_at: Date;
	booking_count: number;
};

function calendarStatus(mentor: Mentor) {
	if (
		mentor.google_connection_status === "connected" &&
		mentor.google_reauthorization_state === "not_required"
	) {
		return {
			label: "Connected",
			className: "border-emerald-200 bg-emerald-50 text-emerald-800",
		};
	}

	if (
		mentor.google_connection_status === "reauth_required" ||
		mentor.google_reauthorization_state === "required"
	) {
		return {
			label: "Reconnect needed",
			className: "border-rose-200 bg-rose-50 text-rose-800",
		};
	}

	return {
		label: "Not connected",
		className: "border-amber-200 bg-amber-50 text-amber-800",
	};
}

export function MentorTableRow({ mentor }: { mentor: Mentor }) {
	const [editIsOpen, setEditIsOpen] = useState(false);
	const googleCalendar = calendarStatus(mentor);

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
				<TableCell>
					<span
						className={cn(
							"inline-flex whitespace-nowrap rounded border px-2 py-0.5 text-xs font-medium",
							googleCalendar.className,
						)}
					>
						{googleCalendar.label}
					</span>
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
