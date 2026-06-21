"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { useState, useTransition } from "react";
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
	const [confirmOpen, setConfirmOpen] = useState(false);
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
				setConfirmOpen(false);
			} else {
				setConfirmOpen(false);
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
			<SheetContent
				className="flex flex-col p-0 sm:max-w-md"
				showCloseButton={false}
			>
				<SheetHeader className="border-b px-6 pb-4 pt-6">
					<SheetTitle className="text-base font-semibold text-foreground">
						Edit admin
					</SheetTitle>
				</SheetHeader>

				<form
					id="edit-admin-form"
					action={handleSubmit}
					className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5"
				>
					<Field label="Name" name="name" required defaultValue={admin.name} />

					<div className="flex flex-col gap-1.5">
						<span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							Email
						</span>
						<p className="text-sm text-muted-foreground">{admin.email}</p>
					</div>

					{error && (
						<p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
							{error}
						</p>
					)}
				</form>

				<SheetFooter className="flex-row justify-between gap-2 border-t px-6 py-4">
					<Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
						<Button
							variant="ghost"
							size="sm"
							className="text-destructive hover:bg-destructive/5 hover:text-destructive"
							disabled={isDeleting || isSelf}
							title={isSelf ? "You can't delete your own account" : undefined}
							onClick={() => setConfirmOpen(true)}
						>
							{isDeleting ? "Deleting…" : "Delete"}
						</Button>
						<DialogContent showCloseButton={false}>
							<DialogHeader>
								<DialogTitle>Delete this admin?</DialogTitle>
								<DialogDescription>
									{admin.name} will lose access immediately and their account
									will be removed. This can't be undone.
								</DialogDescription>
							</DialogHeader>
							<DialogFooter>
								<DialogClose render={<Button variant="outline" size="sm" />}>
									Cancel
								</DialogClose>
								<Button
									variant="solid"
									size="sm"
									className="bg-destructive text-white hover:bg-destructive/90"
									disabled={isDeleting}
									onClick={handleDelete}
								>
									{isDeleting ? "Deleting…" : "Delete admin"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
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
