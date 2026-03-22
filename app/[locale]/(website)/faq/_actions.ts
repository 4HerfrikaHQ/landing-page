import type { Content } from "@prismicio/client";
import { createClient } from "@/prismicio";

export async function getFaqPage() {
	const client = createClient();
	return client.getSingle<Content.FaqPageDocument>("faq_page", {
		graphQuery: `
    {
      faq_page {
        header_image
        frequently_asked_questions {
          section {
            ... on faq {
              title
              faq
            }
          }
        }
      }
    }
  `,
	});
}
