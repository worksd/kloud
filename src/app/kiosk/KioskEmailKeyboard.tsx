'use client';

import React from 'react';

// 이메일 입력 전용 가상 키보드 (모달 안에서 사용).
// - 한글 조합 없음, ASCII만
// - 자주 쓰는 도메인 단축키 제공: @를 만나면 그 앞까지를 로컬파트로 보고 도메인 교체
const ROW_NUM = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
const ROW_TOP = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
const ROW_MID = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
const ROW_BOT = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];
const SYMBOLS = ['@', '.', '_', '-', '+'];
const DOMAIN_SHORTCUTS = ['@gmail.com', '@naver.com', '@daum.net', '@kakao.com'];

type Props = {
  value: string;
  onChange: (next: string) => void;
};

export const KioskEmailKeyboard = ({ value, onChange }: Props) => {
  const append = (k: string) => onChange(value + k);
  const backspace = () => onChange(value.slice(0, -1));
  const applyDomain = (d: string) => {
    const at = value.indexOf('@');
    const local = at >= 0 ? value.slice(0, at) : value;
    onChange((local || '') + d);
  };

  const Key = ({ label, onClick, flex }: { label: React.ReactNode; onClick: () => void; flex?: number }) => (
    <button
      type="button"
      onPointerDown={(e) => { e.preventDefault(); onClick(); }}
      className="rounded-[12px] bg-[#F2F4F6] flex items-center justify-center active:bg-[#E0E3E6] transition-colors select-none text-[#1E2124] font-medium"
      style={{ flex: flex ?? 1, height: 'min(7vw, 76px)', fontSize: 'min(2.4vw, 26px)' }}
    >
      {label}
    </button>
  );

  return (
    <div className="w-full flex flex-col" style={{ gap: 'min(0.8vw, 10px)' }}>
      {/* 도메인 단축키 */}
      <div className="flex" style={{ gap: 'min(0.8vw, 10px)' }}>
        {DOMAIN_SHORTCUTS.map((d) => (
          <Key key={d} label={d} onClick={() => applyDomain(d)} />
        ))}
      </div>

      <div className="flex" style={{ gap: 'min(0.8vw, 10px)' }}>
        {ROW_NUM.map((k) => <Key key={k} label={k} onClick={() => append(k)} />)}
      </div>

      <div className="flex" style={{ gap: 'min(0.8vw, 10px)' }}>
        {ROW_TOP.map((k) => <Key key={k} label={k} onClick={() => append(k)} />)}
      </div>

      <div className="flex" style={{ gap: 'min(0.8vw, 10px)' }}>
        <div style={{ flex: 0.5 }} />
        {ROW_MID.map((k) => <Key key={k} label={k} onClick={() => append(k)} />)}
        <div style={{ flex: 0.5 }} />
      </div>

      <div className="flex" style={{ gap: 'min(0.8vw, 10px)' }}>
        {ROW_BOT.map((k) => <Key key={k} label={k} onClick={() => append(k)} />)}
        <Key
          flex={2}
          label={(
            <svg width="32" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M9 3H20a1 1 0 011 1v16a1 1 0 01-1 1H9l-7-9 7-9z" stroke="#1E2124" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 9l-4 6M12 9l4 6" stroke="#1E2124" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          )}
          onClick={backspace}
        />
      </div>

      <div className="flex" style={{ gap: 'min(0.8vw, 10px)' }}>
        {SYMBOLS.map((k) => <Key key={k} label={k} onClick={() => append(k)} />)}
      </div>
    </div>
  );
};
