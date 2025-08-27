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
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
//@ts-ignore
import { SplitText } from "./splittext"

gsap.registerPlugin(useGSAP); // register the hook to avoid React version discrepancies
gsap.registerPlugin(SplitText); // register the hook to avoid React version discrepancies

export default function ReportPage() {
  const storyTitleRef = useRef<HTMLDivElement>(null);
  const motionSectionRef = useRef<HTMLDivElement>(null);
  const motionDescriptionRef = useRef<HTMLDivElement>(null);
  const milestoneRef = useRef<HTMLDivElement>(null);
  const neverTouchedRef = useRef<HTMLDivElement>(null);
  const justTheBeginningRef = useRef<HTMLDivElement>(null);

  useAnimateOnScroll([
    {
      ref: storyTitleRef,
      className: "show",
      threshold: 0.3,
    }, {
      ref: motionSectionRef,
      className: "show",
      threshold: 0.3,
    },
    {
      ref: motionDescriptionRef,
      className: "show",
      threshold: 1,
    },
    {
      ref: milestoneRef,
      className: "show",
      threshold: 0.3,
    },
    {
      ref: neverTouchedRef,
      className: "show",
      threshold: 0.5,
    },
    {
      ref: justTheBeginningRef,
      className: "show",
      threshold: .8,
    },
  ]);

  useGSAP(() => {
    const storyTitleSplit = SplitText.create(".story-title", { type: "words" });
    (storyTitleSplit.words as Array<HTMLDivElement>).forEach((word, index) => {
      word.style.transitionDelay = `${index * 0.15}s`
    })

    if (storyTitleRef.current) {
      storyTitleRef.current.style.opacity = "1"
    }

    const motionSplit = SplitText.create(".motion-description", { type: "lines" });
    (motionSplit.lines as Array<HTMLDivElement>).forEach((line, index) => {
      line.style.transitionDelay = `${index * 0.2}s`
    })

    if (motionDescriptionRef.current) {
      motionDescriptionRef.current.style.opacity = "1"
    }

    const milestoneSplit = SplitText.create(".milestones-header", { type: "words" });
    (milestoneSplit.words as Array<HTMLDivElement>).forEach((line, index) => {
      line.style.transitionDelay = `${index * 0.1}s`
    })

    const elements = [...document.querySelectorAll('.milestones-list li')];
    elements.forEach((line, index) => {
      line.style.transitionDelay = `${(index * 0.1) + 0.4}s`
    })

    const beginningTextSplit = SplitText.create(".beginning-text", { type: "lines" });
    (beginningTextSplit.lines as Array<HTMLDivElement>).forEach((line, index) => {
      line.style.transitionDelay = `${index * 0.2}s`
    })
  })

  return (
    <div className="w-screen overflow-hidden">
      <Image src={yearReport} alt="Yearly report" className="mx-auto max-w-full" />
      <h1 ref={storyTitleRef} className="text-3xl md:text-5xl font-bold text-black mx-auto my-16 md:my-28 text-center story-title">
        Our Story in Motion
      </h1>
      <div ref={motionSectionRef} className="relative flex flex-col items-center mb-20 md:mb-32">
        <div className="logo-wrapper absolute">
          <F4herfrikaLogo className="w-[96vw]" />
        </div>
        <Squiggle className="squiggle absolute left-0 top-1/2 -translate-y-1/2 w-screen" />
        <Image src={earth} alt="Earth Icon" className="mx-auto max-w-xl relative earth w-[43vw]" />
        <div className="w-[160px] md:w-[224px] h-6 rounded-[50%] bg-[#0B0B0B8C] blur-[20px] earth-platform" />
      </div>
      <p ref={motionDescriptionRef} className="max-w-6xl text-center text-black text-lg md:text-[32px] font-light mx-auto mb-20 md:mb-52 motion-description px-6">
        What started in a single campus in Nigeria has now spread across 25 campuses in Nigeria, Ghana, Sierra Leone, Kenya, and Cameroon. In just one year, 4herfrika has become a community where girls discover their voices, grow their skills, and prepare to lead Africa’s future.
      </p>
      <div className="bg-[#FFF4FC] pt-16 md:pt-[120px] pb-44 md:pb-[420px] flex flex-col text-center relative" ref={milestoneRef}>
        <h2 className="text-3xl md:text-5xl text-gray-400 font-semibold mb-12 milestones-header">
          Milestones of Year One
        </h2>
        <ul className="list-disc text-center space-y-4 md:space-y-6 font text-lg md:text-2xl milestones-list">
          <li className="w-fit mx-auto">3,000+ girls mentored</li>
          <li className="w-fit mx-auto">25+ campuses reached</li>
          <li className="w-fit mx-auto">1,000+ graduates in Tech Academy   </li>
          <li className="w-fit mx-auto">3 thriving academies: Tech, Business, Climate.</li>
        </ul>
        <div className="grid grid-cols-2 gap-4 px-6 mt-12 md:mt-0">
          <Image src={milestone1} alt="milestone" className="relative md:absolute h-40 left-0 md:top-1/2 md:-translate-y-1/2 md:size-[16vw] object-cover md:rounded-full" />
          <Image src={milestone2} alt="milestone" className="relative md:absolute h-40 md:right-60 md:bottom-48 md:size-[14vw] object-cover md:rounded-full" />
          <Image src={milestone3} alt="milestone" className="relative col-span-2 h-[320px] md:absolute md:right-20 md:top-20 md:size-[10vw] object-cover md:rounded-full" />
        </div>
      </div>
      <div
        className="bg-[#EDEEFF] -mt-24 md:-mt-36 relative z-10 rounded-t-[100px] md:rounded-t-[248px] never-touched-section"
        ref={neverTouchedRef}
      >
        <span className="h-12 md:h-32 block" />
        <p className="px-8 md:px-20 text-black text-lg md:text-[32px] text-center mb-12 md:mb-32 description">
          In one year, we’ve seen girls who never touched a computer now designing products, coding software, and leading change in their schools and communities.
        </p>
        <div className="relative mb-8 md:mb-40 never-touched-images grid grid-cols-2 md:flex gap-4 px-6">
          <Image src={middle} alt="Girls" className="w-full h-full md:w-[30vw] md:h-[565px] object-cover mx-auto relative" />
          <Image src={right} alt="Girls" className="w-full h-full md:w-[30vw] md:h-[565px] object-cover md:absolute md:rotate-[25deg] right-0 md:top-32" />
          <Image src={left} alt="Girls" className="col-span-2 w-full h-full md:w-[30vw] md:h-[565px] object-cover md:absolute md:rotate-[-25deg] left-0 md:top-32" />
        </div>
        <Button href="/" className="mx-auto w-fit download-report">
          Download our report
        </Button>
        <span className="h-12 md:h-36 block" />
      </div>
      <div ref={justTheBeginningRef} className="px-6 pt-12 pb-8 md:p-20 grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-y-8 gap-x-24 items-center just-the-beginning">
        <div>
          <h4 className="text-lg md:text-[32px] leading-normal mb-12 beginning-text">
            This is just the beginning. By 2030, 4herfrika envisions 2 million women and girls empowered across Africa. Together, we can make it happen
          </h4>
          <Button href="/" className="w-fit gap-x-1 beginning-button">
            Go to Homepage
            <FaArrowRight />
          </Button>
        </div>
        <Image src={beginning} alt="Just the beginning" className="w-full h-[540px] object-cover beginning-image" />
      </div>
    </div>

  )
}
