// 마이페이지 프로필(이름·이메일) 바로 아래 결제 카드 — 모바일(ProfileForm)·PC(ProfilePcForm) 공용.
// 결제수단 관리가 설정 > 계정 안에 깊이 있어 못 찾는다는 평가가 많아 프로필 밑으로 꺼낸 것 — 내 정규반·패스권 같은 '내 상품' 섹션과 섞이지 않게.
// 결제 카드 등록은 이 서비스에서 중요한 행동(정규반 수강료 자동결제·빠른 결제)이라 두 가지 모습이다:
//  - 카드 있음: 풀폭 한 줄 '[은행] 삼성카드 758* · 외 1개 ……… >' — 조용히, 탭하면 결제수단 관리(추가·삭제). PC 는 액션 줄 안 알약
//  - 카드 없음: 검정 카드 '결제 카드를 등록해 주세요 / 등록해 두면 정규반 수강료가 자동으로 결제돼요 [등록하기]' — 눈에 띄게

import React from "react";
import { GetBillingResponse } from "@/app/endpoint/billing.endpoint";
import { KloudScreen } from "@/shared/kloud.screen";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { BankOrCardIcon } from "@/app/components/Bank";
import { CardFlatIcon, ChevronRightIcon } from "@/app/profile/ActivityIcons";

export type PaymentCardLabels = {
  /** '외 {n}장' */
  more: string;
  /** 비어 있을 때 — 제목·설명·버튼 */
  registerTitle: string;
  registerDesc: string;
  register: string;
};

export const ProfilePaymentCardChip = ({ cards, labels, variant = 'mobile' }: {
  cards: GetBillingResponse[];
  /** 서버에서 번역해 넘긴다 */
  labels: PaymentCardLabels;
  /** mobile=눌림·풀폭 CTA / pc=호버·인라인 */
  variant?: 'mobile' | 'pc';
}) => {
  const first = cards[0];
  const pc = variant === 'pc';

  // 카드 없음 — 등록 유도. 모바일은 풀폭 검정 카드, PC 는 액션 줄의 검정 알약 버튼
  if (!first) {
    return (
      <NavigateClickWrapper method="push" route={KloudScreen.PaymentMethodAdd}>
        {pc ? (
          <button className="h-9 px-4 rounded-full bg-[#191F28] hover:opacity-90 text-[13px] font-semibold text-white flex items-center gap-1.5 transition-opacity">
            <CardFlatIcon size={16}/>
            {labels.register}
          </button>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl bg-[#191F28] pl-4 pr-3 py-3.5 active:opacity-90 transition-opacity">
            <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <CardFlatIcon size={22}/>
            </span>
            <div className="flex flex-col min-w-0 flex-1 gap-0.5">
              <span className="text-[14.5px] font-bold text-white tracking-[-0.3px]">{labels.registerTitle}</span>
              <span className="text-[12px] text-white/60 tracking-[-0.2px] leading-snug">{labels.registerDesc}</span>
            </div>
            <span className="shrink-0 h-8 px-3 rounded-lg bg-white text-[#191F28] text-[12.5px] font-bold flex items-center">{labels.register}</span>
          </div>
        )}
      </NavigateClickWrapper>
    );
  }

  // 카드 있음 — 모바일은 풀폭 한 줄(화살표는 오른쪽 끝), PC 는 액션 줄 안 알약
  // 카드번호는 뒤 4자리만(서버가 준 마스킹 문자열의 끝 4글자)
  const last4 = (first.cardNumber ?? '').slice(-4);
  const rest = cards.length - 1;
  const shell = pc
    ? 'inline-flex items-center gap-2 h-9 pl-2.5 pr-2 rounded-full bg-[#F7F8FA] hover:bg-[#EEF0F3] transition-colors cursor-pointer'
    : 'flex w-full items-center gap-2.5 rounded-xl bg-[#F7F8FA] px-3.5 py-3 active:bg-[#EEF0F3] transition-colors';
  return (
    <NavigateClickWrapper method="push" route={KloudScreen.PaymentMethodSetting}>
      <div className={shell}>
        <span className={`${pc ? 'w-5 h-5 rounded-md' : 'w-7 h-7 rounded-lg'} bg-white flex items-center justify-center shrink-0`}>
          <BankOrCardIcon name={first.cardName ?? ''} size={pc ? 14 : 18}/>
        </span>
        <span className={`${pc ? 'text-[13px]' : 'text-[14px] flex-1 min-w-0'} font-semibold text-[#191F28] tracking-[-0.2px] truncate`}>
          {first.cardName}{last4 && <span className="ml-1 font-paperlogy text-[#8B95A1]">{last4}</span>}
          {rest > 0 && <span className="ml-1.5 text-[12px] font-medium text-[#8B95A1]">{labels.more.replace('{n}', String(rest))}</span>}
        </span>
        <ChevronRightIcon className="w-4 h-4 text-[#C4C9CF] shrink-0"/>
      </div>
    </NavigateClickWrapper>
  );
};
