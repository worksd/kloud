'use client';

import React, { useMemo, useState } from 'react';
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { RegularClassDetailResponse } from "@/app/endpoint/studio.endpoint";
import { GetPassPlanResponse } from "@/app/endpoint/pass.endpoint";
import { weeklyDaysLabel } from "@/utils/weekly.days";
import { kioskImageSrc } from "@/app/kiosk/kiosk.image";

type Props = {
  regularClass: RegularClassDetailResponse;
  /** 강사 사진이 없을 때 쓰는 썸네일 폴백 — 학원 로고 */
  studioImageUrl?: string;
  locale: Locale;
  onClose: () => void;
  /** 고른 수강 방식(가격정책) — 호출부는 이걸 pass-plan 으로 결제한다 */
  onSelect: (plan: GetPassPlanResponse) => void;
};

/**
 * 키오스크 정규반 상세 모달 — 반 정보(썸네일·이름·강사·설명) + 수강 방식(passPlans) 선택 + 등록 버튼.
 * 앱 결제 화면(item=regular-class)과 같은 규칙: status 'Pending'(판매중단)인 방식은 선택지에서 뺀다.
 * 등록 버튼을 누르면 고른 가격정책을 그대로 pass-plan 결제 흐름(phone → payment-method)에 태운다.
 */
