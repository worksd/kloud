import { getPassAction } from "@/app/profile/myPass/action/getPassAction";
import { AccountTransferComponent } from "@/app/tickets/[id]/AccountTransferComponent";
import { getLocale, translate } from "@/utils/translate";
import { Locale, StringResource } from "@/shared/StringResource";
import { PassPlanTier, PassRuleResponse, PassFeatureResponse } from "@/app/endpoint/pass.endpoint";
import PremiumTierIcon from "../../../../../public/assets/ic_premium_pass_plan.svg"
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

const t = (locale: Locale, key: keyof typeof StringResource) => StringResource[key]?.[locale] ?? StringResource[key]?.['en'] ?? key;

const ruleDescription = (rule: PassRuleResponse, locale: Locale): string => {
  const target = rule.targetLabel
    ?? t(locale, rule.targetType === 'All' ? 'all_lessons' : rule.targetType === 'Exclusive' ? 'exclusive_lessons' : 'all_lessons');
  switch (rule.benefitType) {
    case 'Unlimited': return `${target} ${t(locale, 'unlimited')}`;
    case 'FreeCount': return `${target} ${rule.benefitValue ?? 0}${t(locale, 'times')}`;
    case 'Discount': return `${target} ${(rule.benefitValue ?? 0).toLocaleString()}${t(locale, 'won')} ${t(locale, 'discount')}`;
    default: return target;
  }
};

const TicketStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'Used':
    case 'Paid':
      return <span className="text-[10px] font-bold text-[#999] bg-[#F1F3F6] px-1.5 py-0.5 rounded">완료</span>;
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
        <div className="w-full aspect-[16/9] bg-[#F1F3F6]">
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

          {/* 이용기한 */}
          <div className="mt-4 px-4 py-3.5 rounded-xl bg-[#F7F8F9]">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#86898C]">{await translate('pass_period')}</span>
              <span className="text-[15px] font-bold text-black">{pass.startDate} ~ {pass.endDate}</span>
            </div>
            {pass.remainingCount != null && pass.remainingCount >= 0 && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-[13px] text-[#86898C]">{await translate('remaining_usage')}</span>
                <span className="text-[15px] font-bold text-[#5B5FF6]">{pass.remainingCount}{await translate('remaining_count')}</span>
              </div>
            )}
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

        <div className="w-full h-2 bg-[#F7F8F9]" />

        {/* 이용 혜택 */}
        {(passRules.length > 0 || passFeatures.length > 0) && (
          <div className="px-6 pt-5">
            <h3 className="text-[15px] font-bold text-black mb-4">{await translate('pass_benefit')}</h3>
            <div className="flex flex-col gap-5 divide-y divide-[#F0F0F0]">
              {passRules.map((rule) => {
                const isExpired = rule.status === 'Expired' || rule.status === 'Done';
                const hasDiffPeriod = rule.startDate !== pass.startDate || rule.endDate !== pass.endDate;
                return (
                  <div key={rule.id} className={`pt-5 first:pt-0 ${isExpired ? 'opacity-40' : ''}`}>
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className="flex-shrink-0">
                        {ruleBenefitIcon(rule.benefitType)}
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-[14px] font-semibold text-black">{ruleDescription(rule, locale)}</span>
                        <div className="flex items-center gap-2">
                          {rule.remainingCount != null && rule.benefitValue != null && (
                            <span className="text-[11px] font-bold text-[#5B5FF6]">
                              {rule.usageCount}/{rule.benefitValue}{t(locale, 'times')}
                            </span>
                          )}
                          {isExpired && (
                            <span className="text-[11px] font-bold text-[#BFBFBF]">
                              {rule.status === 'Done' ? t(locale, 'exhausted') : t(locale, 'expired')}
                            </span>
                          )}
                        </div>
                        {hasDiffPeriod && (
                          <span className="text-[11px] text-[#AEAEAE]">{rule.startDate} ~ {rule.endDate}</span>
                        )}
                      </div>
                    </div>

                    {rule.tickets.length > 0 && (
                      <div className="flex flex-col gap-1.5 ml-2">
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
              const hasDiffPeriod = feature.startDate !== pass.startDate || feature.endDate !== pass.endDate;
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
                        <span className="text-[11px] font-bold text-[#BFBFBF]">{t(locale, 'expired')}</span>
                      )}
                      {hasDiffPeriod && (
                        <span className="text-[11px] text-[#AEAEAE]">{feature.startDate} ~ {feature.endDate}</span>
                      )}
                    </div>
                  </div>

                  {bookings.length > 0 && (
                    <div className="flex flex-col gap-1.5 ml-2">
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
