'use client';

import React, { useState } from 'react';
import { Locale } from '@/shared/StringResource';
import { getLocaleString } from '@/app/components/locale';
import { KioskNameKeyboard } from '@/app/kiosk/KioskNameKeyboard';

/**
 * 이름으로 수강생 검색 다이얼로그 (igin showNameSearchDialog 포팅).
 * 결제 흐름의 전화 입력 화면과 member 모드가 함께 쓴다.
 * - GET /students/search?keyword= (matchType 없음 = 이름·닉네임 LIKE), 최소 2글자
 * - onSearch가 true를 돌려주면 닫고, false면 열어둔 채 검색 상태만 푼다 (0명이면 errorMessage로 안내)
 */
type Props = {
  locale: Locale;
  /** 호출부가 검색 중 상태를 들고 있으면 넘긴다. 없으면 내부 상태로 관리 */
  errorMessage?: string | null;
  onSearch: (name: string) => Promise<boolean>;
  onClose: () => void;
  variant?: 'kiosk' | 'admin';
};

export const KioskNameSearchDialog = ({ locale, errorMessage, onSearch, onClose, variant = 'kiosk' }: Props) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const admin = variant === 'admin';
  const [name, setName] = useState('');
  const [searching, setSearching] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const trimmed = name.trim();
  const canSearch = trimmed.length >= 2 && !searching;
  const hint = errorMessage ?? localError ?? (trimmed.length === 1 ? t('kiosk_name_min_length') : null);
  const hintIsError = !!(errorMessage ?? localError);

  const submit = async () => {
    if (searching) return;
    if (trimmed.length < 2) { setLocalError(t('kiosk_name_min_length')); return; }
    setLocalError(null);
    setSearching(true);
    try {
      const done = await onSearch(trimmed);
      if (done) onClose();
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-[fadeIn_200ms_ease-out]">
      <div className="absolute inset-0 bg-black/60" onClick={() => { if (!searching) onClose(); }} />
      <div
        className={`relative w-[92%] bg-white rounded-[42px] flex flex-col px-[min(4vw,44px)] py-[min(4vw,44px)] animate-[fadeIn_200ms_ease-out] ${admin ? 'max-w-[720px]' : 'max-w-[1100px]'}`}
        style={admin ? { zoom: 0.8 } : undefined}
      >
        <p className="text-black font-bold text-center" style={{ fontSize: 'min(3vw, 32px)' }}>
          {t('kiosk_search_by_name')}
        </p>

        {/* 입력 디스플레이 — 키보드가 값 관리, 여기선 표시만 */}
        <div className="mt-[min(2.4vw,26px)] w-full bg-[#F9F9FB] rounded-[16px] px-[min(3vw,32px)] flex items-center" style={{ height: 'min(8vw, 86px)' }}>
          <span className={`font-medium truncate ${name ? 'text-black' : 'text-[#CDD1D5]'}`} style={{ fontSize: 'min(2.6vw, 28px)' }}>
            {name || t('kiosk_name_placeholder')}
          </span>
        </div>
        {hint && (
          <p className={`mt-[min(1vw,10px)] px-[min(1vw,10px)] font-medium ${hintIsError ? 'text-[#E55B5B]' : 'text-[#86898C]'}`} style={{ fontSize: 'min(1.7vw, 18px)' }}>
            {hint}
          </p>
        )}

        {/* 한글 가상 키보드 */}
        <div className="mt-[min(2vw,22px)]">
          <KioskNameKeyboard onChange={(v) => { setName(v); setLocalError(null); }} />
        </div>

        <div className="mt-[min(2.4vw,26px)] flex gap-[min(2vw,22px)]">
          <button
            onClick={onClose}
            disabled={searching}
            className="flex-[3] h-[min(9vw,98px)] rounded-[24px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.97] transition-transform disabled:opacity-60"
          >
            <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(2.6vw, 28px)' }}>{t('kiosk_back')}</span>
          </button>
          <button
            onClick={submit}
            disabled={!canSearch}
            className={`flex-[7] h-[min(9vw,98px)] rounded-[24px] flex items-center justify-center active:scale-[0.97] transition-all ${canSearch ? 'bg-[#1E2124]' : 'bg-[#CDD1D5]'}`}
          >
            {searching ? (
              <div className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="text-white font-bold" style={{ fontSize: 'min(2.6vw, 28px)' }}>{t('kiosk_search')}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
