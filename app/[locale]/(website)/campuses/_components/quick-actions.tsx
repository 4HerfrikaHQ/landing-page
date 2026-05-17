import { Button } from "@/components/ui/button";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

const leftCircle = "/assets/make-a-difference-left-circle.svg";
const rightCircle = "/assets/make-a-difference-right-circle.svg";

export async function QuickActions() {
	const t = await getTranslations("campuses");
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
			<div className="relative z-10 mx-auto flex max-w-[733px] flex-col items-center text-center px-4">
				<h2 className="text-3xl md:text-5xl leading-loose font-semibold text-[#333333] mb-6 md:mb-9">
					{t("quickActionsTitle")}
				</h2>
				<p className="text-lg md:text-2xl leading-7 md:leading-8 text-[#333333]/80 mb-8 md:mb-14">
					{t("quickActionsDescription")}
				</p>
				<div className="flex flex-col sm:flex-row gap-4">
					<Button href="/donate" size="lg">
						{t("ctaDonate")}
					</Button>
					<Button href="/join-us" size="lg" variant="outline">
						{t("ctaBecomeMentor")}
					</Button>
					<Button href="/contact-us" size="lg" variant="outline">
						{t("ctaContact")}
					</Button>
				</div>
			</div>
		</section>
	);
}