export const KioskRegularClassDetailModal = ({ regularClass, studioImageUrl, locale, onClose, onSelect }: Props) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const fmt = (n: number) => new Intl.NumberFormat('ko-KR').format(n);

  const plans = useMemo(
    () => (regularClass.passPlans ?? []).filter((p) => p.status !== 'Pending'),
    [regularClass.passPlans],
  );
  // 방식이 하나뿐이면 미리 골라둬서 탭 한 번을 아낀다
  const [selectedId, setSelectedId] = useState<number | null>(plans.length === 1 ? plans[0].id : null);
  const selected = plans.find((p) => p.id === selectedId) ?? null;

  const artist = regularClass.artist;
  const artistName = artist ? (artist.nickName || artist.name) : '';
  const thumbUrl = artist?.profileImageUrl || studioImageUrl;

  const [closing, setClosing] = useState(false);
  const close = (after?: () => void) => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => after?.(), 200);
  };

  return (
    <div className={`fixed inset-0 z-30 bg-black/50 flex items-center justify-center px-[5%] ${closing ? 'animate-[fadeOut_200ms_ease-in_forwards]' : 'animate-[fadeIn_200ms_ease-out]'}`}>
      <div className={`bg-white rounded-[24px] w-full max-w-[720px] max-h-[88vh] flex flex-col overflow-hidden ${closing ? 'animate-[scaleOut_200ms_ease-in_forwards]' : 'animate-[scaleIn_200ms_ease-out]'}`}>
        {/* 헤더 — 썸네일(강사 사진 → 학원 로고) + 반 이름 + 담당 강사 */}
        <div className="flex items-start justify-between px-[24px] pt-[24px] pb-[12px]" style={{ gap: 12 }}>
          <div className="flex items-center min-w-0" style={{ gap: 14 }}>
            <div className="shrink-0 rounded-[14px] overflow-hidden bg-[#F1F3F6]" style={{ width: 'min(7vh, 64px)', height: 'min(7vh, 64px)' }}>
              {thumbUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={kioskImageSrc(thumbUrl, 200)} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex flex-col min-w-0" style={{ gap: 4 }}>
              <p className="text-black font-bold leading-snug line-clamp-2" style={{ fontSize: 'min(2.2vh, 24px)' }}>{regularClass.name}</p>
              {artistName && (
                <p className="text-[#6D7882] truncate" style={{ fontSize: 'min(1.5vh, 15px)' }}>
                  {t('regular_class_artist')} · {artistName}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => close(onClose)}
            className="shrink-0 w-[36px] h-[36px] flex items-center justify-center active:scale-[0.97] transition-transform"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 6L18 18M6 18L18 6" stroke="#1E2124" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* 본문 — 반 설명 + 수강 방식 선택 */}
        <div className="flex-1 overflow-y-auto px-[24px] py-[12px] flex flex-col" style={{ gap: 16 }}>
          {regularClass.description && (
            <p className="text-[#4E5968] whitespace-pre-line leading-relaxed" style={{ fontSize: 'min(1.5vh, 15px)' }}>
              {regularClass.description}
            </p>
          )}

          <div className="flex flex-col" style={{ gap: 10 }}>
            <p className="text-black font-bold" style={{ fontSize: 'min(1.7vh, 18px)' }}>{t('select_enroll_option')}</p>
            {plans.length === 0 && (
              <p className="text-[#86898C] py-[12px]" style={{ fontSize: 'min(1.5vh, 16px)' }}>{t('regular_class_no_plans')}</p>
            )}
            {plans.map((plan) => {
              const isSelected = plan.id === selectedId;
              const daysLabel = weeklyDaysLabel(plan.days, locale);
              const meta = [daysLabel, plan.expireDateStamp].filter(Boolean).join(' · ');
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedId(isSelected ? null : plan.id)}
                  className={`w-full text-left rounded-[16px] flex items-center transition-all active:scale-[0.99] ${
                    isSelected ? 'bg-[#1E2124] ring-2 ring-[#1E2124]' : 'bg-[#F9F9FB]'
                  }`}
                  style={{ padding: 'min(1.6vh, 16px) min(1.8vh, 18px)', gap: 12 }}
                >
                  <div className="flex flex-col min-w-0 flex-1" style={{ gap: 3 }}>
                    <span className={`font-bold truncate ${isSelected ? 'text-white' : 'text-[#1E2124]'}`} style={{ fontSize: 'min(1.8vh, 19px)' }}>
                      {plan.name}
                    </span>
                    {meta && (
                      <span className={`truncate ${isSelected ? 'text-white/70' : 'text-[#6D7882]'}`} style={{ fontSize: 'min(1.4vh, 14px)' }}>
                        {meta}
                      </span>
                    )}
                  </div>
                  <span className={`shrink-0 font-bold ${isSelected ? 'text-white' : 'text-[#1E2124]'}`} style={{ fontSize: 'min(1.8vh, 19px)' }}>
                    {fmt(plan.price ?? 0)}{t('won')}
                  </span>
                  <div className={`shrink-0 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-white bg-white' : 'border-[#CDD1D5]'
                  }`} style={{ width: 22, height: 22 }}>
                    {isSelected && (
                      <svg width="11" height="9" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="#1E2124" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 가격 — 고른 방식의 금액 */}
        <div className="shrink-0 px-[24px] pt-[12px] pb-[16px]">
          <span className="text-black font-extrabold" style={{ fontSize: 'min(2.4vh, 28px)' }}>
            {fmt(selected?.price ?? 0)}{t('won')}
          </span>
        </div>

        {/* 하단 버튼 — 이전 / 정규반 등록 */}
        <div className="shrink-0 px-[24px] pb-[20px] flex gap-[10px]">
          <button
            onClick={() => close(onClose)}
            className="flex-[1] h-[min(6vh,56px)] rounded-[14px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.97] transition-transform"
          >
            <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(1.8vh, 20px)' }}>{t('kiosk_back')}</span>
          </button>
          <button
            onClick={() => selected && close(() => onSelect(selected))}
            disabled={!selected}
            className={`flex-[2] h-[min(6vh,56px)] rounded-[14px] flex items-center justify-center active:scale-[0.97] transition-all ${
              selected ? 'bg-[#1E2124]' : 'bg-[#CDD1D5]'
            }`}
          >
            <span className="text-white font-bold" style={{ fontSize: 'min(1.8vh, 20px)' }}>{t('kiosk_enroll_regular_class')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
