"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import MainImg2 from "@/public/assets/about/vision.jpg";

export default function About() {
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
      answer:
        "No, 4Herfrika membership is free. Our goal is to make mentorship and leadership opportunities accessible to as many young women as possible.",
    },
  ];

  // const [openIndex, setOpenIndex] = useState<number | null>(null);

  // const toggleFAQ = (index: number) => {
  //   setOpenIndex(openIndex === index ? null : index);
  // };

  const [openIndices, setOpenIndices] = useState<number[]>([]);

  const toggleFAQ = (index: number) => {
    if (openIndices.includes(index)) {
      setOpenIndices(openIndices.filter((i) => i !== index));
    } else {
      setOpenIndices([...openIndices, index]);
    }
  };

  return (
    <section>
      <div className="bg-[url('/assets/about/hero.jpg')] bg-no-repeat bg-cover bg-[10%_35%]">
        <div className="flex flex-col items-center gap-12 justify-center w-full h-screen bg-overlay-gradient text-center text-white">
          <h1 className="text-6xl">About 4HerFrika</h1>
          <p className="capitalize text-xl">
            At 4HerFrika, we strive to train, mentor, and empower women <br />
            to become transformative leaders across Africa.
          </p>
          <div className="flex gap-2 text-sm font-medium">
            <Link
              href="/"
              className="py-2 px-6 border border-white rounded-2xl bg-transparent hover:border-transparent hover:bg-primary-500 hover:no-underline"
            >
              Make an Impact
            </Link>
            <Link
              href="/"
              className="py-2 px-6 border border-transparent rounded-2xl bg-primary-500 hover:bg-transparent hover:border-primary-500 hover:no-underline"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      <div className="my-10 px-14 bg-[url('/assets/aboutLogo.png')] bg-no-repeat bg-[center_20rem]">
        <div className="md:bg-[url('/assets/aboutVector.png')] bg-no-repeat bg-[right_1px]">
          <div className="md:bg-[url('/assets/aboutFrame.png')] bg-no-repeat bg-[center_3rem] flex flex-col gap-24">
            <h1 className="text-4xl text-center font-semibold text-gray-400">
              Where Every Girl Achieve Their Goal
            </h1>
            <div className="flex flex-col gap-12">
              <div className="flex flex-col md:flex-row">
                <div className="flex flex-col gap-6 justify-center md:w-3/6">
                  <h4 className="text-3xl font-semibold border-b-4 md:w-3/6 border-primary-500 text-gray-400">
                    Mission Statement
                  </h4>
                  <p className="text-xl text-gray-300">
                    To raise self sufficient leaders from university and high
                    schools across Africa for community impact.
                  </p>
                </div>
                <div className="">
                  <Image
                    src="/assets/about/misson.jpg"
                    width={700}
                    height={100}
                    alt="group of happy girls"
                    className="h-80 w-[700px] object-cover rounded-3xl"
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row md:gap-8">
                <div className="md:w-4/6">
                  <Image
                    src={MainImg2}
                    alt="4herfika t-shirt"
                    placeholder="blur"
                    className="h-72 w-[650px] object-cover rounded-3xl"
                  />
                </div>
                <div className="flex flex-col gap-6 justify-center md:w-3/6">
                  <h4 className="text-3xl font-semibold border-b-4 md:w-3/6 border-primary-500 text-gray-400">
                    Vision Statement
                  </h4>
                  <p className="text-xl text-gray-300 text-justify">
                    We envision 4herfrika in all tertiary <br /> institutions
                    across sub-Saharan Africa and to have impacted 2 million
                    women and girls with tech and entrepreneurship by 2030.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-pink-300 flex items-center px-14 py-20 w-full">
        <div className="flex flex-col gap-10 justify-center items-center w-2/6">
          <h1 className="text-5xl text-secondary-500 font-bold">Core Values</h1>
          <Link
            href="/"
            className="py-2 px-6 text-primary-500 border border-primary-500 w-fit rounded-2xl bg-transparent hover:bg-transparent hover:border-primary-500 hover:no-underline"
          >
            Join Us
          </Link>
        </div>
        <div className="flex justify-between gap-8 text-center text-secondary-500 font-bold w-4/6">
          <div className="w-32 h-auto border rounded border-secondary-500 px-2 py-10 flex flex-col items-center">
            <Image
              src="/assets/about/Empowerment.png"
              alt="Empowerment icon"
              width={700}
              height={100}
              className="h-auto w-10 object-cover rounded-3xl"
            />
            <p className="text-sm">Empowerment</p>
          </div>
          <div className="w-32 h-auto border rounded border-secondary-500 px-2 py-10 flex flex-col items-center">
            <Image
              src="/assets/about/Growth.png"
              alt="Community Development icon"
              width={700}
              height={100}
              className="h-auto w-10 object-cover rounded-3xl"
            />
            <p className="text-sm">Community Development</p>
          </div>
          <div className="w-32 h-auto border rounded border-secondary-500 px-2 py-10 flex flex-col items-center">
            <Image
              src="/assets/about/Leader.png"
              alt="Leadership icon"
              width={700}
              height={100}
              className="h-auto w-10 object-cover rounded-3xl"
            />
            <p className="text-sm">Leadership</p>
          </div>
          <div className="w-32 h-auto border rounded border-secondary-500 px-2 py-10 flex flex-col items-center">
            <Image
              src="/assets/about/Conversation.png"
              alt="Mentorship icon"
              width={700}
              height={100}
              className="h-auto w-10 object-cover rounded-3xl"
            />
            <p className="text-sm">Mentorship</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-10 py-20">
        <div className="flex flex-col justify-center items-center gap-8 text-center">
          <h1 className="text-5xl">
            <span className="text-primary-500">F</span>requently{" "}
            <span className="text-primary-500">A</span>sked{" "}
            <span className="text-primary-500">Q</span>uestions
          </h1>
          <p className="text-base">
            In this section you can find all the answers you are probably
            looking for. If you still <br /> struggle with finding one - don’t
            hesitate to{" "}
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
                  openIndices.includes(index)
                    ? "bg-primary-500 text-white"
                    : "bg-white text-black"
                }`}
                onClick={() => toggleFAQ(index)}
              >
                <span className="text-lg font-medium w-full text-left">
                  {faq.question}
                </span>
                <span className="text-lg">
                  {openIndices.includes(index) ? (
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-black"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </span>
              </button>
              {openIndices.includes(index) && (
                <div className="py-4 px-8 bg-pink-300 rounded-md mt-2 w-full">
                  <p className="text-white font-bold">{faq.question}</p>
                  <p className="text-white mt-2">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
