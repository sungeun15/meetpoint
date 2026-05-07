import { Amaranth, Coda, Inter } from "next/font/google";

export const friendsHeadingFont = Amaranth({
    weight: ["400", "700"],
    subsets: ["latin"],
});

export const friendsDisplayFont = Coda({
    weight: ["400", "800"],
    subsets: ["latin"],
});

export const friendsBodyFont = Inter({
    weight: ["400", "500", "600"],
    subsets: ["latin"],
});