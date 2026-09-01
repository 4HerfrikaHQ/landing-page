"use client";

import { MentorImage } from "@/components/mentor-image";
import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import type { DbMentorWithAvailability } from "@/src/db/schema/tables";
import type { DayOfWeek } from "@/src/db/schema/tables/availability";
import { format, parse } from "date-fns";
import { CalendarClock, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";

const DAY_ORDER: DayOfWeek[] = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
];

function formatTime(timeString: string) {
	try {
		const date = parse(timeString, "HH:mm:ss", new Date());
		return format(date, "h:mm a");
	} catch (error) {
		console.log("Error parsing time:", error);
		return timeString;
	}
}

export function MentorCard({ mentor }: { mentor: DbMentorWithAvailability }) {
	const t = useTranslations("careers");
	const tc = useTranslations("common");
	const displayName = mentor.nickname || mentor.name;
	const availability = mentor.availability ?? [];
	const timezones = Array.from(
		new Set(availability.map((slot) => slot.timezone)),
	);
	const slotsByDay = DAY_ORDER.map((day) => ({
		day,
		slots: availability
			.filter((slot) => slot.day === day)
			.sort((a, b) => a.start_time.localeCompare(b.start_time)),
	})).filter((group) => group.slots.length > 0);

	return (
		<Dialog>
			<div className="group flex h-full w-full flex-col rounded-2xl border border-border/60 bg-white p-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.10)]">
				<div className="relative aspect-[4/5] w-full overflow-hidden rounded-[14px]">
					{mentor.image ? (
						<MentorImage
							src={mentor.image}
							alt={mentor.name}
							crop={mentor.image_crop}
							sizes="(max-width: 768px) 50vw, 25vw"
							className="size-full transition-transform duration-500 group-hover:scale-105"
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center bg-surface-pink">
							<UserRound className="size-20 text-primary-500/60" />
						</div>
					)}
				</div>
				<div className="mt-4 flex grow flex-col text-center">
					<p className="font-semibold text-foreground">{displayName}</p>
					<p className="mt-0.5 text-sm capitalize text-muted-foreground">
						{mentor.position}
					</p>
					<DialogTrigger
						render={
							<Button
								variant="outline"
								size="sm"
								className="mx-auto mt-4 w-full max-w-40"
							/>
						}
					>
						{t("details")}
					</DialogTrigger>
				</div>
			</div>

			<DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:max-w-5xl sm:p-8 lg:p-16">
				<FadeIn>
					<DialogHeader>
						<DialogTitle className="mb-6 text-center text-2xl font-bold text-primary-500 sm:text-3xl lg:mb-10 lg:text-4xl">
							{displayName}
						</DialogTitle>
					</DialogHeader>

					<div className="grid gap-6 lg:grid-cols-2 lg:gap-16">
						{/* Profile Image */}
						<div className="flex justify-center">
							<div className="relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-2xl shadow-md ring-1 ring-border/60">
								{mentor.image ? (
									<MentorImage
										src={mentor.image}
										alt={mentor.name}
										crop={mentor.image_crop}
										sizes="(max-width: 768px) 100vw, 400px"
										className="size-full"
									/>
								) : (
									<div className="flex h-full w-full items-center justify-center bg-surface-pink">
										<UserRound className="size-28 text-primary-500/50" />
									</div>
								)}
							</div>
						</div>

						{/* Profile Information */}
						<div className="flex flex-col">
							<div>
								<h3 className="mb-3 text-xl font-semibold capitalize text-foreground sm:text-2xl">
									{mentor.position}
								</h3>

								{availability.length > 0 ? (
									<div className="mb-5 rounded-2xl border border-border/60 bg-surface-pink/50 p-4">
										<h4 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary-500">
											<CalendarClock className="size-4" />
											{t("availableTimes")}
										</h4>
										<ul className="flex flex-col divide-y divide-border/50">
											{slotsByDay.map(({ day, slots }) => (
												<li
													key={day}
													className="flex items-start justify-between gap-3 py-1.5 text-sm first:pt-0 last:pb-0"
												>
													<span className="font-medium text-foreground">
														{day}
													</span>
													<span className="flex flex-col items-end gap-0.5 text-foreground/70">
														{slots.map((slot) => (
															<span
																key={slot.start_time}
																className="tabular-nums"
															>
																{formatTime(slot.start_time)} –{" "}
																{formatTime(slot.end_time)}
																{timezones.length > 1
																	? ` ${slot.timezone}`
																	: ""}
															</span>
														))}
													</span>
												</li>
											))}
										</ul>
										{timezones.length === 1 ? (
											<p className="mt-3 border-t border-border/50 pt-2 text-xs text-muted-foreground">
												{t("timezoneNote", { timezone: timezones[0] })}
											</p>
										) : null}
									</div>
								) : (
									<div className="mb-5">
										<h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary-500">
											{t("availableTimes")}
										</h4>
										<p className="text-sm text-muted-foreground">
											{t("notMentioned")}
										</p>
									</div>
								)}

								<div className="max-w-[65ch] text-sm leading-relaxed text-muted-foreground">
									{mentor.bio ? (
										<p className="whitespace-pre-line">{mentor.bio}</p>
									) : (
										<p className="whitespace-pre-line">
											{t("mentorComingSoon")}
										</p>
									)}
								</div>
							</div>

							<div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
								{mentor.linkedin_url && (
									<Button variant="link" href={mentor.linkedin_url} isExternal>
										{tc("messageOnLinkedin")}
									</Button>
								)}
								<Button
									variant="solid"
									size="lg"
									href={`/careers-corner/${mentor.slug}`}
									className="w-full sm:w-auto"
								>
									{tc("bookACall")}
								</Button>
							</div>
						</div>
					</div>
				</FadeIn>
			</DialogContent>
		</Dialog>
	);
}
