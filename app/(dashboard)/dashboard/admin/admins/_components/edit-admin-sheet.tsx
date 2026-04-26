"use client";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { useTransition, useState } from "react";
import { deleteAdmin, updateAdmin } from "../_actions";

type Admin = {
	id: string;
	name: string;
	email: string;
};

export function EditAdminSheet({
	admin,
	currentUserId,
	open,
	onOpenChange,
}: {
	admin: Admin;
	currentUserId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();
	const [isDeleting, startDeleteTransition] = useTransition();

	function handleSubmit(formData: FormData) {
		setError(null);
		startTransition(async () => {
			const result = await updateAdmin(admin.id, formData);
			if (result.error) {
				setError(result.error);
			} else {
				onOpenChange(false);
			}
		});
	}

	function handleDelete() {
		setError(null);
		startDeleteTransition(async () => {
			const result = await deleteAdmin(admin.id);
			if (result.error) {
				setError(result.error);
			} else {
				onOpenChange(false);
			}
		});
	}

	const isSelf = admin.id === currentUserId;

	return (
		<Sheet
			open={open}
			onOpenChange={(o) => {
				onOpenChange(o);
				if (!o) setError(null);
			}}
		>
			<SheetContent className="flex flex-col sm:max-w-md p-0" showCloseButton={false}>
				<SheetHeader className="px-6 pt-6 pb-4 border-b">
					<SheetTitle className="text-base font-semibold text-gray-900">
						Edit admin
					</SheetTitle>
				</SheetHeader>

				<form
					id="edit-admin-form"
					action={handleSubmit}
					className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4"
				>
					<Field label="Name" name="name" required defaultValue={admin.name} />

					<div className="flex flex-col gap-1.5">
						<label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
							Email
						</label>
						<p className="text-sm text-gray-400">{admin.email}</p>
					</div>

					{error && (
						<p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-md px-3 py-2">
							{error}
						</p>
					)}
				</form>

				<SheetFooter className="px-6 py-4 border-t flex-row justify-between gap-2">
					<Button
						variant="ghost"
						size="sm"
						className="text-red-500 hover:text-red-600 hover:bg-red-50"
						disabled={isDeleting || isSelf}
						title={isSelf ? "You can't delete your own account" : undefined}
						onClick={handleDelete}
					>
						{isDeleting ? "Deleting…" : "Delete"}
					</Button>
					<div className="flex gap-2">
						<SheetClose render={<Button variant="ghost" size="sm" />}>
							Cancel
						</SheetClose>
						<Button
							type="submit"
							form="edit-admin-form"
							variant="solid"
							size="sm"
							disabled={isPending}
						>
							{isPending ? "Saving…" : "Save changes"}
						</Button>
					</div>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
