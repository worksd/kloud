'use client'
import { QRCodeCanvas } from 'qrcode.react';

const KloudQRCode = () => {
  return (
    <>

      <section className='w-full flex items-center justify-center flex-col'>
        <QRCodeCanvas value={"https://naver.com"}/>
      </section>
    </>
  );
};

export default KloudQRCode;