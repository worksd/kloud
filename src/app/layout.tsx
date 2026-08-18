import type { Metadata, Viewport } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { ReactNode } from "react";
import { headers, cookies } from "next/headers";
import { accessTokenKey } from "@/shared/cookies.key";
import { DialogInfo } from "@/utils/dialog.factory";
import { GlobalErrorHandler } from "@/app/components/GlobalErrorHandler";
import { Analytics } from "@vercel/analytics/react";
import { WebShell } from "@/app/components/WebShell";
import { translate } from "@/utils/translate";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  // 웹 크롬(상단바/푸터) 노출 판단을 서버에서 — proxy가 심어주는 헤더 기반.
  // 클라이언트 mounted 게이트로 하면 SSR HTML에 없다가 hydration 후 뿅 나타나며
  // 컨텐츠를 밀어내는 깜빡임이 생긴다 (kloudNav.push 웹 폴백이 풀 리로드라 이동마다 재발).
  const h = await headers();
  const appVersion = h.get('x-guinness-version') ?? '';
  const entryPath = h.get('x-guinness-entry') ?? '';
  const showWebChrome = appVersion === '' && !entryPath.startsWith('/kiosk');
  const cookieStore = await cookies();
  const isLogin = !!cookieStore.get(accessTokenKey)?.value;

  return (

    <html lang="en" className={`${paperFont.variable}`}>
    <body style={{backgroundColor: "white", color: "white"}}>
    <GlobalErrorHandler />
    {/* PC 웹(≥lg, 앱 웹뷰/키오스크 제외) 공통 크롬 — 상단바 + 유튜브식 LNB(레일/드로어).
        푸터(회사 정보)는 LNB 왼쪽 아래에 산다 (WebLnb의 LnbFooter). */}
    {showWebChrome ? (
      <WebShell
        initialLogin={isLogin}
        lnbLabels={{
          home: await translate('lnb_home'),
          myStudio: await translate('lnb_my_studio'),
          rooms: await translate('lnb_practice_room'),
          profile: await translate('profile'),
        }}
      >
        {children}
      </WebShell>
    ) : (
      <div className="lg:min-h-screen">
        {children}
      </div>
    )}
    {/* Vercel Web Analytics — 이게 없으면 track() 커스텀 이벤트도 전송되지 않는다 */}
    <Analytics />
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
    showImage: (info: string) => void;
    closeBottomSheet: () => void;
    changeWebEndpoint: (endpoint: string) => void;
    openExternalBrowser: (url: string) => void;
    refresh: (endpoint: string) => void;
    requestFcmToken: () => void;

    onKakaoLoginSuccess: (data: { code: string }) => void;
    onAppleLoginSuccess: (data: { code: string, name: string }) => void;
    onGoogleLoginSuccess: (data: { code: string }) => void;
    onPaymentSuccess: (data: { transactionId: string, paymentId: string }) => void;
    onErrorInvoked: (data: { paymentId: string, message?: string }) => void;
    onDialogConfirm: (data: DialogInfo) => void;
    onHideDialogConfirm: (data: { id: string, clicked: boolean }) => void;
    onFcmTokenComplete: (data: { fcmToken: string, udid: string }) => void;
    onFcmTokenReceived: (data: { fcmToken: string, udid: string }) => void;
    onReload: (data: { route: string }) => void;
  }
}