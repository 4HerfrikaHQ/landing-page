"use client";

import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { trackEvent } from "@/src/lib/analytics";
import type { MentorImageCrop } from "@/src/lib/mentor-image";
import { cn } from "@/utils/cn";
import { X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { formatSlotWhen } from "../_format";
import { BookingConfirmation } from "./booking-confirmation";
import { BookingForm } from "./booking-form";
import { SlotPicker } from "./slot-picker";

const DESKTOP_QUERY = "(min-width: 1024px)";

function subscribeToDesktop(onChange: () => void) {
	const query = window.matchMedia(DESKTOP_QUERY);
	query.addEventListener("change", onChange);
	return () => query.removeEventListener("change", onChange);
}

function useIsDesktop() {
	return useSyncExternalStore(
		subscribeToDesktop,
		() => window.matchMedia(DESKTOP_QUERY).matches,
		() => false,
	);
}

type Confirmation = { whenLabel: string; email: string };

type BookingView =
	| { status: "browsing" }
	| { status: "form"; slot: string }
	| ({ status: "confirmed" } & Confirmation);

export function BookingSection({
	mentorSlug,
	mentorName,
	displayName,
	mentorImage,
	mentorImageCrop,
	initialWeekStart,
	readOnly = false,
}: {
	mentorSlug: string;
	mentorName: string;
	displayName: string;
	mentorImage: string | null;
	mentorImageCrop: MentorImageCrop | null;
	initialWeekStart: string | null;
	readOnly?: boolean;
}) {
	const t = useTranslations("mentorProfile");
	const locale = useLocale();
	const isDesktop = useIsDesktop();
	const [selected, setSelected] = useQueryState("slot");
	const [tzParam] = useQueryState("tz");
	const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
	const viewedRef = useRef(false);

	useEffect(() => {
		if (viewedRef.current) return;
		viewedRef.current = true;
		trackEvent("mentor_booking_page_viewed", {
			mentor_slug: mentorSlug,
			mentor_name: mentorName,
		});
	}, [mentorName, mentorSlug]);

	const localTz =
		typeof Intl !== "undefined"
			? Intl.DateTimeFormat().resolvedOptions().timeZone
			: "UTC";
	const tz = tzParam ?? localTz;

	const view: BookingView = confirmation
		? { status: "confirmed", ...confirmation }
		: selected && !readOnly
			? { status: "form", slot: selected }
			: { status: "browsing" };

	function closeSheet() {
		setConfirmation(null);
		void setSelected(null);
	}

	return (
		<>
			<SlotPicker
				mentorSlug={mentorSlug}
				displayName={displayName}
				initialWeekStart={initialWeekStart}
				selectedStartUtc={selected}
				canSelectSlots={!readOnly}
				onSelect={(s) => {
					if (readOnly) return;
					trackEvent("booking_slot_selected", { mentor_slug: mentorSlug });
					void setSelected(s);
				}}
			/>
			{readOnly && (
				<p className="mt-4 text-sm leading-6 text-muted-foreground">
					{t("booking.previewOnly")}
				</p>
			)}
			<Sheet
				open={view.status !== "browsing"}
				onOpenChange={(open) => {
					if (!open) closeSheet();
				}}
			>
				<SheetContent
					side={isDesktop ? "right" : "bottom"}
					showCloseButton={false}
					overlayClassName="bg-secondary/40 supports-backdrop-filter:backdrop-blur-none"
					initialFocus={() =>
						document.querySelector<HTMLElement>('input[name="mentee_name"]')
					}
					className={cn(
						"gap-0 overflow-hidden p-0 motion-reduce:transition-none",
						"data-[side=bottom]:max-h-[92dvh] data-[side=bottom]:rounded-t-[32px] data-[side=bottom]:sm:mx-auto data-[side=bottom]:sm:max-w-xl",
						"data-[side=right]:w-full! data-[side=right]:rounded-l-[40px] data-[side=right]:sm:max-w-[600px]!",
					)}
				>
					<div
						aria-hidden="true"
						className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-pill bg-border lg:hidden"
					/>
					<SheetHeader className="flex-row items-center justify-between gap-3 px-4 pb-3 pt-4 sm:px-6">
						<SheetTitle
							className={cn(
								"text-xl font-semibold",
								view.status === "confirmed" && "sr-only",
							)}
						>
							{t("booking.sheetTitle", { name: displayName })}
						</SheetTitle>
						<SheetClose
							aria-label={t("booking.close")}
							className="ml-auto grid size-11 shrink-0 place-items-center rounded-pill bg-surface-pink text-foreground outline-none transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring"
						>
							<X className="size-5" aria-hidden="true" />
						</SheetClose>
					</SheetHeader>
					{view.status === "form" && (
						<BookingForm
							mentorSlug={mentorSlug}
							displayName={displayName}
							mentorImage={mentorImage}
							mentorImageCrop={mentorImageCrop}
							whenLabel={formatSlotWhen(view.slot, locale, tz)}
							startAtUtc={view.slot}
							menteeTimezone={tz}
							onChangeTime={() => void setSelected(null)}
							onSuccess={(email) => {
								setConfirmation({
									whenLabel: formatSlotWhen(view.slot, locale, tz),
									email,
								});
								void setSelected(null);
							}}
						/>
					)}
					{view.status === "confirmed" && (
						<BookingConfirmation
							displayName={displayName}
							whenLabel={view.whenLabel}
							email={view.email}
						/>
					)}
				</SheetContent>
			</Sheet>
		</>
	);
}
