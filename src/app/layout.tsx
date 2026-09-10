import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Big_Shoulders } from "next/font/google";
import { WarningGate } from "@/components/WarningGate";
import "./globals.css";

const bigShoulders = Big_Shoulders({
  variable: "--font-big-shoulders",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

const barlow = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Strob — Live mood light sessions",
  description:
    "Controller and viewer synced color strobe lights, inspired by moodlight.org",
};

export const viewport: Viewport = {
  themeColor: "#050403",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bigShoulders.variable} ${barlow.variable} bg-void font-ui antialiased`}
      >
        <WarningGate>{children}</WarningGate>
      </body>
    </html>
  );
}
