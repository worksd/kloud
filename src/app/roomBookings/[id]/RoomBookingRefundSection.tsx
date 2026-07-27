'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { deleteRoomBookingAction } from "@/app/profile/get.room.booking.action";
import { createDialog } from "@/utils/dialog.factory";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";
import ArrowUpIcon from "../../../../public/assets/arrow-up.svg";
import ArrowDownIcon from "../../../../public/assets/arrow-down.svg";

// 대관 예약 상세 — 환불 안내사항(접기/펼치기) + 그 안에 숨겨둔 '취소하기'.
// 일반 결제내역의 RefundInformation과 동일한 UX.
// paymentId 있으면 기존 결제내역 환불 플로우로, 없으면 DELETE /roomBookings/:id.
export const RoomBookingRefundSection = ({ bookingId, cancellable, paymentId, locale }: {
  bookingId: number;
  cancellable: boolean;
  paymentId?: string | null;
  locale: Locale;
}) => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });

  const handleCancelClick = async () => {
    if (cancelling) return;
    const dialog = await createDialog({
      id: 'CancelRoomBooking',
      title: t('cancel_booking'),
      message: t('cancel_booking_confirm'),
    });
    window.KloudEvent?.showDialog(JSON.stringify(dialog));
  };

  // 네이티브 확인 다이얼로그의 '확인' 콜백. 다른 다이얼로그는 이전 핸들러로 위임.
  useEffect(() => {
    const prev = window.onDialogConfirm;
    window.onDialogConfirm = async (data) => {
      if (data.id === 'CancelRoomBooking') {
        setCancelling(true);
        try {
          const res = await deleteRoomBookingAction(bookingId);
          if ('success' in res && res.success) {
            const ok = await createDialog({
              id: 'Simple',
              title: t('cancel_booking'),
              message: t('cancel_booking_success'),
            });
            window.KloudEvent?.showDialog(JSON.stringify(ok));
            router.refresh();
          } else {
            const msg = ('message' in res) ? (res as { message?: string }).message ?? '' : '';
            const err = await createDialog({ id: 'Simple', message: msg });
            window.KloudEvent?.showDialog(JSON.stringify(err));
          }
        } finally {
          setCancelling(false);
        }
      } else {
        prev?.(data);
      }
    };
    return () => { window.onDialogConfirm = prev; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  return (
    <div>
      <div className="flex flex-row items-center justify-between" onClick={() => setExpanded(!expanded)}>
        <div className="font-medium text-[14px] text-black">{t('refund_information')}</div>
        {expanded ? <ArrowUpIcon /> : <ArrowDownIcon />}
      </div>
      {expanded && (
        <div className="flex flex-col space-y-4 mt-5">
          <div className="text-[#6b6e71] text-[10px] font-medium leading-[14px]">
            <p className="pb-4">{t('lesson_refund_message_1')}</p>
            <p>{t('lesson_refund_message_2')}</p>
          </div>

          {cancellable && (
            paymentId ? (
              // 결제건 — 기존 결제내역 환불 플로우로 이동.
              <NavigateClickWrapper method="push" route={KloudScreen.PaymentRecordRefund(paymentId)}>
                <button className="w-full border border-[#e55b5b] rounded-[8px] h-9 px-[10px] flex items-center justify-center gap-1 active:scale-[0.95] transition-transform duration-150">
                  <span className="text-[14px] font-medium text-[#e55b5b]">{t('do_cancel')}</span>
                </button>
              </NavigateClickWrapper>
            ) : (
              // 무료(패스 등) — DELETE /roomBookings/:id 직접 취소.
              <button
                disabled={cancelling}
                onClick={handleCancelClick}
                className="w-full border border-[#e55b5b] rounded-[8px] h-9 px-[10px] flex items-center justify-center gap-1 active:scale-[0.95] transition-transform duration-150 disabled:opacity-50"
              >
                <span className="text-[14px] font-medium text-[#e55b5b]">
                  {cancelling ? '...' : t('do_cancel')}
                </span>
              </button>
            )
          )}

          <div className="mt-10 text-[#6b6e71] text-[10px] font-medium leading-[14px]">
            <p className="pb-4">{t('lesson_refund_message_3')}</p>
            <p>{t('lesson_refund_message_4')}</p>
            <p>{t('lesson_refund_message_5')}</p>
          </div>
        </div>
      )}
    </div>
  );
};
