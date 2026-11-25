import { MentorImage } from "@/components/mentor-image";
import { Link } from "@/i18n/navigation";
import type { MentorImageCrop } from "@/src/lib/mentor-image";
import {
	ChevronLeft,
	CircleCheck,
	Clock,
	Linkedin,
	UserRound,
	Video,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

const FOCUS_RING =
	"outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export async function ProfileHero({
	displayName,
	position,
	image,
	imageCrop,
	linkedinUrl,
	freeThisWeek,
	canBook,
}: {
	displayName: string;
	position: string | null;
	image: string | null;
	imageCrop: MentorImageCrop | null;
	linkedinUrl: string | null;
	freeThisWeek: boolean;
	canBook: boolean;
}) {
	const t = await getTranslations("mentorProfile");
	const tc = await getTranslations("common");

	return (
		<div className="mx-auto max-w-6xl">
			<Link
				href="/careercorner"
				className={`inline-flex h-11 items-center gap-1.5 rounded-pill pr-3 text-[15px] font-medium text-muted-foreground transition-colors hover:text-primary hover:no-underline ${FOCUS_RING}`}
			>
				<ChevronLeft className="size-4" aria-hidden="true" />
				{t("back")}
			</Link>
			<article className="mt-3 grid overflow-hidden rounded-[20px] bg-surface-pink shadow-[0_12px_24px_rgba(0,0,0,0.08)] lg:grid-cols-[1fr_480px] lg:rounded-[40px]">
				<div className="relative aspect-square lg:order-2">
					<HeroPhoto
						image={image}
						crop={imageCrop}
						alt={t("hero.photoFallback", { name: displayName })}
					/>
					<FreeBadge visible={freeThisWeek} label={t("hero.freeThisWeek")} />
				</div>
				<div className="flex min-w-0 flex-col justify-center gap-4 p-6 lg:order-1 lg:p-14">
					<span className="w-fit rounded-pill bg-white px-3 py-1.5 text-xs font-medium text-primary">
						{t("hero.eyebrow")}
					</span>
					<h1 className="break-words text-[40px] font-bold leading-[1.05] tracking-tight lg:text-[60px]">
						{t("hero.titleLead")}
						<br />
						{t.rich("hero.titleWith", {
							name: displayName,
							em: (chunks) => (
								<em className="font-playfair font-black text-primary">
									{chunks}
								</em>
							),
						})}
					</h1>
					<Position position={position} />
					<ul className="flex flex-wrap gap-x-5 gap-y-1 text-[15px] text-muted-foreground">
						<li className="flex items-center gap-1.5">
							<Clock className="size-4 text-primary" aria-hidden="true" />
							{t("hero.duration")}
						</li>
						<li className="flex items-center gap-1.5">
							<Video className="size-4 text-primary" aria-hidden="true" />
							{t("hero.meet")}
						</li>
						<li className="flex items-center gap-1.5">
							<CircleCheck className="size-4 text-primary" aria-hidden="true" />
							{t("hero.free")}
						</li>
					</ul>
					<div className="mt-2 flex flex-col gap-3 sm:flex-row">
						<BookLink visible={canBook} label={t("hero.bookCta")} />
						<LinkedinLink
							url={linkedinUrl}
							label={tc("messageOnLinkedin")}
							newTabLabel={t("hero.newTab")}
						/>
					</div>
				</div>
			</article>
		</div>
	);
}

function HeroPhoto({
	image,
	crop,
	alt,
}: {
	image: string | null;
	crop: MentorImageCrop | null;
	alt: string;
}) {
	if (!image) {
		return (
			<div className="absolute inset-0 grid place-items-center bg-primary/10 text-primary">
				<UserRound className="size-24" aria-hidden="true" />
			</div>
		);
	}
	return (
		<MentorImage
			src={image}
			alt={alt}
			crop={crop}
			aspectRatio={1}
			sizes="(min-width: 1024px) 480px, 100vw"
			className="absolute inset-0 size-full"
		/>
	);
}

function FreeBadge({ visible, label }: { visible: boolean; label: string }) {
	if (!visible) return null;
	return (
		<span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-pill bg-white px-3 py-1.5 text-xs font-semibold shadow-sm">
			<span className="size-2 rounded-pill bg-[#14703f]" aria-hidden="true" />
			{label}
		</span>
	);
}

function Position({ position }: { position: string | null }) {
	if (!position) return null;
	return (
		<p className="break-words text-[17px] capitalize text-muted-foreground lg:text-xl">
			{position}
		</p>
	);
}

function BookLink({ visible, label }: { visible: boolean; label: string }) {
	if (!visible) return null;
	return (
		<a
			href="#book"
			className={`inline-flex min-h-12 items-center justify-center rounded-pill bg-primary px-6 py-2 text-center font-medium text-primary-foreground transition-colors hover:bg-primary-700 hover:no-underline ${FOCUS_RING}`}
		>
			{label}
		</a>
	);
}

function LinkedinLink({
	url,
	label,
	newTabLabel,
}: {
	url: string | null;
	label: string;
	newTabLabel: string;
}) {
	if (!url) return null;
	return (
		<a
			href={url}
			target="_blank"
			rel="noreferrer"
			className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-pill border-2 border-primary bg-white px-6 py-2 text-center font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground hover:no-underline ${FOCUS_RING}`}
		>
			<Linkedin className="size-4 shrink-0" aria-hidden="true" />
			{label}
			<span className="sr-only">{newTabLabel}</span>
		</a>
	);
}
