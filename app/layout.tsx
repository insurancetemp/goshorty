import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Temporary Car Insurance | GoShorty",
  description:
    "Looking for temporary car insurance? Explore flexible short-term car cover with GoShorty. Get started with a quick quote journey.",
  metadataBase: new URL("https://goshorty.co.uk")
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}