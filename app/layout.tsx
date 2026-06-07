import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SUMMARY } from "./data";

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
const TITLE = `Market Event Correlator — QQQ · SPY · NDX Daily Returns`;
const DESC = `${SUMMARY.total_days} trading days of QQQ, SPY & Nasdaq-100 open-to-close returns annotated with ${SUMMARY.event_days} major market events. Fed decisions, tariff shocks, AI launches, IPOs — every correlation and causal signal in one place.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  metadataBase: new URL(BASE),
  alternates: { canonical: "/" },
  keywords: [
    "QQQ", "SPY", "NDX", "Nasdaq-100", "S&P 500",
    "Fed decisions", "FOMC", "CPI", "tariffs", "earnings",
    "market events", "volatility", "open to close",
    "AI stocks", "DeepSeek", "intraday returns",
    "event-driven trading", "market correlator",
  ],
  authors: [{ name: "Trace Cohen", url: "https://x.com/Trace_Cohen" }],
  creator: "Trace Cohen",
  publisher: "ValueAdd VC",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: BASE,
    siteName: "Market Event Correlator",
    images: [{ url: `${BASE}/opengraph-image`, width: 1200, height: 630, alt: TITLE }],
    type: "website",
    locale: "en_US",
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

// schema.org Dataset structured data — helps Google Dataset Search index this.
const datasetSchema = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "Market Event Correlator — QQQ, SPY & NDX Daily Returns 2023–2026",
  description: DESC,
  url: BASE,
  creator: {
    "@type": "Person",
    name: "Trace Cohen",
    url: "https://x.com/Trace_Cohen",
  },
  publisher: {
    "@type": "Organization",
    name: "ValueAdd VC",
    url: "https://valueaddvc.com",
  },
  license: "https://creativecommons.org/licenses/by/4.0/",
  isAccessibleForFree: true,
  keywords: [
    "QQQ", "SPY", "NDX", "Nasdaq-100", "S&P 500",
    "Fed", "FOMC", "CPI", "tariffs", "AI", "IPO",
    "market volatility", "open-to-close",
  ],
  temporalCoverage: "2023-01-03/2026-06-05",
  variableMeasured: [
    "QQQ open-to-close % return",
    "SPY open-to-close % return",
    "NDX open-to-close % return",
    "Event type tag",
    "Event name",
  ],
  distribution: [
    {
      "@type": "DataDownload",
      encodingFormat: "application/json",
      contentUrl: `${BASE}/api/data`,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href={BASE} />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
