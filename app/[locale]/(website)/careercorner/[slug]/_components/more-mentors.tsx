import { MentorImage } from "@/components/mentor-image";
import { FadeIn } from "@/components/motion/fade-in";
import { RevealGroup } from "@/components/motion/reveal-group";
import { Link } from "@/i18n/navigation";
import { UserRound } from "lucide-react";
import type { Route } from "next";
import { getTranslations } from "next-intl/server";
import type { getSimilarMentors } from "../_similar-mentors";

const FOCUS_RING =
	"outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export async function MoreMentors({
	mentors,
}: { mentors: Awaited<ReturnType<typeof getSimilarMentors>> }) {
	if (mentors.length === 0) return null;
	const t = await getTranslations("mentorProfile.more");

	return (
		<section className="bg-surface-pink/40 px-4 py-14 lg:px-20 lg:py-20">
			<div className="mx-auto max-w-6xl">
				<FadeIn className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
					<h2 className="text-[28px] font-bold leading-tight lg:text-4xl">
						{t.rich("title", {
							em: (chunks) => (
								<em className="font-playfair font-black text-primary">
									{chunks}
								</em>
							),
						})}
					</h2>
					<Link
						href="/careercorner"
						className={`inline-flex h-11 items-center rounded-pill text-[15px] font-medium text-primary hover:no-underline ${FOCUS_RING}`}
					>
						{t("all")} →
					</Link>
				</FadeIn>
				<RevealGroup
					as="ul"
					className="-mx-4 mt-6 flex snap-x gap-3 overflow-x-auto px-4 pb-4 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:px-0"
				>
					{mentors.map((mentor) => {
						const displayName = mentor.nickname || mentor.name;
						return (
							<li
								key={mentor.id}
								className="w-[220px] shrink-0 snap-start lg:w-auto"
							>
								<Link
									href={`/careercorner/${mentor.slug}` as Route}
									className={`flex h-full flex-col rounded-2xl bg-white p-2.5 shadow-[0_12px_24px_rgba(0,0,0,0.10)] hover:no-underline lg:rounded-[20px] lg:p-3 ${FOCUS_RING}`}
								>
									<div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-surface-pink lg:rounded-[24px]">
										{mentor.image ? (
											<MentorImage
												src={mentor.image}
												alt=""
												crop={mentor.image_crop}
												aspectRatio={4 / 5}
												sizes="(min-width: 1024px) 260px, 220px"
												className="absolute inset-0 size-full"
											/>
										) : (
											<div className="absolute inset-0 grid place-items-center text-primary">
												<UserRound className="size-12" aria-hidden="true" />
											</div>
										)}
									</div>
									<div className="flex flex-1 flex-col p-1.5 pt-3 lg:p-3">
										<h3 className="break-words font-semibold leading-snug">
											{displayName}
										</h3>
										<p className="mb-4 flex-1 break-words text-[15px] capitalize text-muted-foreground">
											{mentor.position}
										</p>
										<span className="inline-flex min-h-11 items-center justify-center rounded-pill bg-primary px-3 text-center text-[15px] font-medium text-primary-foreground">
											{t("book")}
										</span>
									</div>
								</Link>
							</li>
						);
					})}
				</RevealGroup>
			</div>
		</section>
	);
}
