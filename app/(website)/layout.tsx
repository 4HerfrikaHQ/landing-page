import "../globals.css";
import { Logo } from "@/components/Logo";
import { NavbarLink } from "@/components/NavbarLink";
import { MenubarButton } from "@/components/MenubarButton";

export default function WebLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="">
        <header className="sticky inset-x-0 top-0 z-50">
          <nav
            className="flex items-center justify-between p-6 lg:px-8"
            aria-label="Global"
          >
            <div className="flex lg:flex-1">
              <a href="/" className="-m-1.5 p-1.5">
                <span className="sr-only">4Herfrika</span>
                <Logo />
              </a>
            </div>
            <div className="flex lg:hidden">
              <MenubarButton />
            </div>
            <div className="hidden lg:flex lg:gap-x-12 text-gray-400">
              <NavbarLink href="/">Home</NavbarLink>
              <NavbarLink href="/about">About</NavbarLink>
              <NavbarLink href="/">Blog</NavbarLink>
              <NavbarLink href="/">Career Corner</NavbarLink>
            </div>
            <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center gap-8">
              <NavbarLink href="/contact-us">Contact Us</NavbarLink>
              <a
                href="/join-us" // TODO: replace with google form link
                className="text-sm leading-6 text-white bg-primary-500 hover:bg-primary-400 py-2 px-4 rounded-full"
              >
                Register
              </a>
            </div>
          </nav>
          <dialog id="menu" className="lg:hidden" aria-modal="true">
            <div className="fixed inset-0 z-50" />
            <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-200/10">
              <div className="flex items-center justify-between">
                <a href="/" className="-m-1.5 p-1.5">
                  <span className="sr-only">4Herfrika</span>
                  <Logo />
                </a>
                <form
                  method="dialog"
                  className="-m-2.5 rounded-md p-2.5 text-gray-300"
                >
                  <button type="submit">
                    <span className="sr-only">Close menu</span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </form>
              </div>
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-gray-500/10">
                  <div className="space-y-2 py-6">
                    <NavbarLink href="/" className="-mx-3 block px-3 py-2">
                      Home
                    </NavbarLink>
                    <NavbarLink href="/about" className="-mx-3 block px-3 py-2">
                      About
                    </NavbarLink>
                    <NavbarLink href="/" className="-mx-3 block px-3 py-2">
                      Blog
                    </NavbarLink>
                    <NavbarLink href="/" className="-mx-3 block px-3 py-2">
                      Career Corner
                    </NavbarLink>
                    <NavbarLink
                      href="/contact-us"
                      className="-mx-3 block px-3 py-2 underline"
                    >
                      Contact Us
                    </NavbarLink>
                  </div>
                  <div className="py-6">
                    <a
                      href="/join-us" // TODO: replace with google form link
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base leading-7 text-gray-400 hover:bg-gray-50"
                    >
                      Register
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </dialog>
        </header>
      </div>
      {children}
      <footer className="bg-secondary-500">
        <div className="mx-auto max-w-screen-xl px-4 pb-6 pt-16  sm:px-6 lg:px-8">
          <div className="mt-16 flex flex-col-reverse gap-8 pt-16 md:grid md:grid-cols-3 lg:grid-cols-5">
            <div className="text-center sm:text-left">
              <p className="font-bold text-gray-200">Quick Links</p>

              <ul className="mt-8 space-y-4 text-sm">
                <li>
                  <a
                    className="text-white transition hover:text-white/75"
                    href="/"
                  >
                    Home
                  </a>
                </li>

                <li>
                  <a
                    className="text-white transition hover:text-white/75"
                    href="/about"
                  >
                    About Us
                  </a>
                </li>

                <li>
                  <a
                    className="text-white transition hover:text-white/75"
                    href="/"
                  >
                    Boss Divas
                  </a>
                </li>

                <li>
                  <a
                    className="text-white transition hover:text-white/75"
                    href="/"
                  >
                    Tech Divas
                  </a>
                </li>
                <li>
                  <a
                    className="text-white transition hover:text-white/75"
                    href="/"
                  >
                    Become an Ambassador
                  </a>
                </li>
              </ul>
            </div>

            <div className="text-center sm:text-left">
              <p className="font-bold text-gray-200">Legal</p>

              <ul className="mt-8 space-y-4 text-sm">
                <li>
                  <a
                    className="text-white transition hover:text-white/75"
                    href="/"
                  >
                    FAQs
                  </a>
                </li>

                <li>
                  <a
                    className="text-white transition hover:text-white/75"
                    href="/"
                  >
                    Blog
                  </a>
                </li>

                <li>
                  <a
                    className="text-white transition hover:text-white/75"
                    href="/"
                  >
                    Support
                  </a>
                </li>
              </ul>
            </div>

            <div className="text-center sm:text-left">
              <p className="font-bold text-gray-200">Contact Us</p>

              <ul className="mt-8 space-y-4 text-sm">
                <li>
                  <a
                    className="text-white transition hover:text-white/75"
                    href="tel:+234-123-456-7890"
                  >
                    +234-123-456-7890
                  </a>
                </li>

                <li>
                  <a
                    className="text-white transition hover:text-white/75"
                    href="mailto:info@4herfrika.org"
                  >
                    info@4herfrika.org
                  </a>
                </li>
              </ul>
            </div>

            <div className="text-center sm:text-left md:col-span-4 lg:col-span-2">
              <div className="bg-neutral-500/20 p-12 rounded-2xl -mt-8">
                <p className="font-bold text-gray-200">Subscribe</p>

                <div className="mx-auto mt-8 max-w-md sm:ms-0">
                  <form className="mt-4">
                    <div className="flex flex-row lg:items-start">
                      <label htmlFor="email" className="sr-only">
                        Email Address
                      </label>

                      <input
                        className="w-full rounded-tl-md rounded-bl-md border-gray-200 px-6 py-3 shadow-sm placeholder:text-primary-500/60 focus:ring-primary-500 focus:border-primary-500 sm:max-w-xs"
                        type="email"
                        placeholder="Email Address"
                      />

                      <button
                        className="rounded-br-md rounded-tr-md bg-primary-500/60 px-8 py-4 font-bold text-white hover:bg-primary-500/65"
                        type="submit"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 13"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M9.23347 13L14.8898 7.42846C15.4106 6.91519 15.4106 6.08324 14.8898 5.57154L9.23347 0L7.34788 1.8581L10.7279 5.18669H0L0 7.81292H10.7279L7.34788 11.1427L9.23347 13Z"
                            fill="white"
                          />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-gray-200 mt-2">
                      Subscribe to our newsletter for the latest updates and
                      news
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-6 flex flex-col justify-center items-center gap-4 sm:flex-row sm:justify-between">
            <p className="flex flex-row items-center gap-4 text-center text-sm text-gray-200 sm:text-left">
              <span className="bg-white rounded-md px-2 py-1 w-32">
                <Logo className="w-28" />
              </span>{" "}
              &copy; {new Date().getFullYear()}.
            </p>

            <ul className="flex justify-center gap-6 sm:justify-start">
              <li>
                <a
                  href="/"
                  className="text-white transition hover:text-primary-500/75"
                >
                  Terms
                </a>
              </li>
              <li>
                <a
                  href="/"
                  className="text-white transition hover:text-primary-500/75"
                >
                  Privacy
                </a>
              </li>

              <li>
                <a
                  href="/"
                  className="text-white transition hover:text-primary-500/75"
                >
                  Cookies
                </a>
              </li>
            </ul>

            <ul className="mt-4 flex justify-center gap-6 sm:mt-0 sm:justify-start">
              <li>
                <a
                  href="/" // TODO: Add facebook links
                  rel="noreferrer"
                  target="_blank"
                  className="text-white transition hover:text-neutral-500/75 block p-4 border-[1.5px] border-neutral-500/30 rounded-full"
                >
                  <span className="sr-only">LinkedIn</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.48355 2.9671C2.30289 2.9671 2.9671 2.30289 2.9671 1.48355C2.9671 0.664208 2.30289 0 1.48355 0C0.664208 0 0 0.664208 0 1.48355C0 2.30289 0.664208 2.9671 1.48355 2.9671Z"
                      fill="currentColor"
                    />
                    <path
                      d="M2.71984 3.95801H0.247258C0.110772 3.95801 0 4.06878 0 4.20527V11.623C0 11.7595 0.110772 11.8703 0.247258 11.8703H2.71984C2.85633 11.8703 2.9671 11.7595 2.9671 11.623V4.20527C2.9671 4.06878 2.85633 3.95801 2.71984 3.95801Z"
                      fill="currentColor"
                    />
                    <path
                      d="M10.088 3.54665C9.03126 3.18466 7.70942 3.50263 6.91671 4.07281C6.88951 3.96649 6.79258 3.88737 6.67736 3.88737H4.20478C4.06829 3.88737 3.95752 3.99814 3.95752 4.13463V11.5524C3.95752 11.6889 4.06829 11.7996 4.20478 11.7996H6.67736C6.81385 11.7996 6.92462 11.6889 6.92462 11.5524V6.22149C7.32419 5.8773 7.83898 5.76752 8.26031 5.94653C8.66878 6.11912 8.90269 6.54045 8.90269 7.10172V11.5524C8.90269 11.6889 9.01346 11.7996 9.14994 11.7996H11.6225C11.759 11.7996 11.8698 11.6889 11.8698 11.5524V6.60375C11.8416 4.57178 10.8857 3.81962 10.088 3.54665Z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
              </li>

              <li>
                <a
                  href="/" // TODO: Add Instagram link
                  rel="noreferrer"
                  target="_blank"
                  className="text-white transition hover:text-neutral-500/75 block p-4 border-[1.5px] border-neutral-500/30 rounded-full"
                >
                  <span className="sr-only">Instagram</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5.99839 3.99907C4.89666 3.99907 3.99757 4.89816 3.99757 5.99989C3.99757 7.10161 4.89666 8.0007 5.99839 8.0007C7.10011 8.0007 7.9992 7.10161 7.9992 5.99989C7.9992 4.89816 7.10011 3.99907 5.99839 3.99907ZM11.9993 5.99989C11.9993 5.17134 12.0068 4.3503 11.9603 3.52326C11.9138 2.56263 11.6946 1.71007 10.9922 1.00761C10.2882 0.303646 9.43715 0.0860026 8.47652 0.0394721C7.64797 -0.00705849 6.82693 0.00044646 5.99989 0.00044646C5.17134 0.00044646 4.3503 -0.00705849 3.52326 0.0394721C2.56263 0.0860026 1.71007 0.305147 1.00761 1.00761C0.303646 1.71157 0.0860026 2.56263 0.0394721 3.52326C-0.00705849 4.35181 0.00044646 5.17284 0.00044646 5.99989C0.00044646 6.82693 -0.00705849 7.64947 0.0394721 8.47652C0.0860026 9.43715 0.305147 10.2897 1.00761 10.9922C1.71157 11.6961 2.56263 11.9138 3.52326 11.9603C4.35181 12.0068 5.17284 11.9993 5.99989 11.9993C6.82843 11.9993 7.64947 12.0068 8.47652 11.9603C9.43715 11.9138 10.2897 11.6946 10.9922 10.9922C11.6961 10.2882 11.9138 9.43715 11.9603 8.47652C12.0083 7.64947 11.9993 6.82843 11.9993 5.99989ZM5.99839 9.07841C4.29477 9.07841 2.91986 7.70351 2.91986 5.99989C2.91986 4.29627 4.29477 2.92137 5.99839 2.92137C7.70201 2.92137 9.07691 4.29627 9.07691 5.99989C9.07691 7.70351 7.70201 9.07841 5.99839 9.07841ZM9.20299 3.51426C8.80523 3.51426 8.48402 3.19304 8.48402 2.79528C8.48402 2.39752 8.80523 2.07631 9.20299 2.07631C9.60075 2.07631 9.92197 2.39752 9.92197 2.79528C9.92208 2.88973 9.90357 2.98328 9.86748 3.07056C9.83139 3.15785 9.77843 3.23715 9.71165 3.30394C9.64486 3.37072 9.56556 3.42368 9.47827 3.45977C9.39099 3.49586 9.29744 3.51437 9.20299 3.51426Z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
              </li>

              <li>
                <a
                  href="/" // TODO: Change to X link
                  rel="noreferrer"
                  target="_blank"
                  className="text-white transition hover:text-neutral-500/75 block p-4 border-[1.5px] border-neutral-500/30 rounded-full"
                >
                  <span className="sr-only">X</span>
                  <svg
                    width="12"
                    height="11"
                    viewBox="0 0 12 11"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.4506 0H11.2908L7.2708 4.575L12 10.8H8.2968L5.397 7.0242L2.0784 10.8H0.2364L4.5366 5.907L0 0H3.7968L6.4188 3.4512L9.4506 0ZM8.805 9.7032H9.825L3.2424 1.0392H2.148L8.805 9.7032Z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
}
