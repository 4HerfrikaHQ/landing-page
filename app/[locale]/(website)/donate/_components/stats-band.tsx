import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

const STATS = [
	{ value: "3,000+", key: "girlsMentored" },
	{ value: "1,000+", key: "graduates" },
	{ value: "25+", key: "campuses" },
	{ value: "5", key: "countries" },
] as const;

export async function StatsBand() {
	const t = await getTranslations("donate.stats");
	return (
		<section className="bg-primary-500/2 px-4 py-12 lg:px-20 lg:py-16">
			<div className="mx-auto max-w-6xl">
				<dl className="grid grid-cols-2 gap-y-8 lg:grid-cols-4 lg:divide-x lg:divide-primary-500">
					{STATS.map((stat) => (
						<div
							key={stat.key}
							className="flex flex-col-reverse px-2 text-center"
						>
							<dt className="mt-1 text-[15px] font-medium">
								{t(stat.key)}
								<span className="block text-xs font-normal text-muted-foreground">
									{t("period")}
								</span>
							</dt>
							<dd className="text-[40px] font-semibold tabular-nums text-secondary-500 lg:text-5xl">
								{stat.value}
							</dd>
						</div>
					))}
				</dl>
				<p className="mt-8 text-center text-[15px] text-muted-foreground">
					{t("source")}{" "}
					<Link
						href="/impact"
						className="font-medium text-primary-500 underline underline-offset-4"
					>
						{t("reportLink")}
					</Link>
				</p>
			</div>
		</section>
	);
}
