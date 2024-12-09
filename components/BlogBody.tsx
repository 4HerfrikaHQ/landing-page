"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const posts = [
  {
    id: 1,
    title: "Stoptheviolence",
    href: "#",
    description: "We carried out secondary school outreaches to Akoka high, Lagos to sensitize 700 pupils on Gender Based Violence and legal implications of violence...",
    date: "Sept. 3",
    datetime: "5 min read",
    location: "SDGs 5 & 16",
    category: { title: "Marketing", href: "#" },
    author: {
      name: "Michael Foster",
      role: "Co-Founder / CTO",
      href: "#",
      imageUrl: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    img: "/assets/blog-1.png",
  },
  {
    id: 2,
    title: "Pad-A-Girl",
    href: "#",
    description: "In Nasarawa, a number of girls are most times absent from school during their menstrual periods due to lack of access to sanitary products and...",
    date: "Sept. 3",
    datetime: "5 min read",
    location: "Nasarawa State, Nigeria",
    category: { title: "Marketing", href: "#" },
    author: {
      name: "Michael Foster",
      role: "Co-Founder / CTO",
      href: "#",
      imageUrl: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    img: "/assets/blog-1.png",
  },
  {
    id: 3,
    title: "Digi-Rural",
    href: "#",
    description:
      "Oyo state has been growing in digitalization but many rural communities in the state remain unreached. This project will impact 100 girls in secondary schools...",
    date: "Sept. 3",
    datetime: "5 min read",
    location: "Oyo State, Nigeria",
    category: { title: "Marketing", href: "#" },
    author: {
      name: "Michael Foster",
      role: "Co-Founder / CTO",
      href: "#",
      imageUrl: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    img: "/assets/blog-1.png",
  },
  {
    id: 4,
    title: "Project Saturn",
    href: "#",
    description:
      "Its complexity makes it the most complex and unique of all the planets. This project is called Saturn because it is designed to celebrate the uniqueness and strength of the girl child...",
    date: "Sept. 3",
    datetime: "5 min read",
    location: "50 Days Until Launch",
    category: { title: "Marketing", href: "#" },
    author: {
      name: "Michael Foster",
      role: "Co-Founder / CTO",
      href: "#",
      imageUrl: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    img: "/assets/blog-1.png",
  },
];

const postCategories = ["Featured", "Leadership", "Personal Development", "Community Building", "Career Growth", "Success Stories"];

const BlogBody = () => {
  const [active, setActive] = useState("Featured");
  return (
    <div className="mx-auto w-full max-w-[1320px] flex flex-col gap-8 py-20">
      <div className="lg:w-full lg:gap-12 w-11/12 mx-auto overflow-x-auto flex gap-6 overflow-visible">
        {postCategories?.map((item, index) => {
          return (
            <p
              key={index}
              className={
                active === item ? "font-bold font-xl text-[#EC008C] underline cursor-pointer w-fit shrink-0" : "shrink-0 font-light font-xl text-[#333333] w-fit cursor-pointer"
              }
              onClick={() => setActive(item)}>
              {item}
            </p>
          );
        })}
      </div>
      <div className="flex gap-6 flex-col md:flex-row">
        {posts?.map((item) => {
          return (
            <div key={item.id} className=" w-9/12 lg:w-1/4 mx-auto flex flex-col gap-7 bg-[#F2F2F2] rounded-[6px]">
              <div className="relative w-full h-[221px]">
                <Image src={item.img} fill alt="blog" className="rounded-t-[6px]" />
              </div>
              <div className="relative px-3 pb-4 flex flex-col gap-3">
                <div className="absolute -top-10 bg-white px-1.5 py-1.5 flex gap-2.5 rounded-[20px] items-center">
                  <div className="w-3 h-3 rounded-full bg-[#03065C]"></div>
                  <p className="text-[#03065C] text-xs font-normal">{item.location}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="text-base font-normal text-[#333333]">{item.title}</h2>
                  <p className="text-sm font-normal text-[#555555]">{item.description}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="font-normal text-sm text-[#333333]">
                    {item.date} {"                  "}
                    {item.datetime}
                  </p>
                  <Link href="/" className="text-[#EC008C] font-normal text-sm">
                    Read More
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-end w-11/12 lg:w-full">
        <Link href="/" className=" border  border-primary-500/100 rounded-full py-4 px-8 text-primary-500/100 text-xl font-normal">
          View All Projects
        </Link>
      </div>
    </div>
  );
};

export default BlogBody;

// {
//     id: 1,
//     title: "Stoptheviolence",
//     href: "#",
//     description: "We carried out secondary school outreaches to Akoka high, Lagos to sensitize 700 pupils on Gender Based Violence and legal implications of violence...",
//     date: "Sept. 3",
//     datetime: "5 min read",
//     category: { title: "Marketing", href: "#" },
//     author: {
//       name: "Michael Foster",
//       role: "Co-Founder / CTO",
//       href: "#",
//       imageUrl: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
//     },
//   },
