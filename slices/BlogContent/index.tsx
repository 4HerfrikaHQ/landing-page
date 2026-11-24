import type { Content } from "@prismicio/client";
import type { JSXMapSerializer, SliceComponentProps } from "@prismicio/react";
import { PrismicRichText } from "@prismicio/react";
import type { FC } from "react";

export type BlogContentProps = SliceComponentProps<Content.BlogContentSlice>;

const richTextComponents: JSXMapSerializer = {
	paragraph: ({ children }) => (
		<p className="text-[17px] leading-[1.75] text-foreground/90">{children}</p>
	),
	heading1: ({ children }) => (
		<h2 className="mt-6 text-[26px] font-bold leading-tight text-foreground lg:text-[32px]">
			{children}
		</h2>
	),
	heading2: ({ children }) => (
		<h2 className="mt-6 text-[26px] font-bold leading-tight text-foreground lg:text-[32px]">
			{children}
		</h2>
	),
	heading3: ({ children }) => (
		<h3 className="mt-4 text-xl font-semibold leading-tight text-foreground lg:text-2xl">
			{children}
		</h3>
	),
	list: ({ children }) => (
		<ul className="list-disc list-outside pl-6 text-foreground/90 marker:text-primary-500">
			{children}
		</ul>
	),
	oList: ({ children }) => (
		<ol className="list-decimal list-outside pl-6 text-foreground/90 marker:text-primary-500">
			{children}
		</ol>
	),
	listItem: ({ children }) => (
		<li className="text-[17px] leading-[1.75]">{children}</li>
	),
	oListItem: ({ children }) => (
		<li className="text-[17px] leading-[1.75]">{children}</li>
	),
};

const BlogContent: FC<BlogContentProps> = ({ slice }) => {
	if (slice.variation === "quote") {
		return (
			<blockquote
				className="my-4 rounded-[28px] bg-surface-pink px-6 py-8 lg:rounded-[32px] lg:px-10 lg:py-10"
				data-slice-type={slice.slice_type}
				data-slice-variation={slice.variation}
			>
				<p className="font-playfair text-[28px] font-black italic leading-tight text-primary-500 lg:text-[36px]">
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
			<PrismicRichText
				field={slice.primary.text}
				components={richTextComponents}
			/>
		</div>
	);
};

export default BlogContent;
