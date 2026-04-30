'use client';

import React, { useState } from 'react';

type Props = {
  onClose: () => void;
};

const fire = (payload: Record<string, unknown>, log: (s: string) => void) => {
  const json = JSON.stringify(payload);
  log(`→ ${json}`);
  window.KloudEvent?.requestSerialPrint?.(json);
};

const BAUDS = [9600, 19200, 38400, 57600, 115200];
const DEVICE_PATHS = [
  '/dev/ttyUSB0',
  '/dev/ttyUSB1',
  '/dev/ttyUSB2',
  '/dev/ttyS0',
  '/dev/ttyS1',
];

export const KioskPrinterDebugOverlay = ({ onClose }: Props) => {
  const [logs, setLogs] = useState<string[]>([]);
  const log = (s: string) => setLogs((prev) => [...prev.slice(-19), s]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-[5%]">
      <div className="bg-white rounded-[20px] w-full max-w-[820px] max-h-[88vh] flex flex-col overflow-hidden">
        {/* 타이틀 */}
        <div className="shrink-0 px-[20px] pt-[20px] pb-[12px] flex items-center justify-between">
          <p className="text-[#1E2124] font-bold" style={{ fontSize: 18 }}>프린터 진단 테스트</p>
          <button onClick={onClose} className="px-[12px] py-[6px] rounded-[10px] bg-[#F2F4F6] active:scale-[0.96] text-[14px] font-medium">닫기</button>
        </div>

        <div className="flex-1 overflow-y-auto px-[20px] pb-[20px] flex flex-col gap-[14px]">
          {/* ① RAW 평문 송출 */}
          <section className="flex flex-col gap-[6px]">
            <p className="text-[#86898C] text-[12px] font-bold">① RAW 평문 송출 (ESC/POS 가공 없이)</p>
            <button
              onClick={() => fire({ raw: 'HELLO TEST 9600\n\n\n\n\n' }, log)}
              className="px-[14px] h-[40px] rounded-[10px] bg-[#1E2124] text-white text-[14px] font-bold active:scale-[0.97] self-start"
            >
              HELLO TEST 9600
            </button>
          </section>

          {/* ② baud 변형 */}
          <section className="flex flex-col gap-[6px]">
            <p className="text-[#86898C] text-[12px] font-bold">② baud rate 변형</p>
            <div className="flex flex-wrap gap-[8px]">
              {BAUDS.map((b) => (
                <button
                  key={b}
                  onClick={() => fire({ baud: b, raw: `HELLO ${b}\n\n\n\n\n` }, log)}
                  className="px-[12px] h-[36px] rounded-[10px] bg-[#F2F4F6] text-[#1E2124] text-[13px] font-bold active:scale-[0.97]"
                >
                  baud {b}
                </button>
              ))}
            </div>
          </section>

          {/* ③ devicePath 변형 */}
          <section className="flex flex-col gap-[6px]">
            <p className="text-[#86898C] text-[12px] font-bold">③ devicePath 변형</p>
            <div className="flex flex-wrap gap-[8px]">
              {DEVICE_PATHS.map((p) => (
                <button
                  key={p}
                  onClick={() => fire({ devicePath: p, raw: `HELLO ${p}\n\n\n\n\n` }, log)}
                  className="px-[12px] h-[36px] rounded-[10px] bg-[#F2F4F6] text-[#1E2124] text-[13px] font-bold active:scale-[0.97]"
                >
                  {p}
                </button>
              ))}
            </div>
          </section>

          {/* 로그 */}
          <section className="flex flex-col gap-[6px]">
            <p className="text-[#86898C] text-[12px] font-bold">송출 로그 (최근 20개)</p>
            <div className="bg-[#0F1115] rounded-[10px] p-[12px] min-h-[120px] max-h-[200px] overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-[#6D7882] text-[12px] font-mono">아직 송출한 명령이 없습니다.</p>
              ) : (
                logs.map((line, idx) => (
                  <p key={idx} className="text-[#A6E3D6] text-[11px] font-mono break-all whitespace-pre-wrap">{line}</p>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
