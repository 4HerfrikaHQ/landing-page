"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/utils/cn";
import { useQuery } from "@tanstack/react-query";
import { addDays, endOfWeek, format, startOfWeek } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { CalendarX2, ChevronLeft, ChevronRight, Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useAction } from "next-safe-action/hooks";
import { useQueryState } from "nuqs";
import { type ReactNode, useMemo } from "react";
import { listMentorSlots } from "../_actions";
import {
	formatDayParts,
	formatSlotTime,
	formatSlotWhen,
	formatWeekRange,
} from "../_format";
import {
	COMMON_TIMEZONES,
	DAYS_IN_WEEK,
	type PickerStatus,
	SKELETON_SLOT_COUNT,
	SLOTS_STALE_MS,
	pickerStatus,
} from "../_schema";

type Slot = { startUtc: string; endUtc: string };

type WeekAvailability = { slots: Slot[]; bookingUnavailable: boolean };

const NO_AVAILABILITY: WeekAvailability = {
	slots: [],
	bookingUnavailable: false,
};

const DAY_KEY_FORMAT = "yyyy-MM-dd";

const FOCUS_RING =
	"outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-white";

const NAV_BUTTON_CLASS =
	"grid size-11 shrink-0 place-items-center rounded-pill border border-border bg-white transition-colors hover:border-primary hover:text-primary";

function resolveStatus({
	isError,
	isPending,
	availability,
}: {
	isError: boolean;
	isPending: boolean;
	availability: WeekAvailability;
}): PickerStatus {
	if (isError) return pickerStatus.enum.error;
	if (isPending) return pickerStatus.enum.loading;
	if (availability.bookingUnavailable) return pickerStatus.enum.unavailable;
	if (availability.slots.length === 0) return pickerStatus.enum.empty;
	return pickerStatus.enum.ready;
}

