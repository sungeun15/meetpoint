"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { BrandLogo } from "@/app/components/brand-logo";
import { GradientActionLink } from "@/app/components/gradient-action-link";

const headerFontClassName = "font-pretendard font-medium";

const navigationItems = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/about", label: "About us" },
];

const inAppNavigationItems = [
  { href: "/friends", label: "Friends" },
  { href: "/chat", label: "Chat" },
];

type HeaderConfig = {
  hidden?: boolean;
  actionLabel?: string;
  actionHref?: string;
  actionKind?: "link" | "logout";
};

function getDesktopNavigationLinkClass(isActive: boolean, fontClassName: string) {
  return `${fontClassName} relative shrink-0 rounded-full px-3 py-2 text-[16px] font-medium leading-[1] text-[#4a5568] transition-[color,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#f4f0ff] hover:text-[#35258a] md:px-0 md:py-0 md:text-[18px] md:leading-[25px] md:hover:bg-transparent after:absolute after:bottom-[-5px] after:left-0 after:h-[2px] after:w-full after:origin-center after:scale-x-0 after:rounded-full after:bg-[linear-gradient(90deg,#6675f7_0%,#8b5cf6_45%,#57007b_100%)] after:opacity-0 after:transition-[transform,opacity] after:duration-200 after:ease-out hover:after:scale-x-100 hover:after:opacity-100 ${isActive ? "bg-[#efeaff] text-[#1d114f] md:bg-transparent md:font-semibold after:h-[3px] after:scale-x-100 after:opacity-100" : ""}`;
}

function getMobileNavigationLinkClass(isActive: boolean, fontClassName: string) {
  return `${fontClassName} relative rounded-2xl px-4 py-3 text-[16px] font-medium leading-[1.2] transition-[color,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isActive ? "bg-[#efeaff] font-semibold text-[#1d114f] shadow-[0px_12px_28px_rgba(104,92,231,0.12)] ring-1 ring-[rgba(108,92,231,0.18)] before:absolute before:bottom-3 before:left-4 before:top-3 before:w-[4px] before:rounded-full before:bg-[linear-gradient(180deg,#6675f7_0%,#57007b_100%)] before:content-[''] pl-7" : "text-[#4a5568] hover:bg-[#f8f5ff] hover:text-[#35258a] hover:shadow-[0px_10px_24px_rgba(104,92,231,0.08)]"}`;
}

type MainHeaderProps = {
  isAuthenticated: boolean;
  userNickname: string | null;
};

