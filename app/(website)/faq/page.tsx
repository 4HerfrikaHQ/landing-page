import FaqDetails from "@/components/FaqDetails";
import SearchSvg from "@/components/svgs/search";

export default function FAQPage() {
	return (
		<>
			<main className="faqbg lg:pb-24 md:pb-16 pb-14 ">
				<div className="mx-auto max-w-screen-xl px-4 pb-6 pt-16  sm:px-6 lg:px-8">
					<div className="text-center text-white">
						<h2 className="text-[32px] leading-10 ">FAQs</h2>
						<h1 className="lg:text-[64px] text-4xl leading-[80px] mt-1 font-bold md:text-6xl">
							Ask Us Anything
						</h1>
						<p className="font-medium lg:text-2xl text-base md:mt-8 mt-2 lg:mb-[84px] mb-[28px] md:mb-[60px] md:text-xl ">
							In this section you can find all the answers you are
							probably looking for
						</p>
						<div className="flex justify-center mx-auto items-center bg-white rounded-[8.35px] shadow-md px-4 py-3 w-80 ">
							<SearchSvg />

							<input
								type="text"
								placeholder="Search here"
								className="ml-2 w-full border-none outline-none bg-transparent text-gray-600 placeholder-[#53686A] text-base font-inter"
							/>
						</div>
					</div>
				</div>
			</main>
			<FaqDetails />
		</>
	);
}
