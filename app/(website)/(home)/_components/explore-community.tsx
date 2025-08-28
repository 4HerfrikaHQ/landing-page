import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { FaArrowRightLong } from "react-icons/fa6";
import campus from "@/app/(website)/(home)/assets/about-us/campus.png"
import academy from "@/app/(website)/(home)/assets/about-us/academy.png"

export const ExploreCommunity = () => {
  return <section className="px-4 sm:px-6 md:px-7 container mx-auto my-6 lg:my-8 gap-5 flex flex-col lg:flex-row lg:gap-x-11 items-start lg:items-center lg:py-6">
    <Community
      image={campus.src}
      name="Our Campuses"
      description="One campus at a time, we’re growing a sisterhood.
      Across 20+ African universities, 4Herfrika chapters host events, workshops, and mentorship sessions — building leadership, community, and connection."
      link={{
        label: "Explore Campuses",
        href: "/"
      }}
    />
    <div className="hidden lg:block h-[240px] w-[2px] bg-primary-500" />
    <Community
      image={academy.src}
      name="Our Academy"
      description="Virtual learning. Real impact.
      Through our Tech, Business, and Climate Academies, young women gain practical skills, mentorship, and confidence to lead boldly in today’s world."
      link={
        {
          label: "Explore Learning Tracks",
          href: "/"
        }
      }
    />
    <div className="absolute size-[306px] bottom-0 right-0 bg-primary-500 opacity-30 blur-[374px]" />
  </section>
}

const Community = ({
	image,
	name,
  description,
  link
}: { image: string; name: string; description: string, link: {label: string, href: string} }) => (
	<div className="rounded-3xl w-full">
		<Image
			src={image}
			alt="person"
			width={64}
			height={64}
			className="w-16 object-cover aspect-square rounded-full"
		/>
		<h3 className="text-gray-400 text-2xl lg:text-3xl font-bold mt-3 capitalize">
			{name}
		</h3>
		<p className="text-base lg:text-xl text-gray-300 mt-2 mb-4">
			{description}
		</p>
		<Link
			href={link.href as Route}
			className="text-primary-500 flex capitalize items-center gap-2 text-base lg:text-xl"
		>
			{link.label} <FaArrowRightLong className="text-md" />
		</Link>
	</div>
);
