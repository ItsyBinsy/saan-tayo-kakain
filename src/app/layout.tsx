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
      <body>{children}</body>
    </html>
  );
}