'use client'
import Dim from "@/app/components/Dim";
import KloudQRCode from "@/app/tickets/QRCode";
import WhiteCloseIcon from "../../../../public/assets/ic_close_white.svg"
import QRCode from "../../../../public/assets/ic_qrcode.svg"
import { useEffect, useState } from "react";
import { TranslatableText } from "@/utils/TranslatableText";
import TicketUsageSSEPage from "@/app/tickets/[id]/TicketUsageSSEPage";

export const QrCodeDialogScreen = ({ticketId, qrCodeUrl, endpoint}: { ticketId: number, qrCodeUrl?: string, endpoint: string }) => {
  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);

  useEffect(() => {
    if (isDialogVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isDialogVisible]);
  return (
    <div className={'fixed z-10'}>
      {qrCodeUrl &&
        <div className={'fixed bottom-8 right-6 bg-black rounded-full p-3'} onClick={() => setIsDialogVisible(true)}>
          <QRCode/>
        </div>
      }

      {isDialogVisible &&
        <div>
          <Dim>
            <div className="flex flex-col items-center">
              <KloudQRCode qrCodeUrl={qrCodeUrl}/>

              <div
                className="bg-white text-black text-sm font-semibold text-center w-[330px] py-3 rounded-xl shadow-md mt-4">
                <TranslatableText titleResource="do_not_capture_qr"/>
              </div>


              <div
                onClick={() => setIsDialogVisible(false)}
                className="flex items-center justify-center bg-white/50 rounded-full mt-6 w-[52px] h-[52px]"
              >
                <WhiteCloseIcon className="w-7 h-7"/>
              </div>
            </div>
          </Dim>
          <TicketUsageSSEPage ticketId={ticketId} endpoint={endpoint}/>
        </div>
      }
    </div>
  )
}