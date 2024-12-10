const SkillUpPopup = () => {
	return (
		<div className=" z-50 flex items-center justify-center">
			<div className="relative w-[90%] max-w-lg bg-white rounded-2xl shadow-lg p-8">
				<button
					className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
					aria-label="Close popup"
				>
					<svg
						className="w-6 h-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>

				<div className="text-center">
					<h2 className="md:text-[34px] md:leading-[46px] text-xl font-bold text-gray-800 mb-4">
						SkillUp with 4HerFrika
					</h2>

					<div className="flex justify-center items-center mb-4">
						<div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center">
							<div className="w-6 h-6 border-4 border-pink-500 rounded-full border-t-white animate-spin"></div>
						</div>
					</div>

					<h3 className="text-lg md:text-[24px] md:leading-[46px] font-semibold text-gray-700 mb-4 mt-8 md:mt-16">
						Ready to Level Up Your Skills?
					</h3>

					<p className="text-sm md:text-lg text-gray-600 mb-6">
						Unlock career-boosting resources, hands-on workshops,
						and mentorship. Sign up now to be the first notified
						when we launch!
					</p>
					<div className="flex justify-center space-x-10">
						<button className="px-6 py-3 md:px-14 md:py-4 rounded-[56px] border border-gray-300 text-gray-700 hover:bg-gray-100 focus:outline-none">
							Leave Skills
						</button>
						<button className="md:px-10 md:py-4 px-6 py-3 rounded-[56px] bg-pink-500 text-white font-semibold hover:bg-pink-600 focus:outline-none">
							Join the Waitlist!
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
export default SkillUpPopup;
