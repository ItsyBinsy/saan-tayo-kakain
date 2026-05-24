import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Saan Tayo Kakain",
  description: "Ako na bahala kung saan ka kakain.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}