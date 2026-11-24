"use client";

import { usePathname } from "@/i18n/navigation";
import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";
import { useNavHidden } from "./use-nav-hidden";

export function Navbar() {
	const hidden = useNavHidden();
	const pathname = usePathname();

	return (
		<header
			data-site-navbar
			data-hidden={hidden}
			className="site-nav pointer-events-none fixed inset-x-0 top-3 z-50 px-3 xl:top-6 xl:px-0"
		>
			<DesktopNav />
			<MobileNav key={pathname} />
		</header>
	);
}
