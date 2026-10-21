'use client';

import React from 'react';
import { kloudNav } from '@/app/lib/kloudNav';
import { KloudScreen } from '@/shared/kloud.screen';
import { ErrorView } from '@/app/components/ErrorView';

// 에러 응답에 함께 내려오는 충돌 수업 (예: BUNDLE_DUPLICATE_REGISTRATION의 개별구매 수업)
export type PaymentErrorLesson = {
  id: number;
  title: string;
  date?: string;
  startDate?: string;
  thumbnailUrl?: string;
};

// 결제 진입 시 도메인 에러(예: BUNDLE_DUPLICATE_REGISTRATION)를 보기 좋게 노출.
// notFound 대신 사용. 공통 ErrorView에 충돌 수업 목록만 얹는다.
export function PaymentErrorView({ title, message, homeLabel, lessons = [] }: {
  title: string;
  message: string;
  homeLabel: string;
  lessons?: PaymentErrorLesson[];
}) {
  return (
    <ErrorView title={title} message={message} homeLabel={homeLabel}>
      {/* 충돌 수업 목록 — 어떤 수업이 문제인지 안내 */}
      {lessons.length > 0 && (
        <div className="mt-7 w-full max-w-[380px] flex flex-col gap-2">
          {lessons.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => kloudNav.push(KloudScreen.LessonDetail(l.id))}
              className="flex items-center gap-3 p-3 bg-[#F7F8F9] rounded-2xl text-left w-full active:scale-[0.98] transition-transform"
            >
              <div className="w-[52px] h-[52px] rounded-xl overflow-hidden bg-[#E8E8EA] shrink-0">
                {l.thumbnailUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[14px] font-bold text-black truncate">{l.title}</span>
                {(l.date || l.startDate) && (
                  <span className="text-[12px] text-[#86898C] truncate mt-0.5">{l.date ?? l.startDate}</span>
                )}
              </div>
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0 text-[#B0B8BF]">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </ErrorView>
  );
}
