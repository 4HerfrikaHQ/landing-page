"use client";

import type { NAV_LINKS } from "./navigation";

export const DropdownMenu = ({
	item,
	setHoveredItem,
}: {
	item: (typeof NAV_LINKS)[0];
	setHoveredItem: (name: string | null) => void;
}) => {
	return (
		<div onMouseEnter={() => setHoveredItem(item.name)} className="relative">
			<button
				type="button"
				className="flex items-center gap-1 text-gray-600 hover:text-primary-500"
			>
				{item.name}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="transition-transform"
				>
					<title>Arrow Down</title>
					<polyline points="6 9 12 15 18 9" />
				</svg>
			</button>
		</div>
	);
};
