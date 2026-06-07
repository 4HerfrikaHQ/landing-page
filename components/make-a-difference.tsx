import Image from "next/image";
import { Button } from "@/components/ui/button";

const leftCircle = "/assets/make-a-difference-left-circle.svg";
const rightCircle = "/assets/make-a-difference-right-circle.svg";

export function MakeADifference() {
	return (
		<section className="relative overflow-x-clip bg-white py-12 md:py-24">
			<Image
				src={leftCircle}
				alt=""
				aria-hidden
				width={297}
				height={340}
				className="pointer-events-none absolute left-0 top-0 max-w-[50%] h-auto"
			/>
			<Image
				src={rightCircle}
				alt=""
				aria-hidden
				width={445}
				height={322}
				className="pointer-events-none absolute bottom-0 right-0 max-w-[50%] h-auto"
			/>
			<div className="relative z-10 mx-auto flex max-w-[733px] flex-col items-center text-center">
				<h2 className="text-3xl md:text-5xl leading-loose font-semibold text-[#333333] mb-6 md:mb-9">Make a Difference</h2>
				<p className="text-lg md:text-2xl leading-7 md:leading-8 text-[#333333]/80 mb-8 md:mb-14">
					Your support can help us continue creating impact in communities across Africa
				</p>
				<Button href="/donate" size="lg">
					Support This Cause
				</Button>
			</div>
		</section>
	);
}
