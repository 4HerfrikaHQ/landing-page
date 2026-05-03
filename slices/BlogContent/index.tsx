import type { FC } from "react";
import type { Content } from "@prismicio/client";
import type { JSXMapSerializer, SliceComponentProps } from "@prismicio/react";
import { PrismicRichText } from "@prismicio/react";

export type BlogContentProps = SliceComponentProps<Content.BlogContentSlice>;

const richTextComponents: JSXMapSerializer = {
	paragraph: ({ children }) => (
		<p className="text-lg md:text-2xl font-normal leading-relaxed text-[#364153]">{children}</p>
	),
	heading1: ({ children }) => (
		<h2 className="text-2xl md:text-4xl font-bold leading-tight text-foreground">{children}</h2>
	),
	heading2: ({ children }) => (
		<h2 className="text-xl md:text-3xl font-bold leading-tight text-foreground">{children}</h2>
	),
	heading3: ({ children }) => (
		<h3 className="text-lg md:text-2xl font-semibold leading-tight text-foreground">{children}</h3>
	),
	list: ({ children }) => (
		<ul className="list-disc list-outside pl-6 text-[#364153]">{children}</ul>
	),
	oList: ({ children }) => (
		<ol className="list-decimal list-outside pl-6 text-[#364153]">{children}</ol>
	),
	listItem: ({ children }) => (
		<li className="text-lg md:text-2xl font-normal leading-relaxed">{children}</li>
	),
	oListItem: ({ children }) => (
		<li className="text-lg md:text-2xl font-normal leading-relaxed">{children}</li>
	),
};

const BlogContent: FC<BlogContentProps> = ({ slice }) => {
	if (slice.variation === "quote") {
		return (
			<blockquote
				className="border-l-4 border-[rgba(236,0,140,0.6)] rounded-r-[14px] bg-[#FDF2F8] pt-6 pr-6 pb-6 pl-9"
				data-slice-type={slice.slice_type}
				data-slice-variation={slice.variation}
			>
				<p className="text-lg md:text-2xl font-normal md:leading-[39px] leading-relaxed text-[#1E2939]">
					{slice.primary.text}
				</p>
			</blockquote>
		);
	}

	return (
		<div
			className="flex flex-col gap-6"
			data-slice-type={slice.slice_type}
			data-slice-variation={slice.variation}
		>
			<PrismicRichText field={slice.primary.text} components={richTextComponents} />
		</div>
	);
};

export default BlogContent;
