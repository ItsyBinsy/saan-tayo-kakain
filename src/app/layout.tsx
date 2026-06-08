import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Barlow_Condensed, Space_Grotesk } from "next/font/google";
import "./globals.css";
import OpenInBrowserBanner from "@/components/OpenInBrowserBanner";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
  variable: "--font-barlow",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-body-loaded",
})

export const metadata: Metadata = {
  title: "Saan Tayo Kakain",
  description: "Tabi. Ako na pipili. No more arguments about where to eat.",
  keywords: ["saan kakain", "food decider", "restaurant picker", "where to eat", "food app philippines", "where to eat manila", "bahala na", "paikutin", "this or that", "group food decision"],
  authors: [{ name: "Vince Carl Viaña" }],
  openGraph: {
    title: "Saan Tayo Kakain",
    description: "Tabi. Ako na pipili. No more arguments about where to eat.",
    url: "https://www.saantayokakain.today",
    siteName: "Saan Tayo Kakain",
    locale: "en_PH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Saan Tayo Kakain",
    description: "Tabi. Ako na pipili. No more arguments about where to eat.",
  },
  metadataBase: new URL("https://www.saantayokakain.today"),
  verification: { google: "ZSzMwTbVi_m2NVys9odQZD82xNgzvKAVzPPatyKHVYQ" },
  alternates: { canonical: "https://www.saantayokakain.today" },
  appleWebApp: {
    title: "STK",
    capable: true,
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-PH" className={`${barlowCondensed.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body suppressHydrationWarning>
        <OpenInBrowserBanner />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-42N9LG081H" strategy="lazyOnload" />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-42N9LG081H');
          `}
        </Script>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Saan Tayo Kakain",
              "url": "https://www.saantayokakain.today",
              "description": "Tabi. Ako na pipili. No more arguments about where to eat.",
              "applicationCategory": "LifestyleApplication",
              "operatingSystem": "Any",
            }),
          }}
        />
      </body>
    </html>
  );
}