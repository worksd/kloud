// PC 전용 연습실 대관 — 아직 오픈 전. 함께할 스튜디오 모집 안내 화면.
// (글로벌 연습실 list가 열리면 이 자리를 실제 목록으로 교체)

import React from "react";

const CONTACT_EMAIL = 'official@rawgraphy.com';

export default function StudioRoomsPcForm() {
  return (
    <div className="relative w-full min-h-screen bg-white flex items-center justify-center overflow-hidden">
      {/* 은은한 브랜드 빛 — 로그인 화면과 같은 톤의 배경 장식 */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-[380px] h-[380px] rounded-full bg-[#8AB4FF]/20 blur-3xl"/>
        <div className="absolute top-1/3 -right-28 w-[420px] h-[420px] rounded-full bg-[#E3A6FF]/20 blur-3xl"/>
        <div className="absolute -bottom-32 left-1/4 w-[380px] h-[380px] rounded-full bg-[#8FE8D2]/20 blur-3xl"/>
      </div>

      <div className="relative flex flex-col items-center text-center px-6 pb-24">
        {/* 문 아이콘 — 그라데이션 원 안에 */}
        <div
          className="w-[72px] h-[72px] rounded-3xl flex items-center justify-center mb-7 shadow-[0_16px_40px_-12px_rgba(91,95,246,0.45)]"
          style={{ background: 'linear-gradient(135deg, #5B5FF6 0%, #9A6BFF 100%)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
            <path d="M15.1 4.6H18a1.7 1.7 0 0 1 1.7 1.7v11.4A1.7 1.7 0 0 1 18 19.4h-2.9" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M14.3 21 6.4 19.1a1.5 1.5 0 0 1-1.1-1.4V6.3a1.5 1.5 0 0 1 1.1-1.4L14.3 3v18Z" stroke="white" strokeWidth="1.6" strokeLinejoin="round"/>
            <circle cx="11.6" cy="12" r="1" fill="white"/>
          </svg>
        </div>

        <span className="text-[12px] font-bold text-[#5B5FF6] bg-[#5B5FF6]/10 px-3 py-1.5 rounded-full mb-5">
          함께할 스튜디오 모집중
        </span>

        <h1 className="text-[32px] font-bold text-black tracking-tight leading-snug font-paperlogy">
          Rawgraphy에서 연습실 대관까지
        </h1>
        <p className="text-[15px] text-[#6d7882] leading-relaxed mt-4 whitespace-pre-line">
          시간 단위로 예약하는 연습실 대관 기능을 준비하고 있어요.{'\n'}
          연습실을 운영하는 스튜디오라면 지금 함께해 주세요.
        </p>

        <a
          href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('[Rawgraphy] 연습실 대관 입점 문의')}`}
          className="mt-8 h-12 px-7 rounded-full bg-black text-white text-[15px] font-semibold flex items-center gap-2 hover:bg-gray-800 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]">
            <rect x="3" y="5" width="18" height="14" rx="2" stroke="white" strokeWidth="1.6"/>
            <path d="M3 7l9 6 9-6" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          메일로 문의하기
        </a>
        <span className="text-[13px] text-[#8A949E] mt-3">{CONTACT_EMAIL}</span>
      </div>
    </div>
  );
}
