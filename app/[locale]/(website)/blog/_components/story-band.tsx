import { getTranslations } from "next-intl/server";
import type { FeedCategory } from "../_feed";
import { SubmitStoryModal } from "./submit-story-modal";

export async function StoryBand({
	categories,
}: { categories: FeedCategory[] }) {
	const t = await getTranslations("blogPage");
	const options = categories.flatMap((category) =>
		category.id ? [{ id: category.id, name: category.name }] : [],
	);

	return (
		<section className="bg-surface-indigo px-4 py-16 lg:px-20 lg:py-24">
			<div className="mx-auto max-w-3xl text-center">
				<h2 className="text-[32px] font-bold leading-tight lg:text-5xl">
					{t("storyTitle")}{" "}
					<em className="font-playfair font-black text-primary-500">
						{t("storyEm")}
					</em>
				</h2>
				<p className="mt-4 text-[15px] text-muted-foreground lg:text-lg">
					{t("storyDescription")}
				</p>
				<div className="mt-8 flex justify-center">
					<SubmitStoryModal categories={options} />
				</div>
			</div>
		</section>
	);
}
