import { getTranslations } from "next-intl/server";

const STEP_KEYS = ["one", "two", "three"] as const;

export async function NextSteps({ displayName }: { displayName: string }) {
	const t = await getTranslations("mentorProfile.steps");

	return (
		<div>
			<span className="rounded-pill bg-surface-pink px-3 py-1.5 text-xs text-primary">
				{t("tag")}
			</span>
			<h2 className="mt-4 text-[28px] font-bold leading-tight lg:text-4xl">
				{t("title")}
			</h2>
			<ol className="mt-6 space-y-3">
				{STEP_KEYS.map((key, index) => (
					<li key={key} className="flex gap-4 rounded-[24px] bg-muted p-5">
						<span className="grid size-11 shrink-0 place-items-center rounded-pill bg-primary font-semibold text-primary-foreground">
							{index + 1}
						</span>
						<div>
							<h3 className="font-semibold">
								{t(`${key}.title`, { name: displayName })}
							</h3>
							<p className="mt-1 text-[15px] text-muted-foreground">
								{t(`${key}.body`, { name: displayName })}
							</p>
						</div>
					</li>
				))}
			</ol>
		</div>
	);
}
