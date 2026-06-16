'use client';

import React from 'react';
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { KioskCartItemPayment } from "@/app/endpoint/kiosk.endpoint";
import { DiscountResponse, PaymentDiscount } from "@/app/endpoint/payment.endpoint";
import { KioskPassSelection } from "@/app/kiosk/KioskPassSelectModal";
import { KioskTopBar } from "@/app/kiosk/KioskLessonListForm";
import { kioskImageSrc } from "@/app/kiosk/kiosk.image";

const toPaymentDiscount = (d: DiscountResponse): PaymentDiscount => ({
  key: d.key,
  amount: d.amount,
  type: d.type as PaymentDiscount['type'],
  itemId: d.itemId,
  passRuleId: d.passRule?.id,
  passRule: d.passRule,
});

export type ResolvedCartItem = {
  net: number;            // 카드/현금으로 청구할 이 수업의 잔액
  discountAmount: number; // 차감 금액 (패스 풀커버면 price 전액)
  label?: string;         // 적용된 패스/할인 이름
  passId?: number;        // 패스 풀커버 시
  discount?: PaymentDiscount; // 할인/부분차감 시
};

// 수업 한 줄에 선택된 패스/할인을 해석 — 표시/합계/결제요청에서 공통 사용 (KioskForm과 공유)
export const resolveCartItem = (item: KioskCartItemPayment, selection: KioskPassSelection | null | undefined): ResolvedCartItem => {
  if (!selection) return { net: item.price, discountAmount: 0 };
  if (selection.kind === 'discount') {
    const amt = selection.discount.amount;
    return {
      net: Math.max(0, item.price - amt),
      discountAmount: amt,
      label: selection.discount.description ?? selection.discount.key,
      discount: toPaymentDiscount(selection.discount),
    };
  }
  const { pass, rule } = selection;
  const name = pass.passPlan?.name ?? '패스권';
  // benefitType='Discount' 룰은 부분 할인(잔액 카드결제), 그 외(FreeCount/Unlimited)는 풀커버
  if (rule.benefitType === 'Discount') {
    const amt = rule.benefitValue ?? 0;
    return {
      net: Math.max(0, item.price - amt),
      discountAmount: amt,
      label: name,
      discount: { key: name, amount: amt, type: 'passRule', itemId: pass.id, passRuleId: rule.id, passRule: rule },
    };
  }
  return { net: 0, discountAmount: item.price, label: name, passId: pass.id };
};

type Props = {
  cartPayment: { items: KioskCartItemPayment[] };
  selections: Record<number, KioskPassSelection | null>;
  locale: Locale;
  isPaying: boolean;
  cardEnabled: boolean;
  cashEnabled: boolean;
  onSelectItemPass: (lessonId: number) => void;
  onClearItem: (lessonId: number) => void;
  onPayCard: () => void;
  onPayCash: () => void;
  onBack: () => void;
  onHome: () => void;
  onChangeLocale: (locale: Locale) => void;
};

