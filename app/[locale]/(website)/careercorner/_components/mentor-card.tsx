"use client";

import { MentorImage } from "@/components/mentor-image";
import { RollLabel } from "@/components/ui/roll-label";
import type { DbMentorWithAvailability } from "@/src/db/schema/tables";
import { UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { BookCallLink } from "./book-call-link";

export function MentorCard({ mentor }: { mentor: DbMentorWithAvailability }) {
	const tc = useTranslations("common");
	const t = useTranslations("careers");
	const displayName = mentor.nickname || mentor.name;

	return (
		<article className="flex h-full flex-col rounded-2xl bg-white p-2.5 shadow-[0_12px_24px_rgba(0,0,0,0.10)] motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:-translate-y-1 lg:rounded-[20px] lg:p-3">
			<div className="relative aspect-4/5 w-full overflow-hidden rounded-xl lg:rounded-3xl">
				<CardPhoto mentor={mentor} />
			</div>
			<div className="flex flex-1 flex-col p-1.5 pt-3 lg:p-3">
				<h3 className="font-semibold leading-snug text-foreground">
					{displayName}
				</h3>
				<p className="mb-4 flex-1 text-[15px] capitalize leading-snug text-muted-foreground">
					{mentor.position}
				</p>
				<BookCallLink
					mentor={{ id: mentor.id, slug: mentor.slug, name: displayName }}
					source="directory"
					ariaLabel={t("bookCallWith", { name: displayName })}
					className="press inline-flex h-11 items-center justify-center rounded-pill bg-primary-500 text-[15px] font-medium text-white transition-[filter] hover:no-underline hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
				>
					<RollLabel>{tc("bookACall")}</RollLabel>
				</BookCallLink>
			</div>
		</article>
	);
}

function CardPhoto({ mentor }: { mentor: DbMentorWithAvailability }) {
	if (!mentor.image) {
		return (
			<div className="absolute inset-0 flex items-center justify-center bg-surface-pink">
				<UserRound className="size-20 text-primary-500/60" />
			</div>
		);
	}

	return (
		<MentorImage
			src={mentor.image}
			alt=""
			crop={mentor.image_crop}
			sizes="(max-width: 1024px) 50vw, 25vw"
			className="absolute inset-0"
		/>
	);
}
