'use client';

import React, { useState } from 'react';
import { kloudNav } from '@/app/lib/kloudNav';
import { KloudScreen } from '@/shared/kloud.screen';

// 키오스크 엔드포인트(서버) 변경 모달.
// 앱 설정의 개발자 화면(DeveloperForm)과 같은 규칙으로 native의 changeWebEndpoint를 호출한다.
//  - Production / Test 는 고정 URL
//  - 직접 입력은 IP/호스트만 받아 http://<입력>:3000 으로 변환 (전체 URL을 넣으면 그대로 사용)
// 키오스크는 로그인 전에도 접근해야 해서(엔드포인트가 틀리면 로그인 자체가 불가) 별도 모달로 분리.
type ServerOption = {
  key: 'production' | 'test' | 'custom';
  label: string;
  url: string;
};

const SERVER_OPTIONS: ServerOption[] = [
  { key: 'production', label: 'Production 서버', url: 'https://rawgraphy.com' },
  { key: 'test', label: 'Test 서버', url: 'https://staging.rawgraphy.com' },
  { key: 'custom', label: '직접 입력 (localhost / 사내망)', url: '' },
];

const resolveUrl = (option: ServerOption, custom: string): string => {
  if (option.key !== 'custom') return option.url;
  const raw = custom.trim();
  if (!raw) return '';
  return /^https?:\/\//.test(raw) ? raw : `http://${raw}:3000`;
};

const isValidUrl = (url: string): boolean => {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

export const KioskEndpointModal = ({ onClose }: { onClose: () => void }) => {
  const [selected, setSelected] = useState<ServerOption>(SERVER_OPTIONS[0]);
  const [custom, setCustom] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  // 전환이 안 될 때(네이티브가 재진입을 처리하지 못하는 빌드) 사용자가 '적용 중...'에 갇히지 않도록 안내
  const [stuck, setStuck] = useState(false);

  const target = resolveUrl(selected, custom);

  const handleApply = () => {
    if (!target) {
      setError('주소를 입력해 주세요.');
      return;
    }
    if (!isValidUrl(target)) {
      setError('유효한 http(s) 주소가 아닙니다. 예) 192.168.0.11 또는 http://192.168.0.11:3000');
      return;
    }
    if (typeof window.KloudEvent?.changeWebEndpoint !== 'function') {
      setError('이 기기에서는 엔드포인트를 변경할 수 없습니다.');
      return;
    }
    setError(null);
    setApplying(true);
    setStuck(false);

    // ① 네이티브에 새 엔드포인트 저장
    window.KloudEvent.changeWebEndpoint(target);

    // ② 저장만 하고 화면 전환은 웹이 트리거해야 하는 구현(앱 설정의 개발자 화면과 동일).
    //    키오스크는 splash가 아니라 키오스크 화면으로 다시 진입해야 하므로 clearAndPush(/kiosk).
    setTimeout(() => {
      kloudNav.clearAndPush(KloudScreen.Kiosk);
    }, 400);

    // ③ 그래도 전환이 없으면(구버전 네이티브 등) 안내 — 앱 재실행 필요
    setTimeout(() => setStuck(true), 3000);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center px-[5%] animate-[fadeIn_180ms_ease-out]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[24px] w-full max-w-[520px] p-[28px] flex flex-col animate-[scaleIn_180ms_ease-out]"
      >
        <p className="text-[#1E2124] font-bold" style={{ fontSize: 'min(2.4vh, 26px)' }}>서버 변경</p>
        <p className="text-[#86898C] mt-[6px]" style={{ fontSize: 'min(1.4vh, 14px)' }}>
          변경하면 앱이 새 서버로 다시 시작됩니다
        </p>

        <div className="mt-[20px] flex flex-col gap-[10px]">
          {SERVER_OPTIONS.map((option) => {
            const active = option.key === selected.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => { setSelected(option); setError(null); }}
                className={`w-full h-[56px] px-[18px] rounded-[14px] border flex items-center justify-between transition-colors ${
                  active ? 'bg-[#1E2124] border-[#1E2124]' : 'bg-[#F7F8F9] border-[#E6E8EA] active:bg-[#F2F4F6]'
                }`}
              >
                <span className={`font-bold ${active ? 'text-white' : 'text-[#1E2124]'}`} style={{ fontSize: 'min(1.7vh, 17px)' }}>
                  {option.label}
                </span>
                {active && (
                  <svg viewBox="0 0 24 24" fill="none" className="w-[20px] h-[20px]">
                    <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {selected.key === 'custom' && (
          <input
            value={custom}
            onChange={(e) => { setCustom(e.target.value); setError(null); }}
            inputMode="url"
            placeholder="192.168.0.11"
            className="mt-[12px] h-[52px] px-[16px] rounded-[14px] border border-[#E6E8EA] focus:outline-none focus:border-[#1E2124] text-[#1E2124]"
            style={{ fontSize: 'min(1.7vh, 17px)' }}
          />
        )}

        {/* 적용될 최종 주소 확인 */}
        {target && (
          <p className="mt-[12px] text-[#8A949E] break-all" style={{ fontSize: 'min(1.4vh, 14px)' }}>{target}</p>
        )}
        {error && (
          <p className="mt-[10px] text-[#E53935]" style={{ fontSize: 'min(1.4vh, 14px)' }}>{error}</p>
        )}
        {stuck && (
          <p className="mt-[10px] text-[#B58026]" style={{ fontSize: 'min(1.4vh, 14px)' }}>
            서버는 저장됐어요. 화면이 그대로면 앱을 완전히 종료하고 다시 실행해주세요.
          </p>
        )}

        <div className="mt-[24px] flex gap-[10px]">
          <button
            type="button"
            onClick={onClose}
            disabled={applying && !stuck}
            className="flex-1 h-[52px] rounded-[14px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.97] transition-transform disabled:opacity-50"
          >
            <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(1.7vh, 17px)' }}>취소</span>
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={applying}
            className="flex-[2] h-[52px] rounded-[14px] bg-[#1E2124] flex items-center justify-center active:scale-[0.97] transition-transform disabled:opacity-60"
          >
            <span className="text-white font-bold" style={{ fontSize: 'min(1.7vh, 17px)' }}>
              {applying ? '적용 중...' : '변경하고 다시 시작'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
