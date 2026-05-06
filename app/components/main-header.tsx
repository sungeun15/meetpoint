"use client";

import Image from "next/image";
import Link from "next/link";
import { Abril_Fatface, Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import { useState } from "react";

const abrilFatface = Abril_Fatface({
    weight: "400",
    subsets: ["latin"],
});

const inter = Inter({
    weight: ["400", "500", "600"],
    subsets: ["latin"],
});

const navigationItems = [
    { href: "/", label: "home" },
    { href: "/features", label: "features" },
    { href: "/about", label: "about us" },
];

const headerConfigByPath: Record<string, { actionLabel: string; actionHref: string }> = {
    "/login": { actionLabel: "sign up", actionHref: "/signup" },
    "/signup": { actionLabel: "sign in", actionHref: "/login" },
};

const gradientBackground =
    "linear-gradient(90deg, #4e6ff7 0%, #6c63ff 50%, #7b5cff 100%)";

function getDesktopNavigationLinkClass(isActive: boolean) {
    return [
        "transition-colors",
        isActive ? "text-[#1f1f1f]" : "text-[#8f8f8f] hover:text-[#3f3f46]",
    ].join(" ");
}

function getMobileNavigationLinkClass(isActive: boolean) {
    return [
        "rounded-2xl px-4 py-3 text-base font-medium transition-colors lowercase",
        isActive
            ? "bg-[#3d63ea]/10 text-[#163091]"
            : "text-[#4b5563] hover:bg-[#f4f4f5] hover:text-[#1f2937]",
    ].join(" ");
}

export function MainHeader() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const headerConfig = headerConfigByPath[pathname] ?? {
        actionLabel: "sign in",
        actionHref: "/login",
    };

    return (
        <header className="w-full border-b border-[#eee7ff] bg-[#faf7ff] shadow-[0_6px_24px_rgba(113,87,180,0.08)]">
            <div className="mx-auto flex min-h-[84px] w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3 sm:gap-4 lg:gap-5">
                    <Link href="/" className="flex items-center gap-[11px] text-[#1c1d1f]">
                        <Image
                            src="/imports/Frame1-2/6bbd22ff4d1f77ee42786bef5cc5ea8b1b2a6028.png"
                            alt="MeetPoint pin logo"
                            width={26}
                            height={36}
                            priority
                            className="h-[32px] w-auto sm:h-[36px]"
                        />
                        <span className={`${abrilFatface.className} text-[28px] lowercase leading-none tracking-[0.01em] text-[#111827]`}>
                            meetpoint
                        </span>
                    </Link>

                    <nav className={`${inter.className} hidden items-center gap-6 text-[15px] font-medium lowercase lg:flex`}>
                        {navigationItems.map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                className={getDesktopNavigationLinkClass(pathname === href)}
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="hidden items-center lg:flex">
                    <Link
                        href={headerConfig.actionHref}
                        className={`${inter.className} inline-flex min-w-[108px] items-center justify-center rounded-[5px] px-6 py-[14px] text-[14px] font-semibold lowercase leading-none text-[#fafafa] shadow-[0px_4px_24.5px_rgba(0,0,0,0.15)] transition-transform hover:-translate-y-0.5`}
                        style={{ background: gradientBackground }}
                    >
                        {headerConfig.actionLabel}
                    </Link>
                </div>

                <button
                    type="button"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d9d2f3] bg-white text-[#2b2373] shadow-[0_8px_18px_rgba(84,65,140,0.08)] transition hover:border-[#c7bbea] hover:bg-[#f7f3ff] lg:hidden"
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={isMenuOpen}
                    onClick={() => setIsMenuOpen((open) => !open)}
                >
                    <span className="relative block h-4 w-5">
                        <span
                            className={`absolute left-0 top-0 h-[2px] w-5 rounded-full bg-current transition ${isMenuOpen ? "translate-y-[7px] rotate-45" : ""
                                }`}
                        />
                        <span
                            className={`absolute left-0 top-[7px] h-[2px] w-5 rounded-full bg-current transition ${isMenuOpen ? "opacity-0" : ""
                                }`}
                        />
                        <span
                            className={`absolute left-0 top-[14px] h-[2px] w-5 rounded-full bg-current transition ${isMenuOpen ? "-translate-y-[7px] -rotate-45" : ""
                                }`}
                        />
                    </span>
                </button>
            </div>

            {isMenuOpen ? (
                <div className="border-t border-[#eee7ff] bg-[#fffdfd] px-4 py-4 shadow-[0_18px_38px_rgba(113,87,180,0.12)] lg:hidden">
                    <div className="mx-auto flex max-w-[1440px] flex-col gap-4">
                        <nav className={`${inter.className} flex flex-col gap-2`}>
                            {navigationItems.map(({ href, label }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className={getMobileNavigationLinkClass(pathname === href)}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {label}
                                </Link>
                            ))}
                        </nav>

                        <Link
                            href={headerConfig.actionHref}
                            className={`${inter.className} inline-flex w-full items-center justify-center rounded-[5px] px-5 py-[14px] text-[14px] font-semibold lowercase leading-none text-[#fafafa] shadow-[0px_4px_24.5px_rgba(0,0,0,0.15)] transition-transform hover:-translate-y-0.5`}
                            style={{ background: gradientBackground }}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {headerConfig.actionLabel}
                        </Link>
                    </div>
                </div>
            ) : null}
        </header>
    );
}