import Image from "next/image";

type MetaItem = { icon: React.ReactNode; label: string };
type Tag = { label: string; color?: string };

export function ProjectHero({
	title,
	coverSrc,
	coverAlt,
	tags = [],
	meta = [],
}: {
	title: string;
	coverSrc: string;
	coverAlt: string;
	tags?: Tag[];
	meta?: MetaItem[];
}) {
	return (
		<header className="space-y-4 md:space-y-6">
			<h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-gray-900">
				{title}
			</h1>

			<div className="relative rounded-2xl overflow-hidden border border-gray-200 h-44 sm:h-56 md:h-[360px] lg:h-[440px] xl:h-[500px]">
				<Image
					src={coverSrc}
					alt={coverAlt}
					fill
					priority
					sizes="(min-width:1280px) 1100px, (min-width:1024px) 900px, 100vw"
					className="object-cover object-top"
				/>

				{tags?.length > 0 && (
					<div className="absolute left-3 bottom-3 flex flex-wrap gap-2">
						{tags.map((t) => (
							<span
								key={t.label}
								className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ${
									t.color ?? "border-indigo-100 bg-indigo-50 text-indigo-700"
								}`}
							>
								{t.label}
							</span>
						))}
					</div>
				)}
			</div>

			{meta?.length > 0 && (
				<ul className="flex flex-wrap gap-4 text-sm text-gray-600">
					{meta.map((m) => (
						<li key={m.label} className="inline-flex items-center gap-2">
							<span aria-hidden>{m.icon}</span>
							<span>{m.label}</span>
						</li>
					))}
				</ul>
			)}
		</header>
	);
}
