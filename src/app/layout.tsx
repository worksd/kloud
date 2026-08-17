import type { Metadata, Viewport } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { ReactNode } from "react";
import { headers, cookies } from "next/headers";
import { accessTokenKey } from "@/shared/cookies.key";
import { DialogInfo } from "@/utils/dialog.factory";
import { GlobalErrorHandler } from "@/app/components/GlobalErrorHandler";
import { Analytics } from "@vercel/analytics/react";
import { WebTopNav } from "@/app/components/WebTopNav";
import { WebFooter } from "@/app/components/WebFooter";

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
  const isLogin = !!(await cookies()).get(accessTokenKey)?.value;

  return (

    <html lang="en" className={`${paperFont.variable}`}>
    <body style={{backgroundColor: "white", color: "white"}}>
    <GlobalErrorHandler />
    {/* PC 웹(≥lg, 앱 웹뷰/키오스크 제외) 공통 상단바 — sticky라 컨텐츠와 겹치지 않는다 */}
    {showWebChrome && <WebTopNav initialLogin={isLogin} />}
    {/* 컨텐츠 영역이 lg에서 항상 최소 100vh — 페이지 전환 중 loading으로 높이가 무너져도
        푸터가 fold 아래(스크롤해야 보이는 위치)에 머물러 위로 튀어오르거나 번쩍이지 않는다.
        flex-1 sticky-footer 방식은 로딩 중 푸터가 화면 하단에 '보이는' 높이가 돼 번쩍임이 남는다.
        lg 미만/앱에선 클래스 비활성 — 그냥 래퍼 div (동작 불변). */}
    <div className="lg:min-h-screen">
      {children}
    </div>
    {/* PC 웹 공통 푸터 — 회사 정보 법적 표기 (값은 src/shared/company.ts 단일 출처) */}
    {showWebChrome && <WebFooter />}
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