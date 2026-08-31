"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/utils/cn";
import { format } from "date-fns";
import {
	CalendarCheck2,
	CalendarOff,
	CalendarSync,
	CalendarX2,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { requestMentorCalendarConnection } from "../_actions";
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
			icon: CalendarCheck2,
			className: "text-emerald-600",
		};
	}

	if (mentor.google_connection_status === "revoked") {
		return {
			label: "Disconnected",
			icon: CalendarX2,
			className: "text-slate-500",
		};
	}

	if (
		mentor.google_connection_status === "reauth_required" ||
		mentor.google_reauthorization_state === "required"
	) {
		return {
			label: "Reconnect needed",
			icon: CalendarSync,
			className: "text-rose-600",
		};
	}

	return {
		label: "Not connected",
		icon: CalendarOff,
		className: "text-amber-600",
	};
}

export function MentorTableRow({ mentor }: { mentor: Mentor }) {
	const [editIsOpen, setEditIsOpen] = useState(false);
	const [isSending, startSending] = useTransition();
	const googleCalendar = calendarStatus(mentor);
	const CalendarIcon = googleCalendar.icon;
	const isConnected = googleCalendar.label === "Connected";
	const firstName = mentor.name.split(" ")[0];

	// An admin can't complete the OAuth on a mentor's behalf — Google's consent
	// screen needs the mentor's own account — so the action here is a nudge.
	function sendConnectRequest() {
		startSending(async () => {
			const result = await requestMentorCalendarConnection(mentor.id);
			if (result.error) toast.error(result.error);
			else toast.success(`Connection link sent to ${result.sentTo}`);
		});
	}

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
				<TableCell
					className="w-16 text-center"
					onClick={(e) => e.stopPropagation()}
				>
					<Tooltip>
						<TooltipTrigger
							render={
								isConnected ? (
									<span
										aria-label={`Google Calendar: ${googleCalendar.label}`}
										className={cn(
											"inline-flex size-8 items-center justify-center rounded-full bg-muted/70",
											googleCalendar.className,
										)}
									/>
								) : (
									<button
										type="button"
										disabled={isSending}
										onClick={sendConnectRequest}
										aria-label={`Google Calendar: ${googleCalendar.label}. Email ${firstName} a connection link.`}
										className={cn(
											"inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-muted/70 transition-colors hover:bg-muted disabled:opacity-50",
											googleCalendar.className,
										)}
									/>
								)
							}
						>
							<CalendarIcon className="size-4" aria-hidden />
						</TooltipTrigger>
						<TooltipContent>
							Google Calendar: {googleCalendar.label}
							{isConnected ? null : (
								<span className="mt-1 block text-xs opacity-80">
									Only {firstName} can connect it — Google needs their own
									account. Click to email them the link.
								</span>
							)}
						</TooltipContent>
					</Tooltip>
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
