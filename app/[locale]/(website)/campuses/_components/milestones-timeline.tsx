import type { Content } from "@prismicio/client";

type Milestone = Content.CampusDocumentDataMilestonesItem;

function formatDate(date: string | null | undefined) {
	if (!date) return "";
	return new Date(date).toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
	});
}

export function MilestonesTimeline({
	milestones,
	label,
}: {
	milestones: Milestone[];
	label: string;
}) {
	return (
		<ol aria-label={label} className="relative mx-auto max-w-3xl">
			<div
				aria-hidden
				className="absolute left-6 md:left-1/2 top-2 bottom-2 w-px md:-translate-x-1/2 bg-primary-500/40"
			/>

			{milestones.map((m, i) => {
				const right = i % 2 === 1;
				return (
					<li
						key={`milestone-${i + 1}`}
						className="relative grid md:grid-cols-2 gap-x-10 pb-10 md:pb-14 last:pb-0"
					>
						<span
							aria-hidden
							className="absolute left-6 md:left-1/2 top-3 -translate-x-1/2 size-3 rounded-full bg-primary-500 ring-4 ring-background"
						/>

						<div className="md:hidden pl-14 mb-3">
							<span className="inline-flex items-center rounded-full bg-primary-500 text-white text-xs font-semibold px-3 py-1">
								{formatDate(m.date)}
							</span>
						</div>

						<div
							className={
								right
									? "hidden md:flex md:order-2 md:pl-12 items-start"
									: "hidden md:flex md:pr-12 md:justify-end items-start"
							}
						>
							<span className="inline-flex items-center rounded-full bg-primary-500 text-white text-xs font-semibold px-3 py-1">
								{formatDate(m.date)}
							</span>
						</div>

						<div
							className={
								right
									? "pl-14 md:pl-0 md:pr-12 md:text-right md:order-1"
									: "pl-14 md:pl-12"
							}
						>
							<article className="rounded-2xl border border-[#E0E0E0] bg-white p-5 md:p-6 inline-block w-full md:max-w-md">
								<h3 className="text-lg md:text-xl font-semibold text-foreground leading-tight">
									{m.title}
								</h3>
								{m.description && (
									<p className="mt-2 text-sm md:text-base text-[#636363]">
										{m.description}
									</p>
								)}
							</article>
						</div>
					</li>
				);
			})}
		</ol>
	);
}
