import { api } from "@/app/api.client";
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

export default async function SettingPage({
                                            searchParams
                                          }: {
  searchParams: Promise<{ os: string }>
}) {
  const os = (await searchParams).os
  const user = await api.user.me({})

  if ('id' in user) {
    const upcoming = user.upcomingLesson;

    return (
      <div className="flex flex-col min-h-screen bg-white py-8 w-full max-w-screen overflow-x-hidden">
        <div className="flex justify-end px-4 mb-4">
          <NavigateClickWrapper method={'push'} route={KloudScreen.ProfileSetting}>
            <SettingIcon className="w-[24px] h-[24px]"/>
          </NavigateClickWrapper>
        </div>

        <div className={"flex flex-row w-full ml-6 mb-5 items-center"}>
          <div className="w-[52px] h-[52px] rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={user.profileImageUrl ?? ''}
              alt="studio logo"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col px-4">
              <div className="flex flex-row items-center gap-2">
                <div className="font-bold text-lg text-black">{has(user.nickName) ? user.nickName : '-'}</div>
                <NavigateClickWrapper method={'push'} route={KloudScreen.ProfileEdit}>
                  <EditIcon className="w-[18px] h-[18px] active:opacity-50 transition-opacity duration-150"/>
                </NavigateClickWrapper>
              </div>
              {has(user.email) && (
                <div className="text-gray-500">{user.email}</div>
              )}
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
                {user.ticketCount != null && user.ticketCount > 0 && (
                  <span className="text-[13px] font-bold text-black font-paperlogy">{user.ticketCount}건</span>
                )}
              </div>
            </NavigateClickWrapper>

            <NavigateClickWrapper method={'push'} route={KloudScreen.MyPass}>
              <div className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl bg-[#F7F8F9] active:scale-[0.96] active:bg-[#EFEFEF] transition-all duration-150">
                <div className="flex items-center gap-1.5">
                  <PassPlanIcon className="w-[24px] h-[24px]"/>
                  <span className="text-[12px] font-medium text-[#999] font-paperlogy">{await translate('my_pass')}</span>
                </div>
                {user.passCount != null && user.passCount > 0 && (
                  <span className="text-[13px] font-bold text-black font-paperlogy">{user.passCount}개</span>
                )}
              </div>
            </NavigateClickWrapper>

            <NavigateClickWrapper method={'push'} route={KloudScreen.PaymentRecords}>
              <div className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl bg-[#F7F8F9] active:scale-[0.96] active:bg-[#EFEFEF] transition-all duration-150">
                <div className="flex items-center gap-1.5">
                  <ReceiptIcon className="w-[24px] h-[24px]"/>
                  <span className="text-[12px] font-medium text-[#999] font-paperlogy">{await translate('payment_records')}</span>
                </div>
                {user.paymentRecordCount != null && user.paymentRecordCount > 0 && (
                  <span className="text-[13px] font-bold text-black font-paperlogy">{user.paymentRecordCount}건</span>
                )}
              </div>
            </NavigateClickWrapper>
          </div>
        </section>
      </div>
    );
  }
};

const has = (s?: string | null) => !!s && s.trim().length > 0;
