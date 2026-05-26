import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { MainHeader } from "@/app/components/main-header";
import { PwaInstallBanner } from "@/app/components/pwa-install-banner";
import { PwaServiceWorker } from "@/app/components/pwa-service-worker";
import { getCurrentSession } from "@/lib/auth/session";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MeetPoint",
  description: "Meet smarter, meet faster.",
  applicationName: "meetpoint",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "meetpoint",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCurrentSession();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pretendard/dist/web/static/pretendard.css" />
      </head>
      <body className="flex min-h-screen flex-col">
        <PwaServiceWorker />
        <PwaInstallBanner />
        <MainHeader isAuthenticated={Boolean(session)} userNickname={session?.nickname ?? null} />
        {children}
      </body>
    </html>
  );
}

