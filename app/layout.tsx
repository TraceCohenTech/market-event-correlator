import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const BASE = "https://market-event-correlator.vercel.app";
const TITLE = "Market Event Correlator — QQQ · SPY · NDX Daily Returns";
const DESC =
  "857 trading days of QQQ, SPY & Nasdaq-100 open-to-close returns annotated with 81 major market events. Fed decisions, tariff shocks, AI launches, IPOs — every correlation and causal signal in one place.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  metadataBase: new URL(BASE),
  openGraph: {
    title: TITLE,
    description: DESC,
    url: BASE,
    siteName: "Market Event Correlator",
    images: [{ url: `${BASE}/opengraph-image`, width: 1200, height: 630, alt: TITLE }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
    creator: "@Trace_Cohen",
    site: "@Trace_Cohen",
    images: [`${BASE}/opengraph-image`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