export const KioskCartForm = ({
  cartPayment, selections, locale, isPaying, cardEnabled, cashEnabled,
  onSelectItemPass, onClearItem, onPayCard, onPayCash, onBack, onHome, onChangeLocale,
}: Props) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const fmt = (n: number) => new Intl.NumberFormat('ko-KR').format(n);
  const won = t('won');

  const resolved = cartPayment.items.map((it) => ({ item: it, r: resolveCartItem(it, selections[it.lessonId]) }));
  const total = resolved.reduce((s, x) => s + x.r.net, 0);
  const totalDiscount = resolved.reduce((s, x) => s + x.r.discountAmount, 0);
  const allCovered = total === 0; // 전부 패스 풀커버 → 단말 결제 없이 신청

  return (
    <div className="bg-white w-full h-screen flex flex-col overflow-hidden">
      <KioskTopBar locale={locale} onChangeLocale={onChangeLocale} onBack={onBack} onHome={onHome} />

      <div className="shrink-0 px-[5.6%] pb-[min(1.4vw,16px)]">
        <p className="text-black font-bold leading-tight" style={{ fontSize: 'min(3vh, 34px)' }}>
          {t('kiosk_cart_title')}
        </p>
      </div>

      {/* 수업 목록 */}
      <div className="flex-1 overflow-y-auto px-[5.6%]">
        <div className="flex flex-col gap-[12px]">
          {resolved.map(({ item, r }) => {
            const sel = selections[item.lessonId];
            return (
              <div key={item.lessonId} className="rounded-[18px] bg-[#F9F9FB] p-[min(2vw,22px)] flex flex-col gap-[min(1.4vw,16px)]">
                <div className="flex items-center gap-[min(1.6vw,18px)]">
                  <div className="rounded-[12px] overflow-hidden bg-[#E8E8EA] shrink-0" style={{ width: 'min(7vh,76px)', height: 'min(9vh,100px)' }}>
                    {item.thumbnailUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={kioskImageSrc(item.thumbnailUrl, 300)} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-black font-bold truncate" style={{ fontSize: 'min(2vh, 22px)' }}>{item.title}</p>
                    {item.startDate && (
                      <p className="text-[#86898C] mt-[4px] truncate" style={{ fontSize: 'min(1.5vh, 16px)' }}>{item.startDate}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    {r.discountAmount > 0 && (
                      <span className="text-[#BFC2C5] line-through" style={{ fontSize: 'min(1.5vh,16px)' }}>{fmt(item.price)}{won}</span>
                    )}
                    <span className="text-black font-bold" style={{ fontSize: 'min(2vh,22px)' }}>{fmt(r.net)}{won}</span>
                  </div>
                </div>

                {/* 패스/할인 적용 행 */}
                <div className="flex items-center gap-[10px]">
                  {sel ? (
                    <>
                      <div className="flex-1 flex items-center gap-[8px] min-w-0">
                        <span className="shrink-0 px-[min(1.2vw,14px)] py-[min(0.5vw,6px)] rounded-full bg-[#1E2124]" style={{ fontSize: 'min(1.3vh,14px)' }}>
                          <span className="text-white font-bold">{t('kiosk_applied')}</span>
                        </span>
                        <span className="text-[#1E2124] font-medium truncate" style={{ fontSize: 'min(1.6vh,18px)' }}>{r.label}</span>
                      </div>
                      <button
                        onClick={() => onClearItem(item.lessonId)}
                        className="shrink-0 rounded-[12px] bg-[#EEF0F2] px-[min(2vw,22px)] py-[min(1vw,12px)] active:scale-[0.97]"
                        style={{ fontSize: 'min(1.6vh,18px)' }}
                      >
                        <span className="text-[#6D7882] font-bold">{t('kiosk_remove')}</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => onSelectItemPass(item.lessonId)}
                      className="w-full rounded-[12px] border border-[#D9DDE1] py-[min(1.2vw,14px)] active:scale-[0.98]"
                      style={{ fontSize: 'min(1.6vh,18px)' }}
                    >
                      <span className="text-[#1E2124] font-bold">{t('kiosk_select_pass')}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 합계 + 결제 */}
      <div className="shrink-0 border-t border-[#F2F4F6] px-[5.6%] py-[min(2vw,22px)]">
        {totalDiscount > 0 && (
          <div className="flex items-center justify-between mb-[min(0.8vw,10px)]">
            <span className="text-[#86898C]" style={{ fontSize: 'min(1.6vh,18px)' }}>{t('discount_info')}</span>
            <span className="text-[#EF4444] font-bold" style={{ fontSize: 'min(1.6vh,18px)' }}>-{fmt(totalDiscount)}{won}</span>
          </div>
        )}
        <div className="flex items-center justify-between mb-[min(1.6vw,18px)]">
          <span className="text-black font-bold" style={{ fontSize: 'min(2.2vh,24px)' }}>{t('kiosk_total')}</span>
          <span className="text-black font-bold" style={{ fontSize: 'min(2.8vh,30px)' }}>{fmt(total)}{won}</span>
        </div>

        {allCovered ? (
          <button
            onClick={onPayCard}
            disabled={isPaying}
            className="w-full rounded-[20px] bg-[#1E2124] flex items-center justify-center active:scale-[0.98] disabled:opacity-60"
            style={{ height: 'min(8vh,88px)' }}
          >
            <span className="text-white font-bold" style={{ fontSize: 'min(2.4vh,26px)' }}>{t('kiosk_submit')}</span>
          </button>
        ) : (
          <div className="flex gap-[min(1.4vw,16px)]">
            <button
              onClick={onPayCash}
              disabled={isPaying || !cashEnabled}
              className="flex-1 rounded-[20px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.98] disabled:opacity-40"
              style={{ height: 'min(8vh,88px)' }}
            >
              <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(2.4vh,26px)' }}>{t('kiosk_cash')}</span>
            </button>
            <button
              onClick={onPayCard}
              disabled={isPaying || !cardEnabled}
              className="flex-[2] rounded-[20px] bg-[#1E2124] flex items-center justify-center active:scale-[0.98] disabled:opacity-40"
              style={{ height: 'min(8vh,88px)' }}
            >
              <span className="text-white font-bold" style={{ fontSize: 'min(2.4vh,26px)' }}>{t('kiosk_card')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
