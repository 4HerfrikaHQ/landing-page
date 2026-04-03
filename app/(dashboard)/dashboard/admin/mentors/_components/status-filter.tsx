"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/utils/cn";

const OPTIONS = [
	{ label: "All", value: undefined },
	{ label: "Active", value: "active" },
	{ label: "Inactive", value: "inactive" },
] as const;

export function StatusFilter() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const current = searchParams.get("status") ?? undefined;

	function setStatus(value: string | undefined) {
		const params = new URLSearchParams(searchParams.toString());
		if (value) {
			params.set("status", value);
		} else {
			params.delete("status");
		}
		router.replace(`?${params.toString()}`);
	}

	return (
		<div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg w-fit">
			{OPTIONS.map((option) => {
				const isActive = current === option.value;
				return (
					<button
						key={option.label}
						onClick={() => setStatus(option.value)}
						className={cn(
							"px-3 py-1 text-sm rounded-md transition-all cursor-pointer",
							isActive
								? "bg-white text-gray-900 shadow-sm font-medium"
								: "text-gray-500 hover:text-gray-700",
						)}
					>
						{option.label}
					</button>
				);
			})}
		</div>
	);
}
