"use client";

import { parseAsString, useQueryState } from "nuqs";
import { FAQ_QUERY_THROTTLE_MS } from "../_schema";

const faqQueryParam = parseAsString
	.withDefault("")
	.withOptions({
		history: "replace",
		scroll: false,
		throttleMs: FAQ_QUERY_THROTTLE_MS,
	});

export function useFaqQuery() {
	return useQueryState("q", faqQueryParam);
}
