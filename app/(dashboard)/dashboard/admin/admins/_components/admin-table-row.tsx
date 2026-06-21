"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { useState } from "react";
import { EditAdminSheet } from "./edit-admin-sheet";

type Admin = {
	id: string;
	name: string;
	email: string;
	created_at: Date;
};

export function AdminTableRow({
	admin,
	currentUserId,
}: {
	admin: Admin;
	currentUserId: string;
}) {
	const [editIsOpen, setEditIsOpen] = useState(false);

	return (
		<>
			<TableRow onClick={() => setEditIsOpen(true)} className="cursor-pointer">
				<TableCell className="font-medium text-foreground">
					{admin.name}
				</TableCell>
				<TableCell className="text-muted-foreground">{admin.email}</TableCell>
				<TableCell className="text-sm text-muted-foreground">
					{format(admin.created_at, "MMM d, yyyy")}
				</TableCell>
			</TableRow>

			<EditAdminSheet
				admin={admin}
				currentUserId={currentUserId}
				open={editIsOpen}
				onOpenChange={setEditIsOpen}
			/>
		</>
	);
}
