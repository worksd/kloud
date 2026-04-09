'use client'

import React, { useEffect, useState } from "react";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { getRoomBookingAction, deleteRoomBookingAction } from "@/app/profile/get.room.booking.action";
import { RoomBookingDetailResponse } from "@/app/endpoint/room.booking.endpoint";
import { kloudNav } from "@/app/lib/kloudNav";
import { KloudScreen } from "@/shared/kloud.screen";

export type RoomBookingInfo = {
  id: number;
  roomName: string;
  roomImageUrl?: string;
  studioName?: string;
  startDate: string;
  endDate: string;
}

export const RoomBookingDialog = ({
  booking,
  locale,
  onClose,
  onCancelled,
}: {
  booking: RoomBookingInfo;
  locale: Locale;
  onClose: () => void;
  onCancelled?: () => void;
}) => {
  const [closing, setClosing] = useState(false);
  const [detail, setDetail] = useState<RoomBookingDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    getRoomBookingAction(booking.id)
      .then(res => { if ('id' in res) setDetail(res); })
      .finally(() => setLoading(false));
  }, [booking.id]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 150);
  };

  const handleCancelConfirm = async () => {
    setCancelling(true);
    try {
      const res = await deleteRoomBookingAction(booking.id);
      if ('success' in res && res.success) {
        setClosing(true);
        setTimeout(() => {
          onClose();
          onCancelled?.();
        }, 150);
      }
    } finally {
      setCancelling(false);
      setConfirmCancel(false);
    }
  };

  const roomName = detail?.studioRoom?.name ?? booking.roomName;
  const imageUrl = detail?.studioRoom?.imageUrls?.[0] ?? booking.roomImageUrl;
  const datePart = (detail?.startDate ?? booking.startDate).split(' ')[0] ?? '';
  const startTime = (detail?.startDate ?? booking.startDate).split(' ')[1] ?? '';
  const endTime = (detail?.endDate ?? booking.endDate).split(' ')[1] ?? '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={handleClose}>
      <div className={`absolute inset-0 bg-black/60 ${closing ? 'animate-[fadeOut_150ms_ease-in_forwards]' : 'animate-[fadeIn_150ms_ease-out]'}`} />
      <div
        className={`relative bg-white rounded-2xl w-[calc(100%-48px)] max-w-[340px] overflow-hidden shadow-2xl ${closing ? 'animate-[scaleOut_150ms_ease-in_forwards]' : 'animate-[scaleIn_150ms_ease-out]'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* 이미지 + dim gradient + 정보 오버레이 */}
        <div className="relative w-full h-[160px] bg-[#1E2124]">
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* X 버튼 */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center active:bg-white/40"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2L10 10M10 2L2 10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          {/* 스탬프 */}
          <div className="absolute bottom-8 right-4 -rotate-12">
            <div className="border-[2.5px] border-white/60 rounded-lg px-3.5 py-1.5 backdrop-blur-sm bg-white/10">
              <span className="text-[14px] font-extrabold tracking-[0.2em] text-white/80">
                CONFIRMED
              </span>
            </div>
          </div>

          {/* 이미지 위 텍스트 */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
            <h3 className="text-[20px] font-bold text-white">{roomName}</h3>
            {booking.studioName && (
              <span className="text-[13px] text-white/60">{booking.studioName}</span>
            )}
          </div>
        </div>

        {/* 정보 */}
        <div className="px-5 pt-4 pb-5">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* 날짜/시간 카드 */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1 bg-[#F7F8F9] rounded-xl px-3.5 py-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect x="1.5" y="2.5" width="11" height="9.5" rx="1.5" stroke="#86898C" strokeWidth="1"/>
                      <path d="M1.5 5.5H12.5" stroke="#86898C" strokeWidth="1"/>
                      <path d="M4.5 1V3" stroke="#86898C" strokeWidth="1" strokeLinecap="round"/>
                      <path d="M9.5 1V3" stroke="#86898C" strokeWidth="1" strokeLinecap="round"/>
                    </svg>
                    <span className="text-[11px] text-[#86898C]">{getLocaleString({ locale, key: 'date' })}</span>
                  </div>
                  <span className="text-[14px] font-bold text-black">{datePart}</span>
                </div>
                <div className="flex-1 bg-[#F7F8F9] rounded-xl px-3.5 py-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="5.5" stroke="#86898C" strokeWidth="1"/>
                      <path d="M7 4V7L9 9" stroke="#86898C" strokeWidth="1" strokeLinecap="round"/>
                    </svg>
                    <span className="text-[11px] text-[#86898C]">{getLocaleString({ locale, key: 'time' })}</span>
                  </div>
                  <span className="text-[14px] font-bold text-black">{startTime} ~ {endTime}</span>
                </div>
              </div>

              {/* 상세 정보 */}
              <div className="flex flex-col gap-2.5">
                {detail?.pass && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#EDEDFF] flex items-center justify-center flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="#5B5FF6" strokeWidth="1.2"/>
                        <circle cx="8" cy="8" r="2" stroke="#5B5FF6" strokeWidth="1.2"/>
                      </svg>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] text-[#86898C]">{getLocaleString({ locale, key: 'use_pass_confirm_pass' })}</span>
                      <span className="text-[13px] font-medium text-black truncate">{detail.pass.passPlanName}</span>
                    </div>
                  </div>
                )}

                {detail?.price != null && detail.price > 0 && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#FEF3C7] flex items-center justify-center flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="#D97706" strokeWidth="1.2"/>
                        <path d="M8 4.5V8" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round"/>
                        <path d="M6 9.5H10" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] text-[#86898C]">{getLocaleString({ locale, key: 'lesson_price' })}</span>
                      <span className="text-[13px] font-bold text-black">
                        {new Intl.NumberFormat('ko-KR').format(detail.price)}{getLocaleString({ locale, key: 'won' })}
                      </span>
                    </div>
                  </div>
                )}
              </div>


              {detail?.notice && (
                <div className="mt-4 p-3 rounded-xl bg-[#FFFBEB] border border-[#F59E0B]/20">
                  <span className="text-[12px] text-[#92400E] leading-relaxed">{detail.notice}</span>
                </div>
              )}

              {detail?.createdAt && (
                <div className="mt-3 text-right">
                  <span className="text-[11px] text-[#B0B3B8]">{getLocaleString({ locale, key: 'booked_at' })} {detail.createdAt}</span>
                </div>
              )}

              <button
                onClick={() => {
                  setClosing(true);
                  const roomId = detail?.studioRoomId ?? booking.id;
                  setTimeout(() => {
                    onClose();
                    kloudNav.push(KloudScreen.StudioRoomDetail(roomId));
                  }, 150);
                }}
                className="w-full mt-4 py-3 rounded-xl text-[14px] font-bold active:scale-[0.98] transition-transform
                  bg-black text-white"
              >
                {locale === 'en' || locale === 'zh'
                  ? `${getLocaleString({ locale, key: 'go_to_room' })} ${roomName}`
                  : `${roomName} ${getLocaleString({ locale, key: 'go_to_room' })}`}
              </button>

              {!confirmCancel ? (
                <button
                  onClick={() => setConfirmCancel(true)}
                  className="w-full mt-2 py-3 rounded-xl text-[13px] font-medium text-[#999] active:text-[#EF4444] transition-colors"
                >
                  {getLocaleString({ locale, key: 'cancel_booking' })}
                </button>
              ) : (
                <div className="mt-3 p-3.5 rounded-xl border border-[#EF4444]/20 bg-[#FEF2F2]">
                  <p className="text-[13px] text-[#EF4444] font-medium text-center mb-3">
                    {getLocaleString({ locale, key: 'cancel_booking_confirm' })}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmCancel(false)}
                      className="flex-1 py-2.5 rounded-xl text-[13px] font-bold bg-white text-[#333] border border-[#E8E8E8] active:scale-[0.98] transition-transform"
                    >
                      {getLocaleString({ locale, key: 'no' })}
                    </button>
                    <button
                      disabled={cancelling}
                      onClick={handleCancelConfirm}
                      className="flex-1 py-2.5 rounded-xl text-[13px] font-bold bg-[#EF4444] text-white active:scale-[0.98] transition-transform disabled:opacity-50"
                    >
                      {cancelling ? '...' : getLocaleString({ locale, key: 'yes_cancel' })}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

    </div>
  );
};
