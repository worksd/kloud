'use client';

import React from 'react';
import { Locale } from '@/shared/StringResource';
import { getLocaleString } from '@/app/components/locale';
import { KioskTopBar } from '@/app/kiosk/KioskTopBar';
import { GetLessonResponse } from '@/app/endpoint/lesson.endpoint';
import { PreviewPaymentGroupResponse } from '@/app/endpoint/kiosk.endpoint';
import { kioskImageSrc } from '@/app/kiosk/kiosk.image';
import { formatLessonDate, formatLessonStart } from '@/app/kiosk/kiosk.lesson';

/**
 * 장바구니 결제수단 화면 (igin cartMode 포팅) — 단건 KioskPaymentMethodForm과 별개.
 * 수업 정보(행마다 사유·X) / 결제 정보(총 N개 수업 + preview 합계) / 결제 방법(카드·Apple Pay·현금).
 * purchasable=false 행은 amber 사유만 보여주고 버튼은 막지 않는다 — 누르면 호출부가 remove_blocked 다이얼로그를 띄운다.
 */
type Props = {
  items: GetLessonResponse[];
  preview: PreviewPaymentGroupResponse | null;
  loading: boolean;
  errorMessage: string | null;
  locale: Locale;
  onRemove: (lesson: GetLessonResponse) => void;
  onBack: () => void;
  onHome: () => void;
  onSelectCard: () => void;
  onSelectApplePay: () => void;
  onSelectCash: () => void;
};

const REASON_KEY: Record<string, 'kiosk_cart_reason_sold_out' | 'kiosk_cart_reason_already_registered' | 'kiosk_cart_reason_invalid_status' | 'kiosk_cart_reason_price_unavailable'> = {
  SOLD_OUT: 'kiosk_cart_reason_sold_out',
  ALREADY_REGISTERED: 'kiosk_cart_reason_already_registered',
  INVALID_STATUS: 'kiosk_cart_reason_invalid_status',
  PRICE_UNAVAILABLE: 'kiosk_cart_reason_price_unavailable',
};

