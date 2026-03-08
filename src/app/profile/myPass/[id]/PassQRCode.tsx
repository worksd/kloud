'use client'

import { QRCodeCanvas } from 'qrcode.react';
import { useState } from 'react';

export const PassQRCode = ({ url }: { url: string }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div onClick={() => setExpanded(true)} className="cursor-pointer">
        <QRCodeCanvas
          value={url}
          size={72}
          level="M"
          marginSize={0}
        />
      </div>

      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setExpanded(false)}
        >
          <div
            className="flex flex-col items-center gap-5 bg-white rounded-2xl p-8 mx-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <QRCodeCanvas
              value={url}
              size={280}
              level="H"
              marginSize={1}
            />
            <div className="flex flex-col items-center gap-1.5">
              <p className="text-[13px] text-[#999] font-medium">QR코드를 스캔해주세요</p>
              <p className="text-[11px] text-[#C0C0C0]">화면 캡쳐는 사용이 제한될 수 있습니다</p>
            </div>
            <button
              onClick={() => setExpanded(false)}
              className="text-[14px] font-semibold text-[#666] mt-1"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
};
