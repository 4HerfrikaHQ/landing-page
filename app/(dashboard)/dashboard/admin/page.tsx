import { currentDbUser } from "@/src/auth";
import { db } from "@/src/db";
import { schema } from "@/src/db";
import { count, eq } from "drizzle-orm";
import Link from "next/link";
import { unauthorized } from "next/navigation";

export default async function AdminDashboardPage() {
	const user = await currentDbUser();
	if (user.role !== "super_admin") unauthorized();

	const [[{ mentorCount }], [{ adminCount }]] = await Promise.all([
		db.select({ mentorCount: count() }).from(schema.mentors),
		db
			.select({ adminCount: count() })
			.from(schema.users)
			.where(eq(schema.users.role, "super_admin")),
	]);

	const firstName = user.name.split(" ")[0];

	return (
		<div className="p-8 max-w-3xl mx-auto">
			<div className="mb-10">
				<h1 className="text-2xl font-semibold text-gray-900">
					Hi, {firstName} 👋
				</h1>
				<p className="text-sm text-gray-500 mt-1">Here's a quick overview.</p>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<Link
					href="/dashboard/admin/mentors"
					className="group border rounded-xl p-6 hover:border-gray-300 hover:shadow-sm transition-all bg-white"
				>
					<p className="text-3xl font-semibold text-gray-900 mb-1">{mentorCount}</p>
					<p className="text-sm text-gray-500">Mentors</p>
					<p className="text-xs text-primary-500 mt-4 group-hover:underline">
						Manage mentors →
					</p>
				</Link>

				<Link
					href="/dashboard/admin/admins"
					className="group border rounded-xl p-6 hover:border-gray-300 hover:shadow-sm transition-all bg-white"
				>
					<p className="text-3xl font-semibold text-gray-900 mb-1">{adminCount}</p>
					<p className="text-sm text-gray-500">Admins</p>
					<p className="text-xs text-primary-500 mt-4 group-hover:underline">
						Manage admins →
					</p>
				</Link>
			</div>
		</div>
	);
}
