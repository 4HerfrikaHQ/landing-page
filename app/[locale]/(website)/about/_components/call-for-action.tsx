import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import CallForActionImage from "../assets/call-for-action.jpg";

export const CallForAction = async () => {
	const t = await getTranslations("about");
	return (
		<section className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 lg:pb-14 px-4 container mx-auto">
			<FadeIn direction="right" className="flex flex-col justify-center order-2 lg:order-1">
				<h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 md:mb-4">
					{t.rich("callForActionTitle", {
						pink: (chunks) => <span className="text-primary-500">{chunks}</span>,
					})}
				</h2>
				<p className="text-base sm:text-lg md:text-xl text-muted-foreground">
					{t("callForActionDescription")}
				</p>
				<div className="flex flex-row gap-3 md:gap-4 lg:gap-6 mt-6 md:mt-8 lg:mt-10">
					<Button
						href="/projects"
						variant="outline"
						className="px-3 py-2 md:py-3 text-sm md:text-base w-full sm:w-auto"
					>
						{t("viewProjects")}
					</Button>
					<Button
						href="/donate"
						className="px-3 py-2 md:py-3 text-sm md:text-base w-full sm:w-auto"
					>
						{t("donateNow")}
					</Button>
				</div>
			</FadeIn>
			<FadeIn direction="left" className="order-1 lg:order-2">
				<Image
					alt="Call for action"
					src={CallForActionImage.src}
					height={CallForActionImage.height}
					width={CallForActionImage.width}
					className="rounded-md h-[300px] md:h-[400px] lg:h-[500px] w-full object-cover"
				/>
			</FadeIn>
		</section>
	);
};
