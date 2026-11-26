import { RollLabel } from "@/components/ui/roll-label";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

export async function VolunteerBand() {
	const t = await getTranslations("mentorProfile.volunteer");
	const tc = await getTranslations("common");

	return (
		<section className="flex flex-col overflow-hidden rounded-t-[40px] lg:min-h-[520px] lg:flex-row lg:rounded-t-[64px]">
			<div className="bg-secondary px-6 py-14 text-white lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:px-20">
				<span className="w-fit rounded-pill bg-surface-pink px-3 py-1.5 text-xs text-primary">
					{t("tag")}
				</span>
				<h2 className="mt-4 text-[32px] font-bold leading-tight lg:text-5xl">
					{t.rich("title", {
						em: (chunks) => (
							<em className="font-playfair font-black text-primary-bright">
								{chunks}
							</em>
						),
					})}
				</h2>
				<p className="mt-4 text-[15px] leading-relaxed text-[#c2c4e0] lg:text-lg">
					{t("body")}
				</p>
				<div className="mt-8 flex flex-col gap-3 sm:flex-row">
					<Link
						href="/careercorner/apply"
						className="press inline-flex h-12 items-center justify-center rounded-pill bg-primary-bright px-6 font-semibold text-secondary outline-none transition-colors hover:bg-white hover:no-underline focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
					>
						<RollLabel>{tc("volunteerAsMentor")}</RollLabel>
					</Link>
				</div>
			</div>
			<div className="relative aspect-[4/3] w-full lg:aspect-auto lg:w-1/2">
				<Image
					src="/assets/academy/tech-source.jpg"
					alt={t("imageAlt")}
					fill
					sizes="(min-width: 1024px) 50vw, 100vw"
					className="object-cover"
				/>
			</div>
		</section>
	);
}
