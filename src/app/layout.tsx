import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";


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
    <body style={{backgroundColor: "white", color: "white"}}>
      {children}
    </body>
    </html>
  );
}

declare global {
  interface CustomEventMap {
    onSplashStarted: () => void;
  }

  interface Window {
    KloudEvent: Record<string, (data?: string) => void>;
    push: (screen: string, data?: string) => void;
    replace: (screen: string, data?: string) => void;
    clearAndPush: (screen: string, data?: string) => void;
    back: () => void;
    navigateMain: (bootInfo: string) => void;
    setToken: (token: string) => void;
    sendBootInfo: (bootInfo: string) => void;
    onSplashStarted: () => void;
    showToast: (message: string) => void;
    sendHapticFeedback: () => void;
    sendAppleLogin: () => void;

    addEventListener<K extends keyof CustomEventMap>(type: K, listener: (this: Document, ev: CustomEventMap[K]) => void): void;
    dispatchEvent<K extends keyof CustomEventMap>(ev: CustomEventMap[K]): void;
    removeEventListener<K extends keyof CustomEventMap>(type: K, listener: (this: Document, ev: CustomEventMap[K]) => void): void;
  }
}