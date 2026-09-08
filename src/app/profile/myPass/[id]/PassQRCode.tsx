'use client'

import { QRCodeCanvas } from 'qrcode.react';
import { useState } from 'react';

// 패스권 QR — 헤더 옆 조그만 QR. 탭하면 전체화면 확대(fade/scale in, 닫을 때 fade/scale out).
export const PassQRCode = ({ url, hint, closeLabel }: {
  url: string;
  hint: string;
  closeLabel: string;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [closing, setClosing] = useState(false);

  // 닫기 — fadeOut 재생 후 언마운트
  const close = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => { setExpanded(false); setClosing(false); }, 180);
  };

  return (
    <>
      {/* 조그만 QR — 탭하면 확대 */}
      <div
        onClick={() => setExpanded(true)}
        className="shrink-0 rounded-[12px] bg-white p-1.5 cursor-pointer active:opacity-70 transition-opacity select-none"
        aria-label={hint}
      >
        <QRCodeCanvas value={url} size={64} level="M" marginSize={0}/>
      </div>

      {expanded && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 ${closing ? 'animate-[fadeOut_180ms_ease-in_forwards]' : 'animate-[fadeIn_200ms_ease-out]'}`}
          onClick={close}
        >
          <div
            className={`flex flex-col items-center gap-5 bg-white rounded-[24px] p-8 mx-6 ${closing ? 'animate-[scaleOut_180ms_ease-in_forwards]' : 'animate-[scaleIn_220ms_cubic-bezier(0.34,1.4,0.64,1)]'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <QRCodeCanvas value={url} size={280} level="H" marginSize={1}/>
            <p className="text-[13px] text-[#8B95A1] tracking-[-0.2px]">{hint}</p>
            <button
              onClick={close}
              className="w-full h-[48px] rounded-[14px] bg-[#F2F4F6] text-[15px] font-semibold text-[#4E5968]"
            >
              {closeLabel}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
