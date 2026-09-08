// PC 웹 전용 프로필 — 서버에서 번역/홈 컨텐츠를 준비해 클라이언트 셸(ProfilePcClient)에 넘긴다.
// 사이드바 메뉴는 라우팅 없이 탭 전환(각 탭이 서버 액션으로 데이터 조회).
// 분기는 page.tsx에서 appVersion + viewport(lg)로. 값/라벨은 모바일(ProfileForm)과 동일 규칙.

import { KloudScreen } from "@/shared/kloud.screen";
import React from "react";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import Image from "next/image";
import { translate } from "@/utils/translate";
import { MyBookingCard } from "@/app/profile/MyBookingCard";
import { LessonLabel } from "@/app/components/LessonLabel";
import { GetMeResponse } from "@/app/endpoint/user.endpoint";
import { Locale } from "@/shared/StringResource";
import { formatEndDate, formatRelativeStart, ddayLabel } from "@/app/profile/profile.format";
import { PassFlatIcon, ChevronRightIcon } from "@/app/profile/ActivityIcons";
import {
  ProfilePcClient,
  ProfileContentCard,
  ProfilePcTranslations,
  ProfileTabKey,
} from "@/app/profile/ProfilePcClient";

export const ProfilePcForm = async ({user, locale, initialTab}: {
  user: GetMeResponse,
  locale: Locale,
  initialTab?: ProfileTabKey,
}) => {
  const upcoming = user.upcomingLesson;
  const relativeStart = formatRelativeStart(upcoming?.startDate, locale);
  const hasPasses = !!user.myPasses && user.myPasses.length > 0;
  const hasBookings = !!user.myBookings && user.myBookings.length > 0;
  const isEmpty = !upcoming && !hasPasses && !hasBookings;

  const t: ProfilePcTranslations = {
    editProfile: await translate('edit_profile'),
    setting: await translate('setting'),
    homeTab: await translate('lnb_home'),
    myTickets: await translate('my_tickets'),
    myPass: await translate('my_pass'),
    paymentRecords: await translate('payment_records'),
    roomBookings: await translate('room_bookings'),
    scheduledPayments: await translate('scheduled_payments'),
    noScheduledPayments: await translate('no_scheduled_payments'),
    myActivePasses: await translate('my_active_passes'),
    myUsedPasses: await translate('my_used_passes'),
    roomBookingsUpcoming: await translate('room_bookings_upcoming'),
    roomBookingsPast: await translate('room_bookings_past'),
    roomBookingsEmpty: await translate('room_bookings_empty'),
    practiceRoom: await translate('practice_room'),
    bookingStatus: {
      Active: await translate('room_booking_status_active'),
      Pending: await translate('room_booking_status_pending'),
      Used: await translate('room_booking_status_used'),
      Cancelled: await translate('room_booking_status_cancelled'),
    },
    noTicketsTitle: await translate('no_payment_records_title'),
    noTicketsMessage: await translate('no_payment_records_message'),
    noRecordsMessage: await translate('no_purchase_history'),
    noActivePassesMessage: await translate('no_active_passes_message'),
  };

  // 홈 탭 컨텐츠 — 서버 렌더 (user.me에 이미 실려 온 데이터라 추가 조회 없음)
  const homeContent = (
    <>
      {/* 다음 예정 수업 */}
      {upcoming && (
        <ProfileContentCard title={await translate('upcoming_lesson')}>
          <NavigateClickWrapper method={'push'} route={KloudScreen.LessonDetail(upcoming.id)}>
            <div className="rounded-2xl overflow-hidden bg-black cursor-pointer hover:opacity-95 transition-opacity">
              <div className="relative w-full aspect-[2.5/1]">
                {upcoming.thumbnailUrl && (
                  <Image
                    src={upcoming.thumbnailUrl}
                    alt={upcoming.title ?? ''}
                    fill
                    className="object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"/>

                {/* 메타(배지·제목·스튜디오)는 왼쪽 아래 정렬 */}
                <div className="absolute inset-0 flex flex-col justify-end px-6 pb-6">
                  <div className="flex items-center gap-2 mb-2">
                    {/* 상대 시간('3시간 후'·'내일'·'3일 후') 우선, 7일 넘으면 dday — 모바일과 동일 */}
                    {(relativeStart ?? upcoming.dday) && (
                      <span className="text-[12px] font-extrabold text-black bg-white px-2 py-0.5 rounded-full">
                        {relativeStart ?? upcoming.dday}
                      </span>
                    )}
                    {upcoming.genre && upcoming.genre !== 'Default' && (
                      <LessonLabel label={upcoming.genre} locale={locale}/>
                    )}
                  </div>

                  <h3 className="text-[18px] font-bold text-white line-clamp-1">
                    {upcoming.title}
                  </h3>

                  <div className="flex items-center gap-2 mt-1.5">
                    {upcoming.studio?.profileImageUrl && (
                      <Image
                        src={upcoming.studio.profileImageUrl}
                        alt=""
                        width={18}
                        height={18}
                        className="w-[18px] h-[18px] rounded-full"
                      />
                    )}
                    <span className="text-[12px] text-white/60 font-medium">
                      {upcoming.studio?.name}
                    </span>
                    {upcoming.startDate && (
                      <span className="text-[12px] text-white/40">
                        {upcoming.startDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </NavigateClickWrapper>
        </ProfileContentCard>
      )}

      {/* 보유 패스권 — 모바일과 동일한 밝은 카드 행. 썸네일(없으면 플랫 패스 아이콘) + 이름/종료일 + D-day 칩 */}
      {hasPasses && (
        <ProfileContentCard title={await translate('my_pass')}>
          <div className="flex flex-col gap-2.5">
            {user.myPasses!.map((pass) => {
              const isActive = pass.status === 'Active';
              const dday = isActive ? ddayLabel(typeof pass.endDate === 'string' ? pass.endDate : undefined) : null;
              const period = pass.endDate && typeof pass.endDate === 'string'
                ? formatEndDate(pass.endDate, locale)
                : pass.passPlan?.expireDateStamp;
              return (
                <NavigateClickWrapper key={pass.id} method="push" route={KloudScreen.MyPassDetail(pass.id)}>
                  <div className={`flex items-center gap-4 rounded-[20px] px-4 py-3.5 cursor-pointer bg-[#F9FAFB] hover:bg-[#F2F4F6] transition-colors ${isActive ? '' : 'opacity-60'}`}>
                    {pass.passPlan?.imageUrl ? (
                      <div className={`relative w-14 h-14 rounded-[14px] overflow-hidden shrink-0 ${isActive ? '' : 'grayscale'}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={pass.passPlan.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <span className="w-14 h-14 rounded-[14px] bg-white flex items-center justify-center shrink-0">
                        <PassFlatIcon size={30}/>
                      </span>
                    )}
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span className="text-[15px] font-semibold text-[#191F28] truncate tracking-[-0.3px]">{pass.passPlan?.name}</span>
                      {period && <span className="text-[12.5px] text-[#8B95A1] truncate tracking-[-0.2px]">{period}</span>}
                    </div>
                    {dday && (
                      <span className="shrink-0 px-2 py-[3px] rounded-[6px] bg-[#191F28] text-white text-[11px] font-bold font-paperlogy tracking-wide">{dday}</span>
                    )}
                    <ChevronRightIcon className="text-[#D1D6DB] shrink-0 -ml-1"/>
                  </div>
                </NavigateClickWrapper>
              );
            })}
          </div>
        </ProfileContentCard>
      )}

      {/* 홀 예약 내역 */}
      {hasBookings && (
        <ProfileContentCard title={await translate('room_booking_history')}>
          <div className="flex flex-col gap-2.5">
            {user.myBookings!.map((booking) => (
              <MyBookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </ProfileContentCard>
      )}

      {/* 아무 내역도 없을 때 */}
      {isEmpty && (
        <ProfileContentCard>
          <div className="py-16 flex flex-col items-center gap-2">
            <span className="text-[15px] font-semibold text-[#6d7882]">{await translate('profile_empty_message')}</span>
          </div>
        </ProfileContentCard>
      )}
    </>
  );

  return (
    <ProfilePcClient
      user={user}
      locale={locale}
      t={t}
      initialTab={initialTab}
      homeContent={homeContent}
    />
  );
};
