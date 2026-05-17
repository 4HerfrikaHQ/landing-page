import { PrismicNextImage } from "@prismicio/next";
import { PrismicNextLink } from "@prismicio/next";
import type { Content, ImageField } from "@prismicio/client";

type Lead = {
	name: string;
	role?: string | null;
	bio?: string | null;
	photo?: ImageField | null;
	socials?: Content.CampusDocumentDataLeadAmbassadorSocialsItem[] | null;
	heading: string;
};

export function MeetTheLead({
	name,
	role,
	bio,
	photo,
	socials,
	heading,
}: Lead) {
	if (!name) return null;
	return (
		<section className="mt-12 md:mt-16">
			<h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
				{heading}
			</h2>
			<div className="rounded-2xl border border-[#E0E0E0] bg-white p-5 md:p-8 grid grid-cols-1 sm:grid-cols-[160px_1fr] md:grid-cols-[200px_1fr] gap-5 md:gap-8 items-center sm:items-start">
				{photo?.url ? (
					<div className="relative w-32 h-32 sm:w-full sm:h-40 md:h-50 rounded-2xl overflow-hidden">
						<PrismicNextImage
							field={photo}
							fill
							sizes="200px"
							className="object-cover"
						/>
					</div>
				) : (
					<div className="w-32 h-32 sm:w-full sm:h-40 md:h-50 rounded-2xl bg-muted flex items-center justify-center text-3xl md:text-5xl font-bold text-primary-500">
						{name.charAt(0)}
					</div>
				)}
				<div className="flex flex-col">
					<span className="text-xs font-medium uppercase tracking-wide text-primary-500">
						{role ? "Lead Ambassador" : "Lead Ambassador"}
					</span>
					<h3 className="mt-2 text-xl md:text-2xl font-semibold text-foreground">
						{name}
					</h3>
					{role && (
						<p className="mt-1 text-sm md:text-base text-[#636363]">{role}</p>
					)}
					{bio && (
						<p className="mt-4 text-sm md:text-base text-foreground leading-relaxed">
							{bio}
						</p>
					)}
					{socials && socials.length > 0 && (
						<ul className="mt-5 flex flex-wrap gap-2">
							{socials.map((s, i) => (
								<li key={`social-${i + 1}`}>
									<PrismicNextLink
										field={s.url}
										className="inline-flex items-center rounded-full border border-[#E0E0E0] px-3 py-1 text-xs font-medium text-[#636363] hover:border-primary-500 hover:text-primary-500 transition-colors"
									>
										{s.platform}
									</PrismicNextLink>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</section>
	);
}
