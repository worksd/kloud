import type { Metadata, Viewport } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { ReactNode } from "react";
import { DialogInfo } from "@/utils/dialog.factory";

const paperFont = localFont({
  src: '../../public/fonts/Paperlogy-7Bold.ttf',
  variable: '--font-paperlogy',
  weight: '700'
})

export const metadata: Metadata = {
  title: "Rawgraphy",
  description: "언제 어디서든 원하는 댄스 스튜디오의 수업을 확인하고, 간편하게 예약 및 결제하세요.",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (

    <html lang="en" className={`${paperFont.variable}`}>
    <body style={{backgroundColor: "white", color: "white"}}>
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, height=device-height"
    />
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
    fullSheet: (screen: string, data?: string) => void;
    clearAndPush: (screen: string, data?: string) => void;
    back: () => void;
    rootNext: (screen: string) => void;
    navigateMain: (bootInfo: string) => void;
    setToken: (token: string) => void;
    onSplashStarted: () => void;
    showToast: (message: string) => void;
    sendHapticFeedback: () => void;
    sendAppleLogin: () => void;
    sendKakaoLogin: (configuration: string) => void;
    sendGoogleLogin: () => void;
    showDialog: (info: string) => void;
    showBottomDialog: (info: string) => void;
    requestPayment: (command: string) => void;
    showGallery: () => void;
    closeBottomSheet: () => void;
    changeWebEndpoint: (endpoint: string) => void;
    openExternalBrowser: (url: string) => void;
    refresh: (endpoint: string) => void;

    onKakaoLoginSuccess: (data: { code: string }) => void;
    onAppleLoginSuccess: (data: { code: string, name: string }) => void;
    onGoogleLoginSuccess: (data: { code: string }) => void;
    onPaymentSuccess: (data: { transactionId: string, paymentId: string }) => void;
    onErrorInvoked: (data: { code: string }) => void;
    onDialogConfirm: (data: DialogInfo) => void;
    onHideDialogConfirm: (data: { id: string, clicked: boolean }) => void;
    onFcmTokenComplete: (data: { fcmToken: string, udid: string }) => void;
    onReload: (data: { route: string }) => void;
  }
}