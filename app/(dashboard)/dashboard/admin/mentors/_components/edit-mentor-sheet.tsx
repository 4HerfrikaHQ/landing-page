import { AvailabilityEditor } from "@/components/availability-editor";
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
import { Textarea } from "@/components/ui/textarea";
import { getAvailability } from "@/src/db/actions/availability";
import type { DbAvailability } from "@/src/db/schema/tables";
import { useEffect, useState, useTransition } from "react";
import { updateMentor } from "../_actions";

type Tab = "details" | "availability";

type Mentor = {
	id: string;
	name: string;
	position: string;
	bio: string | null;
	nickname: string | null;
	linkedin_url: string | null;
};

export function EditMentorSheet({
	mentor,
	open,
	onOpenChange,
}: {
	mentor: Mentor;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [tab, setTab] = useState<Tab>("details");
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();
	const [availabilitySlots, setAvailabilitySlots] = useState<DbAvailability[] | null>(null);

	// Load availability lazily on first switch to that tab
	useEffect(() => {
		if (tab === "availability" && availabilitySlots === null) {
			getAvailability(mentor.id).then(setAvailabilitySlots);
		}
	}, [tab, mentor.id, availabilitySlots]);

	// Reset state when sheet closes
	useEffect(() => {
		if (!open) {
			setTab("details");
			setError(null);
			setAvailabilitySlots(null);
		}
	}, [open]);

	function handleSubmit(formData: FormData) {
		setError(null);
		startTransition(async () => {
			const result = await updateMentor(mentor.id, formData);
			if (result.error) {
				setError(result.error);
			} else {
				onOpenChange(false);
			}
		});
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="flex flex-col p-0 max-w-none! w-140!" showCloseButton={false}>
				<SheetHeader className="px-6 pt-6 pb-4 border-b">
					<SheetTitle className="text-base font-semibold text-gray-900">
						Edit mentor
					</SheetTitle>

					{/* Tab toggle */}
					<div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 mt-2 w-fit">
						{(["details", "availability"] as Tab[]).map((t) => (
							<button
								key={t}
								type="button"
								onClick={() => setTab(t)}
								className={`px-3 py-1 text-xs font-medium rounded-md transition-all capitalize ${
									tab === t
										? "bg-white text-gray-900 shadow-sm"
										: "text-gray-500 hover:text-gray-700"
								}`}
							>
								{t}
							</button>
						))}
					</div>
				</SheetHeader>

				{tab === "details" ? (
					<>
						<form
							id="edit-mentor-form"
							action={handleSubmit}
							className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4"
						>
							<Field label="Name" name="name" required defaultValue={mentor.name} />

							<div className="flex items-center gap-3 py-1">
								<div className="h-px flex-1 bg-gray-100" />
								<span className="text-xs text-gray-400">Optional details</span>
								<div className="h-px flex-1 bg-gray-100" />
							</div>

							<Field label="Position" name="position" defaultValue={mentor.position} />
							<Field label="Nickname" name="nickname" defaultValue={mentor.nickname ?? ""} />

							<div className="flex flex-col gap-1.5">
								<label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
									Bio
								</label>
								<Textarea
									name="bio"
									rows={3}
									className="text-sm resize-none"
									placeholder="Short bio…"
									defaultValue={mentor.bio ?? ""}
								/>
							</div>

							<Field
								label="LinkedIn URL"
								name="linkedin_url"
								type="url"
								defaultValue={mentor.linkedin_url ?? ""}
							/>

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
								form="edit-mentor-form"
								variant="solid"
								size="sm"
								disabled={isPending}
							>
								{isPending ? "Saving…" : "Save changes"}
							</Button>
						</SheetFooter>
					</>
				) : (
					<div className="flex-1 overflow-y-auto px-6 py-5">
						{availabilitySlots === null ? (
							<div className="flex items-center justify-center py-12">
								<div className="size-5 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
							</div>
						) : (
							<AvailabilityEditor
								mentorId={mentor.id}
								initialSlots={availabilitySlots}
							/>
						)}
					</div>
				)}
			</SheetContent>
		</Sheet>
	);
}
