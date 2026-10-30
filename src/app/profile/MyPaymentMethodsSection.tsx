'use client'
// 마이페이지 '결제 카드' 섹션 — 모바일(ProfileForm)·PC(ProfilePcForm) 공용.
// 결제수단 관리가 설정 > 계정 안에 깊이 들어가 있어 못 찾는다는 평가가 많아 마이페이지 본문으로 꺼낸 것.
// 등록된 카드를 행으로(은행/카드 아이콘 + 카드명 + 뒷자리), 끝에 '카드 추가하기' 행.
// 추가는 여기서 바텀시트를 바로 띄우지 않고 결제수단 관리 페이지로 이동한 뒤 그 페이지가 바텀시트를 연다(?add=1, KloudScreen.PaymentMethodAdd)
// — 돌아왔을 때 목록 갱신·삭제 등은 그 페이지 몫이라 여기엔 상태가 없다. 머리글 오른쪽 '관리'도 같은 페이지로.
// 하나도 없으면 안내 카드 + 추가 버튼. 카드 목록은 서버(page.tsx)에서 user.me 와 병렬로 받아 내려준다.

import React from "react";
import { GetBillingResponse } from "@/app/endpoint/billing.endpoint";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { KloudScreen } from "@/shared/kloud.screen";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { BankOrCardIcon } from "@/app/components/Bank";
import { ChevronRightIcon } from "@/app/profile/ActivityIcons";

/** 본문에 바로 보여줄 카드 수 — 넘치면 '외 N장 더 보기'로 접고 관리 페이지에서 */
const SHOW_MAX = 3;

export const MyPaymentMethodsSection = ({ cards, locale, variant = 'mobile' }: {
  cards: GetBillingResponse[];
  locale: Locale;
  /** mobile=섹션 머리글 17px·눌림 스케일 / pc=ProfileContentCard 안 머리글 16px·호버 */
  variant?: 'mobile' | 'pc';
}) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const pc = variant === 'pc';

  const shown = cards.slice(0, SHOW_MAX);
  const rest = cards.length - shown.length;
  const rowClass = pc
    ? 'flex items-center gap-4 rounded-[20px] px-4 py-3.5 bg-[#F9FAFB]'
    : 'flex items-center gap-3.5 rounded-[20px] px-4 py-3.5 bg-[#F9FAFB]';
  const iconBox = pc ? 'w-14 h-14' : 'w-[52px] h-[52px]';

  return (
    <>
      {/* 머리글 — 제목 + 장수, 오른쪽 '관리'(기존 설정 페이지: 삭제 등) */}
      <div className={`flex items-center justify-between ${pc ? 'mb-5' : 'mb-3 px-1'}`}>
        <div className="flex items-baseline gap-2">
          <span className={`${pc ? 'text-[16px]' : 'text-[17px]'} font-bold text-[#191F28] tracking-[-0.3px]`}>{t('my_payment_cards')}</span>
          {cards.length > 0 && <span className="text-[13px] font-semibold text-[#B0B8C1] font-paperlogy">{cards.length}</span>}
        </div>
        {cards.length > 0 && (
          <NavigateClickWrapper method="push" route={KloudScreen.PaymentMethodSetting}>
            <span className="inline-flex items-center text-[13px] font-semibold text-[#8B95A1] active:opacity-60 hover:text-[#4E5968] cursor-pointer">
              {t('payment_method_manage')}
              <ChevronRightIcon className="w-4 h-4 -mr-1"/>
            </span>
          </NavigateClickWrapper>
        )}
      </div>

      {cards.length === 0 ? (
        // 비어 있음 — 왜 등록하면 좋은지 한 줄 + 추가 버튼(관리 페이지로 이동 → 거기서 바텀시트)
        <div className="rounded-[20px] bg-[#F9FAFB] px-5 py-5 flex flex-col items-start gap-1">
          <span className="text-[15px] font-bold text-[#191F28] tracking-[-0.3px]">{t('payment_cards_empty_title')}</span>
          <span className="text-[13px] text-[#8B95A1] tracking-[-0.2px]">{t('payment_cards_empty_desc')}</span>
          <NavigateClickWrapper method="push" route={KloudScreen.PaymentMethodAdd}>
            <button
              type="button"
              className="mt-3.5 h-11 px-5 rounded-xl bg-[#191F28] text-white text-[14px] font-bold active:scale-[0.97] hover:opacity-90 transition-all"
            >
              {t('payment_card_add')}
            </button>
          </NavigateClickWrapper>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {shown.map((card) => {
            const last4 = (card.cardNumber ?? '').slice(-4);
            return (
              <div key={card.billingKey} className={rowClass}>
                <span className={`${iconBox} rounded-[14px] bg-white flex items-center justify-center shrink-0`}>
                  <BankOrCardIcon name={card.cardName ?? ''} size={28}/>
                </span>
                <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                  <span className="text-[15px] font-semibold text-[#191F28] truncate tracking-[-0.3px]">{card.cardName}</span>
                  {last4 && <span className="text-[12.5px] text-[#8B95A1] tracking-wider font-paperlogy">**** {last4}</span>}
                </div>
              </div>
            );
          })}
          {rest > 0 && (
            <NavigateClickWrapper method="push" route={KloudScreen.PaymentMethodSetting}>
              <div className="px-1 py-1 text-[13px] font-semibold text-[#8B95A1] cursor-pointer active:opacity-60">
                {t('payment_cards_more').replace('{n}', String(rest))}
              </div>
            </NavigateClickWrapper>
          )}
          {/* 추가 행 — 점선 테두리. 관리 페이지로 이동하면서 바텀시트가 열린다 */}
          <NavigateClickWrapper method="push" route={KloudScreen.PaymentMethodAdd}>
            <button
              type="button"
              className={`w-full flex items-center justify-center gap-1.5 h-12 rounded-[20px] border border-dashed border-[#D1D6DB] text-[14px] font-semibold text-[#4E5968] ${pc ? 'hover:bg-[#F9FAFB]' : 'active:bg-[#F9FAFB]'} transition-colors`}
            >
              <span className="text-[18px] leading-none -mt-0.5">+</span>
              {t('payment_card_add')}
            </button>
          </NavigateClickWrapper>
        </div>
      )}
    </>
  );
};
