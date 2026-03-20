import academy from "@/app/[locale]/(website)/(home)/assets/about-us/academy.png";
import campus from "@/app/[locale]/(website)/(home)/assets/about-us/campus.png";
import { StaggerContainer, StaggerItem } from "@/components/motion";
import type { Route } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const ExploreCommunity = async () => {
	const t = await getTranslations("home");

	return (
		<StaggerContainer className="px-4 sm:px-6 md:px-7 container mx-auto my-6 lg:my-8 gap-5 flex flex-col lg:flex-row lg:gap-x-11 items-start lg:items-center lg:py-6">
			<StaggerItem>
				<Community
					image={campus.src}
					name={t("ourCampuses")}
					description={t("ourCampusesDescription")}
					link={{
						label: t("exploreCampuses"),
						href: "/",
					}}
				/>
			</StaggerItem>
			<div className="hidden lg:block h-60 w-0.5 bg-primary-500" />
			<StaggerItem>
				<Community
					image={academy.src}
					name={t("ourAcademy")}
					description={t("ourAcademyDescription")}
					link={{
						label: t("exploreLearningTracks"),
						href: "/",
					}}
				/>
			</StaggerItem>
			<div className="absolute size-76.5 bottom-0 right-0 bg-primary-500 opacity-30 blur-[374px]" />
		</StaggerContainer>
	);
};

const Community = ({
	image,
	name,
	description,
	link,
}: {
	image: string;
	name: string;
	description: string;
	link: { label: string; href: string };
}) => (
	<div className="rounded-3xl w-full">
		<Image
			src={image}
			alt="person"
			width={64}
			height={64}
			className="w-16 object-cover aspect-square rounded-full"
		/>
		<h3 className="text-foreground text-2xl lg:text-3xl font-bold mt-3 capitalize">
			{name}
		</h3>
		<p className="text-base lg:text-xl text-muted-foreground mt-2 mb-4">
			{description}
		</p>
		<Link
			href={link.href as Route}
			className="text-primary-500 flex capitalize items-center gap-2 text-base lg:text-xl"
		>
			{link.label} <ArrowRight className="h-4 w-4" />
		</Link>
	</div>
);
