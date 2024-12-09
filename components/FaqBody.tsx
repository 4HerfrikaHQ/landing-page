"use client";

import Link from "next/link";
import { useState } from "react";

const FaqBody = () => {
  const faqData = [
    {
      question: "Who can join 4Herfrika?",
      answer: "",
    },
    {
      question: "How does 4Herfrika operate?",
      answer:
        "We operate through a campus structure, with bite-sized communities in tertiary institutions across Africa. Each campus community functions independently but is connected to the broader 4Herfrika network, enabling collaboration and resource sharing.",
    },
    {
      question: "What opportunities does 4Herfrika provide for its members?",
      answer:
        "Members have access to mentorship from experienced professionals, leadership development programs, networking events, and opportunities to participate in or lead community impact projects. You will also develop valuable skills such as communication, teamwork, and project management.",
    },
    {
      question: "How do I start a 4Herfrika chapter at my campus?",
      answer:
        "If 4Herfrika doesn’t already have a chapter at your campus, you can apply to start one. Reach out to us via our contact form, and we will provide guidance on the requirements and process for launching a new chapter.",
    },
    {
      question: " Are there any fees to join 4Herfrika?",
      answer: "No, 4Herfrika membership is free. Our goal is to make mentorship and leadership opportunities accessible to as many young women as possible.",
    },
  ];
  const [openIndices, setOpenIndices] = useState<number[]>([]);

  const toggleFAQ = (index: number) => {
    if (openIndices.includes(index)) {
      setOpenIndices(openIndices.filter((i) => i !== index));
    } else {
      setOpenIndices([...openIndices, index]);
    }
  };
  return (
    <div className="flex flex-col gap-10 py-20">
      <div className="flex flex-col justify-center items-center gap-8 text-center">
        <h1 className="text-[67px] font-bold">
          <span className="text-primary-500">F</span>requently <span className="text-primary-500">A</span>sked <span className="text-primary-500">Q</span>uestions
        </h1>
        <p className="text-base">
          In this section you can find all the answers you are probably looking for. If you still <br /> struggle with finding one - don’t hesitate to{" "}
          <Link href="/" className="underline text-primary-500">
            contact us
          </Link>{" "}
          directly.
        </p>
      </div>

      <div className="w-full p-14">
        {faqData.map((faq, index) => (
          <div key={index} className="mb-4">
            <button
              className={`w-full flex justify-between items-center py-4 px-8 rounded-md shadow-md focus:outline-none  ${
                openIndices.includes(index) ? "bg-primary-500 text-white hidden" : "bg-white text-black"
              }`}
              onClick={() => toggleFAQ(index)}>
              <span className="text-lg font-medium w-full text-left">{faq.question}</span>
              <span className="text-lg">
                {openIndices.includes(index) ? (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </span>
            </button>
            {openIndices.includes(index) && (
              <div className="py-4 px-8 bg-primary-300 rounded-md mt-2 w-full flex  gap-4 items-center justify-between" onClick={() => toggleFAQ(index)}>
                <div className="">
                  <p className="text-white font-bold">{faq.question}</p>
                  <p className="text-white mt-2">{faq.answer}</p>
                </div>
                <div>
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.3333 40L32 21.3333L50.6666 40" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FaqBody;
