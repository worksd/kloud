'use client'
import { QRCodeCanvas } from 'qrcode.react';

const KloudQRCode = ({qrCodeUrl}: { qrCodeUrl?: string }) => {
  return (
    <>
      <section className='flex items-center justify-center flex-col bg-white w-[330px] h-[330px] rounded-[20px]'>
        {qrCodeUrl &&
          <QRCodeCanvas
            value={qrCodeUrl}
            size={280}
          />
        }
      </section>
    </>
  );
};

export default KloudQRCode;