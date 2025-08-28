import { Button } from "@/components/Button";
import Image from "next/image";
import CallForActionImage from "../assets/call-for-action.jpg";

export const CallForAction = () => {
	return (
		<section className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 lg:pb-14 px-4 container mx-auto">
			<div className="flex flex-col justify-center order-2 lg:order-1">
				<h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 md:mb-4">
					<span className="text-primary-500">When you empower one girl</span>,
					you uplift an entire community.
				</h2>
				<p className="text-base sm:text-lg md:text-xl text-gray-300">
					Every donation you make helps us reach more girls and create
					sustainable change across underserved regions. Together, we&apos;re
					breaking barriers in education, health, and technology.
				</p>
				<div className="flex flex-row gap-3 md:gap-4 lg:gap-6 mt-6 md:mt-8 lg:mt-10">
					<Button
						variant="outline"
						className="px-3 py-2 md:py-3 text-sm md:text-base w-full sm:w-auto"
					>
						View Projects
					</Button>
					<Button
						href="/contact-us"
						className="px-3 py-2 md:py-3 text-sm md:text-base w-full sm:w-auto"
					>
						Donate Now
					</Button>
				</div>
			</div>
			<div className="order-1 lg:order-2">
				<Image
					alt="Every donation you make helps us reach more girls and create
					sustainable change across underserved regions. Together, we're
					breaking barriers in education, health, and technology."
					src={CallForActionImage.src}
					height={CallForActionImage.height}
					width={CallForActionImage.width}
					className="rounded-md h-[300px] md:h-[400px] lg:h-[500px] w-full object-cover"
				/>
			</div>
		</section>
	);
};
