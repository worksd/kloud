import React from 'react';
import { ADMIN_HEADER_TOP_PAD } from '@/app/admin/admin.layout';
import { AdminNoHorizontalScroll } from '@/app/admin/AdminNoHorizontalScroll';

/**
 * 관리자 탭 화면 공통 헤더 — 제목 + 학원 이름. 본문만 스크롤되고 헤더는 상단에 고정된다(sticky).
 * 탭 웹뷰는 상태바 아래에서 시작하지만 ignoreSafeArea 라우트에서도 겹치지 않게 safe-area 패딩을 준다.
 */
export const AdminPageHeader = ({ title, studioName }: { title: string; studioName?: string }) => (
  <div
    className="sticky top-0 z-20 bg-[#F7F8FA]/95 backdrop-blur-sm border-b border-[#EDEFF2] px-5 pb-3"
    style={{ paddingTop: ADMIN_HEADER_TOP_PAD }}
  >
    <AdminNoHorizontalScroll/>
    {studioName && <p className="text-[13px] font-semibold text-[#8B95A1]">{studioName}</p>}
    <h1 className="text-[24px] font-bold text-[#191F28] tracking-[-0.4px]">{title}</h1>
  </div>
);
