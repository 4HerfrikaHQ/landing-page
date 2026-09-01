"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { updateMyBookingNotice } from "../../_actions";

export function BookingNoticeForm({ initial }: { initial: number }) {
	const [value, setValue] = useState(String(initial));
	const [saving, setSaving] = useState(false);

	async function save() {
		setSaving(true);
		const fd = new FormData();
		fd.set("minLeadHours", value);
		const res = await updateMyBookingNotice(fd);
		setSaving(false);
		if (res.error) {
			toast.error(res.error);
			return;
		}
		toast.success("Booking notice updated.");
	}

	return (
		<div className="rounded-2xl border border-border/60 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
			<h3 className="font-medium text-foreground">Booking notice</h3>
			<p className="mt-1 text-sm text-muted-foreground">
				Mentees can&apos;t book a call within this many hours of the start time.
				The default is 24.
			</p>
			<div className="mt-3 flex items-center gap-2">
				<input
					type="number"
					min={0}
					max={168}
					value={value}
					onChange={(e) => setValue(e.target.value)}
					aria-label="Booking notice in hours"
					className="h-10 w-24 rounded-lg border border-border/60 bg-white px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-primary-500"
				/>
				<span className="text-sm text-muted-foreground">hours</span>
				<Button size="sm" onClick={save} disabled={saving}>
					{saving ? "Saving…" : "Save"}
				</Button>
			</div>
		</div>
	);
}
