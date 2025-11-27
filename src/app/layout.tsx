import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TourProvider } from "@/components/tour/TourProvider";
import { TourButton } from "@/components/tour/TourButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SignalCI - CI/CD for Trading",
  description: "Build visual pipelines that trigger from TradingView webhooks and execute step-by-step conditions before alerting you.",
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
        <TourProvider>
          {children}
          <TourButton />
        </TourProvider>
      </body>
    </html>
  );
}
