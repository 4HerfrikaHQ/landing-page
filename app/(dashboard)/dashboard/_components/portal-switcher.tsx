"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

type Portal = "admin" | "mentor";

const PORTAL_LABELS: Record<Portal, string> = {
	admin: "Admin",
	mentor: "Mentor",
};

export function PortalSwitcher({
	portal,
	canSwitch,
}: {
	portal: Portal;
	canSwitch: boolean;
}) {
	const router = useRouter();

	if (!canSwitch) {
		return <span className="font-medium text-foreground">{PORTAL_LABELS[portal]}</span>;
	}

	return (
		<Select
			value={portal}
			onValueChange={(value) => {
				if (!value || value === portal) return;
				router.push(
					value === "admin"
						? "/dashboard/admin/mentors"
						: "/dashboard/mentor",
				);
			}}
		>
			<SelectTrigger
				aria-label="Switch portal"
				className="h-9 min-w-28 border-transparent bg-transparent px-2 text-base font-medium hover:bg-muted focus-visible:border-ring"
			>
				<SelectValue>{PORTAL_LABELS[portal]}</SelectValue>
			</SelectTrigger>
			<SelectContent className="min-w-36 p-1">
				<SelectItem value="admin" className="py-2">
					Admin
				</SelectItem>
				<SelectItem value="mentor" className="py-2">
					Mentor
				</SelectItem>
			</SelectContent>
		</Select>
	);
}
