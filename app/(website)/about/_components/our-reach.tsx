import { createClient } from "@/prismicio";
import type { Content } from "@prismicio/client";
import { Statistic } from "../../_components/statistic";

export const OurReach = async () => {
	const client = createClient();
	const page = await client.getSingle<Content.HomepageDocument>("homepage");
	const { members, campuses, countries } = page.data;

	return (
		<section className="px-4 md:px-28 container mx-auto py-10 pb-16 lg:py-20">
			<h1 className="text-3xl md:text-4xl font-semibold text-center">
				<span className="text-primary-500">W</span>e{" "}
				<span className="text-primary-500">H</span>ave{" "}
				<span className="text-primary-500">R</span>eached
			</h1>
			<section className="mt-10 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-0 z-10 relative">
				<Statistic value={members} label="members" />
				<hr className="hidden sm:block border h-16 md:h-20 lg:h-24 w-0 border-primary-500 mx-4 md:mx-8 lg:mx-24" />
				<Statistic value={campuses} label="campuses" />
				<hr className="hidden sm:block border h-16 md:h-20 lg:h-24 w-0 border-primary-500 mx-4 md:mx-8 lg:mx-24" />
				<Statistic value={countries} label="african countries" />
			</section>
		</section>
	);
};
