import { getPassAction } from "@/app/profile/myPass/action/getPassAction";
import { AccountTransferComponent } from "@/app/tickets/[id]/AccountTransferComponent";
import { getLocale, translate } from "@/utils/translate";
import { PassPlanTier, PassRuleResponse, PassFeatureResponse } from "@/app/endpoint/pass.endpoint";
import PremiumTierIcon from "../../../../../public/assets/ic_premium_pass_plan.svg"
import { DdayText } from "@/app/components/DdayText";
import { CircleImage } from "@/app/components/CircleImage";
import React from "react";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";
import UnlimitedIcon from "../../../../../public/assets/ic_unlimited.svg";
import FreeUnlimitedIcon from "../../../../../public/assets/ic_free_unlimited.svg";
import DiscountIcon from "../../../../../public/assets/ic_discount.svg";
import PassPresaleIcon from "../../../../../public/assets/ic_pass_presale.svg";
import PassFastIcon from "../../../../../public/assets/ic_pass_fast.svg";
import PassRoomIcon from "../../../../../public/assets/ic_pass_room.svg";
import { PassQRCode } from "@/app/profile/myPass/[id]/PassQRCode";

const featureIcon = (key: string) => {
  switch (key) {
    case 'canPrePurchase': return <PassPresaleIcon />;
    case 'priorityEntry': return <PassFastIcon />;
    case 'practiceRoom': return <PassRoomIcon />;
    default: return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7L6 10L11 4" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  }
};

const ruleBenefitIcon = (benefitType: string) => {
  switch (benefitType) {
    case 'Unlimited': return <UnlimitedIcon />;
    case 'FreeCount': return <FreeUnlimitedIcon />;
    case 'Discount': return <DiscountIcon />;
    default: return <UnlimitedIcon />;
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
    const passFeatures = pass.passFeatures ?? [];
    const usableText = await translate('usable');
    const additionalBenefitText = await translate('additional_benefit');

    return (
      <div className="flex flex-col min-h-screen bg-white pb-20">
        {/* 패스플랜 이미지 */}
        <div className="w-full aspect-[2/1] bg-[#F1F3F6]">
          {passPlan?.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={passPlan.imageUrl} alt="" className="w-full h-full object-cover" />
          )}
        </div>

        {/* 상단 패스 정보 */}
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
            {pass.qrcodeUrl && pass.status === 'Active' && (
              <div className="flex-shrink-0 rounded-xl overflow-hidden bg-white p-1.5 shadow-sm border border-[#E8E8E8]">
                <PassQRCode url={pass.qrcodeUrl} />
              </div>
            )}
          </div>

          {/* 상태 + 잔여 */}
          <div className="flex items-center gap-2 mt-3 mb-2">
            <span className={`text-[12px] font-bold px-2.5 py-1 rounded-full ${
              pass.status === 'Active' ? 'text-[#059669] bg-[#ECFDF5]'
                : pass.status === 'Pending' ? 'text-[#D97706] bg-[#FFFBEB]'
                  : 'text-[#999] bg-[#F1F3F6]'
            }`}>
              {pass.statusLabel}
            </span>
            {pass.remainingCount != null && pass.remainingCount >= 0 && (
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

        {/* 이용 혜택 */}
        {(passRules.length > 0 || passFeatures.length > 0) && (
          <div className="px-6 pt-5">
            <h3 className="text-[15px] font-bold text-black mb-4">{await translate('pass_benefit')}</h3>
            <div className="flex flex-col gap-5 divide-y divide-[#F0F0F0]">
              {passRules.map((rule) => {
                const isExpired = rule.status === 'Expired' || rule.status === 'Done';
                return (
                  <div key={rule.id} className={`pt-5 first:pt-0 ${isExpired ? 'opacity-40' : ''}`}>
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className="flex-shrink-0">
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

            {/* passFeatures - 이용 혜택에 통합 */}
            {passFeatures.map((feature) => {
              const isExpired = feature.status === 'Expired';
              const bookings = feature.roomBookings ?? [];
              return (
                <div key={feature.id} className={`pt-5 first:pt-0 ${isExpired ? 'opacity-40' : ''}`}>
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="flex-shrink-0">
                      {featureIcon(feature.featureKey)}
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[14px] font-semibold text-black">{feature.description ?? feature.featureKey}</span>
                      {feature.usable && !isExpired && (
                        <span className="text-[11px] font-bold text-[#059669]">
                          {feature.status === 'Active' ? usableText : feature.status}
                        </span>
                      )}
                      {isExpired && (
                        <span className="text-[11px] font-bold text-[#BFBFBF]">만료</span>
                      )}
                    </div>
                  </div>

                  {bookings.length > 0 && (
                    <div className="flex flex-col gap-1.5 ml-12">
                      {bookings.map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#F9FAFB]">
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="text-[13px] font-medium text-[#333] truncate">
                              {booking.studioRoom?.name ?? '연습실'}
                            </span>
                            <span className="text-[11px] text-[#999]">
                              {booking.startDate} ~ {booking.endDate}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    )
  }
}
