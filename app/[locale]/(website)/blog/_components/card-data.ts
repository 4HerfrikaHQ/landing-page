import { type FeedItem, chipTone } from "../_feed";
import { formatFeedDate } from "../_utils";
import type { CardData } from "./feed-card";

type Labels = {
	minRead: (minutes: number) => string;
	readStory: string;
	readProject: string;
};

export function toCardData(
	item: FeedItem,
	locale: string,
	labels: Labels,
): CardData {
	const date = formatFeedDate(item.date, locale);
	const read = labels.minRead(item.minutes);
	return {
		href: item.href,
		title: item.title,
		excerpt: item.excerpt,
		imageSrc: item.imageSrc,
		imageAlt: item.imageAlt,
		chipLabel: item.categoryName,
		tone: chipTone(item.categorySlug),
		meta: [date, read].filter(Boolean).join(" · "),
		cta: item.kind === "project" ? labels.readProject : labels.readStory,
	};
}
