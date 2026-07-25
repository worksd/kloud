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
  // 지금 접속 중인 엔드포인트 = 이 웹을 서빙한 origin. 체크 표시를 여기에 맞춰야
  // '변경이 실제로 적용됐는지'를 화면에서 확인할 수 있다.
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const [selected, setSelected] = useState<ServerOption>(() => {
    const matched = SERVER_OPTIONS.find((o) => o.url && o.url === currentOrigin);
    return matched ?? SERVER_OPTIONS[2]; // 매칭 없으면 '직접 입력'
  });
  const [custom, setCustom] = useState(() => {
    const matched = SERVER_OPTIONS.find((o) => o.url && o.url === currentOrigin);
    return matched ? '' : currentOrigin;
  });
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

    // ① 네이티브에 새 엔드포인트 저장. 브릿지 구현에 따라 문자열/JSON 둘 다 받을 수 있어 순차 호출.
    //    (앱 설정 개발자 화면은 URL 문자열만 넘긴다)
    window.KloudEvent.changeWebEndpoint(target);
    try {
      window.KloudEvent.changeWebEndpoint(JSON.stringify({ endpoint: target, url: target }));
    } catch {
      // 문자열만 받는 구현이면 두 번째 호출은 무시됨
    }

    // ② 엔드포인트만 저장하고 화면 전환은 웹이 트리거해야 하는 구현 대응.
    //    refresh(endpoint)가 있으면 그걸로, 없으면 키오스크 화면으로 clearAndPush.
    setTimeout(() => {
      if (typeof window.KloudEvent?.refresh === 'function') {
        window.KloudEvent.refresh(target);
        return;
      }
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
        {/* 현재 접속 중인 주소 — 재실행 후 이 값이 바뀌어야 변경이 적용된 것 */}
        <p className="text-[#86898C] mt-[6px] break-all" style={{ fontSize: 'min(1.4vh, 14px)' }}>
          현재 접속: <span className="text-[#1E2124] font-bold">{currentOrigin || '-'}</span>
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
            화면이 그대로면 네이티브가 엔드포인트 변경을 처리하지 못한 상태입니다.
            앱을 완전히 종료하고 다시 실행해도 &apos;현재 접속&apos; 주소가 그대로면 앱 수정이 필요합니다.
            {` (bridge: changeWebEndpoint=${typeof window.KloudEvent?.changeWebEndpoint}, refresh=${typeof window.KloudEvent?.refresh})`}
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