export const KioskCartPaymentForm = ({ items, preview, loading, errorMessage, locale, onRemove, onBack, onHome, onSelectCard, onSelectApplePay, onSelectCash }: Props) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const fmt = (n: number) => new Intl.NumberFormat('ko-KR').format(n);
  const previewOf = (l: GetLessonResponse) => preview?.items.find((it) => it.item === 'lesson' && String(it.itemId) === String(l.id));
  const fallbackTotal = items.reduce((s, l) => s + (l.price ?? 0), 0);
  const total = preview?.totalAmount ?? fallbackTotal;
  const count = items.length;

  return (
    <div className="bg-white w-full h-screen flex flex-col overflow-hidden animate-[fadeIn_260ms_ease-out]">
      <KioskTopBar onBack={onBack} onHome={onHome} />

      <div className="shrink-0 flex items-center justify-center px-[5.6%]" style={{ paddingTop: 'min(4vw, 44px)', paddingBottom: 'min(2.4vw, 26px)' }}>
        <p className="text-black font-bold text-center leading-tight" style={{ fontSize: 'min(3.4vw, 36px)' }}>
          {t('kiosk_how_to_pay')}
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* 수업 정보 — 담은 수업 행 목록 */}
        <div className="px-[5.6%] pb-[min(2vw,22px)]">
          <p className="text-[#86898C] font-bold mb-[min(1vw,12px)]" style={{ fontSize: 'min(1.8vw, 20px)' }}>{t('kiosk_lesson_info')}</p>
          <div className="bg-white border border-[#E6E8EA] rounded-[20px] overflow-hidden divide-y divide-[#F2F4F6]">
            {items.map((l) => {
              const pv = previewOf(l);
              const reason = pv && pv.purchasable === false ? (pv.reason ?? 'INVALID_STATUS') : null;
              const amount = pv?.amount ?? l.price ?? 0;
              return (
                <div key={l.id} className="flex items-center px-[min(2.4vw,26px)] py-[min(1.6vw,18px)]" style={{ gap: 'min(1.6vw, 18px)' }}>
                  <div className="rounded-[10px] bg-[#E8E8EA] overflow-hidden shrink-0" style={{ width: 52, height: 66 }}>
                    {l.thumbnailUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={kioskImageSrc(l.thumbnailUrl, 200)} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <span className="text-black font-bold truncate" style={{ fontSize: 'min(2vw, 22px)' }}>{l.title ?? ''}</span>
                    <span className="text-[#6D7882] truncate mt-[2px]" style={{ fontSize: 'min(1.5vw, 17px)' }}>
                      {[formatLessonDate(l, locale), formatLessonStart(l, locale)].filter(Boolean).join(' · ')}
                    </span>
                    {reason && (
                      <span className="text-[#C8860A] font-medium mt-[2px]" style={{ fontSize: 'min(1.5vw, 17px)' }}>
                        {t(REASON_KEY[reason] ?? 'kiosk_cart_reason_invalid_status')}
                      </span>
                    )}
                  </div>
                  <span className="text-black font-bold shrink-0" style={{ fontSize: 'min(2vw, 22px)' }}>{fmt(amount)}{t('won')}</span>
                  <button
                    type="button"
                    onClick={() => onRemove(l)}
                    aria-label="remove"
                    className="shrink-0 w-[36px] h-[36px] rounded-full bg-[#F2F4F6] flex items-center justify-center active:scale-[0.92] transition-transform"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M6 6L18 18M6 18L18 6" stroke="#1E2124" strokeWidth="2.6" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 결제 정보 — 총 N개 수업 · preview 합계 */}
        <div className="px-[5.6%] pb-[min(2vw,22px)]">
          <p className="text-[#86898C] font-bold mb-[min(1vw,12px)]" style={{ fontSize: 'min(1.8vw, 20px)' }}>{t('kiosk_payment_info')}</p>
          <div className="bg-[#F9F9FB] rounded-[20px] px-[min(3vw,32px)] py-[min(2.4vw,26px)]">
            <div className="flex items-baseline justify-between">
              <span className="text-black" style={{ fontSize: 'min(2.4vw, 26px)' }}>{t('kiosk_cart_total_label').replace('{count}', String(count))}</span>
              <span className="flex items-baseline gap-[6px]">
                {loading ? (
                  <span className="inline-block w-6 h-6 border-3 border-[#CDD1D5] border-t-[#1E2124] rounded-full animate-spin" />
                ) : (
                  <span className="text-black font-bold" style={{ fontSize: 'min(3.2vw, 34px)' }}>{fmt(total)}</span>
                )}
                <span className="text-[#86898C]" style={{ fontSize: 'min(2vw, 22px)' }}>{t('won')}</span>
              </span>
            </div>
            {errorMessage && (
              <p className="text-[#C8860A] font-medium mt-[min(1vw,12px)]" style={{ fontSize: 'min(1.7vw, 19px)' }}>{errorMessage}</p>
            )}
          </div>
        </div>

        {/* 결제 방법 — 카드 / Apple Pay / 현금 (3열). 0원 그룹은 카드를 눌러도 호출부가 현금 경로로 보낸다 */}
        <div className="px-[5.6%] pb-[min(1.4vw,16px)]">
          <p className="text-[#86898C] font-bold mb-[min(1vw,12px)]" style={{ fontSize: 'min(1.8vw, 20px)' }}>{t('kiosk_payment_method_section')}</p>
          <div className="grid grid-cols-3 gap-[min(1.4vw,16px)]">
            <button onClick={onSelectCard} className="aspect-square bg-[#F9F9FB] rounded-[20px] flex flex-col items-center justify-center cursor-pointer active:scale-[0.97] transition-transform">
              <svg width="28" height="38" viewBox="0 0 54 70" fill="none">
                <rect x="2" y="2" width="50" height="66" rx="8" fill="#A6B5C9"/>
                <circle cx="42" cy="14" r="3.5" fill="white"/>
              </svg>
              <span className="text-[#1E2124] font-bold mt-[min(1.4vw,16px)]" style={{ fontSize: 'min(2.2vw, 24px)' }}>{t('kiosk_card_payment')}</span>
            </button>
            <button onClick={onSelectApplePay} className="aspect-square bg-[#F9F9FB] rounded-[20px] flex flex-col items-center justify-center cursor-pointer active:scale-[0.97] transition-transform">
              <svg width="32" height="40" viewBox="0 0 54 70" fill="none">
                <rect x="2" y="2" width="50" height="66" rx="8" fill="#A6B5C9"/>
                <path d="M30.5 35.5C29.2 35.5 27.9 36.4 26.8 36.4C25.7 36.4 24.5 35.5 23 35.5C20.5 35.5 17.5 37.5 17.5 41.8C17.5 44.7 18.7 47.7 20.3 49.7C21.1 50.7 22 51.6 23.1 51.6C24.2 51.6 24.6 50.9 25.9 50.9C27.2 50.9 27.7 51.6 28.8 51.6C29.9 51.6 30.7 50.6 31.5 49.7C32.4 48.5 32.8 47.4 32.8 47.3C32.7 47.2 30.7 46.4 30.7 44C30.7 42 32.3 41 32.4 40.9C31.6 39.7 30.4 35.5 30.5 35.5Z" fill="white"/>
                <path d="M28.7 33.5C29.3 32.7 29.7 31.6 29.6 30.5C28.7 30.5 27.6 31.1 26.9 31.9C26.4 32.6 25.9 33.7 26 34.8C27 34.9 28 34.3 28.7 33.5Z" fill="white"/>
              </svg>
              <span className="text-[#1E2124] font-bold mt-[min(1.4vw,16px)]" style={{ fontSize: 'min(2.2vw, 24px)' }}>Apple Pay</span>
            </button>
            <button onClick={onSelectCash} className="aspect-square bg-[#F9F9FB] rounded-[20px] flex flex-col items-center justify-center cursor-pointer active:scale-[0.97] transition-transform">
              <svg width="36" height="28" viewBox="0 0 72 54" fill="none">
                <rect x="2" y="2" width="68" height="50" rx="8" fill="#A6B5C9"/>
                <circle cx="36" cy="27" r="9" fill="none" stroke="white" strokeWidth="2.5"/>
                <rect x="10" y="13" width="6" height="3" rx="1" fill="white"/>
                <rect x="56" y="13" width="6" height="3" rx="1" fill="white"/>
                <rect x="10" y="38" width="6" height="3" rx="1" fill="white"/>
                <rect x="56" y="38" width="6" height="3" rx="1" fill="white"/>
              </svg>
              <span className="text-[#1E2124] font-bold mt-[min(1.4vw,16px)]" style={{ fontSize: 'min(2.2vw, 24px)' }}>{t('kiosk_cash_payment')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="shrink-0 px-[5.6%] pt-[min(1.8vw,20px)] pb-[min(2.8vw,30px)]">
        <button onClick={onBack} className="w-full h-[min(7vh,72px)] rounded-[16px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.97] transition-transform">
          <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(2.4vw, 26px)' }}>{t('kiosk_back')}</span>
        </button>
      </div>
    </div>
  );
};
