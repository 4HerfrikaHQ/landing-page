import FaqDetails from "@/components/FaqDetails";
import SearchSvg from "@/components/svgs/search";
import { createClient } from "@/prismicio";
import { Content } from "@prismicio/client";
import OpenSvg from "@/components/svgs/open";
import CloseSvg from "@/components/svgs/close";
import FaqSvg from "@/components/svgs/faq";
import SkillUpPopup from "@/components/SkillupModal";
import FAQ from "@/components/FAQ/FAQ";
import { Button } from "../../../components/Button";

export default async function FAQPage() {
  const client = createClient();

  const page = await client.getSingle<Content.FaqPageDocument>("faq_page",
    {
      graphQuery: `
    {
      faq_page {
        header_image
        frequently_asked_questions {
          section {
            ... on faq {
              title
              faq
            }
          }
        }
      }
    }
  `
    })

  return (
    <>
      <div className="faqbg lg:pb-24 md:pb-16 pb-14 relative">
        {page.data.header_image.url && <img src={page.data.header_image.url} className="absolute top-0 left-0 w-full h-full object-cover brightness-50" />}
        <div className="mx-auto max-w-screen-xl px-4 pb-6 pt-16  sm:px-6 lg:px-8 relative">
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
      </div>
      <div className="pt-20">
        {
          page.data.frequently_asked_questions.map(({ section }) => (
            <div className="mb-20">
              <h1 className="md:text-[60px] text-[34px] lg:text-[67px] font-semibold text-center mb-8">
                {section.data.title.split(" ").map(word => (
                  <>
                    <span className="text-primary-500">{word[0]}</span>
                    <span>{word.slice(1)}</span>
                    {" "}
                  </>
                ))}
              </h1>
              <div className="grid gap-y-6 w-full px-8 md:px-0 md:w-3/4 mx-auto">
                {section.data.faq.map(faq => <FAQ question={faq.question} answer={faq.answer} />)}
              </div>
            </div>
          ))
        }
      </div>
      <div class="md:pt-16 px-8 pb-10">
        <div class="p-8 bg-neutral-400 rounded-2xl flex flex-col gap-y-8 md:flex-row md:items-center justify-between">
          <div>
            <h4 class="text-primary-500/60 font-semibold text-2xl mb-2">
              Still have questions?
            </h4>
            <p className="text-xl text-primary-500/60">
              Can’t find the answer you’re looking for? Please chat to our friendly team.
            </p>
          </div>

          <a href="mailto:support@4herfrika.org" className="w-fit hover:no-underline bg-primary-500 px-5 py-2.5 text-white text-lg font-semibold rounded-lg">
            Get in touch
          </a>
        </div>
      </div>
    </>
  );
}
