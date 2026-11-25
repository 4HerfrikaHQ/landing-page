import { getTranslations } from "next-intl/server";

export async function AboutMentor({
	displayName,
	bio,
}: {
	displayName: string;
	bio: string | null;
}) {
	if (!bio) return null;
	const t = await getTranslations("mentorProfile.about");

	return (
		<div>
			<span className="rounded-pill bg-surface-pink px-3 py-1.5 text-xs text-primary">
				{t("tag")}
			</span>
			<h2 className="mt-4 break-words text-[28px] font-bold leading-tight lg:text-4xl">
				{t.rich("title", {
					name: displayName,
					em: (chunks) => (
						<em className="font-playfair font-black text-primary">{chunks}</em>
					),
				})}
			</h2>
			<p className="mt-5 max-w-[62ch] whitespace-pre-wrap break-words text-[16px] leading-relaxed text-foreground/80 lg:text-[17px]">
				{bio}
			</p>
		</div>
	);
}
