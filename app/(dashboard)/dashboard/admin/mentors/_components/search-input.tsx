"use client";

import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";

export function SearchInput() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const timer = useRef<ReturnType<typeof setTimeout>>(null);

	function handleChange(value: string) {
		if (timer.current) clearTimeout(timer.current);
		timer.current = setTimeout(() => {
			const params = new URLSearchParams(searchParams.toString());
			if (value) {
				params.set("q", value);
			} else {
				params.delete("q");
			}
			router.replace(`?${params.toString()}`);
		}, 300);
	}

	return (
		<Input
			defaultValue={searchParams.get("q") ?? ""}
			onChange={(e) => handleChange(e.target.value)}
			placeholder="Search by name or position…"
			className="max-w-xs h-9 text-sm"
		/>
	);
}
