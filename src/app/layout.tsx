/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Be_Vietnam_Pro } from "next/font/google";
import { TopBar } from "@/components/layout/top-bar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SocialFab } from "@/components/layout/social-fab";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} - Find one more player. Fill games. Play more.`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Find one more player and fill your padel game. OM Player connects players to open matches at courts near you across Ireland and beyond.",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  applicationName: SITE_NAME,
  keywords: [
    "padel",
    "OM Player",
    "one more player",
    "find padel players",
    "fill padel game",
    "padel near me",
    "padel Ireland",
    "book padel court",
    "padel Dublin",
    "padel Cork",
  ],
  authors: [{ name: SITE_NAME }],
  openGraph: {
    type: "website",
    locale: "en_IE",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: `${SITE_NAME} - Find one more player. Fill games. Play more.`,
    description:
      "Find one more player and fill your padel game. Connect with players at courts near you.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - One More Player`,
    description:
      "Find one more player and fill your padel game. Open games at courts near you.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "en-IE",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/courts?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: absoluteUrl("/icon.svg"),
  areaServed: {
    "@type": "Country",
    name: "Ireland",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${beVietnamPro.variable}`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="bg-background font-body text-on-surface antialiased">
        <TopBar />
        <main className="pt-16 pb-24">{children}</main>
        <SocialFab />
        <BottomNav />
      </body>
    </html>
  );
}
