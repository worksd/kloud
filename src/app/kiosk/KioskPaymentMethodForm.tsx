'use client';

import React from 'react';
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { KioskTopBar } from "@/app/kiosk/KioskLessonListForm";
import { DiscountResponse } from "@/app/endpoint/payment.endpoint";

type KioskPaymentMethodFormProps = {
  itemType: 'lesson' | 'pass-plan';
  lessonTitle: string;
  lessonSubtitle?: string;
  lessonThumbnailUrl?: string;
  price: number;
  user: {
    name?: string;
    nickName?: string;
    phone?: string;
    profileImageUrl?: string;
  };
  selectedDiscount: DiscountResponse | null;
  locale: Locale;
  onBack: () => void;
  onSelectPass: () => void;
  onClearDiscount: () => void;
  onSelectCard: () => void;
  onSelectApplePay: () => void;
  onSelectCash: () => void;
  onPayWithPass: () => void;
  onHome: () => void;
  onChangeLocale: (locale: Locale) => void;
  // 서버 paymentInfo.methods의 isEnabled 반영 — false면 해당 결제 수단 버튼/섹션을 숨김.
  // 미지정(undefined) 시 기본 활성으로 간주.
  cardEnabled?: boolean;
  cashEnabled?: boolean;
  passEnabled?: boolean;
};

