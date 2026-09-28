'use client';

import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { kloudNav } from '@/app/lib/kloudNav';
import { ADMIN_HEADER_TOP_PAD } from '@/app/admin/admin.layout';
import { AdminNoHorizontalScroll } from '@/app/admin/AdminNoHorizontalScroll';

/**
 * 관리자 상세 화면 헤더 — 뒤로가기 + 제목.
 *
 * 관리자 경로는 전부 ignoreSafeArea(풀스크린)라 네이티브 헤더가 없다.
 * 상태바 영역은 여기서 safe-area 패딩으로 직접 잡는다.
 */
export function AdminDetailHeader({ title, subtitle, onBack }: {
  title: string;
  subtitle?: string;
  /** 단계형 화면에서 이전 단계로 — 없으면 화면을 닫는다(네이티브 back / router.back) */
  onBack?: () => void;
}) {
  const router = useRouter();
  const leave = () => (window.KloudEvent ? kloudNav.back() : router.back());

  return (
    <div
      className={'sticky top-0 z-20 bg-[#F7F8FA]/95 backdrop-blur-sm border-b border-[#EDEFF2] px-2 pb-2.5'}
      style={{ paddingTop: ADMIN_HEADER_TOP_PAD }}
    >
      <AdminNoHorizontalScroll/>
      <div className={'flex items-center gap-1'}>
        <button
          type={'button'}
          aria-label={'뒤로가기'}
          onClick={onBack ?? leave}
          className={'w-10 h-10 rounded-full flex items-center justify-center text-[#191F28] active:bg-[#EDEFF2] transition-colors'}
        >
          <ChevronLeft size={24} strokeWidth={1.8}/>
        </button>
        <div className={'min-w-0'}>
          {subtitle && <p className={'text-[11.5px] font-semibold text-[#8B95A1] truncate leading-tight'}>{subtitle}</p>}
          <h1 className={'text-[17px] font-bold text-[#191F28] truncate leading-tight'}>{title}</h1>
        </div>
      </div>
    </div>
  );
}
