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
import { format, parseISO } from "date-fns";
import { useTranslations } from "next-intl";
import Image from "next/image";
import type { Mentor } from "../_schema";

function formatTime(timeString: string) {
	try {
		const date = parseISO(timeString);
		return format(date, "h:mm a");
	} catch (error) {
		console.log("Error parsing time:", error);
		return timeString;
	}
}

export function MentorCard({ mentor }: { mentor: Mentor }) {
	const t = useTranslations("careers");
	const tc = useTranslations("common");
	const displayName = mentor.nickname || mentor.name;

	return (
		<Dialog>
			<div className="h-full w-full bg-secondary-500 bg-opacity-20 p-2 rounded-md hover:shadow-lg transition-shadow duration-300">
				<div className="overflow-hidden rounded-md">
					<Image
						src={mentor.image}
						alt={mentor.name}
						width={700}
						height={1000}
						className="hover:scale-105 h-64 w-full object-cover object-top transition-transform duration-300"
					/>
				</div>
				<p className="text-center text-md mt-3 uppercase font-bold text-white">
					{mentor.name}
				</p>
				<p className="text-white text-xs text-center uppercase">
					{mentor.position}
				</p>
				<DialogTrigger
					render={
						<Button
							variant="solid"
							size="sm"
							className="max-w-36 w-full flex items-center justify-center mx-auto my-7"
						/>
					}
				>
					{t("details")}
				</DialogTrigger>
			</div>

			<DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 lg:p-16">
				<FadeIn>
				<DialogHeader>
					<DialogTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-primary-500 mb-6 lg:mb-10">
						{displayName}
					</DialogTitle>
				</DialogHeader>

				<div className="grid lg:grid-cols-2 gap-6 lg:gap-16">
					{/* Profile Image */}
					<div className="flex justify-center">
						<div className="w-full max-w-md rounded-md shadow-md relative aspect-3/4 h-75 sm:h-100">
							<Image
								src={mentor.image}
								alt={mentor.name}
								fill
								sizes="(max-width: 768px) 100vw, 400px"
								className="rounded-md object-cover object-top"
								quality={100}
								priority
								style={{
									imageRendering: "crisp-edges",
									WebkitFontSmoothing: "antialiased",
								}}
							/>
						</div>
					</div>

					{/* Profile Information */}
					<div className="flex flex-col">
						<div>
							<h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
								{mentor.position}
							</h3>

							{mentor.availability && mentor.availability.length > 0 ? (
								<div className="mb-4">
									<h4 className="text-primary-500 text-xs font-medium mb-2">
										{t("availableTimes")}
									</h4>
									<p className="text-foreground text-xs">
										{mentor.availability.map((slot, index) => (
											<span key={formatTime(slot.time.start)}>
												{`${slot.day}, ${formatTime(slot.time.start)} - ${formatTime(slot.time.end)} ${slot.timezone}`}
												{index < mentor.availability.length - 2 ? ", " : ""}
												{index === mentor.availability.length - 2
													? " and "
													: ""}
											</span>
										))}
									</p>
								</div>
							) : (
								<div className="mb-4">
									<h4 className="text-primary-500 font-medium mb-2">
										{t("availableTimes")}
									</h4>
									<p className="text-foreground">{t("notMentioned")}</p>
								</div>
							)}

							<div className="text-muted-foreground text-sm">
								{mentor.bio ? (
									<p className="whitespace-pre-line">{mentor.bio}</p>
								) : (
									<p className="whitespace-pre-line">
										{t("mentorComingSoon")}
									</p>
								)}
							</div>
						</div>

						<div className="flex flex-col items-center sm:flex-row gap-4 sm:gap-6 mt-6">
							<Button
								variant="link"
								href={mentor.linkedinUrl || "/"}
								isExternal
							>
								{tc("messageOnLinkedin")}
							</Button>
							<Button
								variant="solid"
								size="lg"
								href={mentor.bookingUrl || "/"}
								isExternal
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
