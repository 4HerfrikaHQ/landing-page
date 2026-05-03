import { redirectToPreviewURL } from "@prismicio/next";
import type { NextRequest } from "next/server";

import { createClient } from "../../../prismicio";

export async function GET(request: NextRequest) {
	const client = createClient();

	return await redirectToPreviewURL({
		client,
		request,
		linkResolver: (doc) => {
			const lang = (doc.lang ?? "en-us").split("-")[0];
			const prefix = lang === "en" ? "" : `/${lang}`;

			if (doc.type === "blog_post") {
				return `${prefix}/blog/${doc.uid}`;
			}
			return `${prefix}/`;
		},
	});
}
