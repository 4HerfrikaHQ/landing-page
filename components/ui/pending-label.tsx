import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export function PendingLabel({
	pending,
	pendingLabel,
	children,
}: {
	pending: boolean;
	pendingLabel: string;
	children: ReactNode;
}) {
	return (
		<span className="relative inline-flex items-center justify-center">
			<span
				aria-hidden={pending}
				data-pending={pending}
				className="inline-flex items-center justify-center gap-2 transition-[opacity,filter] duration-150 ease-out data-[pending=true]:opacity-0 data-[pending=true]:blur-[2px]"
			>
				{children}
			</span>
			<span
				aria-hidden={!pending}
				data-pending={pending}
				className="absolute inset-0 inline-flex items-center justify-center opacity-0 blur-[2px] transition-[opacity,filter] duration-150 ease-out data-[pending=true]:opacity-100 data-[pending=true]:blur-none"
			>
				<Loader2
					aria-hidden="true"
					className="size-4 animate-spin motion-reduce:animate-none"
				/>
				{pending ? <span className="sr-only">{pendingLabel}</span> : null}
			</span>
		</span>
	);
}
