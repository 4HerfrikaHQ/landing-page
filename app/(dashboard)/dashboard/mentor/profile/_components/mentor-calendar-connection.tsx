"use client";

import {
	AlertCircle,
	CalendarDays,
	CalendarX2,
	CheckCircle2,
	Info,
	RefreshCw,
	Unplug,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryStates } from "nuqs";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { DataCard, DataCardSection } from "@/components/dashboard/data-card";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/utils/cn";

export type MentorCalendarConnectionStatus =
	| "not_connected"
	| "connected"
	| "disconnected"
	| "revoked"
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
		className: string;
		icon: typeof CheckCircle2;
	}
> = {
	not_connected: {
		label: "Not connected",
		className: "border-amber-200 bg-amber-50 text-amber-800",
		icon: AlertCircle,
	},
	disconnected: {
		label: "Disconnected",
		className: "border-slate-200 bg-slate-50 text-slate-700",
		icon: Unplug,
	},
	revoked: {
		label: "Access revoked",
		className: "border-rose-200 bg-rose-50 text-rose-800",
		icon: CalendarX2,
	},
	connected: {
		label: "Connected",
		className: "border-emerald-200 bg-emerald-50 text-emerald-800",
		icon: CheckCircle2,
	},
	reauth_required: {
		label: "Reauthorization required",
		className: "border-rose-200 bg-rose-50 text-rose-800",
		icon: AlertCircle,
	},
};

const ACTION_FOCUS_CLASS_NAME =
	"focus-visible:ring-3 focus-visible:ring-ring/50";
