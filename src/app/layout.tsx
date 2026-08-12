import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { BottomNav, SideNav } from "@/components/nav";
import { StoreHydration } from "@/components/store-hydration";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });

export const metadata: Metadata = {
  title: "Zyra — Football, Tracked",
  description: "Live match scoring and player football passports for grassroots football.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0e17",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="font-sans">
        <StoreHydration />
        <SideNav />
        <div className="min-h-dvh pb-24 md:ml-64 md:pb-8">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
