"use client";

import Link from "next/link";
import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { BrandLogo } from "@/app/components/brand-logo";
import { GradientActionLink } from "@/app/components/gradient-action-link";

const inter = Inter({
  weight: ["500", "600"],
  subsets: ["latin"],
});

const navigationItems = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/about", label: "About us" },
];

type HeaderConfig = {
  hidden?: boolean;
  actionLabel?: string;
  actionHref?: string;
};

const defaultHeaderConfig: HeaderConfig = {
  actionLabel: "sign in",
  actionHref: "/login",
};

const headerConfigByPath: Record<string, HeaderConfig> = {
  "/login": {
    actionLabel: "sign up",
    actionHref: "/signup",
  },
  "/signup": {
    actionLabel: "sign in",
    actionHref: "/login",
  },
};

function getDesktopNavigationLinkClass(isActive: boolean, fontClassName: string) {
  return `${fontClassName} shrink-0 rounded-full px-3 py-2 text-[15px] font-medium leading-[1] text-[#4a5568] transition-colors hover:bg-[#f4f0ff] hover:text-[#1a202c] md:px-0 md:py-0 md:text-[16px] md:leading-[25px] ${isActive ? "bg-[#f4f0ff] text-[#24145f] md:bg-transparent" : ""}`;
}

function getMobileNavigationLinkClass(isActive: boolean, fontClassName: string) {
  return `${fontClassName} rounded-2xl px-4 py-3 text-[15px] font-medium leading-[1.2] transition-colors ${isActive ? "bg-[#f4f0ff] text-[#24145f]" : "text-[#4a5568] hover:bg-[#f8f5ff] hover:text-[#1a202c]"}`;
}

export function MainHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const headerConfig = pathname
    ? { ...defaultHeaderConfig, ...headerConfigByPath[pathname] }
    : defaultHeaderConfig;

  if (headerConfig.hidden) {
    return null;
  }

  const actionHref = headerConfig.actionHref ?? defaultHeaderConfig.actionHref ?? "/login";

  return (
    <header className="w-full border-b border-black/5 bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.08)]">
      <div className="mx-auto flex w-full max-w-[1440px] items-center gap-3 px-4 py-3 sm:px-5 md:min-h-[84px] md:gap-6 md:py-0 lg:px-8">
        <BrandLogo />

        <nav className="hidden flex-1 items-center justify-center gap-8 md:flex lg:gap-20">
          {navigationItems.map((navigationItem) => (
            <Link
              key={navigationItem.href}
              href={navigationItem.href}
              className={getDesktopNavigationLinkClass(pathname === navigationItem.href, inter.className)}
            >
              {navigationItem.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden md:flex md:items-center">
          <GradientActionLink
            href={actionHref}
            className={`${inter.className} inline-flex h-[48px] items-center justify-center rounded-[5px] px-[30px] text-[14px] font-medium leading-[14px] text-[#fafafa] shadow-[0px_4px_24.5px_rgba(0,0,0,0.15)] transition-opacity hover:opacity-95`}
          >
            {headerConfig.actionLabel}
          </GradientActionLink>
        </div>

        <button
          type="button"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
          className="ml-auto inline-flex size-11 items-center justify-center rounded-full border border-[#d7dce5] bg-white text-[#24145f] shadow-[0px_6px_20px_rgba(36,20,95,0.12)] transition-colors hover:bg-[#f8f5ff] md:hidden"
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          <span className="relative block h-[18px] w-[20px]">
            <span
              className={`absolute left-0 top-[2px] h-[2px] w-full rounded-full bg-current transition-transform duration-200 ${
                isMenuOpen ? "translate-y-[6px] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[8px] h-[2px] w-full rounded-full bg-current transition-opacity duration-200 ${
                isMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 top-[14px] h-[2px] w-full rounded-full bg-current transition-transform duration-200 ${
                isMenuOpen ? "-translate-y-[6px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-black/5 bg-white px-4 py-4 shadow-[0px_12px_30px_rgba(0,0,0,0.08)] md:hidden">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3">
            <nav className="flex flex-col gap-2">
              {navigationItems.map((navigationItem) => (
                <Link
                  key={navigationItem.href}
                  href={navigationItem.href}
                  className={getMobileNavigationLinkClass(pathname === navigationItem.href, inter.className)}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {navigationItem.label}
                </Link>
              ))}
            </nav>

            <GradientActionLink
              href={actionHref}
              onClick={() => setIsMenuOpen(false)}
              className={`${inter.className} inline-flex h-[48px] items-center justify-center rounded-[5px] px-[30px] text-[14px] font-medium leading-[14px] text-[#fafafa] shadow-[0px_4px_24.5px_rgba(0,0,0,0.15)] transition-opacity hover:opacity-95`}
            >
              {headerConfig.actionLabel}
            </GradientActionLink>
          </div>
        </div>
      ) : null}
    </header>
  );
}
