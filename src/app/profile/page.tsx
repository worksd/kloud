import { api } from "@/app/api.client";
import { KloudScreen } from "@/shared/kloud.screen";
import React from "react";
import { handleApiError } from "@/utils/handle.api.error";
import { TokenExpiredRedirect } from "@/app/components/TokenExpiredRedirect";
import SettingIcon from "../../../public/assets/ic_setting.svg";
import EditIcon from "../../../public/assets/ic_edit.svg";
import TicketIcon from "../../../public/assets/ic_ticket.svg";
import PassPlanIcon from "../../../public/assets/ic_pass_plan.svg";
import ReceiptIcon from "../../../public/assets/ic_receipt.svg";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import Image from "next/image";
import { translate } from "@/utils/translate";

export default async function SettingPage({
                                            searchParams
                                          }: {
  searchParams: Promise<{ os: string }>
}) {
  const os = (await searchParams).os
  const user = await api.user.me({})

  if (!('id' in user)) {
    const result = await handleApiError(user, 'GET /users/me');
    if (result === 'TOKEN_EXPIRED') return <TokenExpiredRedirect />;
    return null;
  }

  const upcoming = user.upcomingLesson;

    return (
      <div className="flex flex-col min-h-screen bg-white pb-8 w-full max-w-screen overflow-x-hidden">
        {/* 아이콘 */}
        <div className="flex justify-end items-center gap-3 px-5 py-3">
          <NavigateClickWrapper method={'push'} route={KloudScreen.ProfileEdit}>
            <EditIcon className="w-[22px] h-[22px] active:opacity-50 transition-opacity duration-150"/>
          </NavigateClickWrapper>
          <NavigateClickWrapper method={'push'} route={KloudScreen.ProfileSetting}>
            <SettingIcon className="w-[22px] h-[22px] active:opacity-50 transition-opacity duration-150"/>
          </NavigateClickWrapper>
        </div>

        {/* 프로필 정보 */}
        <div className="flex items-center gap-3 px-5 mb-5">
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
                      {upcoming.genre && (
                        <span className="text-[11px] font-bold text-white/70">
                          {upcoming.genre}
                        </span>
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

        {/* 연습실 예약 */}
        {user.myBookings && user.myBookings.length > 0 && (
          <section className="px-4 mb-6">
            <div className="text-[13px] font-bold text-[#999] mb-3 px-1">{await translate('my_bookings')}</div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide [&>*:last-child]:mr-4">
              {user.myBookings.map((booking) => (
                <NavigateClickWrapper key={booking.id} method="push" route={KloudScreen.StudioRoomDetail(booking.studioRoom?.id ?? booking.studioRoomId)}>
                  <div className="flex-shrink-0 w-[200px] rounded-2xl overflow-hidden bg-[#F7F8F9] active:scale-[0.98] transition-all duration-150">
                    <div className="w-full h-[80px] bg-[#E8E8EA]">
                      {booking.studioRoom?.imageUrls?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={booking.studioRoom.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="px-3 py-2.5">
                      <span className="text-[14px] font-bold text-black block truncate">{booking.studioRoom?.name ?? '연습실'}</span>
                      <span className="text-[11px] text-[#86898C] mt-0.5 block">{booking.startDate} ~ {booking.endDate}</span>
                    </div>
                  </div>
                </NavigateClickWrapper>
              ))}
            </div>
          </section>
        )}

        {/* 보유 패스권 */}
        {user.myPasses && user.myPasses.length > 0 && (
          <section className="px-4 mb-6">
            <div className="text-[13px] font-bold text-[#999] mb-3 px-1">{await translate('my_pass')}</div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide [&>*:last-child]:mr-4">
              {user.myPasses.map((pass) => (
                <NavigateClickWrapper key={pass.id} method="push" route={KloudScreen.MyPassDetail(pass.id)}>
                  <div className="flex-shrink-0 w-[160px] rounded-2xl bg-[#F7F8F9] px-3.5 py-3 active:scale-[0.98] transition-all duration-150">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      pass.status === 'Active' ? 'text-[#059669] bg-[#ECFDF5]' : 'text-[#999] bg-[#F1F3F6]'
                    }`}>
                      {pass.status === 'Active' ? '사용 가능' : pass.status}
                    </span>
                    <span className="text-[14px] font-bold text-black block mt-2 truncate">{pass.passPlan?.name}</span>
                    {pass.passPlan?.expireDateStamp && (
                      <span className="text-[11px] text-[#86898C] mt-1 block truncate">{pass.passPlan.expireDateStamp}</span>
                    )}
                  </div>
                </NavigateClickWrapper>
              ))}
            </div>
          </section>
        )}

        {/* 마이페이지 메뉴 그리드 */}
        <section className="px-4 mt-4">
          <div className="text-[13px] font-bold text-[#999] mb-3 px-1 pt-2">{await translate('my_page')}</div>
          <div className="grid grid-cols-3 gap-3">
            <NavigateClickWrapper method={'push'} route={KloudScreen.Tickets}>
              <div className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl bg-[#F7F8F9] active:scale-[0.96] active:bg-[#EFEFEF] transition-all duration-150">
                <div className="flex items-center gap-1.5">
                  <TicketIcon className="w-[24px] h-[24px]"/>
                  <span className="text-[12px] font-medium text-[#999] font-paperlogy">{await translate('my_tickets')}</span>
                </div>
                <span className="text-[13px] font-bold text-black font-paperlogy">{user.ticketCount ?? 0}건</span>
              </div>
            </NavigateClickWrapper>

            <NavigateClickWrapper method={'push'} route={KloudScreen.MyPass}>
              <div className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl bg-[#F7F8F9] active:scale-[0.96] active:bg-[#EFEFEF] transition-all duration-150">
                <div className="flex items-center gap-1.5">
                  <PassPlanIcon className="w-[24px] h-[24px]"/>
                  <span className="text-[12px] font-medium text-[#999] font-paperlogy">{await translate('my_pass')}</span>
                </div>
                <span className="text-[13px] font-bold text-black font-paperlogy">{user.passCount ?? 0}개</span>
              </div>
            </NavigateClickWrapper>

            <NavigateClickWrapper method={'push'} route={KloudScreen.PaymentRecords}>
              <div className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl bg-[#F7F8F9] active:scale-[0.96] active:bg-[#EFEFEF] transition-all duration-150">
                <div className="flex items-center gap-1.5">
                  <ReceiptIcon className="w-[24px] h-[24px]"/>
                  <span className="text-[12px] font-medium text-[#999] font-paperlogy">{await translate('payment_records')}</span>
                </div>
                <span className="text-[13px] font-bold text-black font-paperlogy">{user.paymentRecordCount ?? 0}건</span>
              </div>
            </NavigateClickWrapper>
          </div>
        </section>
      </div>
    );
};

const has = (s?: string | null) => !!s && s.trim().length > 0;

const formatPhone = (phone: string) => {
  const nums = phone.replace(/\D/g, '');
  if (nums.length === 11) return `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7)}`;
  if (nums.length === 10) return `${nums.slice(0, 3)}-${nums.slice(3, 6)}-${nums.slice(6)}`;
  return phone;
};
