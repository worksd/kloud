import React from 'react';
import { ADMIN_HEADER_TOP_PAD } from '@/app/admin/admin.layout';

/** 목 데이터 화면임을 알리는 배너 — 실제 API 연동 시 제거 */
export const AdminMockNotice = () => (
  <div className="mx-4 mt-3 flex items-center gap-2 rounded-xl border border-[#FFE0A3] bg-[#FFF8E8] px-3.5 py-2.5">
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0">
      <circle cx="12" cy="12" r="9" fill="#E09B12"/>
      <path d="M12 7.5v5.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="12" cy="16.4" r="1.1" fill="#FFFFFF"/>
    </svg>
    <span className="text-[12px] font-semibold text-[#8A5B00]">목(mock) 데이터예요. API 연동 전 화면입니다.</span>
  </div>
);

/**
 * 관리자 탭 화면 공통 헤더 — 제목 + 학원 이름. 본문만 스크롤되고 헤더는 상단에 고정된다(sticky).
 * 탭 웹뷰는 상태바 아래에서 시작하지만 ignoreSafeArea 라우트에서도 겹치지 않게 safe-area 패딩을 준다.
 */
export const AdminPageHeader = ({ title, studioName }: { title: string; studioName?: string }) => (
  <div
    className="sticky top-0 z-20 bg-[#F7F8FA]/95 backdrop-blur-sm border-b border-[#EDEFF2] px-5 pb-3"
    style={{ paddingTop: ADMIN_HEADER_TOP_PAD }}
  >
    {studioName && <p className="text-[13px] font-semibold text-[#8B95A1]">{studioName}</p>}
    <h1 className="text-[24px] font-bold text-[#191F28] tracking-[-0.4px]">{title}</h1>
  </div>
);
