import { getTranslations } from "next-intl/server";
import { impactReports } from "../_schema";
import { ReportCard } from "./report-card";

export async function ReportsSection() {
	const t = await getTranslations("impactIndex");

	return (
		<section id="reports" className="scroll-mt-28 px-4 py-14 lg:px-20 lg:py-24">
			<div className="mx-auto max-w-6xl">
				<span className="inline-flex rounded-full bg-surface-pink px-3 py-1.5 text-xs text-primary-500">
					{t("reportsPill")}
				</span>
				<h2 className="mt-4 text-4xl font-bold leading-tight lg:text-5xl">
					{t("reportsFirst")}
					<br />
					<em className="font-playfair font-black text-primary-500">
						{t("reportsSecond")}
					</em>
				</h2>
				<div className="mt-10 flex flex-col gap-8">
					{impactReports.map((report) => (
						<ReportCard key={report.key} report={report} />
					))}
				</div>
			</div>
		</section>
	);
}
