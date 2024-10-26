import { redirect } from "next/navigation";
import { PageProps } from "@premieroctet/next-admin";
import prisma from "@/utils/prisma";
import { Logo } from "@/components/Logo";
import { auth, signIn, signOut } from "../../../api/auth/config";
import { EmailSubmitButton } from "../components";
import Link from "next/link";
import { env } from "@/utils/env";

type PageTypes = "check-email" | "error";

const handleSubmit = async (
  formData: FormData,
  searchParams?: PageProps["searchParams"]
) => {
  "use server";
  let pageType: PageTypes = "check-email";

  try {
    const email = formData.get("email")?.toString();
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (user || email === env.ADMIN_EMAIL) {
      await signIn(
        "resend",
        { email, redirect: false },
        new URLSearchParams(searchParams as Record<string, string>)
      );
    } else {
      console.error("SignIn Error::", "User not found");
      pageType = "error";
    }
  } catch (error) {
    console.error("SignIn Error::", error);
    pageType = "error";
  }

  redirect(`/backoffice/auth?action=${pageType}`);
};

const signOutUser = async () => {
  "use server";
  await signOut({ redirectTo: "/backoffice/auth" });
};

function renderAuth({ searchParams }: PageProps) {
  switch (searchParams?.action) {
    case "check-email":
      return (
        <div
          className="p-6 space-y-4 flex flex-col
         items-center"
        >
          <h2 className="text-lg font-semibold">Check your email</h2>
          <p className="text-sm">
            We&apos;ve sent you a magic link to your email address. Click the
            link to continue.
          </p>
          <a
            href="mailto:"
            className="bg-primary-500 inline-block text-white py-2 px-4 rounded-md text-sm font-medium"
          >
            Open email app
          </a>
        </div>
      );
    case "error":
      return (
        <div
          className="p-6 space-y-4 flex flex-col
         items-center"
        >
          <h2 className="text-lg font-semibold">An error occurred</h2>
          <p className="text-sm">
            {searchParams?.error
              ? `A server side ${searchParams?.error} occurred.`
              : "We couldn't send you a magic link. Please try again."}
          </p>
          <Link
            href="/backoffice/auth"
            className="bg-primary-500 inline-block text-white py-2 px-4 rounded-md text-sm font-medium"
          >
            Try again
          </Link>
        </div>
      );
    default:
      return (
        <>
          <div className="p-6 pt-0 space-y-4">
            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-user absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <input
                  name="email"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  id="email"
                  placeholder="joe@example.com"
                  type="email"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center px-6 py-0">
            <EmailSubmitButton />
          </div>
          <div className="flex items-center p-6 pt-3">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-white text-black hover:bg-gray-100 h-10 px-4 py-2 w-full dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
            >
              Continue with Google
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M21.35 11.1h-9.17v2.72h5.27c-.23 1.24-.92 2.29-1.94 2.98v2.48h3.12c1.82-1.68 2.87-4.15 2.87-6.98 0-.46-.03-.91-.09-1.35z"
                  fill="#4285F4"
                ></path>
                <path
                  d="M12.18 22c2.48 0 4.56-.82 6.08-2.22l-3.12-2.48c-.86.58-1.94.93-3.12.93-2.4 0-4.43-1.62-5.15-3.8H3.62v2.38c1.52 3.02 4.68 5.18 8.56 5.18z"
                  fill="#34A853"
                ></path>
                <path
                  d="M6.03 13.43c-.2-.58-.31-1.2-.31-1.83s.11-1.25.31-1.83V7.39H3.62C2.96 8.64 2.6 10.17 2.6 11.6c0 1.43.36 2.96 1.02 4.21l2.41-2.38z"
                  fill="#FBBC05"
                ></path>
                <path
                  d="M12.18 4.82c1.32 0 2.5.45 3.43 1.34l2.54-2.54C16.74 2.36 14.66 1.4 12.18 1.4 8.3 1.4 5.14 3.56 3.62 6.58l2.41 2.38c.72-2.18 2.75-3.8 5.15-3.8z"
                  fill="#EA4335"
                ></path>
              </svg>
            </button>
          </div>
        </>
      );
  }
}

export default async function AuthPage(props: PageProps) {
  if (["signout"].includes(props.searchParams?.action as string)) {
    await signOutUser();
    return <></>;
  }
  const session = await auth();
  if (session) {
    redirect("/backoffice");
  }
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
      <form
        className="rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-md"
        action={async (formData) => {
          "use server";
          await handleSubmit(formData, props.searchParams);
        }}
      >
        <div className="flex flex-col p-6 space-y-1">
          <h3 className="flex justify-center">
            <Logo />
          </h3>
        </div>
        {renderAuth({ ...props })}
      </form>
    </div>
  );
}
