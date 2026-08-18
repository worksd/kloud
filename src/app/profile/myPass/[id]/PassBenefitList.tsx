// 패스 상세의 이용 혜택 리스트(passRules + passFeatures) — 모바일/PC 폼이 공유한다.
// 판정·라벨 로직을 여기 한 곳에만 둔다. 제목(h2/h3)은 각 폼이 자기 스타일로 렌더.

import { getLocale, translate } from "@/utils/translate";
import { Locale, StringResource } from "@/shared/StringResource";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { formatRuleDescription, formatFeatureDescription, formatMinutes } from "@/utils/pass.description";
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
    case 'TimeHours': return <PassRoomIcon />;
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

export const PassBenefitList = async ({pass}: { pass: GetPassResponse }) => {
  const locale = await getLocale();
  const passPlan = pass.passPlan;
  const passRules = pass.passRules ?? [];
  const passFeatures = pass.passFeatures ?? [];
  const usableText = await translate('usable');

  return (
    <>
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
                    benefit: { type: rule.benefitType, value: rule.benefitValue, startTime: rule.startTime, endTime: rule.endTime },
                    duration: rule.duration,
                    excludes: rule.excludes,
                  }, locale, passPlan?.tag ?? passPlan?.name)}</span>
                  <div className="flex items-center gap-2">
                    {rule.remainingCount != null && rule.benefitValue != null && (
                      <span className="text-[11px] font-bold text-[#5B5FF6]">
                        {rule.benefitType === 'TimeHours'
                          ? t(locale, 'remaining_time').replace('{time}', formatMinutes(rule.remainingCount * 60, locale))
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
                      <div className="flex items-center gap-3 py-2 pl-2 pr-3 rounded-lg bg-[#F9FAFB] hover:bg-[#F1F3F6] active:bg-[#F0F0F0] cursor-pointer transition-colors">
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

              {/* 이 룰로 예약한 연습실 목록 — 연습실 관련 패스권일 때만. 탭 시 예약 상세로 이동. */}
              {(rule.roomBookings?.length ?? 0) > 0 && (
                <div className="flex flex-col gap-1.5 ml-2 mt-1.5">
                  {rule.roomBookings!.map((b) => {
                    const img = b.studioRoom?.imageUrls?.[0];
                    const [sDate, sTime] = b.startDate.split(' ');
                    const [eDate, eTime] = b.endDate.split(' ');
                    const [, sm, sd] = (sDate ?? '').split('.');
                    const dateLabel = sm && sd
                      ? (locale === 'ko' ? `${Number(sm)}월 ${Number(sd)}일` : `${sm}.${sd}`)
                      : (sDate ?? '');
                    const range = sDate === eDate
                      ? `${dateLabel} ${sTime ?? ''} ~ ${eTime ?? ''}`
                      : `${dateLabel} ${sTime ?? ''} ~ ${eDate ?? ''} ${eTime ?? ''}`;
                    // 이 예약이 소진한 이용 시간(N시간) — bold로 강조.
                    const toMs = (dateStr?: string, timeStr?: string) => {
                      const [y, m, d] = (dateStr ?? '').split('.').map(Number);
                      const [hh, mm] = (timeStr ?? '').split(':').map(Number);
                      return new Date(y || 0, (m || 1) - 1, d || 1, hh || 0, mm || 0).getTime();
                    };
                    const durMin = Math.round((toMs(eDate, eTime) - toMs(sDate, sTime)) / 60000);
                    const durLabel = durMin > 0 ? formatMinutes(durMin, locale) : '';
                    return (
                      <NavigateClickWrapper key={b.id} method="push" route={KloudScreen.RoomBookingDetail(b.id)}>
                        <div className="flex items-center gap-3 py-2 pl-2 pr-3 rounded-lg bg-[#F9FAFB] hover:bg-[#F1F3F6] active:bg-[#F0F0F0] cursor-pointer transition-colors">
                          {img ? (
                            <div className="relative w-10 h-10 rounded-md overflow-hidden shrink-0 bg-[#F1F3F6]">
                              <Image src={img} alt="" fill sizes="40px" className="object-cover" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-[#F1F3F6] shrink-0" />
                          )}
                          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-[13px] font-medium text-[#333] truncate">{b.studioRoom?.name ?? ''}</span>
                              {durLabel && <span className="text-[12px] font-bold text-[#5B5FF6] shrink-0">{durLabel}</span>}
                            </div>
                            <span className="text-[11px] text-[#999]">{range}</span>
                          </div>
                          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0">
                            <path d="M9 6l6 6-6 6" stroke="#C4C9CF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </NavigateClickWrapper>
                    );
                  })}
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
  );
};
