import { cn } from "@/utils/cn";
import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";

function NativeSelect({ className, ...props }: ComponentProps<"select">) {
	return (
		<span className="relative block">
			<select
				data-slot="native-select"
				className={cn(
					"h-12 w-full appearance-none rounded-xl border border-input bg-white py-0 pr-11 pl-4 text-base text-foreground transition-[border-color,box-shadow] duration-200 outline-none focus-visible:border-primary-500 focus-visible:ring-3 focus-visible:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
					className,
				)}
				{...props}
			/>
			<ChevronDown
				aria-hidden="true"
				className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-muted-foreground"
			/>
		</span>
	);
}

export { NativeSelect };
