// PC 웹 전용 패스 상세 — 모바일(MyPassDetailForm)의 풀블리드 그래디언트 대신
// 중앙 정렬 카드 섹션들로 정리한 데스크톱 레이아웃 (결제내역 상세 PC와 동일 패턴).
// 분기는 page.tsx에서 appVersion + viewport(lg)로. 혜택 리스트 로직은 PassBenefitList 단일 출처.

import { AccountTransferComponent } from "@/app/tickets/[id]/AccountTransferComponent";
import { translate } from "@/utils/translate";
import { PassPlanTier, GetPassResponse } from "@/app/endpoint/pass.endpoint";
import PremiumTierIcon from "../../../../../public/assets/ic_premium_pass_plan.svg"
import { CircleImage } from "@/app/components/CircleImage";
import React from "react";
import { PassBenefitList } from "@/app/profile/myPass/[id]/PassBenefitList";

export const MyPassDetailPcForm = async ({pass}: { pass: GetPassResponse }) => {
  const passPlan = pass.passPlan;
  const passRules = pass.passRules ?? [];
  const passFeatures = pass.passFeatures ?? [];

  return (
    <div className="w-full min-h-screen bg-[#f9f9fb] pt-12 pb-24">
      <div className="mx-auto w-full max-w-[680px] px-8 flex flex-col gap-4">

        {/* 헤더 카드 — 모바일의 그래디언트 히어로를 카드 안으로. 이미지는 풀블리드 대신 썸네일로 */}
        <header
          className="rounded-2xl border border-[#f0f1f3] p-6"
          style={{ background: 'linear-gradient(135deg, #E9F1FF 0%, #FCF3FF 100%)' }}
        >
          <div className="flex items-start gap-5">
            {passPlan?.imageUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={passPlan.imageUrl}
                alt=""
                className="w-[128px] h-[128px] rounded-xl object-cover shrink-0 bg-[#F1F3F6]"
              />
            )}
            <div className="flex flex-col min-w-0 flex-1 self-center">
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
                    <h1 className="text-[20px] font-bold text-black truncate">{passPlan?.name}</h1>
                    {passPlan?.tier === PassPlanTier.Premium && <PremiumTierIcon className="flex-shrink-0" />}
                  </div>
                  <span className="text-[13px] text-[#86898C]">{passPlan?.studio?.name}</span>
                </div>
              </div>

              {/* 이용기한 — 그래디언트 위라 살짝 반투명한 흰색으로 */}
              <div className="mt-4 px-4 py-3.5 rounded-xl bg-white/70">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[13px] text-[#86898C]">{await translate('pass_period')}</span>
                  <span className="text-[15px] font-bold text-black">{pass.startDate} ~ {pass.endDate}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Pending: 계좌이체 안내 */}
        {pass.status === 'Pending' && (
          <section className="rounded-2xl border border-[#f0f1f3] bg-white p-6">
            <div className="-mt-4">
              <AccountTransferComponent
                depositor={passPlan?.studio?.depositor}
                bank={passPlan?.studio?.bank}
                accountNumber={passPlan?.studio?.accountNumber}
                price={passPlan?.price}
              />
            </div>
          </section>
        )}

        {/* Waiting */}
        {pass.status === 'Waiting' && pass.startDate && (
          <section className="p-5 bg-[#FFFDF5] rounded-2xl border border-[#F59E0B]/20">
            <span className="text-[#F59E0B] font-semibold text-sm">
              {pass.startDate} {await translate('waiting_pass_start_date')}
            </span>
          </section>
        )}

        {/* 이용 혜택 카드 */}
        {(passRules.length > 0 || passFeatures.length > 0) && (
          <section className="rounded-2xl border border-[#f0f1f3] bg-white p-6">
            <h2 className="text-[16px] font-bold text-black mb-5">{await translate('pass_benefit')}</h2>
            <PassBenefitList pass={pass} />
          </section>
        )}
      </div>
    </div>
  );
};
