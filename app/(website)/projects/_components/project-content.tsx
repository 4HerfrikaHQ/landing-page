export function ProjectContent({ children }: { children: React.ReactNode }) {
	return (
		<article
			className="
        prose prose-gray max-w-none
        prose-headings:scroll-mt-24
        prose-h2:text-gray-900 prose-h2:font-extrabold
        prose-h3:text-gray-900 prose-h3:font-bold
        prose-p:text-gray-700
        prose-strong:text-gray-900
        prose-li:marker:text-gray-400
        prose-a:text-pink-700 prose-a:no-underline hover:prose-a:underline
        prose-img:rounded-xl
      "
		>
			{children}
		</article>
	);
}
