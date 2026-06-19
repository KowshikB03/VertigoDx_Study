import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Inter_Tight } from "next/font/google";
import "./globals.css";
import { LaptopBanner } from "./components/Brand";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700"],
});
const body = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "SmartVertigo Clinician Review",
  description: "Nystagmus video classification study",
  // BROWSER TAB LOGO: handled automatically by the file  app/icon.png
  // (App Router convention). No metadata.icons entry needed.
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>
        <LaptopBanner />
        {children}
      </body>
    </html>
  );
}