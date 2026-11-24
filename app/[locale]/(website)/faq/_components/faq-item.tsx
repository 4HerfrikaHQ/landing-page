"use client";

import { Plus } from "lucide-react";
import { useSyncExternalStore } from "react";
import type { FaqItem as FaqItemData } from "../_helpers/faq-groups";
import {
	getHash,
	getServerHash,
	subscribeToHash,
} from "../_helpers/location-hash";

export function FaqItem({ item }: { item: FaqItemData }) {
	const hash = useSyncExternalStore(subscribeToHash, getHash, getServerHash);
	const targeted = hash === item.id;

	return (
		<details
			id={item.id}
			open={targeted || undefined}
			className="group scroll-mt-28 rounded-2xl bg-white shadow-sm transition-shadow open:shadow-[0_12px_24px_rgba(0,0,0,0.10)] motion-reduce:transition-none lg:rounded-[28px]"
		>
			<summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 text-[17px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 lg:rounded-[28px] lg:px-7 lg:text-lg [&::-webkit-details-marker]:hidden">
				{item.question}
				<span
					aria-hidden="true"
					className="inline-flex size-9 shrink-0 items-center justify-center rounded-pill bg-surface-pink text-primary-500 transition-transform group-open:rotate-45 group-open:bg-primary-500 group-open:text-white motion-reduce:transition-none"
				>
					<Plus className="size-5" />
				</span>
			</summary>
			<div className="flex flex-col gap-3 px-5 pb-6 text-base leading-relaxed text-muted-foreground lg:px-7">
				{item.paragraphs.map((paragraph) => (
					<p key={paragraph}>{paragraph}</p>
				))}
			</div>
		</details>
	);
}
