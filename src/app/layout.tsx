import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { KloudScreen } from "@/shared/kloud.screen";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
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
        {children}
      </body>
    </html>
  );
}

declare global {
  interface CustomEventMap {
    navigateMain: () => void;
  }
  interface Window {
    Android: Record<string, (data?: string) => void>;
    iOS: Record<string, (data?: string) => void>;
    navigate: (screen: KloudScreen, data ?: string) => void;


    // adds definition to Document, but you can do the same with HTMLElement
    addEventListener<K extends keyof CustomEventMap>(type: K, listener: (this: Document, ev: CustomEventMap[K]) => void): void;
    dispatchEvent<K extends keyof CustomEventMap>(ev: CustomEventMap[K]): void;
    removeEventListener<K extends keyof CustomEventMap>(type: K, listener: (this: Document, ev: CustomEventMap[K]) => void): void;
  }
}