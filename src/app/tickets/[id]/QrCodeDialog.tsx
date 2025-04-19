'use client'
import Dim from "@/app/components/Dim";
import KloudQRCode from "@/app/tickets/QRCode";
import WhiteCloseIcon from "../../../../public/assets/ic_close_white.svg"
import QRCode from "../../../../public/assets/ic_qrcode.svg"
import { useEffect, useState } from "react";

export const QrCodeDialogScreen = ({qrCodeUrl}: { qrCodeUrl?: string }) => {
  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);

  // 🔒 Prevent scroll when dialog is open
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
        <Dim>
          <div className={'flex flex-col items-center'}>
            <KloudQRCode qrCodeUrl={qrCodeUrl} />
            <div
              onClick={() => setIsDialogVisible(false)}
              className="flex items-center justify-center bg-white/50 rounded-full mt-6 w-[52px] h-[52px]">
              <WhiteCloseIcon className="w-7 h-7"/>
            </div>
          </div>
        </Dim>}
    </div>
  )
}