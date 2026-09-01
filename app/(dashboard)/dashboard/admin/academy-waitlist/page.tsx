import { PageHeader } from "@/components/dashboard/page-header";
import { currentDbUser } from "@/src/auth";
import { db, schema } from "@/src/db";
import type { Academy } from "@/src/db/schema/tables";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { unauthorized } from "next/navigation";
import { AcademyWaitlistTable } from "./_components/academy-waitlist-table";

const PAGE_SIZE = 20;

export default async function AcademyWaitlistPage({
	searchParams,
}: {
	searchParams: Promise<{
		academy?: string;
		q?: string;
		page?: string;
		sort?: string;
		order?: string;
	}>;
}) {
	const user = await currentDbUser();
	if (user.role !== "super_admin") unauthorized();
	const sp = await searchParams;
	const academy = ["tech", "business", "climate"].includes(sp.academy ?? "")
		? (sp.academy as Academy)
		: undefined;
	const q = sp.q?.trim();
	const page = Math.max(1, Number(sp.page) || 1);
	const sort = sp.order === "asc" || sp.sort === "oldest" ? "oldest" : "newest";
	const where = and(
		academy ? eq(schema.academyWaitlistEntries.academy, academy) : undefined,
		q
			? or(
					ilike(schema.academyWaitlistEntries.name, `%${q}%`),
					ilike(schema.academyWaitlistEntries.email, `%${q}%`),
					ilike(schema.academyWaitlistEntries.location, `%${q}%`),
				)
			: undefined,
	);
	const [rows, counts, totalRows] = await Promise.all([
		db
			.select()
			.from(schema.academyWaitlistEntries)
			.where(where)
			.orderBy(
				sort === "oldest"
					? asc(schema.academyWaitlistEntries.created_at)
					: desc(schema.academyWaitlistEntries.created_at),
			)
			.limit(PAGE_SIZE)
			.offset((page - 1) * PAGE_SIZE),
		db
			.select({
				academy: schema.academyWaitlistEntries.academy,
				count: sql<number>`count(*)::int`,
			})
			.from(schema.academyWaitlistEntries)
			.groupBy(schema.academyWaitlistEntries.academy),
		db
			.select({ count: sql<number>`count(*)::int` })
			.from(schema.academyWaitlistEntries)
			.where(where),
	]);
	const total = totalRows[0]?.count ?? 0;
	return (
		<div>
			<PageHeader
				title="Academy waitlist"
				subtitle="People interested in upcoming Academy programmes."
			/>
			<AcademyWaitlistTable
				rows={rows}
				academy={academy}
				counts={Object.fromEntries(
					counts.map((entry) => [entry.academy, entry.count]),
				)}
				page={page}
				pageSize={PAGE_SIZE}
				total={total}
			/>
		</div>
	);
}
