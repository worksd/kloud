// 모바일(앱 웹뷰 + 좁은 웹) 프로필 — 기존 page.tsx 렌더를 그대로 옮긴 것.
// PC 분기는 page.tsx에서 appVersion + viewport(lg)로, PC 렌더는 ProfilePcForm.

import { KloudScreen } from "@/shared/kloud.screen";
import React from "react";
import { TicketFlatIcon, PassFlatIcon, ReceiptFlatIcon, ScheduledPaymentFlatIcon, RoomBookingFlatIcon, ChevronRightIcon, PencilFlatIcon, GearFlatIcon } from "@/app/profile/ActivityIcons";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import Image from "next/image";
import { translate } from "@/utils/translate";
import { MyBookingCard } from "@/app/profile/MyBookingCard";
import { LessonLabel } from "@/app/components/LessonLabel";
import { GetMeResponse } from "@/app/endpoint/user.endpoint";
import { UserType } from "@/entities/user/user.type";
import { Locale } from "@/shared/StringResource";
import { has, formatEndDate, formatPhone, formatRelativeStart, ddayLabel } from "@/app/profile/profile.format";

export const ProfileForm = async ({user, locale}: { user: GetMeResponse, locale: Locale }) => {
  const upcoming = user.upcomingLesson;
  const relativeStart = formatRelativeStart(upcoming?.startDate, locale);

  return (
    <div className="flex flex-col h-screen bg-white w-full max-w-screen overflow-hidden">
      {/* 고정 헤더: 아이콘 + 프로필 */}
      <div className="flex-shrink-0 bg-white">
        <div className="flex justify-end items-center gap-3 px-5 py-3">
          <NavigateClickWrapper method={'push'} route={KloudScreen.ProfileEdit}>
            <PencilFlatIcon size={24} className="active:opacity-50 transition-opacity duration-150"/>
          </NavigateClickWrapper>
          <NavigateClickWrapper method={'push'} route={KloudScreen.ProfileSetting}>
            <GearFlatIcon size={24} className="active:opacity-50 transition-opacity duration-150"/>
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
          <div className="text-[17px] font-bold text-[#191F28] tracking-[-0.3px] mb-3 px-1">{await translate('upcoming_lesson')}</div>
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
                    {/* 상대 시간('3시간 후'·'내일'·'3일 후') 우선, 7일 넘으면 dday */}
                    {(relativeStart ?? upcoming.dday) && (
                      <span className="text-[12px] font-extrabold text-black bg-white px-2 py-0.5 rounded-full">
                        {relativeStart ?? upcoming.dday}
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

      {/* 보유 패스권 — 밝은 카드 행. 썸네일(없으면 보라 틴트 아이콘) + 이름/종료일 + D-day 칩 */}
      {user.myPasses && user.myPasses.length > 0 && (
        <section className="px-4">
          <div className="text-[17px] font-bold text-[#191F28] tracking-[-0.3px] mb-3 px-1">{await translate('my_pass')}</div>
          <div className="flex flex-col gap-2.5">
            {user.myPasses.map((pass) => {
              const isActive = pass.status === 'Active';
              const dday = isActive ? ddayLabel(typeof pass.endDate === 'string' ? pass.endDate : undefined) : null;
              const period = pass.endDate && typeof pass.endDate === 'string'
                ? formatEndDate(pass.endDate, locale)
                : pass.passPlan?.expireDateStamp;
              return (
                <NavigateClickWrapper key={pass.id} method="push" route={KloudScreen.MyPassDetail(pass.id)}>
                  <div className={`flex items-center gap-3.5 rounded-[20px] px-4 py-3.5 active:scale-[0.985] transition-all duration-150 ${isActive ? 'bg-[#F9FAFB]' : 'bg-[#F9FAFB] opacity-60'}`}>
                    {pass.passPlan?.imageUrl ? (
                      <div className={`relative w-[52px] h-[52px] rounded-[14px] overflow-hidden shrink-0 ${isActive ? '' : 'grayscale'}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={pass.passPlan.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <span className="w-[52px] h-[52px] rounded-[14px] bg-white flex items-center justify-center shrink-0">
                        <PassFlatIcon size={28}/>
                      </span>
                    )}
                    <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                      <span className="text-[15px] font-semibold text-[#191F28] truncate tracking-[-0.3px]">
                        {pass.passPlan?.name}
                      </span>
                      {period && (
                        <span className="text-[12.5px] text-[#8B95A1] truncate tracking-[-0.2px]">{period}</span>
                      )}
                    </div>
                    {dday && (
                      <span className="shrink-0 px-2 py-[3px] rounded-[6px] bg-[#191F28] text-white text-[11px] font-bold font-paperlogy tracking-wide">
                        {dday}
                      </span>
                    )}
                    <ChevronRightIcon className="text-[#D1D6DB] shrink-0 -ml-1"/>
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
          <div className="text-[17px] font-bold text-[#191F28] tracking-[-0.3px] mb-3 px-1">{await translate('room_booking_history')}</div>
          <div className="flex flex-col gap-2.5">
            {user.myBookings.map((booking) => (
              <MyBookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </section>
      )}

      {/* 내 활동 — 세로 목록. 옅은 라운드 스퀘어 안 플랫 컬러 아이콘 + 라벨, 오른쪽 개수 + 화살표. 카드/구분선 없이 여백으로 */}
      <section className="px-4 mt-8">
        <div className="text-[17px] font-bold text-[#191F28] tracking-[-0.3px] mb-1 px-1">{await translate('my_activity')}</div>
        <div className="flex flex-col">
          <ActivityRow route={KloudScreen.Tickets} icon={<TicketFlatIcon size={24}/>} label={await translate('my_tickets')} count={user.ticketCount ?? 0}/>
          <ActivityRow route={KloudScreen.MyPass} icon={<PassFlatIcon size={24}/>} label={await translate('my_pass')} count={user.passCount ?? 0}/>
          <ActivityRow route={KloudScreen.PaymentRecords} icon={<ReceiptFlatIcon size={24}/>} label={await translate('payment_records')} count={user.paymentRecordCount ?? 0}/>
          {/* 예약 결제(정기결제) 관리 — 결제내역의 '다가오는 결제' 탭을 대신한다 */}
          <ActivityRow route={KloudScreen.MySubscription} icon={<ScheduledPaymentFlatIcon size={24}/>} label={await translate('scheduled_payments')}/>
          {(user.bookingCount ?? 0) > 0 && (
            <ActivityRow route={KloudScreen.RoomBookings} icon={<RoomBookingFlatIcon size={24}/>} label={await translate('room_bookings')} count={user.bookingCount ?? 0}/>
          )}
        </div>
      </section>
      </div>
    </div>
  );
};

// 내 활동 행 — 옅은 라운드 스퀘어 위 플랫 컬러 아이콘 + 라벨, 오른쪽 개수(있을 때) + 화살표
const ActivityRow = ({ route, icon, label, count }: { route: string; icon: React.ReactNode; label: string; count?: number }) => (
  <NavigateClickWrapper method={'push'} route={route}>
    <div className="flex items-center gap-3.5 px-1 py-3.5 rounded-[14px] active:bg-[#F9FAFB] transition-colors">
      <span className="w-[42px] h-[42px] rounded-[14px] bg-[#F7F8FA] flex items-center justify-center shrink-0">
        {icon}
      </span>
      <span className="flex-1 text-[15.5px] font-semibold text-[#191F28] tracking-[-0.3px]">{label}</span>
      {count != null && (
        <span className="text-[15px] font-bold text-[#8B95A1] font-paperlogy">{count}</span>
      )}
      <ChevronRightIcon className="text-[#D1D6DB] shrink-0"/>
    </div>
  </NavigateClickWrapper>
);
