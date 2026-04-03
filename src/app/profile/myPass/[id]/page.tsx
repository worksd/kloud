import { getPassAction } from "@/app/profile/myPass/action/getPassAction";
import { AccountTransferComponent } from "@/app/tickets/[id]/AccountTransferComponent";
import { getLocale, translate } from "@/utils/translate";
import { PassPlanTier, PassRuleResponse } from "@/app/endpoint/pass.endpoint";
import PremiumTierIcon from "../../../../../public/assets/ic_premium_pass_plan.svg"
import { DdayText } from "@/app/components/DdayText";
import { CircleImage } from "@/app/components/CircleImage";
import React from "react";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";
import UnlimitedIcon from "../../../../../public/assets/ic_unlimited.svg";
import FreeUnlimitedIcon from "../../../../../public/assets/ic_free_unlimited.svg";
import DiscountIcon from "../../../../../public/assets/ic_discount.svg";

const ruleBenefitIcon = (benefitType: string) => {
  switch (benefitType) {
    case 'Unlimited': return <UnlimitedIcon className="w-5 h-5" />;
    case 'FreeCount': return <FreeUnlimitedIcon className="w-5 h-5" />;
    case 'Discount': return <DiscountIcon className="w-5 h-5" />;
    default: return <UnlimitedIcon className="w-5 h-5" />;
  }
};

const ruleDescription = (rule: PassRuleResponse): string => {
  const target = rule.targetLabel ?? (rule.targetType === 'All' ? '모든 수업' : rule.targetType === 'Exclusive' ? '전용 수업' : rule.targetType);
  switch (rule.benefitType) {
    case 'Unlimited': return `${target} 무제한`;
    case 'FreeCount': return `${target} ${rule.benefitValue ?? 0}회`;
    case 'Discount': return `${target} ${(rule.benefitValue ?? 0).toLocaleString()}원 할인`;
    default: return target;
  }
};

const TicketStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'Used':
      return <span className="text-[10px] font-bold text-[#999] bg-[#F1F3F6] px-1.5 py-0.5 rounded">사용완료</span>;
    case 'Paid':
      return <span className="text-[10px] font-bold text-[#5B5FF6] bg-[#EDEDFF] px-1.5 py-0.5 rounded">예정</span>;
    case 'Cancelled':
    case 'CancelPending':
      return <span className="text-[10px] font-bold text-[#E55B5B] bg-[#FFEDED] px-1.5 py-0.5 rounded">취소</span>;
    default:
      return <span className="text-[10px] font-bold text-[#999] bg-[#F1F3F6] px-1.5 py-0.5 rounded">{status}</span>;
  }
};

export default async function MyPassDetailPage({params}: {
  params: Promise<{ id: number }>
}) {
  const pass = await getPassAction({id: (await params).id});
  const locale = await getLocale();

  if ('id' in pass) {
    const passPlan = pass.passPlan;
    const passRules = pass.passRules ?? [];

    return (
      <div className="flex flex-col min-h-screen bg-white pb-20">
        {/* 상단 패스 정보 */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-3">
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

          {/* 상태 + 잔여 */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[12px] font-bold px-2.5 py-1 rounded-full ${
              pass.status === 'Active' ? 'text-[#059669] bg-[#ECFDF5]'
                : pass.status === 'Pending' ? 'text-[#D97706] bg-[#FFFBEB]'
                  : 'text-[#999] bg-[#F1F3F6]'
            }`}>
              {pass.statusLabel}
            </span>
            {pass.remainingCount != null && (
              <span className="text-[12px] font-bold text-[#5B5FF6] bg-[#EDEDFF] px-2.5 py-1 rounded-full">
                {pass.remainingCount}회 남음
              </span>
            )}
            {pass.endDate && (
              <span className="text-[12px] font-bold text-black bg-[#F1F3F6] px-2.5 py-1 rounded-full">
                <DdayText input={pass.endDate}/>
              </span>
            )}
          </div>

          <span className="text-[13px] text-[#AEAEAE]">{pass.startDate} ~ {pass.endDate}</span>
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

        <div className="w-full h-2 bg-[#F7F8F9]" />

        {/* 이용 혜택 (passRules) */}
        {passRules.length > 0 && (
          <div className="px-6 pt-5">
            <h3 className="text-[15px] font-bold text-black mb-4">{await translate('pass_benefit')}</h3>
            <div className="flex flex-col gap-5">
              {passRules.map((rule) => {
                const isExpired = rule.status === 'Expired' || rule.status === 'Done';
                return (
                  <div key={rule.id} className={isExpired ? 'opacity-40' : ''}>
                    {/* 규칙 헤더 */}
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#F3F4F6] flex items-center justify-center flex-shrink-0">
                        {ruleBenefitIcon(rule.benefitType)}
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-[14px] font-semibold text-black">{ruleDescription(rule)}</span>
                        <div className="flex items-center gap-2">
                          {rule.remainingCount != null && rule.benefitValue != null && (
                            <span className="text-[11px] font-bold text-[#5B5FF6]">
                              {rule.usageCount}/{rule.benefitValue}회 사용
                            </span>
                          )}
                          {isExpired && (
                            <span className="text-[11px] font-bold text-[#BFBFBF]">
                              {rule.status === 'Done' ? '소진' : '만료'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 티켓 목록 */}
                    {rule.tickets.length > 0 && (
                      <div className="flex flex-col gap-1.5 ml-12">
                        {rule.tickets.map((ticket) => (
                          <NavigateClickWrapper key={ticket.id} method="push" route={KloudScreen.TicketDetail(ticket.id, false)}>
                            <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#F9FAFB] active:bg-[#F0F0F0] transition-colors">
                              <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="text-[13px] font-medium text-[#333] truncate">{ticket.lesson?.title}</span>
                                <span className="text-[11px] text-[#999]">{ticket.lesson?.startDate}</span>
                              </div>
                              <TicketStatusBadge status={ticket.status} />
                            </div>
                          </NavigateClickWrapper>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* features */}
        {passPlan?.features && passPlan.features.length > 0 && (
          <div className="px-6 pt-4">
            {passRules.length > 0 && (
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 h-px bg-[#EBEBEB]" />
                <span className="text-[12px] text-[#B0B0B0] font-medium">부가 혜택</span>
                <div className="flex-1 h-px bg-[#EBEBEB]" />
              </div>
            )}
            <div className="flex flex-col gap-2.5">
              {passPlan.features.map((feature, i) => (
                feature.description && (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#F3F4F6] flex items-center justify-center flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 7L6 10L11 4" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-[13px] text-[#555] font-medium">{feature.description}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
}
