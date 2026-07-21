import { getPassAction } from "@/app/profile/myPass/action/getPassAction";
import { AccountTransferComponent } from "@/app/tickets/[id]/AccountTransferComponent";
import { getLocale, translate } from "@/utils/translate";
import { Locale, StringResource } from "@/shared/StringResource";
import { PassPlanTier } from "@/app/endpoint/pass.endpoint";
import { formatRuleDescription, formatFeatureDescription, formatMinutes } from "@/utils/pass.description";
import PremiumTierIcon from "../../../../../public/assets/ic_premium_pass_plan.svg"
import { CircleImage } from "@/app/components/CircleImage";
import Image from "next/image";
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
    case 'TimeMinutes': return <PassRoomIcon />;
    default: return <UnlimitedIcon />;
  }
};

const t = (locale: Locale, key: keyof typeof StringResource) => StringResource[key]?.[locale] ?? StringResource[key]?.['en'] ?? key;


const TICKET_STATUS_LABEL: Record<string, Record<Locale, string>> = {
  Paid: { ko: '구매완료', en: 'Purchased', jp: '購入済み', zh: '已购买' },
  Used: { ko: '구매완료', en: 'Purchased', jp: '購入済み', zh: '已购买' },
  Cancelled: { ko: '취소', en: 'Cancelled', jp: 'キャンセル', zh: '已取消' },
  CancelPending: { ko: '취소', en: 'Cancelled', jp: 'キャンセル', zh: '已取消' },
};

const TicketStatusBadge = ({ status, locale }: { status: string, locale: Locale }) => {
  const label = TICKET_STATUS_LABEL[status]?.[locale] ?? TICKET_STATUS_LABEL[status]?.['ko'] ?? status;
  switch (status) {
    case 'Used':
    case 'Paid':
      return <span className="text-[10px] font-bold text-[#059669] bg-[#ECFDF5] px-1.5 py-0.5 rounded">{label}</span>;
    case 'Cancelled':
    case 'CancelPending':
      return <span className="text-[10px] font-bold text-[#E55B5B] bg-[#FFEDED] px-1.5 py-0.5 rounded">{label}</span>;
    default:
      return <span className="text-[10px] font-bold text-[#999] bg-[#F1F3F6] px-1.5 py-0.5 rounded">{label}</span>;
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
            <div className="flex flex-col gap-5 divide-y divide-[#F0F0F0]">
              {passRules.map((rule) => {
                const isExpired = rule.status === 'Expired' || rule.status === 'Done';
                const hasDiffPeriod = rule.startDate !== pass.startDate || rule.endDate !== pass.endDate;
                return (
                  <div key={rule.id} className={`pt-5 first:pt-0 ${isExpired ? 'opacity-40' : ''}`}>
                    <div className="flex items-start gap-3 mb-2.5">
                      <div className="flex-shrink-0">
                        {ruleBenefitIcon(rule.benefitType)}
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-[14px] font-semibold text-black">{formatRuleDescription({
                          target: { type: rule.targetType, label: rule.targetLabel },
                          benefit: { type: rule.benefitType, value: rule.benefitValue },
                          duration: rule.duration,
                          excludes: rule.excludes,
                        }, locale, passPlan?.tag ?? passPlan?.name)}</span>
                        <div className="flex items-center gap-2">
                          {rule.remainingCount != null && rule.benefitValue != null && (
                            <span className="text-[11px] font-bold text-[#5B5FF6]">
                              {rule.benefitType === 'TimeMinutes'
                                ? t(locale, 'remaining_time').replace('{time}', formatMinutes(rule.remainingCount, locale))
                                : `${rule.usageCount}/${rule.benefitValue}${t(locale, 'times')}`}
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
                            <div className="flex items-center gap-3 py-2 pl-2 pr-3 rounded-lg bg-[#F9FAFB] active:bg-[#F0F0F0] transition-colors">
                              {/* 수업 썸네일 — 없을 땐 회색 placeholder */}
                              {ticket.lesson?.thumbnailUrl ? (
                                <div className="relative w-10 h-10 rounded-md overflow-hidden shrink-0 bg-[#F1F3F6]">
                                  <Image
                                    src={ticket.lesson.thumbnailUrl}
                                    alt=""
                                    fill
                                    sizes="40px"
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-md bg-[#F1F3F6] shrink-0"/>
                              )}
                              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                <span className="text-[13px] font-medium text-[#333] truncate">{ticket.lesson?.title}</span>
                                <span className="text-[11px] text-[#999]">{ticket.lesson?.startDate}</span>
                              </div>
                              <TicketStatusBadge status={ticket.status} locale={locale} />
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
                  <div className="flex items-start gap-3 mb-2.5">
                    <div className="flex-shrink-0">
                      {featureIcon(feature.featureKey)}
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[14px] font-semibold text-black">{formatFeatureDescription(feature.featureKey, locale, feature.featureValue)}</span>
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
          </>
          )}
        </div>
      </div>
    )
  }
}