export function SlotPicker({
	mentorSlug,
	displayName,
	initialWeekStart,
	selectedStartUtc,
	onSelect,
	canSelectSlots,
}: {
	mentorSlug: string;
	displayName: string;
	initialWeekStart: string | null;
	selectedStartUtc: string | null;
	onSelect: (startUtc: string) => void;
	canSelectSlots: boolean;
}) {
	const t = useTranslations("mentorProfile.slots");
	const locale = useLocale();
	const [weekParam, setWeekParam] = useQueryState("week");
	const [dayParam, setDayParam] = useQueryState("day");
	const [tzParam, setTzParam] = useQueryState("tz");

	const localTz =
		typeof Intl !== "undefined"
			? Intl.DateTimeFormat().resolvedOptions().timeZone
			: "UTC";
	const tz = tzParam ?? localTz;

	const weekStart = useMemo(() => {
		const base = weekParam ?? initialWeekStart;
		return startOfWeek(base ? new Date(base) : new Date(), {
			weekStartsOn: 1,
		});
	}, [weekParam, initialWeekStart]);

	function goToWeek(date: Date) {
		setWeekParam(
			format(startOfWeek(date, { weekStartsOn: 1 }), DAY_KEY_FORMAT),
		);
		setDayParam(null);
	}

	const fromUtc = useMemo(() => weekStart.toISOString(), [weekStart]);
	const toUtc = useMemo(
		() => endOfWeek(weekStart, { weekStartsOn: 1 }).toISOString(),
		[weekStart],
	);

	const { executeAsync } = useAction(listMentorSlots);

	const {
		data: availability = NO_AVAILABILITY,
		isPending,
		isError,
	} = useQuery({
		queryKey: ["slots", mentorSlug, fromUtc, toUtc],
		queryFn: async () => {
			const res = await executeAsync({ mentorSlug, fromUtc, toUtc });
			if (res?.serverError) throw new Error(res.serverError);
			if (!res?.data) throw new Error("Failed to load slots");
			return res.data;
		},
		select: (data): WeekAvailability => ({
			slots: data.slots ?? [],
			bookingUnavailable: data.bookingUnavailable === true,
		}),
		staleTime: SLOTS_STALE_MS,
	});

	const slotsByDay = useMemo(() => {
		const groups = new Map<string, Slot[]>();
		for (const s of availability.slots) {
			const dayKey = formatInTimeZone(new Date(s.startUtc), tz, DAY_KEY_FORMAT);
			let daySlots = groups.get(dayKey);
			if (!daySlots) {
				daySlots = [];
				groups.set(dayKey, daySlots);
			}
			daySlots.push(s);
		}
		return groups;
	}, [availability.slots, tz]);

	const days = useMemo(
		() => Array.from({ length: DAYS_IN_WEEK }, (_, i) => addDays(weekStart, i)),
		[weekStart],
	);
	const dayKeys = days.map((d) => formatInTimeZone(d, tz, DAY_KEY_FORMAT));
	const todayKey = formatInTimeZone(new Date(), tz, DAY_KEY_FORMAT);

	const status = resolveStatus({ isError, isPending, availability });

	const hasSlots = (key: string) => (slotsByDay.get(key)?.length ?? 0) > 0;
	const firstDayWithSlots = dayKeys.find(hasSlots);
	const selectedDayKey =
		dayParam && dayKeys.includes(dayParam) && hasSlots(dayParam)
			? dayParam
			: (firstDayWithSlots ??
				(dayKeys.includes(todayKey) ? todayKey : dayKeys[0]));
	const selectedDay = days[dayKeys.indexOf(selectedDayKey)] ?? days[0];
	const selectedSlots = slotsByDay.get(selectedDayKey) ?? [];

	const tzOptions = Array.from(new Set([tz, ...COMMON_TIMEZONES]));
	const range = formatWeekRange(
		weekStart,
		addDays(weekStart, DAYS_IN_WEEK - 1),
		locale,
	);
	const rangeLabel = t("weekRange", { start: range.start, end: range.end });
	const tzLabel = tz.replace(/_/g, " ");

	return (
		<div className="space-y-4" aria-busy={isPending}>
			<WeekNav
				status={status}
				rangeLabel={rangeLabel}
				onPrevious={() => goToWeek(addDays(weekStart, -DAYS_IN_WEEK))}
				onNext={() => goToWeek(addDays(weekStart, DAYS_IN_WEEK))}
			/>
			<PickerBody
				status={status}
				displayName={displayName}
				rangeLabel={rangeLabel}
				onTryNextWeek={() => goToWeek(addDays(weekStart, DAYS_IN_WEEK))}
			>
				<DayPicker
					days={days}
					dayKeys={dayKeys}
					selectedDayKey={selectedDayKey}
					hasSlots={hasSlots}
					locale={locale}
					tz={tz}
					onSelectDay={(key) => setDayParam(key)}
				/>
				<div>
					<div className="flex flex-wrap items-center justify-between gap-2">
						<SelectedDayHeading
							label={formatDayParts(selectedDay, locale, tz).long}
							isToday={selectedDayKey === todayKey}
						/>
						<Select
							value={tz}
							onValueChange={(v) => v && setTzParam(v as string)}
						>
							<SelectTrigger
								aria-label={t("timezone")}
								className={cn(
									"h-11 w-auto max-w-[11rem] gap-1.5 rounded-full data-[size=default]:h-11 border-border bg-white px-3 text-sm",
									FOCUS_RING,
								)}
							>
								<Globe className="size-4 text-primary" aria-hidden="true" />
								<SelectValue>{tzLabel}</SelectValue>
							</SelectTrigger>
							<SelectContent className="max-h-72 w-56 p-1">
								{tzOptions.map((option) => (
									<SelectItem key={option} value={option} className="py-2">
										{option.replace(/_/g, " ")}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<TimeButtons
						slots={selectedSlots}
						selectedStartUtc={selectedStartUtc}
						canSelectSlots={canSelectSlots}
						locale={locale}
						tz={tz}
						onSelect={onSelect}
					/>
				</div>
			</PickerBody>
			<TimezoneNote status={status} tzLabel={tzLabel} />
		</div>
	);
}

function WeekNav({
	status,
	rangeLabel,
	onPrevious,
	onNext,
}: {
	status: PickerStatus;
	rangeLabel: string;
	onPrevious: () => void;
	onNext: () => void;
}) {
	const t = useTranslations("mentorProfile.slots");
	if (status === pickerStatus.enum.unavailable) return null;

	return (
		<div className="flex items-center justify-between gap-2">
			<button
				type="button"
				aria-label={t("previousWeek")}
				onClick={onPrevious}
				className={cn(NAV_BUTTON_CLASS, FOCUS_RING)}
			>
				<ChevronLeft className="size-4" aria-hidden="true" />
			</button>
			<span
				aria-live="polite"
				className="text-center text-[15px] font-medium leading-tight"
			>
				{rangeLabel}
			</span>
			<button
				type="button"
				aria-label={t("nextWeek")}
				onClick={onNext}
				className={cn(NAV_BUTTON_CLASS, FOCUS_RING)}
			>
				<ChevronRight className="size-4" aria-hidden="true" />
			</button>
		</div>
	);
}

function PickerBody({
	status,
	displayName,
	rangeLabel,
	onTryNextWeek,
	children,
}: {
	status: PickerStatus;
	displayName: string;
	rangeLabel: string;
	onTryNextWeek: () => void;
	children: ReactNode;
}) {
	if (status === pickerStatus.enum.error) return <LoadError />;
	if (status === pickerStatus.enum.loading) return <LoadingSkeleton />;
	if (status === pickerStatus.enum.unavailable) return <Unavailable />;
	if (status === pickerStatus.enum.empty) {
		return (
			<EmptyWeek
				displayName={displayName}
				rangeLabel={rangeLabel}
				onTryNextWeek={onTryNextWeek}
			/>
		);
	}
	return <div className="space-y-4">{children}</div>;
}

function LoadError() {
	const t = useTranslations("mentorProfile.slots");
	return (
		<div
			role="alert"
			className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
		>
			{t("loadError")}
		</div>
	);
}

function LoadingSkeleton() {
	return (
		<div className="space-y-4">
			<div className="grid grid-cols-7 gap-1.5">
				{Array.from({ length: DAYS_IN_WEEK }).map((_, i) => (
					<div
						key={`day-skeleton-${i + 1}`}
						className="h-14 rounded-xl bg-muted motion-safe:animate-pulse"
					/>
				))}
			</div>
			<div className="grid grid-cols-3 gap-2">
				{Array.from({ length: SKELETON_SLOT_COUNT }).map((_, i) => (
					<div
						key={`slot-skeleton-${i + 1}`}
						className="h-11 rounded-xl bg-muted motion-safe:animate-pulse"
					/>
				))}
			</div>
		</div>
	);
}

function Notice({
	title,
	body,
	children,
}: {
	title: string;
	body: string;
	children?: ReactNode;
}) {
	return (
		<div className="flex flex-col items-center rounded-[24px] border border-dashed border-primary/30 bg-surface-pink/60 px-6 py-10 text-center">
			<span className="mb-3 grid size-12 place-items-center rounded-pill bg-surface-pink text-primary">
				<CalendarX2 className="size-6" strokeWidth={1.75} aria-hidden="true" />
			</span>
			<p className="font-semibold">{title}</p>
			<p className="mt-1 text-[15px] text-muted-foreground">{body}</p>
			{children}
		</div>
	);
}

function Unavailable() {
	const t = useTranslations("mentorProfile.slots");
	return <Notice title={t("unavailableTitle")} body={t("unavailableBody")} />;
}

function EmptyWeek({
	displayName,
	rangeLabel,
	onTryNextWeek,
}: {
	displayName: string;
	rangeLabel: string;
	onTryNextWeek: () => void;
}) {
	const t = useTranslations("mentorProfile.slots");
	return (
		<Notice
			title={t("emptyTitle")}
			body={t("emptyBody", { name: displayName, range: rangeLabel })}
		>
			<button
				type="button"
				onClick={onTryNextWeek}
				className={cn(
					"mt-4 inline-flex min-h-12 items-center justify-center gap-1 rounded-pill bg-primary px-6 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary-700",
					FOCUS_RING,
				)}
			>
				{t("tryNextWeek")}
				<ChevronRight className="size-4" aria-hidden="true" />
			</button>
		</Notice>
	);
}

function DayPicker({
	days,
	dayKeys,
	selectedDayKey,
	hasSlots,
	locale,
	tz,
	onSelectDay,
}: {
	days: Date[];
	dayKeys: string[];
	selectedDayKey: string;
	hasSlots: (key: string) => boolean;
	locale: string;
	tz: string;
	onSelectDay: (key: string) => void;
}) {
	const t = useTranslations("mentorProfile.slots");
	return (
		<fieldset className="grid min-w-0 grid-cols-7 gap-1.5 border-0 p-0">
			<legend className="sr-only">{t("pickDay")}</legend>
			{days.map((day, i) => {
				const dayKey = dayKeys[i];
				const dayHasSlots = hasSlots(dayKey);
				const isSelected = dayKey === selectedDayKey;
				const parts = formatDayParts(day, locale, tz);
				const buttonClass = isSelected
					? "border-primary bg-primary text-white shadow-[0_4px_14px_rgba(200,0,122,0.25)]"
					: dayHasSlots
						? "border-border bg-white hover:border-primary hover:bg-surface-pink"
						: "cursor-not-allowed border-border/60 bg-muted text-[#6b6d85]";
				const weekdayClass =
					!isSelected && dayHasSlots ? "text-muted-foreground" : undefined;
				return (
					<button
						key={dayKey}
						type="button"
						disabled={!dayHasSlots}
						aria-pressed={isSelected}
						aria-label={parts.long}
						onClick={() => onSelectDay(dayKey)}
						className={cn(
							"flex min-h-14 min-w-0 flex-col items-center justify-center rounded-xl border px-0.5 py-2 text-center transition-colors",
							FOCUS_RING,
							buttonClass,
						)}
					>
						<span
							className={cn("max-w-full truncate text-[11px]", weekdayClass)}
						>
							{parts.weekday}
						</span>
						<span className="font-semibold">{parts.day}</span>
					</button>
				);
			})}
		</fieldset>
	);
}

function SelectedDayHeading({
	label,
	isToday,
}: {
	label: string;
	isToday: boolean;
}) {
	const t = useTranslations("mentorProfile.slots");
	return (
		<p className="text-[15px] font-medium">
			{label}
			<TodayMark isToday={isToday} label={t("today")} />
		</p>
	);
}

function TodayMark({ isToday, label }: { isToday: boolean; label: string }) {
	if (!isToday) return null;
	return (
		<span className="ml-1.5 text-xs font-normal text-primary">· {label}</span>
	);
}

function TimeButtons({
	slots,
	selectedStartUtc,
	canSelectSlots,
	locale,
	tz,
	onSelect,
}: {
	slots: Slot[];
	selectedStartUtc: string | null;
	canSelectSlots: boolean;
	locale: string;
	tz: string;
	onSelect: (startUtc: string) => void;
}) {
	const t = useTranslations("mentorProfile.slots");
	if (slots.length === 0) {
		return (
			<p className="mt-3 rounded-xl border border-dashed border-border bg-white px-4 py-6 text-center text-sm text-muted-foreground">
				{t("noTimesDay")}
			</p>
		);
	}

	return (
		<div className="mt-3 grid grid-cols-3 gap-2">
			{slots.map((s) => {
				const isSelected = s.startUtc === selectedStartUtc;
				const stateClass = isSelected
					? "border-primary bg-primary text-white shadow-[0_4px_14px_rgba(200,0,122,0.3)]"
					: canSelectSlots
						? "border-border bg-white hover:border-primary hover:bg-surface-pink hover:text-primary"
						: "border-border bg-white";
				return (
					<button
						key={s.startUtc}
						type="button"
						disabled={!canSelectSlots}
						aria-pressed={isSelected}
						aria-label={formatSlotWhen(s.startUtc, locale, tz)}
						onClick={() => onSelect(s.startUtc)}
						className={cn(
							"h-11 rounded-xl border text-[15px] font-medium transition-all disabled:cursor-default motion-safe:active:scale-[0.97]",
							FOCUS_RING,
							stateClass,
						)}
					>
						{formatSlotTime(s.startUtc, locale, tz)}
					</button>
				);
			})}
		</div>
	);
}

function TimezoneNote({
	status,
	tzLabel,
}: {
	status: PickerStatus;
	tzLabel: string;
}) {
	const t = useTranslations("mentorProfile.slots");
	if (status === pickerStatus.enum.unavailable) return null;
	return (
		<p className="flex items-center gap-1.5 text-sm text-muted-foreground">
			<Globe className="size-4 shrink-0" aria-hidden="true" />
			{t("allTimesIn", { timezone: tzLabel })}
		</p>
	);
}
