import type { RichTextField } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";

export function RichBody({ field }: { field: RichTextField }) {
	return (
		<div className="flex flex-col gap-4 text-lg leading-relaxed text-secondary-500 [&_a]:text-primary-700 [&_a]:underline [&_h2]:mt-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold [&_img]:rounded-2xl [&_li]:ml-5 [&_ol]:list-decimal [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:bg-surface-indigo [&_pre]:p-4 [&_pre]:text-base [&_ul]:list-disc">
			<PrismicRichText field={field} />
		</div>
	);
}
