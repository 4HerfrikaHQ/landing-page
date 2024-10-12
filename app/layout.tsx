import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Logo } from "@/components/Logo";
import { NavbarLink } from "@/components/NavbarLink";

export const metadata: Metadata = {
  title: "4Herfrika",
  description: "4Herfrika",
};

const outfitSans = Outfit({
  weight: ["400"],
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfitSans.className} antialiased`}>
        <div className="bg-white">
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
                <button
                  type="button"
                  className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-300"
                >
                  <span className="sr-only">Open main menu</span>
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
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                </button>
              </div>
              <div className="hidden lg:flex lg:gap-x-12 text-gray-400">
                <NavbarLink href="/">Home</NavbarLink>
                <NavbarLink href="/about">About</NavbarLink>
                <NavbarLink href="/blog">Blog</NavbarLink>
                <NavbarLink href="/career-corner">Career Corner</NavbarLink>
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
            <dialog className="lg:hidden" aria-modal="true">
              <div className="fixed inset-0 z-50" />
              <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-200/10">
                <div className="flex items-center justify-between">
                  <a href="/" className="-m-1.5 p-1.5">
                    <span className="sr-only">4Herfrika</span>
                    <Logo />
                  </a>
                  <button
                    type="button"
                    className="-m-2.5 rounded-md p-2.5 text-gray-300"
                  >
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
                </div>
                <div className="mt-6 flow-root">
                  <div className="-my-6 divide-y divide-gray-500/10">
                    <div className="space-y-2 py-6">
                      <a
                        href="/"
                        className="-mx-3 block rounded-lg px-3 py-2 text-base leading-7 text-gray-200 hover:bg-gray-50"
                      >
                        Home
                      </a>
                      <a
                        href="/about"
                        className="-mx-3 block rounded-lg px-3 py-2 text-base leading-7 text-gray-400 hover:bg-gray-50"
                      >
                        About
                      </a>
                      <a
                        href="/career-corner"
                        className="-mx-3 block rounded-lg px-3 py-2 text-base leading-7 text-gray-400 hover:bg-gray-50"
                      >
                        Career Corner
                      </a>
                      <a
                        href="/contact-us"
                        className="-mx-3 block rounded-lg px-3 py-2 text-base leading-7 text-gray-400 hover:bg-gray-50"
                      >
                        Contact Us
                      </a>
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
                      className="text-gray-300 transition hover:text-gray-300/75"
                      href="/"
                    >
                      Home
                    </a>
                  </li>

                  <li>
                    <a
                      className="text-gray-300 transition hover:text-gray-300/75"
                      href="/about"
                    >
                      About Us
                    </a>
                  </li>

                  <li>
                    <a
                      className="text-gray-300 transition hover:text-gray-300/75"
                      href="/"
                    >
                      Boss Divas
                    </a>
                  </li>

                  <li>
                    <a
                      className="text-gray-300 transition hover:text-gray-300/75"
                      href="/"
                    >
                      Tech Divas
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-gray-300 transition hover:text-gray-300/75"
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
                      className="text-gray-300 transition hover:text-gray-300/75"
                      href="/"
                    >
                      FAQs
                    </a>
                  </li>

                  <li>
                    <a
                      className="text-gray-300 transition hover:text-gray-300/75"
                      href="/"
                    >
                      Blog (Coming Soon)
                    </a>
                  </li>

                  <li>
                    <a
                      className="text-gray-300 transition hover:text-gray-300/75"
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
                      className="text-gray-300 transition hover:text-gray-300/75"
                      href="tel:+234-123-456-7890"
                    >
                      +234-123-456-7890
                    </a>
                  </li>

                  <li>
                    <a
                      className="text-gray-300 transition hover:text-gray-300/75"
                      href="mailto:info@4herfrika.com"
                    >
                      info@4herfrika.com
                    </a>
                  </li>
                </ul>
              </div>

              <div className="text-center sm:text-left md:col-span-4 lg:col-span-2">
                <div className="bg-neutral-500/95">
                  <p className="font-bold text-gray-200">Subscribe</p>

                  <div className="mx-auto mt-8 max-w-md sm:ms-0">
                    <form className="mt-4">
                      <div className="flex flex-row lg:items-start">
                        <label htmlFor="email" className="sr-only">
                          Email Address
                        </label>

                        <input
                          className="w-full rounded-tl-md rounded-bl-md border-gray-200 px-6 py-3 shadow-sm placeholder:text-primary-500 focus:ring-primary-500 focus:border-primary-500 sm:max-w-xs"
                          type="email"
                          placeholder="Email Address"
                        />

                        <button
                          className="rounded-br-md rounded-tr-md bg-primary-500 px-8 py-3 font-bold text-white transition hover:bg-primary-500"
                          type="submit"
                        >
                          &rarr;
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
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="/"
                    className="text-white transition hover:text-primary-500/75"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>

              <ul className="mt-4 flex justify-center gap-6 sm:mt-0 sm:justify-start">
                <li>
                  <a
                    href="/" // TODO: Add facebook links
                    rel="noreferrer"
                    target="_blank"
                    className="text-white transition hover:text-primary-500/75"
                  >
                    <span className="sr-only">Facebook</span>
                    <svg
                      className="size-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                </li>

                <li>
                  <a
                    href="/" // TODO: Add Instagram link
                    rel="noreferrer"
                    target="_blank"
                    className="text-white transition hover:text-primary-500/75"
                  >
                    <span className="sr-only">Instagram</span>
                    <svg
                      className="size-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                </li>

                <li>
                  <a
                    href="/" // TODO: Change to Twitter link
                    rel="noreferrer"
                    target="_blank"
                    className="text-white transition hover:text-primary-500/75"
                  >
                    <span className="sr-only">Twitter</span>
                    <svg
                      className="size-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