const CONNECTED_ACTION_CLASS_NAME = cn(
	"box-border h-9 gap-2 py-0",
	ACTION_FOCUS_CLASS_NAME,
);

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
			"Reconnect and approve the requested Calendar permission before you can host new meetings.",
	},
	invalid_grant: {
		title: "Google needs you to reconnect",
		description:
			"Use Reauthorize this account before you can host new meetings.",
	},
	oauth_exchange_failed: {
		title: "Google could not finish the connection",
		description:
			"Try connecting again. You cannot host new meetings until Google Calendar is connected.",
	},
	identity_lookup_failed: {
		title: "Google account details could not be confirmed",
		description: "Try connecting again with the intended mentor account.",
	},
	refresh_token_missing: {
		title: "Google needs you to reconnect",
		description:
			"Use Reauthorize this account before you can host new meetings.",
	},
	connection_unavailable: {
		title: "Google Calendar is unavailable",
		description:
			"Try again shortly. You cannot host new meetings until Google Calendar is connected.",
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
	const disconnectButtonRef = useRef<HTMLButtonElement>(null);
	const keepItButtonRef = useRef<HTMLButtonElement>(null);
	const restoreDisconnectFocusRef = useRef(false);
	const router = useRouter();
	const [, clearCallbackQuery] = useQueryStates({
		googleCalendar: parseAsString,
		reason: parseAsString,
	});
	const status = STATUS_COPY[connection.status];
	const StatusIcon = status.icon;
	const isConnected = connection.status === "connected";
	const isReconnect =
		connection.status === "reauth_required" || connection.status === "revoked";
	const description = isConnected
		? "Your Google account organizes new calls."
		: connection.status === "reauth_required"
			? "Reauthorize Google Calendar before you can host new meetings."
			: connection.status === "revoked"
				? "Google access was revoked. Reconnect before you can host new meetings."
				: connection.status === "disconnected"
					? "Reconnect Google Calendar before you can host new meetings."
					: "Connect Google Calendar before you can host meetings.";
	const reconnectLabel =
		connection.status === "revoked"
			? "Reconnect Google Calendar"
			: "Reauthorize this account";

	useEffect(() => {
		if (confirmDisconnect) {
			keepItButtonRef.current?.focus();
			return;
		}

		if (restoreDisconnectFocusRef.current) {
			disconnectButtonRef.current?.focus();
			restoreDisconnectFocusRef.current = false;
		}
	}, [confirmDisconnect]);

	useEffect(() => {
		if (!callbackOutcome) return;
		void clearCallbackQuery({ googleCalendar: null, reason: null });
	}, [callbackOutcome, clearCallbackQuery]);

	function cancelDisconnect() {
		restoreDisconnectFocusRef.current = true;
		setConfirmDisconnect(false);
	}

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
				<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
					<div className="min-w-0">
						<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							Your calls
						</p>
						<h2 className="mt-1 font-heading text-xl font-semibold text-foreground">
							Google Calendar &amp; Meet
						</h2>
						<p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
							{description}
						</p>
					</div>
					<div
						className={cn(
							"inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
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
						account before you can host new meetings.
					</div>
				) : null}
				{revocationPending ? (
					<div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
						<p className="font-medium">
							Google access removal is still pending.
						</p>
						<p className="mt-1 leading-5">
							You cannot host new meetings until Google confirms revocation and
							you reconnect. Try the protected retry now, or remove 4HerFrika
							from Google Account → Security → Third-party connections.
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
				) : null}

				<div className="flex flex-col gap-3 border-t border-border/60 pt-5">
					{confirmDisconnect && isConnected ? (
						<div
							className="flex w-full flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50/70 p-4 sm:flex-row sm:items-center sm:justify-between"
							role="alertdialog"
							aria-labelledby="disconnect-google-calendar-title"
							aria-describedby="disconnect-google-calendar-description"
						>
							<div>
								<p
									id="disconnect-google-calendar-title"
									className="text-sm font-medium text-rose-950"
								>
									Disconnect Google Calendar?
								</p>
								<p
									id="disconnect-google-calendar-description"
									className="mt-1 text-sm leading-5 text-rose-900/80"
								>
									You will not be able to host new meetings until you connect
									Google Calendar again.
								</p>
							</div>
							<div className="grid grid-cols-2 gap-2 sm:flex">
								<Button
									type="button"
									variant="outline"
									size="sm"
									className={cn(
										"gap-2 border-rose-300 px-3.5 text-rose-700 hover:border-primary-500 hover:text-white",
										ACTION_FOCUS_CLASS_NAME,
									)}
									disabled={isPending || !actions?.disconnect}
									onClick={() => runAction(actions?.disconnect, "disconnect")}
								>
									Yes, disconnect
								</Button>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className={cn(
										"px-3.5 text-rose-900 hover:bg-white/70",
										ACTION_FOCUS_CLASS_NAME,
									)}
									ref={keepItButtonRef}
									onClick={cancelDisconnect}
								>
									Keep it
								</Button>
							</div>
						</div>
					) : (
						<div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
							{isConnected ? (
								<>
									<Button
										type="button"
										variant="outline"
										size="sm"
										className={CONNECTED_ACTION_CLASS_NAME}
										disabled={isPending || !actions?.reconnect}
										aria-disabled={!actions?.reconnect}
										onClick={() => runAction(actions?.reconnect, "oauth")}
									>
										<RefreshCw className="size-4" aria-hidden="true" />
										Reauthorize this account
									</Button>
									<Tooltip>
										<TooltipTrigger
											render={
												<Button
													type="button"
													variant="ghost"
													size="icon-sm"
													aria-label="About reauthorization"
													className="text-muted-foreground"
												/>
											}
										>
											<Info className="size-4" aria-hidden="true" />
										</TooltipTrigger>
										<TooltipContent>
											Refreshes consent for this linked Google account; it
											cannot switch accounts.
										</TooltipContent>
									</Tooltip>
								</>
							) : (
								<Button
									type="button"
									variant="solid"
									size="sm"
									className="gap-2"
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
									{isReconnect ? (
										<RefreshCw className="size-4" aria-hidden="true" />
									) : (
										<CalendarDays className="size-4" aria-hidden="true" />
									)}
									{isReconnect ? reconnectLabel : "Connect Google Calendar"}
								</Button>
							)}
							{isConnected && actions?.disconnect ? (
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className={CONNECTED_ACTION_CLASS_NAME}
									disabled={isPending}
									ref={disconnectButtonRef}
									onClick={() => setConfirmDisconnect(true)}
								>
									<Unplug className="size-4" aria-hidden="true" />
									Disconnect
								</Button>
							) : null}
						</div>
					)}
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
