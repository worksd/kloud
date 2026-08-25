// 웹 로그인 화면 공통 장식 — 브랜드 그래디언트 배경 + 블러 블롭 + PC(lg) 유리 카드 클래스.
// intro/email/phone 로그인 페이지가 공유한다. 앱 웹뷰에는 적용하지 않는다(각 페이지 isWeb 분기).
import React from "react";

export const LOGIN_GRADIENT_STYLE: React.CSSProperties = {
  background: 'linear-gradient(135deg, #E9F1FF 0%, #FCF3FF 100%)',
};

// PC(lg) 반투명 유리 카드 — 패딩은 페이지마다 달라 여기 포함하지 않는다.
// relative: 배경 블롭(absolute)보다 위에 그려지기 위해 필요.
export const LOGIN_WEB_CARD_CLS =
  'lg:relative lg:w-full lg:max-w-[420px] lg:bg-white/80 lg:backdrop-blur-xl lg:border lg:border-white/70 lg:rounded-3xl lg:shadow-[0_24px_60px_-16px_rgba(91,95,246,0.25)]';

export const LoginGradientBlobs = () => (
  <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -top-24 -left-24 w-[360px] h-[360px] rounded-full bg-[#8AB4FF]/40 blur-3xl"/>
    <div className="absolute top-1/4 -right-32 w-[420px] h-[420px] rounded-full bg-[#E3A6FF]/35 blur-3xl"/>
    <div className="absolute -bottom-36 left-1/4 w-[400px] h-[400px] rounded-full bg-[#8FE8D2]/35 blur-3xl"/>
  </div>
);
