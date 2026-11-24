import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";
import { type LegalHeading, headingId } from "./legal-source";

function textOf(node: ReactNode): string {
	if (typeof node === "string") return node;
	if (Array.isArray(node)) return node.map(textOf).join("");
	return "";
}

export function legalMdxComponents(headings: LegalHeading[]): MDXComponents {
	return {
		h1: () => null,
		h2: ({ children }) => {
			const index = headings.findIndex((h) => h.text === textOf(children));
			return (
				<h2 id={index >= 0 ? headingId(index) : undefined}>
					<span
						aria-hidden="true"
						className="mb-1 block text-sm font-semibold tabular-nums text-primary"
					>
						{String(index + 1).padStart(2, "0")}
					</span>
					{children}
				</h2>
			);
		},
	};
}
