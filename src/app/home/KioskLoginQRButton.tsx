'use client'

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

type Props = {
  qrUrl: string;
};

export const KioskLoginQRButton = ({ qrUrl }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="키오스크 로그인 QR"
        className="ml-auto w-9 h-9 rounded-full bg-white/80 border border-[#E6E8EA] flex items-center justify-center active:scale-[0.95] transition-transform"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="#1E2124" strokeWidth="1.6"/>
          <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="#1E2124" strokeWidth="1.6"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="#1E2124" strokeWidth="1.6"/>
          <path d="M14 14H17V17H14V14ZM18 14H21V17M14 18H17V21M18 18V21H21V18H18Z" stroke="#1E2124" strokeWidth="1.6" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-6" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-3xl w-full max-w-[400px] p-6 flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <p className="text-[18px] font-bold text-black">키오스크 로그인 QR</p>
            <p className="text-[13px] text-[#86898C] mt-1 text-center">키오스크에서 이 QR을 스캔해 로그인하세요</p>

            <div className="mt-5 bg-white p-4 rounded-2xl border border-[#F2F4F6]">
              <QRCodeSVG value={qrUrl} size={240} level="M" includeMargin={false} />
            </div>

            <button
              onClick={() => setOpen(false)}
              className="mt-6 w-full h-12 rounded-2xl bg-[#1E2124] flex items-center justify-center active:scale-[0.97] transition-transform"
            >
              <span className="text-white font-bold text-[15px]">닫기</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
