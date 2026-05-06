"use client";

import Image from "next/image";
import Link from "next/link";
import { Abril_Fatface, Inter } from "next/font/google";
import { usePathname } from "next/navigation";

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

export function MainHeader() {
    const pathname = usePathname();
    const headerConfig = headerConfigByPath[pathname] ?? {
        actionLabel: "sign in",
        actionHref: "/login",
    };

    return (
        <header className="w-full border-b border-[#eee7ff] bg-[#faf7ff] shadow-[0_6px_24px_rgba(113,87,180,0.08)]">
            <div className="mx-auto flex min-h-[84px] w-full max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-8">
                <div className="flex items-center gap-8">
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

                    <nav className={`${inter.className} hidden items-center gap-7 text-[15px] font-medium lowercase text-[#8f8f8f] md:flex`}>
                        {navigationItems.map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                className={pathname === href ? "text-[#1f1f1f]" : "transition-colors hover:text-[#3f3f46]"}
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <Link
                    href={headerConfig.actionHref}
                    className={`${inter.className} inline-flex min-w-[108px] items-center justify-center rounded-[5px] px-6 py-[14px] text-[14px] font-semibold leading-none text-[#fafafa] shadow-[0px_4px_24.5px_rgba(0,0,0,0.15)] transition-transform hover:-translate-y-0.5`}
                    style={{ background: gradientBackground }}
                >
                    {headerConfig.actionLabel}
                </Link>
            </div>
        </header>
    );
}