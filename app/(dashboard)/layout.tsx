import { TooltipProvider } from "@/components/ui/tooltip";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<NuqsAdapter>
			<TooltipProvider>{children}</TooltipProvider>
		</NuqsAdapter>
	);
}
