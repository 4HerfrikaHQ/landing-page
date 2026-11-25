import type { Topic } from "../_schema";
import { selectTopic } from "./contact-session";

export function chooseTopic(topic: Topic) {
	selectTopic(topic);
	document.getElementById("form")?.scrollIntoView();
}
