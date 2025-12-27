"use client";

import { cn } from "@/utils/cn";
import { useEffect, useRef, useState } from "react";
import ChevronIcon from "./chevron.svg";

const FrequentlyAskedQuestion = ({
	question,
	answer,
}: {
	question: string;
	answer: string;
}): JSX.Element => {
	const [isOpen, setIsOpen] = useState<boolean>(false);

	const elementHeightRef = useRef(0);
	const answerElementRef = useRef<HTMLParagraphElement>(null);

	useEffect(() => {
		const calculateElementHeight = () => {
			elementHeightRef.current = answerElementRef.current?.scrollHeight || 0;
		};

		calculateElementHeight();

		window.addEventListener("resize", calculateElementHeight);

		return () => {
			window.removeEventListener("resize", calculateElementHeight);
		};
	}, []);

	return (
		<section
			className={cn(
				"p-6 md:px-16 md:py-10 flex gap-x-16 items-center bg-white rounded-2xl cursor-pointer duration-200",
				{
					"bg-primary-500/60": isOpen,
				},
			)}
			style={{ boxShadow: "2px 10px 24px 0px rgba(0, 0, 0, 0.18)" }}
			onClick={() => setIsOpen(!isOpen)}
		>
			<div className="grow">
				<h4
					className={cn(
						"text-md md:text-2xl text-gray-400 font-semibold duration-200",
						{
							"text-white": isOpen,
						},
					)}
				>
					{question}
				</h4>
				<div
					style={{ height: isOpen ? `${elementHeightRef.current}px` : 0 }}
					ref={answerElementRef}
					className="duration-200 overflow-hidden"
				>
					<p className="text-md text-white font-medium pt-4">{answer}</p>
				</div>
			</div>
			<ChevronIcon
				className={cn("text-gray-400 w-4 shrink-0 md:w-16 duration-150", {
					"text-white rotate-180": isOpen,
				})}
			/>
		</section>
	);
};

export default FrequentlyAskedQuestion;
