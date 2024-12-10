"use client";

// import Link from "next/link";
import { useState } from "react";
import CloseSvg from "./svgs/close";
import OpenSvg from "./svgs/open";
import FaqSvg from "./svgs/faq";
import SkillUpPopup from "./SkillupModal";

const FaqDetails = () => {
	const [openIndices, setOpenIndices] = useState<number[]>([]);
	const toggleFAQ = (index: number) => {
		if (openIndices.includes(index)) {
			setOpenIndices(openIndices.filter((i) => i !== index));
		} else {
			setOpenIndices([...openIndices, index]);
		}
	};

	const [openIndices1, setOpenIndices1] = useState<number[]>([]);
	const toggle1FAQ = (index: number) => {
		if (openIndices1.includes(index)) {
			setOpenIndices1(openIndices1.filter((i) => i !== index));
		} else {
			setOpenIndices1([...openIndices1, index]);
		}
	};

	const [openIndices2, setOpenIndices2] = useState<number[]>([]);
	const toggle2FAQ = (index: number) => {
		if (openIndices2.includes(index)) {
			setOpenIndices2(openIndices2.filter((i) => i !== index));
		} else {
			setOpenIndices2([...openIndices2, index]);
		}
	};

	const [openIndices3, setOpenIndices3] = useState<number[]>([]);
	const toggle3FAQ = (index: number) => {
		if (openIndices3.includes(index)) {
			setOpenIndices3(openIndices3.filter((i) => i !== index));
		} else {
			setOpenIndices3([...openIndices3, index]);
		}
	};

	const [openIndices4, setOpenIndices4] = useState<number[]>([]);
	const toggle4FAQ = (index: number) => {
		if (openIndices4.includes(index)) {
			setOpenIndices4(openIndices4.filter((i) => i !== index));
		} else {
			setOpenIndices4([...openIndices4, index]);
		}
	};

	const faqData1 = [
		{
			question: "What is career coaching, and how can it benefit me?",
			answer: "Career coaching is a supportive process where a mentor guides you in identifying and achieving your career goals. It can help you clarify your aspirations, develop strategies, and build the skills needed for success. Visit the career corner (clickable) for more.",
		},
		{
			question: "How can I find a mentor in my specific field?",
			answer: "Use our platform’s search features to filter mentors by industry or expertise.",
		},
		{
			question: "How should I prepare for my career coaching call?",
			answer: "Prepare by outlining your career goals, specific questions, and any challenges you’re facing. Be ready to discuss your background and what you hope to achieve from the mentorship.",
		},
		{
			question: "Can I have more than one mentor?",
			answer: "Yes, having multiple mentors can provide diverse perspectives and insights. Each mentor can contribute different skills and experiences to your career journey.",
		},
		{
			question:
				"What should I do if I need further assistance after a mentoring session?",
			answer: "Don’t hesitate to reach out to your mentor for additional support or clarification. You can also seek help from other mentors on our website.",
		},
		{
			question: "How can I become a mentor at 4Herfrika?",
			answer: "If you are an experienced professional interested in supporting young women in their leadership journey, you can apply to be a mentor by contacting us through our website or by emailing our team directly.",
		},
	];
	const faqData2 = [
		{
			question: "What skills are essential for my career path?",
			answer: "Essential skills can vary by field but often include communication, problem-solving, teamwork, and leadership. Research industry-specific skills to focus your development.",
		},
		{
			question: "How can I develop leadership skills?",
			answer: "Participate in leadership workshops, take on volunteer roles, seek feedback from mentors, and practice leading small projects to build confidence and experience.",
		},
		{
			question: "What resources are available for career development?",
			answer: "Utilize online courses, webinars, industry publications, and networking events. At 4Herfrika, we also offer workshops and training sessions tailored to specific skills. (join us)",
		},
	];
	const faqData3 = [
		{
			question: "How do I handle setbacks in my career?",
			answer: "Attend industry conferences, join professional organizations, engage in social media platforms like LinkedIn, and participate in community events. Building genuine relationships is key.",
		},
		{
			question: "What should I do if I feel stuck in my current job?",
			answer: "If you are an experienced professional interested in supporting young women in their leadership journey, you can apply to be a mentor by contacting us through our website or by emailing our team directly.",
		},
	];
	const faqData4 = [
		{
			question: "How can I expand my professional network?",
			answer: " Attend industry conferences, join professional organizations, engage in social media platforms like LinkedIn, and participate in community events. Building genuine relationships is key.",
		},
		{
			question:
				"What are some ways to get involved in community impact projects?",
			answer: "Look for local NGOs, community centers, or initiatives related to your interests. Volunteering, joining project teams, or starting your own initiative are great ways to contribute.",
		},
	];
	const faqData5 = [
		{
			question: "Are there group mentoring opportunities available? ",
			answer: "Group mentoring can be a valuable experience but it is currently not available on our website.",
		},
		{
			question: "How do I stay updated on 4Herfrika activities?",
			answer: "You can stay updated by following us on social media, joining your campus chapter, and subscribing to our newsletter for the latest news, events, and opportunities.",
		},
	];

	return (
		<>
			<main className="w-full">
				<div className="mx-auto max-w-screen-xl px-4 pb-6 pt-16  sm:px-6 lg:px-8">
					<div className=" text-black">
						<div>
							<h1 className="md:text-[60px] text-[34px] lg:text-[67px] font-semibold text-center">
								<span className="text-primary-500">F</span>
								inding{" "}
								<span className="text-primary-500">M</span>
								entorship{" "}
							</h1>
							<div className="w-full p-14">
								{faqData1.map((faq, index) => (
									<div key={index} className="mb-4">
										<button
											className={`w-full flex justify-between items-center py-4 px-8 rounded-md shadow-md focus:outline-none  ${
												openIndices.includes(index)
													? "bg-primary-500 text-white hidden"
													: "bg-white text-black"
											}`}
											onClick={() => toggleFAQ(index)}
										>
											<span className="text-lg font-medium w-full text-left">
												{faq.question}
											</span>
											<span className="text-lg">
												{openIndices.includes(index) ? (
													<OpenSvg />
												) : (
													<CloseSvg />
												)}
											</span>
										</button>
										{openIndices.includes(index) && (
											<div
												className="py-4 px-8 bg-[#a91b6f] rounded-md mt-2 w-full flex  gap-4 items-center justify-between"
												onClick={() => toggleFAQ(index)}
											>
												<div className="">
													<p className="text-white font-bold">
														{faq.question}
													</p>
													<p className="text-white mt-2">
														{faq.answer}
													</p>
												</div>
												<div>
													<FaqSvg />
												</div>
											</div>
										)}
									</div>
								))}
							</div>
						</div>
						<div>
							<h1 className="md:text-[60px] text-[34px] lg:text-[67px] font-semibold text-center">
								<span className="text-primary-500">C</span>
								areer{" "}
								<span className="text-primary-500">D</span>
								evelopment{" "}
							</h1>
							<p className="md:text-base text-sm text-center md:w-[625px] w-[70%] mx-auto  ">
								In this section you can find all the answers you
								are probably looking for. If you still struggle
								with finding one - don’t hesitate to{" "}
								<span className="text-primary-500 underline text-underline">
									contact us
								</span>{" "}
								directly.
							</p>
							<div className="w-full p-14">
								{faqData2.map((faq, index) => (
									<div key={index} className="mb-4">
										<button
											className={`w-full flex justify-between items-center py-4 px-8 rounded-md shadow-md focus:outline-none  ${
												openIndices1.includes(index)
													? "bg-primary-500 text-white hidden"
													: "bg-white text-black"
											}`}
											onClick={() => toggle1FAQ(index)}
										>
											<span className="text-lg font-medium w-full text-left">
												{faq.question}
											</span>
											<span className="text-lg">
												{openIndices1.includes(
													index
												) ? (
													<OpenSvg />
												) : (
													<CloseSvg />
												)}
											</span>
										</button>
										{openIndices1.includes(index) && (
											<div
												className="py-4 px-8 bg-[#a91b6f] rounded-md mt-2 w-full flex  gap-4 items-center justify-between"
												onClick={() =>
													toggle1FAQ(index)
												}
											>
												<div className="">
													<p className="text-white font-bold">
														{faq.question}
													</p>
													<p className="text-white mt-2">
														{faq.answer}
													</p>
												</div>
												<div>
													<FaqSvg />
												</div>
											</div>
										)}
									</div>
								))}
							</div>
						</div>
						<div>
							<h1 className="md:text-[60px] text-[34px] lg:text-[67px] font-semibold text-center">
								<span className="text-primary-500">O</span>
								vercoming{" "}
								<span className="text-primary-500">C</span>
								hallenges{" "}
							</h1>
							<p className="md:text-base text-sm text-center md:w-[625px] w-[70%] mx-auto  ">
								In this section you can find all the answers you
								are probably looking for. If you still struggle
								with finding one - don’t hesitate to{" "}
								<span className="text-primary-500 underline text-underline">
									contact us
								</span>{" "}
								directly.
							</p>
							<div className="w-full p-14">
								{faqData3.map((faq, index) => (
									<div key={index} className="mb-4">
										<button
											className={`w-full flex justify-between items-center py-4 px-8 rounded-md shadow-md focus:outline-none  ${
												openIndices2.includes(index)
													? "bg-primary-500 text-white hidden"
													: "bg-white text-black"
											}`}
											onClick={() => toggle2FAQ(index)}
										>
											<span className="text-lg font-medium w-full text-left">
												{faq.question}
											</span>
											<span className="text-lg">
												{openIndices2.includes(
													index
												) ? (
													<OpenSvg />
												) : (
													<CloseSvg />
												)}
											</span>
										</button>
										{openIndices2.includes(index) && (
											<div
												className="py-4 px-8 bg-[#a91b6f] rounded-md mt-2 w-full flex  gap-4 items-center justify-between"
												onClick={() =>
													toggle2FAQ(index)
												}
											>
												<div className="">
													<p className="text-white font-bold">
														{faq.question}
													</p>
													<p className="text-white mt-2">
														{faq.answer}
													</p>
												</div>
												<div>
													<FaqSvg />
												</div>
											</div>
										)}
									</div>
								))}
							</div>
						</div>
						<div>
							<h1 className="md:text-[60px] text-[34px] lg:text-[67px] font-semibold text-center">
								<span className="text-primary-500">N</span>
								etworking and{" "}
								<span className="text-primary-500">C</span>
								ommunity{" "}
								<span className="text-primary-500">I</span>mpact
							</h1>
							<p className="md:text-base text-sm text-center md:w-[625px] w-[70%] mx-auto  ">
								In this section you can find all the answers you
								are probably looking for. If you still struggle
								with finding one - don&apos;t hesitate to{" "}
								<span className="text-primary-500 underline text-underline">
									contact us
								</span>{" "}
								directly.
							</p>
							<div className="w-full p-14">
								{faqData4.map((faq, index) => (
									<div key={index} className="mb-4">
										<button
											className={`w-full flex justify-between items-center py-4 px-8 rounded-md shadow-md focus:outline-none  ${
												openIndices3.includes(index)
													? "bg-primary-500 text-white hidden"
													: "bg-white text-black"
											}`}
											onClick={() => toggle3FAQ(index)}
										>
											<span className="text-lg font-medium w-full text-left">
												{faq.question}
											</span>
											<span className="text-lg">
												{openIndices3.includes(
													index
												) ? (
													<OpenSvg />
												) : (
													<CloseSvg />
												)}
											</span>
										</button>
										{openIndices3.includes(index) && (
											<div
												className="py-4 px-8 bg-[#a91b6f] rounded-md mt-2 w-full flex  gap-4 items-center justify-between"
												onClick={() =>
													toggle3FAQ(index)
												}
											>
												<div className="">
													<p className="text-white font-bold">
														{faq.question}
													</p>
													<p className="text-white mt-2">
														{faq.answer}
													</p>
												</div>
												<div>
													<FaqSvg />
												</div>
											</div>
										)}
									</div>
								))}
							</div>
						</div>
						<div>
							<h1 className="md:text-[60px] text-[34px] lg:text-[67px] font-semibold text-center">
								<span className="text-primary-500">A</span>
								dditional{" "}
								<span className="text-primary-500">S</span>
								upport{" "}
							</h1>
							<p className="md:text-base text-sm text-center md:w-[625px] w-[70%] mx-auto  ">
								In this section you can find all the answers you
								are probably looking for. If you still struggle
								with finding one - don’t hesitate to{" "}
								<span className="text-primary-500 underline text-underline">
									contact us
								</span>{" "}
								directly.
							</p>
							<div className="w-full p-14">
								{faqData5.map((faq, index) => (
									<div key={index} className="mb-4">
										<button
											className={`w-full flex justify-between items-center py-4 px-8 rounded-md shadow-md focus:outline-none  ${
												openIndices4.includes(index)
													? "bg-primary-500 text-white hidden"
													: "bg-white text-black"
											}`}
											onClick={() => toggle4FAQ(index)}
										>
											<span className="text-lg font-medium w-full text-left">
												{faq.question}
											</span>
											<span className="text-lg">
												{openIndices4.includes(
													index
												) ? (
													<OpenSvg />
												) : (
													<CloseSvg />
												)}
											</span>
										</button>
										{openIndices4.includes(index) && (
											<div
												className="py-4 px-8 bg-[#a91b6f] rounded-md mt-2 w-full flex  gap-4 items-center justify-between"
												onClick={() =>
													toggle4FAQ(index)
												}
											>
												<div className="">
													<p className="text-white font-bold">
														{faq.question}
													</p>
													<p className="text-white mt-2">
														{faq.answer}
													</p>
												</div>
												<div>
													<FaqSvg />
												</div>
											</div>
										)}
									</div>
								))}
							</div>
						</div>
						<SkillUpPopup />
					</div>
				</div>
			</main>
		</>
	);
};

export default FaqDetails;
