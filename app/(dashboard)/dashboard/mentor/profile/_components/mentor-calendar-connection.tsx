"use client";

import {
	AlertCircle,
	CalendarDays,
	CheckCircle2,
	RefreshCw,
	ShieldCheck,
	Unplug,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryStates } from "nuqs";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { DataCard, DataCardSection } from "@/components/dashboard/data-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export type MentorCalendarConnectionStatus =
	| "not_connected"
	| "connected"
	| "reauth_required";

/** Safe, non-secret metadata from the server-side connection loader. */
export interface MentorCalendarConnection {
	status: MentorCalendarConnectionStatus;
	googleEmail?: string | null;
	googleDisplayName?: string | null;
	connectedAt?: string | null;
}

export type MentorCalendarCallbackReason =
	| "oauth_denied"
	| "google_account_conflict"
	| "expired_state"
	| "invalid_state"
	| "insufficient_scope"
	| "invalid_grant"
	| "oauth_exchange_failed"
	| "identity_lookup_failed"
	| "refresh_token_missing"
	| "connection_unavailable";

export type MentorCalendarCallbackOutcome = {
	reason: MentorCalendarCallbackReason;
};

/**
 * Adapter boundary for the connection builder's server actions. Actions may
 * redirect to Google themselves, or complete and let the page revalidate.
 */
export interface MentorCalendarConnectionActions {
	connect?: () => Promise<unknown>;
	reconnect?: () => Promise<unknown>;
	disconnect?: () => Promise<unknown>;
	retryRevocation?: () => Promise<unknown>;
}

interface MentorCalendarConnectionProps {
	connection: MentorCalendarConnection;
	actions?: MentorCalendarConnectionActions;
	callbackOutcome?: MentorCalendarCallbackOutcome | null;
	healthCheckUnavailable?: boolean;
	revocationPending?: boolean;
	canRetryRevocation?: boolean;
}

const STATUS_COPY: Record<
	MentorCalendarConnectionStatus,
	{
		label: string;
		description: string;
		className: string;
		icon: typeof CheckCircle2;
	}
> = {
	not_connected: {
		label: "Not connected",
		description: "Connect a Google account before accepting a booking.",
		className: "border-amber-200 bg-amber-50 text-amber-800",
		icon: AlertCircle,
	},
	connected: {
		label: "Connected",
		description: "New calls will be organized from your Google Calendar.",
		className: "border-emerald-200 bg-emerald-50 text-emerald-800",
		icon: CheckCircle2,
	},
	reauth_required: {
		label: "Reauthorization required",
		description:
			"Google needs you to reconnect before a booking can be created.",
		className: "border-rose-200 bg-rose-50 text-rose-800",
		icon: AlertCircle,
	},
};

const CALLBACK_COPY: Record<
	MentorCalendarCallbackReason,
	{ title: string; description: string }
> = {
	oauth_denied: {
		title: "Google access was not granted",
		description:
			"Choose Connect Google Calendar when you are ready to try again.",
	},
	google_account_conflict: {
		title: "That Google account is not linked",
		description:
			"Use Reauthorize this account to continue with the Google account already linked to your mentor profile.",
	},
	expired_state: {
		title: "The connection request expired",
		description: "Start the connection again to get a fresh, secure request.",
	},
	invalid_state: {
		title: "The connection request could not be verified",
		description: "Start the connection again from this profile page.",
	},
	insufficient_scope: {
		title: "Calendar permission is missing",
		description:
			"Reconnect and approve the requested Calendar permission so bookings can be created.",
	},
	invalid_grant: {
		title: "Google needs you to reconnect",
		description:
			"Use Reauthorize this account to restore booking availability.",
	},
	oauth_exchange_failed: {
		title: "Google could not finish the connection",
		description:
			"Try connecting again. Booking stays unavailable until it succeeds.",
	},
	identity_lookup_failed: {
		title: "Google account details could not be confirmed",
		description: "Try connecting again with the intended mentor account.",
	},
	refresh_token_missing: {
		title: "Google needs you to reconnect",
		description:
			"Use Reauthorize this account to restore booking availability.",
	},
	connection_unavailable: {
		title: "Google Calendar is unavailable",
		description:
			"Try again shortly. Booking stays unavailable until it succeeds.",
	},
};

