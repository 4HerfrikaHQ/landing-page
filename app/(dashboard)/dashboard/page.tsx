import { currentDbUser } from "@/src/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
	const user = await currentDbUser();
	redirect(user.role === "super_admin" ? "/dashboard/admin" : "/dashboard/mentor");
}
