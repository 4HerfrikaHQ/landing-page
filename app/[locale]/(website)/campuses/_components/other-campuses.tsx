import { BlogCard } from "@/components/blog-card";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { getCampuses } from "../_actions";

export async function OtherCampuses({ currentUid }: { currentUid: string }) {
	const t = await getTranslations("campuses");
	const tc = await getTranslations("common");
	const all = await getCampuses().catch(() => []);
	const others = all.filter((c) => c.uid !== currentUid).slice(0, 3);

	if (others.length === 0) return null;

	return (
		<section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
				<div>
					<h2 className="text-3xl md:text-4xl lg:text-[42px] font-semibold text-foreground">
						{t("exploreOtherTitle")}
					</h2>
					<p className="mt-2 text-base md:text-lg text-foreground/60">
						{t("exploreOtherDescription")}
					</p>
				</div>
				<Button variant="outline" href="/campuses">
					{t("viewAllCampuses")}
				</Button>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				{others.map((campus) => (
					<BlogCard
						key={campus.id}
						uid={campus.uid ?? ""}
						href={`/campuses/${campus.uid}`}
						category={campus.data.country ?? campus.data.university ?? ""}
						title={campus.data.name ?? ""}
						description={campus.data.summary ?? ""}
						date={new Date(campus.last_publication_date).toLocaleDateString(undefined, {
							year: "numeric",
							month: "short",
							day: "numeric",
						})}
						imageUrl={campus.data.cover_image?.url ?? ""}
						readMoreLabel={tc("readMore")}
					/>
				))}
			</div>
		</section>
	);
}
