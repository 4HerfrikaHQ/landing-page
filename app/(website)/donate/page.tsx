import Image from "next/image";
import Link from "next/link";
import React from "react";
import BankDetails from "./_components/bank-details";

export default function DonationPage() {
	return (
		<div className="min-h-screen bg-white">
			{/* Hero */}
			<section className="py-12 sm:py-14 md:py-16 px-4 bg-neutral-400">
				<div className="max-w-7xl mx-auto relative">
					<div className="text-center mb-10 sm:mb-12 md:mb-16">
						<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-400 md:text-gray-400 mb-6 sm:mb-8 leading-tight">
							Make a Donation to
							<br />
							<span className="text-gray-400">4HERFRIKA</span>
						</h1>
						<p className="text-base sm:text-lg md:text-2xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
							Our Vision is to impact 2 million women and girls with tech and
							<br className="hidden md:block" />
							entrepreneurship by 2030.
						</p>
					</div>

					{/* Images */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8 items-center">
						{/* Left */}
						<div className="relative">
							<div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl transform sm:rotate-1 md:rotate-3 hover:rotate-0 transition-transform duration-300">
								<Image
									src="https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=1200&auto=format&fit=crop&q=75"
									alt="African children smiling"
									width={1200}
									height={800}
									className="w-full h-56 xs:h-64 sm:h-80 md:h-96 object-cover"
									priority
								/>
							</div>
						</div>

						{/* Center overlay card */}
						<div className="relative">
							<div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl isolation-isolate">
								<Image
									src="https://images.unsplash.com/photo-1710093072228-8c3129f27357?w=1200&auto=format&fit=crop&q=75"
									alt="African women in technology"
									width={1200}
									height={800}
									className="w-full h-48 sm:h-60 md:h-72 object-cover"
								/>
								<div className="absolute inset-0 bg-black/60 sm:bg-black/70 z-10" />
								<div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center text-white p-5 sm:p-6 md:p-8">
									<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 leading-tight">
										Donate to Empower
										<br className="hidden sm:block" />
										Women Across Africa
									</h2>
									<Link
										href="#bank-details"
										scroll={true}
										className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 sm:py-4 px-8 sm:px-12 rounded-full text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
										aria-label="Go to bank details"
									>
										Donate Now
									</Link>
								</div>
							</div>
						</div>

						{/* Right */}
						<div className="relative">
							<div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl transform -sm:rotate-1 md:-rotate-3 hover:rotate-0 transition-transform duration-300">
								<Image
									src="https://images.unsplash.com/photo-1554796104-5c39d0551b52?w=1200&auto=format&fit=crop&q=75"
									alt="African woman with flowers"
									width={1200}
									height={800}
									className="w-full h-56 xs:h-64 sm:h-80 md:h-96 object-cover"
								/>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section
				id="bank-details"
				className="py-14 sm:py-16 md:py-20 px-4 border-t border-gray-100 bg-white"
			>
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-8 sm:mb-10 md:mb-12">
						<h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
							Help us Empower Women Across Africa
						</h2>
						<p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
							Your donation funds scholarships, tech training, and mentorship to
							support and raise world-class women. Our vision is to impact
							2,000,000 women and girls with tech and entrepreneurship by 2030.
						</p>
					</div>
					<BankDetails />
				</div>
			</section>
		</div>
	);
}
