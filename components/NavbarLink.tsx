import { usePathname } from "next/navigation";
import type { FC, HTMLProps } from "react";

/**
 * A link in the navbar.
 *
 * Takes all the props of an anchor element.
 */
export const NavbarLink: FC<HTMLProps<HTMLAnchorElement>> = ({
    href,
    className,
    children,
    ...props
}) => {
    const pathname = usePathname();
    return (
        <a
            href={href}
            className={`text-sm leading-6 text-gray-900 hover:text-gray-900 dark:text-gray-100 dark:hover:text-gray-100 ${className}`}
            data-active={pathname === href}
            {...props}
        >
            {children}
        </a>
    );
};
