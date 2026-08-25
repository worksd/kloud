// 모바일(앱 웹뷰 + 좁은 웹) 패스 상세 — 기존 page.tsx 렌더를 그대로 옮긴 것.
// PC 분기는 page.tsx에서 appVersion + viewport(lg)로, PC 렌더는 MyPassDetailPcForm.

import { AccountTransferComponent } from "@/app/tickets/[id]/AccountTransferComponent";
import { translate } from "@/utils/translate";
import { PassPlanTier, GetPassResponse } from "@/app/endpoint/pass.endpoint";
import PremiumTierIcon from "../../../../../public/assets/ic_premium_pass_plan.svg"
import { CircleImage } from "@/app/components/CircleImage";
import React from "react";
import { PassBenefitList } from "@/app/profile/myPass/[id]/PassBenefitList";

export const MyPassDetailForm = async ({pass}: { pass: GetPassResponse }) => {
  const passPlan = pass.passPlan;
  const passRules = pass.passRules ?? [];
  const passFeatures = pass.passFeatures ?? [];

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: 'linear-gradient(135deg, #E9F1FF 0%, #FCF3FF 100%)' }}
    >
      {/* 노치 가리개용 top padding — 페이지가 ignoreSafeArea라 항상 필요. 그래디언트는 그 영역까지 채움.
          이미지가 없으면 헤더가 바로 노치 아래로 붙어 답답하므로 추가 spacer 부여. */}
      <div
        className="w-full"
        style={{ paddingTop: passPlan?.imageUrl ? 'env(safe-area-inset-top, 44px)' : 'calc(env(safe-area-inset-top, 44px) + 88px)' }}
      />

      {/* 패스플랜 이미지 — imageUrl이 있을 때만 노출. 없으면 빈 자리 안 만들고 바로 헤더로 이어지도록 */}
      {passPlan?.imageUrl && (
        <div className="w-full aspect-[1/1]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={passPlan.imageUrl} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* 상단 패스 정보 — 그래디언트 배경 위 */}
      <div className="px-6 pt-5 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {passPlan?.studio?.profileImageUrl ? (
              <CircleImage size={44} imageUrl={passPlan.studio.profileImageUrl} />
            ) : (
              <div className="w-11 h-11 rounded-full bg-[#F1F3F6] flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="4" width="16" height="12" rx="2" stroke="#CDD1D5" strokeWidth="1.5"/>
                  <circle cx="7" cy="9" r="1.5" stroke="#CDD1D5" strokeWidth="1.2"/>
                  <path d="M2 14l4-3 3 2 4-4 5 5" stroke="#CDD1D5" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-[18px] font-bold text-black truncate">{passPlan?.name}</h2>
                {passPlan?.tier === PassPlanTier.Premium && <PremiumTierIcon className="flex-shrink-0" />}
              </div>
              <span className="text-[13px] text-[#999]">{passPlan?.studio?.name}</span>
            </div>
          </div>

          {/* QR 코드 */}
          {/* QR 코드 - 추후 재사용 예정
          {pass.qrcodeUrl && pass.status === 'Active' && (
            <div className="flex-shrink-0 rounded-xl overflow-hidden bg-white p-1.5 shadow-sm border border-[#E8E8E8]">
              <PassQRCode url={pass.qrcodeUrl} />
            </div>
          )}
          */}
        </div>

        {/* 이용기한 — 그래디언트 위라 살짝 반투명한 흰색으로 */}
        <div className="mt-4 px-4 py-3.5 rounded-xl bg-white/70 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-[#86898C]">{await translate('pass_period')}</span>
            <span className="text-[15px] font-bold text-black">{pass.startDate} ~ {pass.endDate}</span>
          </div>
        </div>
      </div>

      {/* Pending: 계좌이체 안내 */}
      {pass.status === 'Pending' && (
        <div className="px-4 pb-2">
          <AccountTransferComponent
            depositor={passPlan?.studio?.depositor}
            bank={passPlan?.studio?.bank}
            accountNumber={passPlan?.studio?.accountNumber}
            price={passPlan?.price}
          />
        </div>
      )}

      {/* Waiting */}
      {pass.status === 'Waiting' && pass.startDate && (
        <div className="mx-6 mb-2 p-4 bg-[#FFFDF5] rounded-xl border border-[#F59E0B]/20">
          <span className="text-[#F59E0B] font-semibold text-sm">
            {pass.startDate} {await translate('waiting_pass_start_date')}
          </span>
        </div>
      )}

      {/* 컨텐츠 영역 — 그래디언트 헤더 아래로는 전부 흰색이 비치도록 항상 렌더(flex-1로 남은 공간 차지).
          상단 코너 24px 라운드, 하단은 페이지 끝까지 흰색. 혜택이 없으면 빈 흰 영역이 그대로 보임. */}
      <div className="bg-white rounded-t-[24px] flex-1 px-6 pt-5 pb-20">
        {(passRules.length > 0 || passFeatures.length > 0) && (
          <>
            <h3 className="text-[15px] font-bold text-black mb-4">{await translate('pass_benefit')}</h3>
            <PassBenefitList pass={pass} />
          </>
        )}
      </div>
    </div>
  );
};