function formatConnectedAt(value: string | null | undefined) {
	if (!value) return "Connected date unavailable";

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "Connected date unavailable";

	return `Connected on ${new Intl.DateTimeFormat(undefined, {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(date)}`;
}

export function MentorCalendarConnection({
	connection,
	actions,
	callbackOutcome,
	healthCheckUnavailable,
	revocationPending,
	canRetryRevocation,
}: MentorCalendarConnectionProps) {
	const [isPending, startTransition] = useTransition();
	const [confirmDisconnect, setConfirmDisconnect] = useState(false);
	const router = useRouter();
	const [, clearCallbackQuery] = useQueryStates({
		googleCalendar: parseAsString,
		reason: parseAsString,
	});
	const status = STATUS_COPY[connection.status];
	const StatusIcon = status.icon;
	const isConnected = connection.status === "connected";
	const isReconnect = connection.status === "reauth_required";

	useEffect(() => {
		if (!callbackOutcome) return;
		void clearCallbackQuery({ googleCalendar: null, reason: null });
	}, [callbackOutcome, clearCallbackQuery]);

	function runAction(
		action: (() => Promise<unknown>) | undefined,
		kind: "oauth" | "disconnect" | "revocation_retry",
	) {
		if (!action) {
			toast.error("Google Calendar connection is not available yet.");
			return;
		}

		startTransition(async () => {
			try {
				const result = await action();
				if (typeof result === "string") {
					window.location.assign(result);
					return;
				}
				setConfirmDisconnect(false);
				if (kind === "disconnect" || kind === "revocation_retry") {
					const resultRecord =
						result && typeof result === "object"
							? (result as {
									remoteRevocation?: string;
									status?: string;
								})
							: null;
					if (resultRecord?.remoteRevocation === "failed") {
						toast.error(
							kind === "revocation_retry"
								? "Google still has not confirmed access removal. Try again later or remove 4Herfrika from Google Account → Security → Third-party connections."
								: "Disconnected here, but Google did not confirm access removal. Check Google Account → Security → Third-party connections and remove 4Herfrika if it is still listed.",
						);
					} else if (resultRecord?.remoteRevocation === "not_attempted") {
						toast.error(
							kind === "revocation_retry"
								? "There is no confirmed Google revocation yet. Check Google Account → Security → Third-party connections."
								: "Disconnected here. Check Google Account → Security → Third-party connections and remove 4Herfrika if it is still listed.",
						);
					} else if (kind === "revocation_retry") {
						toast.success("Google access revocation confirmed.");
					} else {
						toast.success("Disconnected and Google access was revoked.");
					}
					router.refresh();
					return;
				}
				toast.success("Connection started");
			} catch {
				toast.error("Google Calendar could not be updated. Try again.");
			}
		});
	}

	return (
		<DataCard className="overflow-hidden">
			<div className="h-1 bg-linear-to-r from-primary-500 via-primary-300 to-secondary-500" />
			<DataCardSection className="space-y-6 p-6 sm:p-8">
				{callbackOutcome ? (
					<div
						className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"
						role="alert"
					>
						<p className="font-medium">
							{CALLBACK_COPY[callbackOutcome.reason].title}
						</p>
						<p className="mt-1 leading-5">
							{CALLBACK_COPY[callbackOutcome.reason].description}
						</p>
					</div>
				) : null}
				<div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex gap-4">
						<div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-surface-indigo text-secondary-500">
							<CalendarDays className="size-5" aria-hidden="true" />
						</div>
						<div>
							<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
								Your calls
							</p>
							<h2 className="mt-1 font-heading text-xl font-semibold text-foreground">
								Google Calendar &amp; Meet
							</h2>
							<p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
								Your own Google account organizes each call, sends the invite,
								and owns the meeting. 4Herfrika does not join the call.
							</p>
						</div>
					</div>
					<div
						className={cn(
							"inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
							status.className,
						)}
					>
						<StatusIcon className="size-3.5" aria-hidden="true" />
						{status.label}
					</div>
				</div>
				{healthCheckUnavailable ? (
					<div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-5 text-amber-950">
						Google access could not be confirmed just now. Reauthorize this
						account before accepting a new booking.
					</div>
				) : null}
				{revocationPending ? (
					<div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
						<p className="font-medium">
							Google access removal is still pending.
						</p>
						<p className="mt-1 leading-5">
							Bookings remain unavailable until Google confirms revocation. You
							can try the protected retry now, or remove 4Herfrika from Google
							Account → Security → Third-party connections.
						</p>
						{canRetryRevocation && actions?.retryRevocation ? (
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="mt-3"
								disabled={isPending}
								onClick={() =>
									runAction(actions.retryRevocation, "revocation_retry")
								}
							>
								Retry Google access removal
							</Button>
						) : null}
					</div>
				) : null}

				<div className="rounded-xl border border-border/60 bg-muted/40 p-4">
					<div className="flex items-start gap-3">
						<ShieldCheck
							className="mt-0.5 size-4 shrink-0 text-secondary-500"
							aria-hidden="true"
						/>
						<div className="space-y-1">
							<p className="text-sm font-medium text-foreground">
								{status.description}
							</p>
							<p className="text-sm leading-5 text-muted-foreground">
								We only show your connected account and connection health here.
								We never display access codes, tokens, or meeting links in this
								panel.
							</p>
						</div>
					</div>
				</div>

				{isConnected ? (
					<div className="grid gap-4 border-y border-border/60 py-4 sm:grid-cols-2">
						<div>
							<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
								Connected account
							</p>
							<p className="mt-1 truncate text-sm font-medium text-foreground">
								{connection.googleDisplayName ||
									connection.googleEmail ||
									"Google account"}
							</p>
							{connection.googleDisplayName && connection.googleEmail ? (
								<p className="truncate text-sm text-muted-foreground">
									{connection.googleEmail}
								</p>
							) : null}
						</div>
						<div>
							<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
								Connection timing
							</p>
							<p className="mt-1 text-sm text-foreground">
								{formatConnectedAt(connection.connectedAt)}
							</p>
						</div>
					</div>
				) : (
					<div className="border-l-2 border-primary-500 pl-4 text-sm leading-6 text-muted-foreground">
						Bookings are unavailable until Google Calendar is connected. Once
						connected, a fresh Calendar event and unique Meet will be created on
						your account for each booking.
					</div>
				)}

				{isReconnect ? (
					<div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 text-sm leading-6 text-rose-900">
						Reconnect to restore booking availability. The existing connection
						is not used as a fallback, and new calls stay blocked until Google
						confirms your account again.
					</div>
				) : null}

				<div className="flex flex-col gap-3 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-wrap gap-2">
						{isConnected ? (
							<div className="flex flex-wrap items-center gap-2">
								<Button
									type="button"
									variant="outline"
									size="sm"
									disabled={isPending || !actions?.reconnect}
									aria-disabled={!actions?.reconnect}
									onClick={() => runAction(actions?.reconnect, "oauth")}
								>
									<RefreshCw className="size-4" aria-hidden="true" />
									Reauthorize this account
								</Button>
								<p className="basis-full text-xs text-muted-foreground">
									Refreshes consent for this linked Google account; it cannot
									switch accounts.
								</p>
							</div>
						) : (
							<Button
								type="button"
								variant="solid"
								size="sm"
								disabled={
									isPending ||
									!(isReconnect ? actions?.reconnect : actions?.connect)
								}
								onClick={() =>
									runAction(
										isReconnect ? actions?.reconnect : actions?.connect,
										"oauth",
									)
								}
							>
								<CalendarDays className="size-4" aria-hidden="true" />
								{isReconnect
									? "Reauthorize this account"
									: "Connect Google Calendar"}
							</Button>
						)}
						{isConnected ? (
							confirmDisconnect ? (
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<span>Disconnect Google Calendar?</span>
									<Button
										type="button"
										variant="outline"
										size="sm"
										disabled={isPending || !actions?.disconnect}
										onClick={() => runAction(actions?.disconnect, "disconnect")}
									>
										Yes, disconnect
									</Button>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => setConfirmDisconnect(false)}
									>
										Keep it
									</Button>
								</div>
							) : (
								<Button
									type="button"
									variant="ghost"
									size="sm"
									disabled={isPending}
									onClick={() => setConfirmDisconnect(true)}
								>
									<Unplug className="size-4" aria-hidden="true" />
									Disconnect
								</Button>
							)
						) : null}
					</div>
					{isPending ? (
						<output className="text-sm text-muted-foreground">
							Updating connection…
						</output>
					) : null}
				</div>
			</DataCardSection>
		</DataCard>
	);
}
