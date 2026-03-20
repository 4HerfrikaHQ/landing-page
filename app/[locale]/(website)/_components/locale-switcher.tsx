"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { LOCALES } from "@/i18n/routing";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LOCALES.find((l) => l.locale === locale);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function switchLocale(nextLocale: (typeof LOCALES)[number]["locale"]) {
    router.replace(pathname, { locale: nextLocale });
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="gap-1.5"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{current?.name}</span>
        <span className="sm:hidden">{current?.flag}</span>
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-background border border-border rounded-lg shadow-lg z-50 min-w-[140px] py-1">
          {LOCALES.map((l) => (
            <button
              key={l.locale}
              type="button"
              onClick={() => switchLocale(l.locale)}
              className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-muted transition-colors ${
                l.locale === locale ? "text-primary-500 font-medium" : "text-foreground"
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
