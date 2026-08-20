// 모바일(앱 웹뷰 + 좁은 웹) 프로필 — 기존 page.tsx 렌더를 그대로 옮긴 것.
// PC 분기는 page.tsx에서 appVersion + viewport(lg)로, PC 렌더는 ProfilePcForm.

import { KloudScreen } from "@/shared/kloud.screen";
import React from "react";
import SettingIcon from "../../../public/assets/ic_setting.svg";
import EditIcon from "../../../public/assets/ic_edit.svg";
import TicketIcon from "../../../public/assets/ic_ticket.svg";
import PassPlanIcon from "../../../public/assets/ic_pass_plan.svg";
import ReceiptIcon from "../../../public/assets/ic_receipt.svg";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import Image from "next/image";
import { translate } from "@/utils/translate";
import { MyBookingCard } from "@/app/profile/MyBookingCard";
import { LessonLabel } from "@/app/components/LessonLabel";
import { GetMeResponse } from "@/app/endpoint/user.endpoint";
import { UserType } from "@/entities/user/user.type";
import { Locale } from "@/shared/StringResource";
import { has, formatEndDate, formatPhone } from "@/app/profile/profile.format";

export const ProfileForm = async ({user, locale}: { user: GetMeResponse, locale: Locale }) => {
  const upcoming = user.upcomingLesson;

  return (
    <div className="flex flex-col h-screen bg-white w-full max-w-screen overflow-hidden">
      {/* 고정 헤더: 아이콘 + 프로필 */}
      <div className="flex-shrink-0 bg-white">
        <div className="flex justify-end items-center gap-3 px-5 py-3">
          <NavigateClickWrapper method={'push'} route={KloudScreen.ProfileEdit}>
            <EditIcon className="w-[22px] h-[22px] active:opacity-50 transition-opacity duration-150"/>
          </NavigateClickWrapper>
          <NavigateClickWrapper method={'push'} route={KloudScreen.ProfileSetting}>
            <SettingIcon className="w-[22px] h-[22px] active:opacity-50 transition-opacity duration-150"/>
          </NavigateClickWrapper>
        </div>

        <div className="flex items-center gap-3 px-5 pb-4">
          <div className="w-[52px] h-[52px] rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={user.profileImageUrl ?? ''}
              alt="profile"
              width={52}
              height={52}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="font-bold text-lg text-black truncate">
              {has(user.nickName) ? user.nickName : '-'}
              {has(user.name) && <span className="text-[14px] font-normal text-[#999]"> ({user.name})</span>}
            </div>
            <div className="text-gray-500 text-[14px] truncate">
              {has(user.email) ? user.email : has(user.phone) ? formatPhone(user.phone!) : ''}
            </div>
          </div>
        </div>
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto pb-8">

      {/* 강사 인사말 + 개인수업 만들기/내 수업 — Artist 계정(또는 artistStudios 보유)에만 */}
      {(user.type === UserType.Artist || (user.artistStudios?.length ?? 0) > 0) && (
        <section className="px-4 mb-6">
          <div className="rounded-2xl bg-[#0F0F0F] px-5 py-5">
            <div className="text-white text-[16px] font-bold">
              {/* 강사 활동명(artist.nickName) 우선 — 유저 닉네임과 다를 수 있다 */}
              {(await translate('artist_greeting_title')).replace('{name}', user.artist?.nickName ?? user.nickName ?? user.name ?? '')}
            </div>
            <div className="text-[#A0A5AB] text-[13px] mt-1">
              {await translate('artist_greeting_subtitle')}
            </div>
            <div className="mt-4 flex gap-2">
              {/* NavigateClickWrapper는 자체 div라 flex-1 래퍼로 폭을 반씩 나눈다 */}
              <div className="flex-1 min-w-0">
                <NavigateClickWrapper method={'push'} route={KloudScreen.PrivateLessonCreate}>
                  <button
                    type="button"
                    className="w-full h-11 rounded-xl bg-white text-black text-[14px] font-bold active:scale-[0.97] transition-transform duration-150"
                  >
                    {await translate('private_lesson_create')}
                  </button>
                </NavigateClickWrapper>
              </div>
              {/* 여태 진행한 수업 목록 */}
              <div className="flex-1 min-w-0">
                <NavigateClickWrapper method={'push'} route={KloudScreen.ArtistLessons}>
                  <button
                    type="button"
                    className="w-full h-11 rounded-xl border border-white/25 text-white text-[14px] font-bold active:scale-[0.97] transition-transform duration-150"
                  >
                    {await translate('artist_my_lessons')}
                  </button>
                </NavigateClickWrapper>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 다음 예정 수업 */}
      {upcoming && (
        <section className="px-4 mb-6">
          <div className="text-[13px] font-bold text-[#999] mb-3 px-1">{await translate('upcoming_lesson')}</div>
          <NavigateClickWrapper method={'push'} route={KloudScreen.LessonDetail(upcoming.id)}>
            <div className="rounded-2xl overflow-hidden bg-black active:scale-[0.98] transition-all duration-150">
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

                <div className="absolute inset-0 flex flex-col justify-center px-5">
                  <div className="flex items-center gap-2 mb-2">
                    {upcoming.dday && (
                      <span className="text-[12px] font-extrabold text-black bg-white px-2 py-0.5 rounded-full">
                        {upcoming.dday}
                      </span>
                    )}
                    {upcoming.genre && upcoming.genre !== 'Default' && (
                      <LessonLabel label={upcoming.genre} locale={locale}/>
                    )}
                  </div>

                  <h3 className="text-[16px] font-bold text-white line-clamp-1">
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
        </section>
      )}

      {/* 보유 패스권 */}
      {user.myPasses && user.myPasses.length > 0 && (
        <section className="px-4">
          <div className="text-[13px] font-bold text-[#999] mb-3 px-1">{await translate('my_pass')}</div>
          <div className="flex flex-col gap-2.5">
            {user.myPasses.map((pass) => {
              const isActive = pass.status === 'Active';
              return (
                <NavigateClickWrapper key={pass.id} method="push" route={KloudScreen.MyPassDetail(pass.id)}>
                  <div className={`w-full h-[72px] rounded-2xl overflow-hidden active:scale-[0.98] transition-all duration-150 flex items-center ${
                    isActive ? 'bg-[#1E2124]' : 'bg-[#F1F3F6]'
                  }`}>
                    {pass.passPlan?.imageUrl ? (
                      <div className="w-[72px] h-[72px] flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={pass.passPlan.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className={`w-[72px] h-[72px] flex-shrink-0 flex items-center justify-center ${
                        isActive ? 'bg-white/5' : 'bg-[#E8E8EA]'
                      }`}>
                        <PassPlanIcon className="w-6 h-6 opacity-30" />
                      </div>
                    )}
                    <div className="px-4 flex flex-col min-w-0 flex-1">
                      <span className={`text-[15px] font-bold truncate ${isActive ? 'text-white' : 'text-[#999]'}`}>
                        {pass.passPlan?.name}
                      </span>
                      {(pass.endDate || pass.passPlan?.expireDateStamp) && (
                        <span className={`text-[11px] mt-1 truncate ${isActive ? 'text-white/40' : 'text-[#BBB]'}`}>
                          {pass.endDate && typeof pass.endDate === 'string'
                            ? `~ ${formatEndDate(pass.endDate, locale)}`
                            : pass.passPlan?.expireDateStamp}
                        </span>
                      )}
                    </div>
                  </div>
                </NavigateClickWrapper>
              );
            })}
          </div>
        </section>
      )}

      {/* 홀 예약 내역 */}
      {user.myBookings && user.myBookings.length > 0 && (
        <section className="px-4 mt-6">
          <div className="text-[13px] font-bold text-[#999] mb-3 px-1">{await translate('room_booking_history')}</div>
          <div className="flex flex-col gap-2.5">
            {user.myBookings.map((booking) => (
              <MyBookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </section>
      )}

      {/* 내 활동 */}
      <section className="px-4 mt-6">
        <div className="text-[13px] font-bold text-[#999] mb-3 px-1">{await translate('my_activity')}</div>
        <div className="grid grid-cols-3 gap-3">
          <NavigateClickWrapper method={'push'} route={KloudScreen.Tickets}>
            <div className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl bg-[#F7F8F9] active:scale-[0.96] active:bg-[#EFEFEF] transition-all duration-150">
              <TicketIcon className="w-[24px] h-[24px]"/>
              <span className="text-[12px] font-medium text-[#999] font-paperlogy text-center break-keep leading-tight">{await translate('my_tickets')}</span>
              <span className="text-[13px] font-bold text-black font-paperlogy">{user.ticketCount ?? 0}</span>
            </div>
          </NavigateClickWrapper>

          <NavigateClickWrapper method={'push'} route={KloudScreen.MyPass}>
            <div className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl bg-[#F7F8F9] active:scale-[0.96] active:bg-[#EFEFEF] transition-all duration-150">
              <PassPlanIcon className="w-[24px] h-[24px]"/>
              <span className="text-[12px] font-medium text-[#999] font-paperlogy text-center break-keep leading-tight">{await translate('my_pass')}</span>
              <span className="text-[13px] font-bold text-black font-paperlogy">{user.passCount ?? 0}</span>
            </div>
          </NavigateClickWrapper>

          <NavigateClickWrapper method={'push'} route={KloudScreen.PaymentRecords}>
            <div className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl bg-[#F7F8F9] active:scale-[0.96] active:bg-[#EFEFEF] transition-all duration-150">
              <ReceiptIcon className="w-[24px] h-[24px]"/>
              <span className="text-[12px] font-medium text-[#999] font-paperlogy text-center break-keep leading-tight">{await translate('payment_records')}</span>
              <span className="text-[13px] font-bold text-black font-paperlogy">{user.paymentRecordCount ?? 0}</span>
            </div>
          </NavigateClickWrapper>

          {(user.bookingCount ?? 0) > 0 && (
            <NavigateClickWrapper method={'push'} route={KloudScreen.RoomBookings}>
              <div className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl bg-[#F7F8F9] active:scale-[0.96] active:bg-[#EFEFEF] transition-all duration-150">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" stroke="#191f28" strokeWidth="1.6"/>
                  <path d="M3 9.5H21" stroke="#191f28" strokeWidth="1.6"/>
                  <path d="M8 3V6M16 3V6" stroke="#191f28" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
                <span className="text-[12px] font-medium text-[#999] font-paperlogy text-center break-keep leading-tight">{await translate('room_bookings')}</span>
                <span className="text-[13px] font-bold text-black font-paperlogy">{user.bookingCount ?? 0}</span>
              </div>
            </NavigateClickWrapper>
          )}
        </div>
      </section>
      </div>
    </div>
  );
};
