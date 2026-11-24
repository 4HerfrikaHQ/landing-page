import "server-only";
import { getMentors } from "../_actions";

const MAX_SIMILAR_MENTORS = 4;

export async function getSimilarMentors(currentSlug: string) {
	const { mentors } = await getMentors({ page: 1 });
	return mentors
		.filter((mentor) => mentor.slug !== currentSlug)
		.slice(0, MAX_SIMILAR_MENTORS);
}
