"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import {
	CalendarClockIcon,
	CalendarDaysIcon,
	CheckIcon,
	UserRoundIcon,
} from "lucide-react";
import { parseAsBoolean, parseAsStringLiteral, useQueryState } from "nuqs";
import type { ReactNode } from "react";

type StepId = "availability" | "profile" | "calendar";

const steps: { id: StepId; label: string; icon: typeof CalendarClockIcon }[] = [
	{ id: "availability", label: "Availability", icon: CalendarClockIcon },
	{ id: "profile", label: "Profile", icon: UserRoundIcon },
	{ id: "calendar", label: "Google Calendar", icon: CalendarDaysIcon },
];

export function OnboardingStepper({
	availabilitySlot,
	profileSlot,
	calendarSlot,
	calendarConnected,
	availabilityComplete,
	profileComplete,
}: {
	availabilitySlot: ReactNode;
	profileSlot: (onSaved: () => void) => ReactNode;
	calendarSlot: ReactNode;
	calendarConnected: boolean;
	availabilityComplete: boolean;
	profileComplete: boolean;
}) {
	// Step state lives in the URL so it survives refresh and is shareable.
	const [active, setActive] = useQueryState(
		"step",
		parseAsStringLiteral([
			"availability",
			"profile",
			"calendar",
		] as const).withDefault("availability"),
	);
	// "availability" is marked done once the mentor advances past it.
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
			<nav aria-label="Onboarding steps" className="mb-8">
				<ol className="flex items-center gap-3">
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
							<li key={step.id} className="flex flex-1 items-center gap-3">
								<button
									type="button"
									disabled={!canVisit}
									onClick={() => canVisit && setActive(step.id)}
									className={cn(
										"flex flex-1 items-center gap-3 text-left",
										!canVisit && "cursor-not-allowed opacity-60",
									)}
								>
									<span
										className={cn(
											"flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors",
											isActive
												? "border-primary-500 bg-primary-500 text-white"
												: isDone
													? "border-primary-500 bg-surface-pink text-primary-500"
													: "border-border bg-white text-muted-foreground",
										)}
									>
										<Icon className="size-4" strokeWidth={2} />
									</span>
									<span className="min-w-0">
										<span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
											Step {index + 1}
										</span>
										<span
											className={cn(
												"block text-sm font-medium",
												isActive ? "text-foreground" : "text-muted-foreground",
											)}
										>
											{step.label}
										</span>
									</span>
								</button>
								{index < steps.length - 1 ? (
									<span
										aria-hidden
										className={cn(
											"hidden h-px flex-1 sm:block",
											(
												step.id === "availability"
													? availabilityReady
													: step.id === "profile"
														? profileReady
														: calendarConnected
											)
												? "bg-primary-500/40"
												: "bg-border",
										)}
									/>
								) : null}
							</li>
						);
					})}
				</ol>
			</nav>

			{visibleActive === "availability" ? (
				<div className="space-y-6">
					<StepHeader
						title="Set your weekly availability"
						description="Add at least one slot for each day you can take calls, then save. You can change this anytime from your dashboard."
					/>
					{availabilitySlot}
					<div className="flex justify-end pt-2">
						<Button
							size="sm"
							onClick={() => {
								setAvailabilityDone(true);
								setActive("profile");
							}}
						>
							Continue to profile
						</Button>
					</div>
				</div>
			) : visibleActive === "profile" ? (
				<div className="space-y-6">
					<StepHeader
						title="Complete your profile"
						description="This is what mentees see on your booking page. A friendly photo and a short bio go a long way."
					/>
					{profileSlot(() => {
						setProfileDone(true);
						setActive("calendar");
					})}
				</div>
			) : (
				<div className="space-y-6">
					<StepHeader
						title="Connect Google Calendar"
						description="Link the Google Calendar you use for mentoring. New calls will be scheduled on this calendar."
					/>
					{calendarSlot}
				</div>
			)}
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
		<div className="space-y-1">
			<h2 className="font-heading text-lg font-semibold text-foreground">
				{title}
			</h2>
			<p className="text-sm text-muted-foreground">{description}</p>
		</div>
	);
}
