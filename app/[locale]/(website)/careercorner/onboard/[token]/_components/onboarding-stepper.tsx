"use client";

import { AvailabilityEditor } from "@/components/availability-editor";
import type { AvailabilitySlotInput } from "@/src/db/actions/availability";
import type { DbAvailability } from "@/src/db/schema/tables";
import { cn } from "@/utils/cn";
import {
	CalendarClockIcon,
	CalendarDaysIcon,
	CheckIcon,
	UserRoundIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsBoolean, parseAsStringEnum, useQueryState } from "nuqs";
import type { ComponentProps, ReactNode } from "react";
import { type OnboardingStep, onboardingStep } from "../_schema";
import { OnboardingForm } from "./onboarding-form";

const steps: { id: OnboardingStep; icon: typeof CalendarClockIcon }[] = [
	{ id: "availability", icon: CalendarClockIcon },
	{ id: "profile", icon: UserRoundIcon },
	{ id: "calendar", icon: CalendarDaysIcon },
];

export function OnboardingStepper({
	availability,
	profile,
	calendarSlot,
	calendarConnected,
	availabilityComplete,
	profileComplete,
}: {
	availability: {
		mentorId: string;
		initialSlots: DbAvailability[];
		saveAvailabilityAction: (
			mentorId: string,
			slots: AvailabilitySlotInput[],
			timezone: string,
		) => Promise<{ error?: string }>;
	};
	profile: {
		token: string;
		defaultBio: string;
		defaultDisplayName: string;
		defaultImage: string;
	};
	calendarSlot: ReactNode;
	calendarConnected: boolean;
	availabilityComplete: boolean;
	profileComplete: boolean;
}) {
	const t = useTranslations("onboarding");
	const [active, setActive] = useQueryState(
		"step",
		parseAsStringEnum(onboardingStep.options).withDefault(
			onboardingStep.def.entries.availability,
		),
	);
	const [availabilityDone, setAvailabilityDone] = useQueryState(
		"ready",
		parseAsBoolean.withDefault(false),
	);
	const [profileDone, setProfileDone] = useQueryState(
		"profile",
		parseAsBoolean.withDefault(false),
	);
	const availabilityReady = availabilityComplete || availabilityDone;
	const profileReady = profileComplete || profileDone;
	const visibleActive =
		active === "profile" && !availabilityReady
			? "availability"
			: active === "calendar" && (!availabilityReady || !profileReady)
				? availabilityReady
					? "profile"
					: "availability"
				: active;

	return (
		<div>
			<nav aria-label={t("stepsLabel")} className="mb-8">
				<ol className="grid grid-cols-3 gap-2 sm:gap-3">
					{steps.map((step, index) => {
						const isActive = visibleActive === step.id;
						const isDone =
							(step.id === "availability" && availabilityReady) ||
							(step.id === "profile" && profileReady) ||
							(step.id === "calendar" && calendarConnected);
						const canVisit =
							step.id === "availability" ||
							(step.id === "profile" && availabilityReady) ||
							(step.id === "calendar" && availabilityReady && profileReady);
						const Icon = isDone ? CheckIcon : step.icon;
						return (
							<li key={step.id}>
								<button
									type="button"
									disabled={!canVisit}
									aria-current={isActive ? "step" : undefined}
									onClick={() => canVisit && setActive(step.id)}
									className={cn(
										"flex min-h-20 w-full flex-col items-center gap-2 rounded-2xl border px-2 py-3 text-center transition-[background-color,border-color,box-shadow] duration-200 focus-visible:ring-3 focus-visible:ring-primary-500/40 focus-visible:outline-none motion-reduce:transition-none sm:flex-row sm:gap-3 sm:px-4 sm:text-left",
										isActive
											? "border-primary-500 bg-surface-pink"
											: "border-border bg-white",
										canVisit && !isActive && "hover:border-primary-500/50",
										!canVisit && "cursor-not-allowed opacity-60",
									)}
								>
									<span
										className={cn(
											"flex size-9 shrink-0 items-center justify-center rounded-full",
											isActive
												? "bg-primary-500 text-white"
												: isDone
													? "bg-surface-pink text-primary-500"
													: "bg-muted text-muted-foreground",
										)}
									>
										<Icon className="size-4" strokeWidth={2} />
									</span>
									<span className="min-w-0">
										<span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
											{t("step", { number: index + 1 })}
										</span>
										<span
											className={cn(
												"block text-[13px] leading-tight font-semibold sm:text-sm",
												isActive
													? "text-secondary-500"
													: "text-muted-foreground",
											)}
										>
											{t(`steps.${step.id}`)}
										</span>
									</span>
								</button>
							</li>
						);
					})}
				</ol>
			</nav>

			<StepPanel
				step={visibleActive}
				availability={availability}
				profile={profile}
				calendarSlot={calendarSlot}
				onAvailabilitySaved={() => {
					setAvailabilityDone(true);
					setActive("profile");
				}}
				onProfileSaved={() => {
					setProfileDone(true);
					setActive("calendar");
				}}
			/>
		</div>
	);
}

function StepHeader({
	title,
	description,
}: {
	title: string;
	description: string;
}) {
	return (
		<div className="space-y-2">
			<h2 className="text-2xl font-bold leading-tight text-secondary-500">
				{title}
			</h2>
			<p className="text-[15px] leading-relaxed text-muted-foreground">
				{description}
			</p>
		</div>
	);
}

type StepPanelProps = {
	step: OnboardingStep;
	availability: ComponentProps<typeof OnboardingStepper>["availability"];
	profile: ComponentProps<typeof OnboardingStepper>["profile"];
	calendarSlot: ReactNode;
	onAvailabilitySaved: () => void;
	onProfileSaved: () => void;
};

function StepPanel({
	step,
	availability,
	profile,
	calendarSlot,
	onAvailabilitySaved,
	onProfileSaved,
}: StepPanelProps) {
	const t = useTranslations("onboarding");

	if (step === "availability") {
		return (
			<div className="space-y-6">
				<StepHeader
					title={t("availabilityStep.title")}
					description={t("availabilityStep.description")}
				/>
				<AvailabilityEditor
					mentorId={availability.mentorId}
					initialSlots={availability.initialSlots}
					onSave={availability.saveAvailabilityAction}
					requireAtLeastOneSlot
					saveLabel={t("availabilityStep.save")}
					onSaved={onAvailabilitySaved}
				/>
			</div>
		);
	}

	if (step === "profile") {
		return (
			<div className="space-y-6">
				<StepHeader
					title={t("profileStep.title")}
					description={t("profileStep.description")}
				/>
				<OnboardingForm {...profile} onSaved={onProfileSaved} />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<StepHeader
				title={t("calendarStep.title")}
				description={t("calendarStep.description")}
			/>
			{calendarSlot}
		</div>
	);
}
