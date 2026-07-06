import type { MDXComponents } from "mdx/types";

// Required by @next/mdx (App Router). Styling comes from the `prose` wrapper
// on the pages that render MDX, so no per-element overrides needed here.
export function useMDXComponents(components: MDXComponents): MDXComponents {
	return components;
}