export function MainHeader({ isAuthenticated, userNickname }: MainHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDrawerMounted, setIsDrawerMounted] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const mobileMenuId = "main-header-mobile-menu";
  const closeTimeoutRef = useRef<number | null>(null);
  const isInAppPath = pathname?.startsWith("/friends") || pathname?.startsWith("/chat");
  const visibleNavigationItems = isAuthenticated || isInAppPath
    ? [...navigationItems, ...inAppNavigationItems]
    : navigationItems;
  const defaultHeaderConfig: HeaderConfig = isAuthenticated
    ? {
      actionLabel: "open friends",
      actionHref: "/friends",
      actionKind: "link",
    }
    : {
      actionLabel: "sign in",
      actionHref: "/login",
      actionKind: "link",
    };
  const headerConfigByPath: Record<string, HeaderConfig> = {
    "/login": {
      actionLabel: "sign up",
      actionHref: "/signup",
      actionKind: "link",
    },
    "/signup": {
      actionLabel: "sign in",
      actionHref: "/login",
      actionKind: "link",
    },
  };
  const headerConfig = isAuthenticated && isInAppPath
    ? {
      actionLabel: "sign out",
      actionHref: "/login",
      actionKind: "logout" as const,
    }
    : pathname
      ? { ...defaultHeaderConfig, ...headerConfigByPath[pathname] }
      : defaultHeaderConfig;

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  function openMobileMenu() {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    setIsMenuOpen(true);
    setIsDrawerMounted(true);

    window.requestAnimationFrame(() => {
      setIsDrawerVisible(true);
    });
  }

  function closeMobileMenu() {
    setIsDrawerVisible(false);
    setIsMenuOpen(false);

    closeTimeoutRef.current = window.setTimeout(() => {
      setIsDrawerMounted(false);
      closeTimeoutRef.current = null;
    }, 260);
  }

  function toggleMobileMenu() {
    if (isDrawerMounted) {
      closeMobileMenu();
      return;
    }

    openMobileMenu();
  }

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      closeMobileMenu();
      router.push("/login");
      router.refresh();
    } catch {
      setIsLoggingOut(false);
    }
  }

  if (headerConfig.hidden) {
    return null;
  }

  const actionHref = headerConfig.actionHref ?? defaultHeaderConfig.actionHref ?? "/login";
  const actionKind = headerConfig.actionKind ?? "link";
  const actionLabel = actionKind === "logout" && isLoggingOut
    ? "signing out..."
    : headerConfig.actionLabel;

  return (
    <header className="w-full border-b border-black/5 bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.08)]">
      <div className="mx-auto flex w-full max-w-[1440px] items-center gap-3 px-4 py-3 sm:px-5 md:min-h-[84px] md:gap-6 md:py-0 lg:px-8">
        <BrandLogo />

        <nav className="hidden flex-1 items-center justify-center gap-10 md:flex lg:gap-24">
          {visibleNavigationItems.map((navigationItem) => (
            <Link
              key={navigationItem.href}
              href={navigationItem.href}
              className={getDesktopNavigationLinkClass(pathname === navigationItem.href, headerFontClassName)}
            >
              {navigationItem.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden md:flex md:items-center md:gap-3">
          {actionKind === "logout" && userNickname ? (
            <div className={`${headerFontClassName} inline-flex h-[44px] items-center rounded-full border border-[#ddd7ff] bg-[#f8f5ff] px-4 text-[14px] font-semibold text-[#35258a] shadow-[0px_8px_20px_rgba(108,92,231,0.12)]`}>
              {userNickname}
            </div>
          ) : null}

          {actionKind === "logout" ? (
            <button
              type="button"
              disabled={isLoggingOut}
              className={`${headerFontClassName} inline-flex h-[48px] cursor-pointer items-center justify-center rounded-[5px] bg-[linear-gradient(198.712deg,rgb(102,117,247)_0%,rgb(87,0,123)_100%)] px-[30px] text-[14px] font-medium leading-[14px] text-[#fafafa] shadow-[0px_4px_24.5px_rgba(0,0,0,0.15)] transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70`}
              onClick={handleLogout}
            >
              {actionLabel}
            </button>
          ) : (
            <GradientActionLink
              href={actionHref}
              className={`${headerFontClassName} inline-flex h-[48px] items-center justify-center rounded-[5px] px-[30px] text-[14px] font-medium leading-[14px] text-[#fafafa] shadow-[0px_4px_24.5px_rgba(0,0,0,0.15)] transition-opacity hover:opacity-95`}
            >
              {actionLabel}
            </GradientActionLink>
          )}
        </div>

        <button
          type="button"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-controls={mobileMenuId}
          className="ml-auto inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-[#d7dce5] bg-white text-[#24145f] shadow-[0px_6px_20px_rgba(36,20,95,0.12)] transition-colors hover:bg-[#f8f5ff] md:hidden"
          onClick={toggleMobileMenu}
        >
          <span className="relative block h-[18px] w-[20px]">
            <span
              className={`absolute left-0 top-[2px] h-[2px] w-full rounded-full bg-current transition-transform duration-200 ${isMenuOpen ? "translate-y-[6px] rotate-45" : ""
                }`}
            />
            <span
              className={`absolute left-0 top-[8px] h-[2px] w-full rounded-full bg-current transition-opacity duration-200 ${isMenuOpen ? "opacity-0" : "opacity-100"
                }`}
            />
            <span
              className={`absolute left-0 top-[14px] h-[2px] w-full rounded-full bg-current transition-transform duration-200 ${isMenuOpen ? "-translate-y-[6px] -rotate-45" : ""
                }`}
            />
          </span>
        </button>
      </div>

      {isDrawerMounted ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            className={`absolute inset-0 cursor-pointer bg-[rgba(25,17,61,0.34)] backdrop-blur-[3px] transition-opacity duration-200 ease-out ${isDrawerVisible ? "opacity-100" : "opacity-0"}`}
            onClick={closeMobileMenu}
          />

          <div
            id={mobileMenuId}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className={`absolute inset-y-0 left-0 flex w-[min(86vw,340px)] max-w-[340px] flex-col border-r border-black/5 bg-white px-5 py-5 shadow-[0px_18px_40px_rgba(0,0,0,0.16)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isDrawerVisible ? "translate-x-0" : "-translate-x-full"}`}
          >
            <div className="flex items-center justify-between gap-3">
              <BrandLogo />

              <button
                type="button"
                aria-label="Close navigation menu"
                className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-[#d7dce5] bg-white text-[#24145f] shadow-[0px_6px_20px_rgba(36,20,95,0.08)] transition-colors hover:bg-[#f8f5ff]"
                onClick={closeMobileMenu}
              >
                <span className="relative block h-[18px] w-[18px]">
                  <span className="absolute left-0 top-[8px] h-[2px] w-full rotate-45 rounded-full bg-current" />
                  <span className="absolute left-0 top-[8px] h-[2px] w-full -rotate-45 rounded-full bg-current" />
                </span>
              </button>
            </div>

            <nav className="mt-8 flex flex-col gap-2.5">
              {visibleNavigationItems.map((navigationItem) => (
                <Link
                  key={navigationItem.href}
                  href={navigationItem.href}
                  className={getMobileNavigationLinkClass(pathname === navigationItem.href, headerFontClassName)}
                  onClick={closeMobileMenu}
                >
                  {navigationItem.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto pt-6">
              {actionKind === "logout" && userNickname ? (
                <div className={`${headerFontClassName} mb-3 inline-flex w-full items-center justify-center rounded-full border border-[#ddd7ff] bg-[#f8f5ff] px-4 py-3 text-[14px] font-semibold text-[#35258a] shadow-[0px_8px_20px_rgba(108,92,231,0.12)]`}>
                  {userNickname}
                </div>
              ) : null}

              {actionKind === "logout" ? (
                <button
                  type="button"
                  disabled={isLoggingOut}
                  className={`${headerFontClassName} inline-flex h-[48px] w-full cursor-pointer items-center justify-center rounded-[8px] bg-[linear-gradient(198.712deg,rgb(102,117,247)_0%,rgb(87,0,123)_100%)] px-[30px] text-[14px] font-medium leading-[14px] text-[#fafafa] shadow-[0px_4px_24.5px_rgba(0,0,0,0.15)] transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70`}
                  onClick={handleLogout}
                >
                  {actionLabel}
                </button>
              ) : (
                <GradientActionLink
                  href={actionHref}
                  onClick={closeMobileMenu}
                  className={`${headerFontClassName} inline-flex h-[48px] w-full items-center justify-center rounded-[8px] px-[30px] text-[14px] font-medium leading-[14px] text-[#fafafa] shadow-[0px_4px_24.5px_rgba(0,0,0,0.15)] transition-opacity hover:opacity-95`}
                >
                  {actionLabel}
                </GradientActionLink>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
