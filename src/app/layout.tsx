import type { Metadata, Viewport } from "next";
import "./globals.css";

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
    card: "summary",
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
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-PH">
      <body>
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