"use client";
import { useEffect } from "react";
import { useFormStatus } from "react-dom";
import toast from "react-hot-toast";

export function EmailSubmitButton() {
  const { data, pending } = useFormStatus();

  useEffect(() => {
    if (data && !pending) {
      toast.success("Check your email for the magic link!", {
        icon: "📬",
      });
    }
  }, [data, pending]);

  return (
    <button
      type="submit"
      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary-500 text-white hover:bg-primary-500/90 h-10 px-4 py-2 w-full dark:bg-primary-400 dark:hover:bg-primary-400/90"
      disabled={pending}
    >
      {pending && (
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      Continue with Email
    </button>
  );
}
