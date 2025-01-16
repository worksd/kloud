import type { Metadata } from "next";
import "./globals.css";
import { KloudDialogId, KloudMenuId } from "@/app/home/page";

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
    sendKakaoLogin: () => void;
    sendGoogleLogin: () => void;
    showDialog: (info: string) => void;
    showBottomDialog: (info: string) => void;

    onDialogMenuClicked: (data: { dialogId: KloudDialogId, menuId: KloudMenuId }) => void;
    onKakaoLoginSuccess: (data: { code: string }) => void;
    onAppleLoginSuccess: (data: { code: string }) => void;
    onGoogleLoginSuccess: (data: { code: string }) => void;

  }
}