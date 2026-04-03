"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { PlusIcon } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { createMentor } from "../_actions";

function Field({
	label,
	name,
	type = "text",
	required,
}: {
	label: string;
	name: string;
	type?: string;
	required?: boolean;
}) {
	return (
		<div className="flex flex-col gap-1.5">
			<label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
				{label}
				{required && <span className="text-red-400 ml-0.5">*</span>}
			</label>
			<Input name={name} type={type} required={required} className="h-9 text-sm" />
		</div>
	);
}

export function CreateMentorSheet() {
	const [open, setOpen] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();
	const formRef = useRef<HTMLFormElement>(null);

	function handleSubmit(formData: FormData) {
		setError(null);
		startTransition(async () => {
			const result = await createMentor(formData);
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
				Add mentor
			</SheetTrigger>

			<SheetContent className="flex flex-col sm:max-w-md p-0" showCloseButton={false}>
				<SheetHeader className="px-6 pt-6 pb-4 border-b">
					<SheetTitle className="text-base font-semibold text-gray-900">
						Add mentor
					</SheetTitle>
				</SheetHeader>

				<form
					id="create-mentor-form"
					ref={formRef}
					action={handleSubmit}
					className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4"
				>
					<Field label="Name" name="name" required />
					<Field label="Email" name="email" type="email" required />

					<div className="flex items-center gap-3 py-1">
						<div className="h-px flex-1 bg-gray-100" />
						<span className="text-xs text-gray-400">Optional details</span>
						<div className="h-px flex-1 bg-gray-100" />
					</div>

					<Field label="Position" name="position" />
					<Field label="Nickname" name="nickname" />

					<div className="flex flex-col gap-1.5">
						<label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
							Bio
						</label>
						<Textarea
							name="bio"
							rows={3}
							className="text-sm resize-none"
							placeholder="Short bio…"
						/>
					</div>

					<Field label="LinkedIn URL" name="linkedin_url" type="url" />

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
						form="create-mentor-form"
						variant="solid"
						size="sm"
						disabled={isPending}
					>
						{isPending ? "Adding…" : "Add mentor"}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
