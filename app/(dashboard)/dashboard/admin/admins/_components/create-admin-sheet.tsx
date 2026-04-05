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
	SheetTrigger,
} from "@/components/ui/sheet";
import { PlusIcon } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { createAdmin } from "../_actions";

export function CreateAdminSheet() {
	const [open, setOpen] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();
	const formRef = useRef<HTMLFormElement>(null);

	function handleSubmit(formData: FormData) {
		setError(null);
		startTransition(async () => {
			const result = await createAdmin(formData);
			if (result.error) {
				setError(result.error);
			} else {
				setOpen(false);
				formRef.current?.reset();
			}
		});
	}

	return (
		<Sheet
			open={open}
			onOpenChange={(o) => {
				setOpen(o);
				if (!o) setError(null);
			}}
		>
			<SheetTrigger
				render={<Button variant="solid" size="sm" className="gap-1.5" />}
			>
				<PlusIcon className="size-3.5" />
				Add admin
			</SheetTrigger>

			<SheetContent className="flex flex-col sm:max-w-md p-0" showCloseButton={false}>
				<SheetHeader className="px-6 pt-6 pb-4 border-b">
					<SheetTitle className="text-base font-semibold text-gray-900">
						Add admin
					</SheetTitle>
				</SheetHeader>

				<form
					id="create-admin-form"
					ref={formRef}
					action={handleSubmit}
					className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4"
				>
					<Field label="Name" name="name" required />
					<Field label="Email" name="email" type="email" required />

					{error && (
						<p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-md px-3 py-2">
							{error}
						</p>
					)}
				</form>

				<SheetFooter className="px-6 py-4 border-t flex-row justify-end gap-2">
					<SheetClose render={<Button variant="ghost" size="sm" />}>
						Cancel
					</SheetClose>
					<Button
						type="submit"
						form="create-admin-form"
						variant="solid"
						size="sm"
						disabled={isPending}
					>
						{isPending ? "Adding…" : "Add admin"}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
