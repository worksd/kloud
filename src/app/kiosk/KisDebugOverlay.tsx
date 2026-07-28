'use client';

/**
 * staging 전용 KIS 응답 뷰어.
 * 화면 좌하단에 떠 있는 배지를 누르면 지금까지 받은 KIS 응답 raw JSON을 전부 펼쳐서 보여준다.
 * (prod에서는 아무것도 렌더하지 않음 — 대신 Discord로 전송)
 */

import React, { useEffect, useState } from 'react';
import {
  clearKisDebugEntries,
  getKisDebugEntries,
  initKisDebug,
  isKisDebugVisible,
  subscribeKisDebug,
  type KisDebugEntry,
} from '@/app/kiosk/kiosk.kis.debug';

const KIND_LABEL: Record<string, string> = {
  payment: 'D1/D2 결제·취소',
  query: 'ST 거래상태조회',
};

export const KisDebugOverlay = () => {
  const [entries, setEntries] = useState<KisDebugEntry[]>(getKisDebugEntries());
  const [visible, setVisible] = useState(isKisDebugVisible());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    initKisDebug();
    const unsubscribe = subscribeKisDebug(() => {
      setEntries(getKisDebugEntries());
      setVisible(isKisDebugVisible());
    });
    return unsubscribe;
  }, []);

  if (!visible) return null;

  const ordered = [...entries].reverse(); // 최신 먼저

  return (
    <>
      {/* 배지 — 결제 흐름을 가리지 않게 좌하단 고정. 받은 응답 수 표시 */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-[16px] bottom-[16px] z-[90] px-[14px] py-[10px] rounded-[12px] bg-[#0F1115]/85 active:scale-[0.96] transition-transform"
      >
        <span className="text-[#A6E3D6] font-mono font-bold text-[13px]">
          KIS {entries.length}
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[95] bg-black/70 flex items-center justify-center px-[4%]">
          <div className="bg-white rounded-[20px] w-full max-w-[900px] max-h-[90vh] flex flex-col overflow-hidden">
            <div className="shrink-0 px-[20px] pt-[20px] pb-[12px] flex items-center justify-between">
              <div>
                <p className="text-[#1E2124] font-bold" style={{ fontSize: 18 }}>KIS 단말 응답 (staging)</p>
                <p className="text-[#86898C] mt-[2px]" style={{ fontSize: 12 }}>
                  최근 {entries.length}건 · 네이티브가 준 raw 응답 전체
                </p>
              </div>
              <div className="flex items-center gap-[8px]">
                <button
                  onClick={() => clearKisDebugEntries()}
                  className="px-[12px] py-[6px] rounded-[10px] bg-[#F2F4F6] active:scale-[0.96] text-[14px] font-medium"
                >
                  비우기
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="px-[12px] py-[6px] rounded-[10px] bg-[#1E2124] text-white active:scale-[0.96] text-[14px] font-bold"
                >
                  닫기
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-[20px] pb-[20px] flex flex-col gap-[10px]">
              {ordered.length === 0 ? (
                <p className="text-[#6D7882] text-[13px] font-mono py-[20px]">
                  아직 받은 KIS 응답이 없습니다. 카드결제 / 취소 / 결제 확인하기를 실행하면 여기에 쌓입니다.
                </p>
              ) : (
                ordered.map((entry) => (
                  <div key={entry.id} className="rounded-[12px] bg-[#0F1115] p-[12px]">
                    <div className="flex items-center flex-wrap gap-[8px] mb-[8px]">
                      <span className="text-[#A6E3D6] font-mono font-bold text-[12px]">#{entry.id}</span>
                      <span className="text-[#8A949E] font-mono text-[12px]">{entry.time}</span>
                      <span className="px-[8px] py-[2px] rounded-[6px] bg-[#22262E] text-[#E6E8EA] font-mono text-[11px]">
                        {KIND_LABEL[entry.kind] ?? entry.kind}
                      </span>
                      {entry.note && (
                        <span className="text-[#B58026] font-mono text-[11px] break-all">{entry.note}</span>
                      )}
                    </div>
                    <pre className="text-[#E6E8EA] text-[11px] font-mono whitespace-pre-wrap break-all">
                      {JSON.stringify(entry.payload, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
