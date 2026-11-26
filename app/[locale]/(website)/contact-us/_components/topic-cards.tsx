"use client";

import {
	ArrowRight,
	Check,
	GraduationCap,
	Handshake,
	type LucideIcon,
	Megaphone,
	MessageCircle,
	Newspaper,
	Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { chooseTopic } from "../_lib/choose-topic";
import { useContactSession } from "../_lib/use-contact-session";
import { type Topic, topics } from "../_schema";

const TOPIC_ICONS: Record<Topic, LucideIcon> = {
	partner: Handshake,
	press: Newspaper,
	mentorship: Users,
	academy: GraduationCap,
	ambassador: Megaphone,
	other: MessageCircle,
};

function SelectionMark({ selected }: { selected: boolean }) {
	const Mark = selected ? Check : ArrowRight;
	return (
		<Mark className="size-5 text-primary-500 lg:mt-auto" aria-hidden="true" />
	);
}

function TopicCard({ topic }: { topic: Topic }) {
	const t = useTranslations("contact");
	const { topic: selected } = useContactSession();
	const isSelected = selected === topic;
	const Icon = TOPIC_ICONS[topic];

	return (
		<button
			type="button"
			onClick={() => chooseTopic(topic)}
			aria-pressed={isSelected}
			data-selected={isSelected || undefined}
			className="group flex w-full cursor-pointer text-left min-h-20 items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_12px_24px_rgba(0,0,0,0.10)] outline-none ring-2 ring-transparent transition hover:no-underline focus-visible:ring-primary-500 data-selected:ring-primary-500 lg:flex-col lg:items-start lg:rounded-[20px] lg:p-7"
		>
			<span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-pink text-primary-500 transition-colors group-data-selected:bg-primary-500 group-data-selected:text-white">
				<Icon className="size-6" aria-hidden="true" />
			</span>
			<span className="min-w-0 flex-1">
				<span className="block text-lg font-semibold">
					{t(`topics.${topic}.title`)}
				</span>
				<span className="block text-[15px] text-muted-foreground">
					{t(`topics.${topic}.description`)}
				</span>
			</span>
			<SelectionMark selected={isSelected} />
		</button>
	);
}

export function TopicCards() {
	return (
		<div className="mt-10 grid gap-3 lg:grid-cols-3 lg:gap-6">
			{topics.map((topic) => (
				<TopicCard key={topic} topic={topic} />
			))}
		</div>
	);
}
