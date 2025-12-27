'use client'
import Dim from "@/app/components/Dim";
import KloudQRCode from "@/app/tickets/QRCode";
import WhiteCloseIcon from "../../../../public/assets/ic_close_white.svg";
import QRCode from "../../../../public/assets/ic_qrcode.svg";
import { useEffect, useState } from "react";
import TicketUsageSSEPage from "@/app/tickets/[id]/TicketUsageSSEPage";

export const QrCodeDialogScreen = ({
                                     ticketId, qrCodeUrl, endpoint, message
                                   }: { ticketId: number, qrCodeUrl?: string, endpoint: string, message: string }) => {
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  // 스크롤 락
  useEffect(() => {
    document.body.style.overflow = isDialogVisible ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isDialogVisible]);

  return (
    <>
      {/* 오버레이 (언마운트하지 않고 페이드) */}
      <div
        className={`
          fixed inset-0 z-50 flex items-center justify-center
          transition-opacity duration-300 ease-out
          ${isDialogVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        aria-hidden={!isDialogVisible}
        role="dialog"
      >
        <Dim>
          <div
            className={`
              flex flex-col items-center
              transition-transform duration-300 ease-out
              ${isDialogVisible ? 'scale-100' : 'scale-95'}
            `}
          >
            <KloudQRCode qrCodeUrl={qrCodeUrl} />

            <div className="bg-white text-black text-sm font-semibold text-center w-[330px] py-3 rounded-xl shadow-md mt-4 whitespace-pre-line">
              {message}
            </div>

            <button
              type="button"
              onClick={() => setIsDialogVisible(false)}
              className="flex items-center justify-center bg-white/60 rounded-full mt-6 w-[52px] h-[52px] backdrop-blur active:scale-[0.98] transition"
              aria-label="닫기"
            >
              <WhiteCloseIcon className="w-7 h-7" />
            </button>
          </div>
        </Dim>

        {/* 필요 시 열린 동안에만 SSE 연결 */}
        {isDialogVisible && (
          <TicketUsageSSEPage ticketId={ticketId} endpoint={endpoint} />
        )}
      </div>
    </>
  );
};
