import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { PlayerProvider } from "@/components/teo/PlayerProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Teo - Music for everyone",
  description: "Teo is a modern music streaming app. Listen to millions of songs for free.",
  icons: {
    icon: "/teo-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning translate="no">
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <PlayerProvider>
          {children}
        </PlayerProvider>
      </body>
    </html>
  );
}
