"use client";

import { Link } from "@/i18n/navigation";
import { cn } from "@/utils/cn";
import { useTranslations } from "next-intl";
import { JOIN_US_URL } from "../navigation";
import {
	DONATE_LINK_STYLES,
	JOIN_US_LINK_STYLES,
	NAV_FOCUS_RING,
} from "./nav-styles";

type ActionLinkProps = {
	className?: string;
	onNavigate?: () => void;
};

export function DonateLink({ className, onNavigate }: ActionLinkProps) {
	const t = useTranslations("common");
	return (
		<Link
			href="/donate"
			onClick={onNavigate}
			className={cn(DONATE_LINK_STYLES, NAV_FOCUS_RING, className)}
		>
			{t("donate")}
		</Link>
	);
}

export function JoinUsLink({ className, onNavigate }: ActionLinkProps) {
	const t = useTranslations("common");
	return (
		<a
			href={JOIN_US_URL}
			target="_blank"
			rel="noreferrer"
			onClick={onNavigate}
			className={cn(JOIN_US_LINK_STYLES, NAV_FOCUS_RING, className)}
		>
			{t("joinUs")}
		</a>
	);
}