export const KioskPaymentMethodForm = ({
  itemType,
  lessonTitle,
  lessonSubtitle,
  lessonThumbnailUrl,
  price,
  user,
  selectedDiscount,
  locale,
  onBack,
  onSelectPass,
  onClearDiscount,
  onSelectCard,
  onSelectApplePay,
  onSelectCash,
  onPayWithPass,
  onHome,
  onChangeLocale,
  cardEnabled = true,
  cashEnabled = true,
  passEnabled = true,
}: KioskPaymentMethodFormProps) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const fmt = (n: number) => new Intl.NumberFormat('ko-KR').format(n);
  const fmtPhone = (digits: string) => {
    const d = digits.replace(/\D/g, '');
    if (d.length <= 3) return d;
    if (d.length <= 7) return `${d.slice(0, 3)} ${d.slice(3)}`;
    return `${d.slice(0, 3)} ${d.slice(3, 7)} ${d.slice(7, 11)}`;
  };
  const discountAmount = selectedDiscount?.amount ?? 0;
  const finalPrice = Math.max(0, price - discountAmount);
  const fullyCovered = finalPrice === 0;
  const userPrimaryName = user.nickName || user.name || '-';
  const userSecondaryName = user.nickName && user.name ? user.name : '';

  return (
    <div className="bg-white w-full h-screen flex flex-col overflow-hidden">
      {/* 상단 바 */}
      <KioskTopBar locale={locale} onChangeLocale={onChangeLocale} onBack={onBack} onHome={onHome} />

      {/* 큰 안내 문구 */}
      <div className="shrink-0 flex items-center justify-center px-[5.6%]" style={{ paddingTop: 'min(4vw, 44px)', paddingBottom: 'min(2.4vw, 26px)' }}>
        <p className="text-black font-bold text-center leading-tight" style={{ fontSize: 'min(3.4vw, 36px)' }}>
          {t('kiosk_how_to_pay')}
        </p>
      </div>

      {/* 상품 정보 섹션 — 수업이냐 패스권이냐에 따라 라벨 분기 */}
      <div className="shrink-0 px-[5.6%] pb-[min(2vw,22px)]">
        <p className="text-[#86898C] font-bold mb-[min(1vw,12px)]" style={{ fontSize: 'min(1.8vw, 20px)' }}>
          {itemType === 'pass-plan' ? t('kiosk_passplan_info') : t('kiosk_lesson_info')}
        </p>
        <div className="bg-[#F9F9FB] rounded-[20px] flex items-center px-[min(3vw,32px)] py-[min(2.4vw,26px)]" style={{ gap: 'min(1.8vw, 20px)' }}>
          <div
            className="rounded-[12px] bg-[#E8E8EA] flex-shrink-0 overflow-hidden"
            style={{ width: 'min(5.6vw, 60px)', height: 'min(5.6vw, 60px)' }}
          >
            {lessonThumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={lessonThumbnailUrl} alt="" className="w-full h-full object-cover" />
            ) : null}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-black font-bold truncate" style={{ fontSize: 'min(2.2vw, 24px)' }}>{lessonTitle}</span>
            {lessonSubtitle && (
              <span className="text-[#6D7882] mt-[2px] truncate" style={{ fontSize: 'min(1.6vw, 18px)' }}>{lessonSubtitle}</span>
            )}
          </div>
        </div>
      </div>

      {/* 결제 정보 섹션 — 회원 + 결제 금액 한 묶음 */}
      <div className="shrink-0 px-[5.6%] pb-[min(2vw,22px)]">
        <p className="text-[#86898C] font-bold mb-[min(1vw,12px)]" style={{ fontSize: 'min(1.8vw, 20px)' }}>
          {t('kiosk_payment_info')}
        </p>
        <div className="bg-[#F9F9FB] rounded-[20px] flex flex-col" style={{ padding: 'min(2.4vw,26px) min(3vw,32px)' }}>
          {/* 회원 row */}
          <div className="flex items-center" style={{ gap: 'min(1.8vw, 20px)' }}>
            <div
              className="rounded-full bg-[#E8E8EA] flex items-center justify-center flex-shrink-0 overflow-hidden"
              style={{ width: 'min(5.6vw, 60px)', height: 'min(5.6vw, 60px)' }}
            >
              {user.profileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.profileImageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" style={{ width: '60%', height: '60%' }}>
                  <path d="M20 21V19C20 16.79 18.21 15 16 15H8C5.79 15 4 16.79 4 19V21" stroke="#B1B8BE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="#B1B8BE" strokeWidth="2"/>
                </svg>
              )}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-baseline" style={{ gap: 'min(0.8vw, 10px)' }}>
                <span className="text-black font-bold truncate" style={{ fontSize: 'min(2.2vw, 24px)' }}>{userPrimaryName}</span>
                {userSecondaryName && (
                  <span className="text-[#8A949E] truncate" style={{ fontSize: 'min(1.6vw, 18px)' }}>{userSecondaryName}</span>
                )}
              </div>
              {user.phone && (
                <span className="text-[#6D7882] mt-[2px]" style={{ fontSize: 'min(1.6vw, 18px)' }}>{fmtPhone(user.phone)}</span>
              )}
            </div>
          </div>

          {/* 구분선 */}
          <div className="h-px bg-[#E6E8EA] my-[min(2vw,22px)]" />

          {/* 결제 금액 — 할인 적용 시 원가/할인 라인 추가 */}
          <div className="flex flex-col" style={{ gap: 'min(0.8vw, 10px)' }}>
            {selectedDiscount && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[#86898C]" style={{ fontSize: 'min(1.8vw, 20px)' }}>{t('kiosk_original_price')}</span>
                  <span className="text-[#86898C] line-through" style={{ fontSize: 'min(1.8vw, 20px)' }}>{fmt(price)}{t('won')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#86898C]" style={{ fontSize: 'min(1.8vw, 20px)' }}>{t('discount_info')}</span>
                  <span className="text-[#E55B5B] font-bold" style={{ fontSize: 'min(1.8vw, 20px)' }}>-{fmt(discountAmount)}{t('won')}</span>
                </div>
              </>
            )}
            <div className="flex items-center justify-between">
              <span className="text-black" style={{ fontSize: 'min(2.4vw, 26px)' }}>{t('payment_amount')}</span>
              <span className="flex items-baseline gap-[8px]">
                <span className="text-black font-bold" style={{ fontSize: 'min(3.6vw, 38px)' }}>{fmt(finalPrice)}</span>
                <span className="text-[#86898C]" style={{ fontSize: 'min(2vw, 22px)' }}>{t('won')}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 할인 / 패스권 섹션 — 서버에서 pass.isEnabled=false거나 패스권 구매 흐름이면 섹션 자체 숨김
          (패스권 구매 시엔 다른 패스권으로 할인을 적용할 수 없음) */}
      {passEnabled && itemType !== 'pass-plan' && (
      <div className="shrink-0 px-[5.6%] pb-[min(2vw,22px)]">
        <p className="text-[#86898C] font-bold mb-[min(1vw,12px)]" style={{ fontSize: 'min(1.8vw, 20px)' }}>
          {t('kiosk_discount_pass_section')}
        </p>
        {selectedDiscount ? (
          // 적용됨 상태
          <div className="w-full bg-[#1E2124] rounded-[20px] flex items-center justify-between px-[min(3vw,32px)] py-[min(2.4vw,26px)]">
            <div className="flex items-center gap-[min(1.4vw,16px)] min-w-0 flex-1">
              <svg width="36" height="28" viewBox="0 0 72 54" fill="none" className="flex-shrink-0">
                <rect x="2" y="2" width="68" height="50" rx="8" fill="white"/>
                <path d="M36 14L38.4 19L43.5 19.5L39.5 23L40.5 28.5L36 26L31.5 28.5L32.5 23L28.5 19.5L33.6 19L36 14Z" fill="#1E2124"/>
              </svg>
              <div className="flex flex-col min-w-0">
                <span className="text-white font-bold truncate" style={{ fontSize: 'min(2.2vw, 24px)' }}>
                  {selectedDiscount.description || selectedDiscount.passRule?.targetLabel || selectedDiscount.key || t('kiosk_pass')}
                </span>
                <span className="text-white/70" style={{ fontSize: 'min(1.6vw, 18px)' }}>
                  -{fmt(discountAmount)}{t('won')} {t('discount_info')}
                </span>
              </div>
            </div>
            <button
              onClick={onClearDiscount}
              className="ml-[min(1.4vw,16px)] flex-shrink-0 w-[min(3.6vw,40px)] h-[min(3.6vw,40px)] rounded-full bg-white/15 flex items-center justify-center active:scale-[0.93] transition-transform"
            >
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 'min(2vw,22px)', height: 'min(2vw,22px)' }}>
                <path d="M6 6L18 18M6 18L18 6" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        ) : (
          // 미적용 상태
          <button
            onClick={onSelectPass}
            className="w-full bg-[#F9F9FB] rounded-[20px] flex items-center justify-between px-[min(3vw,32px)] py-[min(2.4vw,26px)] cursor-pointer active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-[min(1.4vw,16px)]">
              <svg width="36" height="28" viewBox="0 0 72 54" fill="none">
                <rect x="2" y="2" width="68" height="50" rx="8" fill="#A6B5C9"/>
                <path d="M36 14L38.4 19L43.5 19.5L39.5 23L40.5 28.5L36 26L31.5 28.5L32.5 23L28.5 19.5L33.6 19L36 14Z" fill="white"/>
              </svg>
              <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(2.2vw, 24px)' }}>
                {t('kiosk_discount_apply_cta')}
              </span>
            </div>
            <svg viewBox="0 0 24 24" fill="none" style={{ width: 'min(2vw,22px)', height: 'min(2vw,22px)' }}>
              <path d="M9 6L15 12L9 18" stroke="#86898C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
      )}

      {/* 결제 방법 섹션 — 패스권으로 풀 커버 시 섹션 자체가 사라지고 하단 신청하기 버튼으로 결제. */}
      {!fullyCovered && (() => {
        // 보이는 버튼 수에 맞춰 grid-cols 결정. 카드 활성화 시 카드+Apple Pay 2개로 카운트 (둘 다 'credit' KIS 단말 사용).
        const showCash = cashEnabled && itemType !== 'pass-plan';
        const visibleCount = (cardEnabled ? 2 : 0) + (showCash ? 1 : 0);
        if (visibleCount === 0) return null;
        // 단일 버튼이면 grid 대신 가운데 정렬 flex로 두고 버튼을 1/3 폭으로 제한 → aspect-square가 viewport를 잡아먹어
        // 하단 '이전' 버튼이 잘리던 케이스 방지. 2/3개일 땐 기존 grid 그대로.
        const isSingle = visibleCount === 1;
        const gridCols = visibleCount === 2 ? 'grid-cols-2' : 'grid-cols-3';
        const singleButtonWidth = 'w-1/3';
        return (
          <div className="shrink-0 px-[5.6%] pb-[min(1.4vw,16px)]">
            <p className="text-[#86898C] font-bold mb-[min(1vw,12px)]" style={{ fontSize: 'min(1.8vw, 20px)' }}>
              {t('kiosk_payment_method_section')}
            </p>
            <div className={isSingle ? 'flex justify-start' : `grid ${gridCols} gap-[min(1.4vw,16px)]`}>
              {cardEnabled && (
                <>
                  {/* 카드 결제 */}
                  <button
                    onClick={onSelectCard}
                    className="aspect-square bg-[#F9F9FB] rounded-[20px] flex flex-col items-center justify-center cursor-pointer active:scale-[0.97] transition-transform"
                  >
                    <svg width="28" height="38" viewBox="0 0 54 70" fill="none">
                      <rect x="2" y="2" width="50" height="66" rx="8" fill="#A6B5C9"/>
                      <circle cx="42" cy="14" r="3.5" fill="white"/>
                    </svg>
                    <span className="text-[#1E2124] font-bold mt-[min(1.4vw,16px)]" style={{ fontSize: 'min(2.2vw, 24px)' }}>
                      {t('kiosk_card_payment')}
                    </span>
                  </button>

                  {/* Apple Pay — 동일 KIS 단말 (credit 활성화와 함께 노출) */}
                  <button
                    onClick={onSelectApplePay}
                    className="aspect-square bg-[#F9F9FB] rounded-[20px] flex flex-col items-center justify-center cursor-pointer active:scale-[0.97] transition-transform"
                  >
                    <svg width="32" height="40" viewBox="0 0 54 70" fill="none">
                      <rect x="2" y="2" width="50" height="66" rx="8" fill="#A6B5C9"/>
                      <path d="M30.5 35.5C29.2 35.5 27.9 36.4 26.8 36.4C25.7 36.4 24.5 35.5 23 35.5C20.5 35.5 17.5 37.5 17.5 41.8C17.5 44.7 18.7 47.7 20.3 49.7C21.1 50.7 22 51.6 23.1 51.6C24.2 51.6 24.6 50.9 25.9 50.9C27.2 50.9 27.7 51.6 28.8 51.6C29.9 51.6 30.7 50.6 31.5 49.7C32.4 48.5 32.8 47.4 32.8 47.3C32.7 47.2 30.7 46.4 30.7 44C30.7 42 32.3 41 32.4 40.9C31.6 39.7 30.4 35.5 30.5 35.5Z" fill="white"/>
                      <path d="M28.7 33.5C29.3 32.7 29.7 31.6 29.6 30.5C28.7 30.5 27.6 31.1 26.9 31.9C26.4 32.6 25.9 33.7 26 34.8C27 34.9 28 34.3 28.7 33.5Z" fill="white"/>
                    </svg>
                    <span className="text-[#1E2124] font-bold mt-[min(1.4vw,16px)]" style={{ fontSize: 'min(2.2vw, 24px)' }}>
                      Apple Pay
                    </span>
                  </button>
                </>
              )}

              {/* 현금 결제 — 패스권 구매는 미지원, 서버 cash.isEnabled=false면 숨김 */}
              {showCash && (
                <button
                  onClick={onSelectCash}
                  className={`aspect-square bg-[#F9F9FB] rounded-[20px] flex flex-col items-center justify-center cursor-pointer active:scale-[0.97] transition-transform ${
                    isSingle ? singleButtonWidth : ''
                  }`}
                >
                  <svg width="36" height="28" viewBox="0 0 72 54" fill="none">
                    <rect x="2" y="2" width="68" height="50" rx="8" fill="#A6B5C9"/>
                    <circle cx="36" cy="27" r="9" fill="none" stroke="white" strokeWidth="2.5"/>
                    <rect x="10" y="13" width="6" height="3" rx="1" fill="white"/>
                    <rect x="56" y="13" width="6" height="3" rx="1" fill="white"/>
                    <rect x="10" y="38" width="6" height="3" rx="1" fill="white"/>
                    <rect x="56" y="38" width="6" height="3" rx="1" fill="white"/>
                  </svg>
                  <span className="text-[#1E2124] font-bold mt-[min(1.4vw,16px)]" style={{ fontSize: 'min(2.2vw, 24px)' }}>
                    {t('kiosk_cash_payment')}
                  </span>
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* 하단 — 풀 커버 시 신청하기, 아니면 이전 */}
      <div className="mt-auto shrink-0 px-[5.6%] pt-[min(1.8vw,20px)] pb-[min(2.8vw,30px)]">
        {fullyCovered ? (
          <button
            onClick={onPayWithPass}
            className="w-full h-[min(7vh,72px)] rounded-[16px] bg-[#1E2124] flex items-center justify-center active:scale-[0.97] transition-transform"
          >
            <span className="text-white font-bold" style={{ fontSize: 'min(2.4vw, 26px)' }}>{t('kiosk_submit')}</span>
          </button>
        ) : (
          <button
            onClick={onBack}
            className="w-full h-[min(7vh,72px)] rounded-[16px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.97] transition-transform"
          >
            <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(2.4vw, 26px)' }}>{t('kiosk_back')}</span>
          </button>
        )}
      </div>
    </div>
  );
};
