"use client";
import yearReport from "./year-report.png";
import Image from "next/image";
import earth from "./earth.png";
import F4herfrikaLogo from "./4herfrika.svg";
import Squiggle from "./squiggle.svg";
import milestone1 from "./milestone-1.png";
import milestone2 from "./milestone-2.png";
import milestone3 from "./milestone-3.jpeg";
import left from "./left.jpg";
import middle from "./middle.jpg";
import right from "./right.jpg";
import beginning from "./beginning.jpeg";
import { Button } from "@/components/Button";
import { FaArrowRight } from "react-icons/fa";
import { useAnimateOnScroll } from "@/app/hooks/useAnimateOnScroll";
import { useRef } from "react";
import "./report.scss";

export default function ReportPage() {
  const animatedSectionRef = useRef<HTMLDivElement>(null);

  useAnimateOnScroll([
    {
      ref: animatedSectionRef,
      className: "show",
      threshold: 0.3,
    }
  ]);

  return (
    <div className="w-screen overflow-hidden">
      <Image src={yearReport} alt="Yearly report" className="mx-auto max-w-full" />
      <h1 className="text-5xl font-bold text-black mx-auto mt-28 mb-24 text-center">
        Our Story in Motion
      </h1>
      <div ref={animatedSectionRef} className="relative flex flex-col items-center mb-32">
        <div className="logo-wrapper absolute">
          <F4herfrikaLogo className="w-[96vw]" />
        </div>
        <Squiggle className="squiggle absolute left-0 top-1/2 -translate-y-1/2 w-screen" />
        <Image src={earth} alt="Earth Icon" className="mx-auto max-w-xl relative earth" />
        <div className="w-[224px] h-6 rounded-[50%] bg-[#0B0B0B8C] blur-[20px] earth-platform" />
      </div>
      <p className="max-w-6xl text-center text-black text-[32px] font-light mx-auto mb-52">
        What started in a single campus in Nigeria has now spread across 25 campuses in Nigeria, Ghana, Sierra Leone, Kenya, and Cameroon. In just one year, 4herfrika has become a community where girls discover their voices, grow their skills, and prepare to lead Africa’s future.
      </p>
      <div className="bg-[#FFF4FC] pt-[375px] pb-96 flex flex-col text-center relative">
        <Image src={milestone1} alt="milestone" className="absolute left-0 top-1/2 -translate-y-1/2 size-[16vw] object-cover rounded-full" />
        <Image src={milestone2} alt="milestone" className="absolute right-60 bottom-44 size-[14vw] object-cover rounded-full" />
        <Image src={milestone3} alt="milestone" className="absolute right-20 top-40 size-[10vw] object-cover rounded-full" />
        <h2 className="text-5xl text-gray-400 font-semibold mb-6">
          Milestones of Year One
        </h2>
        <ul className="list-disc text-center space-y-4 font-medium">
          <li className="w-fit mx-auto">3,000+ girls mentored</li>
          <li className="w-fit mx-auto">25+ campuses reached</li>
          <li className="w-fit mx-auto">1,000+ graduates in Tech Academy   </li>
          <li className="w-fit mx-auto">3 thriving academies: Tech, Business, Climate.</li>
        </ul>
      </div>
      <div className="bg-[#EDEEFF] -mt-40 pt-36 pb-36 relative z-10 rounded-t-[248px]">
        <p className="px-20 text-black text-[32px] text-center mb-40 pb-36">
          In one year, we’ve seen girls who never touched a computer now designing products, coding software, and leading change in their schools and communities.
        </p>
        <div className="relative mb-40">
          <Image src={left} alt="Girls" className="w-[30vw] h-[565px] object-cover absolute rotate-[-25deg] left-0 top-32" />
          <Image src={right} alt="Girls" className="w-[30vw] h-[565px] object-cover absolute rotate-[25deg] right-0 top-32" />
          <Image src={middle} alt="Girls" className="w-[30vw] h-[565px] object-cover mx-auto relative" />
        </div>
        <Button href="/" className="mx-auto w-fit">
          Download our report
        </Button>
      </div>
      <div className="p-20 grid grid-cols-[1.5fr_1fr] gap-x-24 items-center">
        <div>
          <h4 className="text-[32px] leading-normal mb-12">
            This is just the beginning. By 2030, 4herfrika envisions 2 million women and girls empowered across Africa. Together, we can make it happen
          </h4>
          <Button href="/" className="w-fit gap-x-1">
            Go to Homepage
            <FaArrowRight />
          </Button>
        </div>
        <Image src={beginning} alt="Just the beginning" className="w-full h-[540px] object-cover" />
      </div>
    </div>

  )
}
