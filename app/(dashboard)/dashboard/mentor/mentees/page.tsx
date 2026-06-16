import { PageHeader } from "@/components/dashboard/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { loadMentees } from "./_actions";
import { MenteesGrid } from "./_components/mentees-grid";

const PAGE_SIZE = 20;

export default async function MenteesPage({
	searchParams,
}: {
	searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
}) {
	const sp = await searchParams;
	const page = Math.max(1, Number(sp.page) || 1);

	const result = await loadMentees({
		query: sp.q,
		sort: sp.sort,
		page,
		pageSize: PAGE_SIZE,
	});

	if (!result.ok) {
		return (
			<div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
				<p className="text-sm text-muted-foreground">
					No mentor profile linked to your account.
				</p>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
			<FadeIn>
				<PageHeader
					title="Mentees"
					subtitle="Everyone who has booked a call with you."
				/>
			</FadeIn>
			<FadeIn delay={0.05}>
				<MenteesGrid
					mentees={result.rows}
					page={page}
					pageSize={PAGE_SIZE}
					total={result.total}
				/>
			</FadeIn>
		</div>
	);
}
