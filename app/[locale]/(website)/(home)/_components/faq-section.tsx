"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

export default function FrequentlyAskedQuestion({
	question,
	answer,
}: {
	question: string;
	answer: string;
}) {
	return (
		<Accordion className="w-full">
			<AccordionItem
				className="rounded-2xl border-none px-6 md:px-16 py-4 md:py-6 bg-background data-open:bg-primary-500/60"
				style={{ boxShadow: "2px 10px 24px 0px rgba(0, 0, 0, 0.18)" }}
			>
				<AccordionTrigger className="text-md md:text-2xl text-foreground font-semibold hover:no-underline data-panel-open:text-white">
					{question}
				</AccordionTrigger>
				<AccordionContent className="text-md text-white font-medium">
					{answer}
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
