import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { isLocalImageUrl } from "@/src/lib/image-url";
import { formatInTimeZone } from "date-fns-tz";
import { CalendarClock, LinkIcon, UserRound, Video } from "lucide-react";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { getInitialWeekStart } from "../../careers-corner/[slug]/_actions";
import { loadBookingFromToken } from "./_actions";
import { ManageActions } from "./_components/manage-actions";

// Token-gated private page — keep it out of search results, but still give it
// a proper localized title/OG for the browser tab and link previews.
export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: Locale }>;
}) {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "seo.manageBooking" });
	return {
		title: t("title"),
		description: t("description"),
		robots: { index: false, follow: false },
	};
}

export default async function ManageBookingPage({
	params,
}: {
	params: Promise<{ locale: string; token: string }>;
}) {
	const { locale, token } = await params;
	setRequestLocale(locale as Locale);

	const result = await loadBookingFromToken(token);
	if (!result.ok) {
		return (
			<Shell>
				<EmptyState
					icon={LinkIcon}
					title="This booking link isn't valid"
					description="The link may have expired or already been used. Head back to find your mentor and book again."
					action={
						<Button variant="outline" size="sm" href="/careers-corner">
							Browse mentors
						</Button>
					}
				/>
			</Shell>
		);
	}

	const { booking, mentor } = result;

	const initialWeekStart = mentor
		? await getInitialWeekStart(mentor.slug)
		: null;

	if (booking.status === "cancelled") {
		return (
			<Shell>
				<EmptyState
					icon={CalendarClock}
					title="This booking is cancelled"
					description={
						mentor
							? `If you'd like to meet again, book a new time with ${mentor.name}.`
							: "If you'd like to meet again, book a new time."
					}
					action={
						<Button
							variant="outline"
							size="sm"
							href={
								mentor ? `/careers-corner/${mentor.slug}` : "/careers-corner"
							}
						>
							Book again
						</Button>
					}
				/>
			</Shell>
		);
	}

	const whenLabel = formatInTimeZone(
		booking.start_at,
		booking.mentee_timezone,
		"EEE, MMM d, yyyy 'at' HH:mm zzz",
	);

	return (
		<main className="bg-muted">
			<div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
				<h1 className="text-2xl font-semibold text-foreground">
					Manage your booking
				</h1>

				<div className="mt-6 rounded-2xl border border-border/60 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
					<div className="flex items-center justify-between gap-3">
						<div className="flex items-center gap-3">
							<div className="relative size-12 shrink-0 overflow-hidden rounded-full ring-2 ring-primary-500/15">
								{mentor?.image ? (
									<Image
										src={mentor.image}
										alt={mentor.name}
										fill
										sizes="48px"
										unoptimized={isLocalImageUrl(mentor.image)}
										className="object-cover object-top"
									/>
								) : (
									<div className="flex h-full w-full items-center justify-center bg-surface-pink">
										<UserRound className="size-6 text-primary-500/60" />
									</div>
								)}
							</div>
							<div>
								<p className="text-sm text-muted-foreground">With</p>
								<p className="font-semibold text-foreground">
									{mentor?.name ?? "—"}
								</p>
							</div>
						</div>
						<StatusBadge status={booking.status} />
					</div>

					<div className="my-5 h-px bg-border/60" />

					<div className="flex items-start gap-3">
						<span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-pink text-primary-500">
							<CalendarClock className="size-5" />
						</span>
						<div>
							<p className="text-sm text-muted-foreground">When</p>
							<p className="font-medium text-foreground">{whenLabel}</p>
						</div>
					</div>

					<div className="mt-5">
						<Button
							variant="solid"
							size="sm"
							href={booking.meet_url}
							isExternal
							className="inline-flex items-center gap-2"
						>
							<Video className="size-4" />
							Join Google Meet
						</Button>
					</div>
				</div>

				<div className="mt-6">
					<ManageActions
						token={token}
						mentorSlug={mentor?.slug ?? ""}
						initialWeekStart={initialWeekStart}
					/>
				</div>
			</div>
		</main>
	);
}

function Shell({ children }: { children: React.ReactNode }) {
	return (
		<main className="bg-muted">
			<div className="mx-auto max-w-md px-4 py-16">{children}</div>
		</main>
	);
}
