import type { ReactNode } from "react";

export function SectionEyebrow({ children }: { children: ReactNode }) {
	return (
		<span className="inline-flex rounded-pill bg-surface-pink px-3 py-1.5 text-xs text-primary-500">
			{children}
		</span>
	);
}
