import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crossroads Compass — Human Design & Vedic Guidance",
  description: "Your personal navigation system combining Human Design and Vedic Astrology.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
