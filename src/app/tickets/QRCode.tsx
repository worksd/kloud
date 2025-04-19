'use client'
import { QRCodeCanvas } from 'qrcode.react';

const KloudQRCode = ({qrCodeUrl}: { qrCodeUrl?: string }) => {
  return (
    <>
      <section className='flex items-center justify-center flex-col bg-white w-[300px] h-[300px] rounded-[20px]'>
        {qrCodeUrl &&
          <QRCodeCanvas
            value={qrCodeUrl}
            size={256}
          />
        }
      </section>
    </>
  );
};

export default KloudQRCode;