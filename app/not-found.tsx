import Link from "next/link";

export default function NotFoundPage() {
    return (
        <div className="flex items-center justify-center py-12 px-4 lg:pt-44">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-zinc-100">
                        Oops! Something went wrong
                    </h2>
                    <p className="mt-2 text-sm text-zinc-300">
                        This file, page or resource could not be found
                    </p>
                </div>
                <div className="mt-8 space-y-6 flex justify-center">
                    <Link
                        className="group relative w-1/2 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-secondary-500 hover:bg-secondary-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-600"
                        href="/"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
