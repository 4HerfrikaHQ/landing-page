import { currentUser } from "@/src/auth";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	await currentUser();
	return <>{children}</>;
}
