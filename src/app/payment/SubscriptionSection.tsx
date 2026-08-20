'use client';

// 정기결제 스페셜 섹션 — canSubscribe 상품에서 일반 결제수단과 별도로 노출하는 프로모션 톤 카드.
// 탭하면 정기결제 모드로 선택되고, 안에서 등록 카드 선택/신규 등록까지 처리한다.
// 결제 자체는 PaymentButton이 POST /subscription 으로 보낸다.

import React, { useState } from 'react';
import { Locale } from '@/shared/StringResource';
import { getLocaleString } from '@/app/components/locale';
import { GetBillingResponse, CreateBillingRequest } from '@/app/endpoint/billing.endpoint';
import { SelectableBillingList } from '@/app/profile/setting/account/paymentMethod/BillingCardForm';
import { InlineCardForm } from '@/app/lessons/[id]/payment/InlineCardForm';
import { addBillingAction } from '@/app/profile/setting/account/paymentMethod/add.billing.action';
import { getBillingListAction } from '@/app/profile/setting/account/paymentMethod/get.billing.list.action';
import { createDialog } from '@/utils/dialog.factory';

export const SubscriptionSection = ({
  locale,
  price,
  cycleSuffix,
  cycleLabel,
  cards,
  onCardsChangeAction,
  selectedBillingCard,
  selectBillingCard,
  selected,
  onSelectAction,
}: {
  locale: Locale,
  /** 주기당 결제 금액 (선택한 가격 정책의 상품가) — null이면 금액 미표기 */
  price?: number | null,
  /** 금액 옆 주기 표기 (예: '/ 4주', '/ 월') — 선택한 가격 정책으로 연산된 값 */
  cycleSuffix?: string,
  /** 문장용 주기 라벨 (예: '4주마다', '매달') */
  cycleLabel?: string,
  cards: GetBillingResponse[],
  onCardsChangeAction: (cards: GetBillingResponse[]) => void,
  selectedBillingCard?: GetBillingResponse,
  selectBillingCard: (card: GetBillingResponse) => void,
  /** 정기결제 모드로 선택됐는지 */
  selected: boolean,
  onSelectAction: () => void,
}) => {
  const [showCardForm, setShowCardForm] = useState(false);
  const [newCardForm, setNewCardForm] = useState<CreateBillingRequest | null>(null);
  const [addingCard, setAddingCard] = useState(false);

  const handleAddCard = async () => {
    if (!newCardForm || addingCard) return;
    setAddingCard(true);
    const res = await addBillingAction(newCardForm);
    if ('billingKey' in res && res.billingKey) {
      setShowCardForm(false);
      setNewCardForm(null);
      // 풀 리로드 대신 목록 재조회 — 새 카드를 바로 선택 상태로
      const list = await getBillingListAction();
      if ('billings' in list) {
        onCardsChangeAction(list.billings);
        const added = list.billings.find((c) => c.billingKey === res.billingKey);
        if (added) selectBillingCard(added);
      }
    } else {
      const message = 'pgMessage' in res
        ? res.pgMessage ?? ''
        : (res as { message?: string }).message ?? '';
      const dialog = await createDialog({
        id: 'Simple',
        title: getLocaleString({ locale, key: 'billing_register_fail_title' }),
        message,
      });
      window.KloudEvent?.showDialog(JSON.stringify(dialog));
    }
    setAddingCard(false);
  };

  const benefits: Parameters<typeof getLocaleString>[0]['key'][] = [
    'subscription_benefit_1',
    'subscription_benefit_2',
    'subscription_benefit_3',
  ];

  return (
    // mb-5: 아래 일반결제 섹션과 살짝 간격
    <div className="flex flex-col gap-y-2 px-6 mt-2 mb-5">
      <div className="text-[15px] font-bold text-black">
        {getLocaleString({ locale, key: 'my_subscription' })}
      </div>

      <div
        onClick={() => { if (!selected) onSelectAction(); }}
        className={`relative rounded-2xl p-5 cursor-pointer select-none overflow-hidden transition-all duration-200
          bg-gradient-to-br from-[#111114] via-[#1B1B3A] to-[#3B2B75] text-white
          ${selected ? 'ring-2 ring-[#8B7CFF] shadow-[0_10px_30px_-10px_rgba(80,60,200,0.5)]' : 'opacity-95 active:scale-[0.99]'}`}
      >
        {/* 반짝이 장식 */}
        <span className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-[#8B7CFF]/20 blur-2xl"/>

        <div className="flex items-start justify-between">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/15 text-[11px] font-bold">
            ✨ {getLocaleString({ locale, key: 'subscription_badge' })}
          </span>
          {/* 선택 체크 */}
          <span className={`w-[20px] h-[20px] rounded-full border-[1.5px] flex items-center justify-center transition-all duration-150
            ${selected ? 'border-white bg-white' : 'border-white/40'}`}>
            {selected && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="#1B1B3A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </span>
        </div>

        {price != null && price > 0 && (
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-[24px] font-extrabold tracking-tight">
              {new Intl.NumberFormat('ko-KR').format(price)}{getLocaleString({ locale, key: 'won' })}
            </span>
            <span className="text-[13px] font-medium text-white/60">
              {cycleSuffix ?? getLocaleString({ locale, key: 'subscription_per_month' })}
            </span>
          </div>
        )}

        {/* 혜택 리스트 — 편함을 판다. 첫 줄은 가격 정책으로 연산한 결제 주기를 치환 */}
        <ul className="mt-3 flex flex-col gap-1.5">
          {benefits.map((key) => (
            <li key={key} className="flex items-center gap-2 text-[13px] text-white/85">
              <svg width="12" height="10" viewBox="0 0 10 8" fill="none" className="shrink-0">
                <path d="M1 4L3.5 6.5L9 1" stroke="#A99CFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {getLocaleString({ locale, key }).replace(
                '{cycle}',
                cycleLabel ?? getLocaleString({ locale, key: 'cycle_monthly' }),
              )}
            </li>
          ))}
        </ul>

        {/* 선택 시 — 카드 선택/등록 패널 */}
        {selected && (
          <div className="mt-4 rounded-xl bg-white p-3" onClick={(e) => e.stopPropagation()}>
            <SelectableBillingList
              billingCards={cards}
              selectedBillingKey={selectedBillingCard}
              onSelectAction={(card) => {
                selectBillingCard(card);
                setShowCardForm(false);
                setNewCardForm(null);
              }}
              locale={locale}
            />
            <button
              type="button"
              onClick={() => setShowCardForm((prev) => !prev)}
              className="mt-2 w-full flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-dashed border-[#D0D0D0] bg-white
                         text-[#888] text-[13px] font-medium active:bg-[#F5F5F5] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {getLocaleString({ locale, key: 'add_new_card' })}
            </button>
            {showCardForm && (
              <>
                <InlineCardForm
                  locale={locale}
                  onCardInfoChange={(form) => setNewCardForm(form)}
                />
                <button
                  type="button"
                  onClick={handleAddCard}
                  disabled={!newCardForm || addingCard}
                  className={`mt-2 w-full h-11 rounded-xl text-[13px] font-bold transition-colors ${
                    !newCardForm || addingCard ? 'bg-[#EEEFF0] text-[#B0B8BF]' : 'bg-black text-white active:scale-[0.98]'
                  }`}
                >
                  {addingCard
                    ? <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin align-middle"/>
                    : getLocaleString({ locale, key: 'confirm' })}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
