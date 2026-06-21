"use client";

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
import { format, parse } from "date-fns";
import { CalendarClock, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

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

	return (
		<Dialog>
			<div className="group flex h-full w-full flex-col rounded-2xl border border-border/60 bg-white p-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.10)]">
				<div className="relative h-64 w-full overflow-hidden rounded-[14px]">
					{mentor.image ? (
						<Image
							src={mentor.image}
							alt={mentor.name}
							fill
							sizes="(max-width: 768px) 50vw, 25vw"
							unoptimized={mentor.image.includes("localhost")}
							className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
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
							<div className="relative aspect-3/4 h-75 w-full max-w-md overflow-hidden rounded-2xl shadow-md ring-1 ring-border/60 sm:h-100">
								{mentor.image ? (
									<Image
										src={mentor.image}
										alt={mentor.name}
										fill
										sizes="(max-width: 768px) 100vw, 400px"
										className="object-cover object-top"
										unoptimized={mentor.image.includes("localhost")}
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

								{mentor.availability && mentor.availability.length > 0 ? (
									<div className="mb-5 rounded-2xl border border-border/60 bg-surface-pink/50 p-4">
										<h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary-500">
											<CalendarClock className="size-4" />
											{t("availableTimes")}
										</h4>
										<p className="text-sm text-foreground/80">
											{mentor.availability.map((slot, index) => (
												<span key={formatTime(slot.start_time)}>
													{`${slot.day}, ${formatTime(slot.start_time)} - ${formatTime(slot.end_time)} ${slot.timezone}`}
													{index < mentor.availability.length - 2 ? ", " : ""}
													{index === mentor.availability.length - 2
														? " and "
														: ""}
												</span>
											))}
										</p>
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
