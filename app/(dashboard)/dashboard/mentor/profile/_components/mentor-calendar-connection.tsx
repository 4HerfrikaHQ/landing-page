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
import { useLocale, useTranslations } from "next-intl";
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
	configurationMissing?: boolean;
	healthCheckUnavailable?: boolean;
	revocationPending?: boolean;
	canRetryRevocation?: boolean;
}

const STATUS_COPY: Record<
	MentorCalendarConnectionStatus,
	{
		className: string;
		icon: typeof CheckCircle2;
	}
> = {
	not_connected: {
		className: "border-amber-200 bg-amber-50 text-amber-800",
		icon: AlertCircle,
	},
	disconnected: {
		className: "border-slate-200 bg-slate-50 text-slate-700",
		icon: Unplug,
	},
	revoked: {
		className: "border-rose-200 bg-rose-50 text-rose-800",
		icon: CalendarX2,
	},
	connected: {
		className: "border-emerald-200 bg-emerald-50 text-emerald-800",
		icon: CheckCircle2,
	},
	reauth_required: {
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

export function MentorCalendarConnection({
	connection,
	actions,
	callbackOutcome,
	configurationMissing,
	healthCheckUnavailable,
	revocationPending,
	canRetryRevocation,
}: MentorCalendarConnectionProps) {
	const t = useTranslations("calendarConnection");
	const locale = useLocale();
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
	const description = t(`description.${connection.status}`);
	const reconnectLabel =
		connection.status === "revoked" ? t("reconnect") : t("reauthorize");
	const connectedAt = connection.connectedAt
		? new Date(connection.connectedAt)
		: null;
	const connectedAtLabel =
		connectedAt && !Number.isNaN(connectedAt.getTime())
			? t("connectedOn", {
					date: new Intl.DateTimeFormat(locale, {
						dateStyle: "medium",
						timeStyle: "short",
					}).format(connectedAt),
				})
			: t("connectedDateUnavailable");

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
			toast.error(t("toast.notAvailable"));
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
								? t("toast.retryFailed")
								: t("toast.disconnectUnconfirmed"),
						);
					} else if (resultRecord?.remoteRevocation === "not_attempted") {
						toast.error(
							kind === "revocation_retry"
								? t("toast.retryNotAttempted")
								: t("toast.disconnectNotAttempted"),
						);
					} else if (kind === "revocation_retry") {
						toast.success(t("toast.revocationConfirmed"));
					} else {
						toast.success(t("toast.disconnected"));
					}
					router.refresh();
					return;
				}
				toast.success(t("toast.started"));
			} catch {
				toast.error(t("toast.failed"));
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
							{t(`callback.${callbackOutcome.reason}.title`)}
						</p>
						<p className="mt-1 leading-5">
							{t(`callback.${callbackOutcome.reason}.description`)}
						</p>
					</div>
				) : null}
				<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
					<div className="min-w-0">
						<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							{t("eyebrow")}
						</p>
						<h2 className="mt-1 font-heading text-xl font-semibold text-foreground">
							{t("title")}
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
						{t(`status.${connection.status}`)}
					</div>
				</div>
				{configurationMissing ? (
					<div
						className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-5 text-amber-950"
						role="alert"
					>
						<p className="font-medium">{t("configMissingTitle")}</p>
						<p className="mt-1">{t("configMissingBody")}</p>
					</div>
				) : null}
				{healthCheckUnavailable ? (
					<div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-5 text-amber-950">
						{t("healthUnavailable")}
					</div>
				) : null}
				{revocationPending ? (
					<div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
						<p className="font-medium">{t("revocationPendingTitle")}</p>
						<p className="mt-1 leading-5">{t("revocationPendingBody")}</p>
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
								{t("retryRevocation")}
							</Button>
						) : null}
					</div>
				) : null}

				{isConnected ? (
					<div className="grid gap-4 border-y border-border/60 py-4 sm:grid-cols-2">
						<div>
							<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
								{t("connectedAccount")}
							</p>
							<p className="mt-1 truncate text-sm font-medium text-foreground">
								{connection.googleDisplayName ||
									connection.googleEmail ||
									t("googleAccount")}
							</p>
							{connection.googleDisplayName && connection.googleEmail ? (
								<p className="truncate text-sm text-muted-foreground">
									{connection.googleEmail}
								</p>
							) : null}
						</div>
						<div>
							<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
								{t("connectionTiming")}
							</p>
							<p className="mt-1 text-sm text-foreground">{connectedAtLabel}</p>
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
									{t("disconnectTitle")}
								</p>
								<p
									id="disconnect-google-calendar-description"
									className="mt-1 text-sm leading-5 text-rose-900/80"
								>
									{t("disconnectBody")}
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
									{t("confirmDisconnect")}
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
									{t("keepIt")}
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
										{t("reauthorize")}
									</Button>
									<Tooltip>
										<TooltipTrigger
											render={
												<Button
													type="button"
													variant="ghost"
													size="icon-sm"
													aria-label={t("aboutReauth")}
													className="text-muted-foreground"
												/>
											}
										>
											<Info className="size-4" aria-hidden="true" />
										</TooltipTrigger>
										<TooltipContent>{t("reauthTooltip")}</TooltipContent>
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
									{isReconnect ? reconnectLabel : t("connect")}
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
									{t("disconnect")}
								</Button>
							) : null}
						</div>
					)}
					{isPending ? (
						<output className="text-sm text-muted-foreground">
							{t("updating")}
						</output>
					) : null}
				</div>
			</DataCardSection>
		</DataCard>
	);
}
