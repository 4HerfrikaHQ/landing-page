import { cn } from "@/utils/cn";

/** Booking lifecycle statuses (from the bookings schema). */
export type BookingStatus = "confirmed" | "completed" | "cancelled" | "no_show";

/** Mentor application statuses. */
export type ApplicationStatus = "pending" | "approved" | "rejected";

export type BadgeStatus = BookingStatus | ApplicationStatus;

const STATUS_STYLES: Record<BadgeStatus, string> = {
	// Booking
	confirmed: "bg-blue-50 text-blue-700 border-blue-200",
	completed: "bg-green-50 text-green-700 border-green-200",
	cancelled: "bg-gray-100 text-gray-600 border-gray-200",
	no_show: "bg-red-50 text-red-700 border-red-200",
	// Application
	pending: "bg-amber-50 text-amber-700 border-amber-200",
	approved: "bg-green-50 text-green-700 border-green-200",
	rejected: "bg-gray-100 text-gray-600 border-gray-200",
};

const FALLBACK_STYLE = "bg-gray-100 text-gray-600 border-gray-200";

const STATUS_LABELS: Partial<Record<BadgeStatus, string>> = {
	no_show: "no show",
};

interface StatusBadgeProps {
	/** Booking or application status. Unknown values render with a neutral style. */
	status: BadgeStatus | string;
	/** Override the displayed text. Defaults to a humanized status. */
	label?: string;
	className?: string;
}

/**
 * Single source of truth for booking + application status colors.
 * Use across mentor and admin dashboards.
 */
export function StatusBadge({ status, label, className }: StatusBadgeProps) {
	const style = STATUS_STYLES[status as BadgeStatus] ?? FALLBACK_STYLE;
	const text =
		label ?? STATUS_LABELS[status as BadgeStatus] ?? status.replace(/_/g, " ");

	return (
		<span
			className={cn(
				"inline-flex items-center rounded border px-2 py-0.5 text-xs uppercase tracking-wide",
				style,
				className,
			)}
		>
			{text}
		</span>
	);
}
