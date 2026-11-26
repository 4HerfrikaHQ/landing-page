"use client";

import { RollLabel } from "@/components/ui/roll-label";
import type { ReactNode } from "react";
import { chooseTopic } from "../_lib/choose-topic";

export function PartnerButton({ children }: { children: ReactNode }) {
	return (
		<button
			type="button"
			onClick={() => chooseTopic("partner")}
			className="press mt-7 cursor-pointer inline-flex h-12 w-fit items-center rounded-full bg-primary-500 px-6 font-medium text-white outline-none transition hover:no-underline hover:brightness-90 focus-visible:ring-4 focus-visible:ring-white/60"
		>
			<RollLabel>{children}</RollLabel>
		</button>
	);
}
