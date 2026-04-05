import { TooltipProvider } from "@/components/ui/tooltip";
import { currentUser } from "@/src/auth";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <TooltipProvider>{children}</TooltipProvider>;
}
