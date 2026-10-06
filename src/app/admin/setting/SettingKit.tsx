'use client';

import { showToast } from '@/app/components/toast.host';
import React, { useState } from 'react';
import { AdminDetailHeader } from '@/app/admin/AdminDetailHeader';
import { UpdateStudioRequest } from '@/app/endpoint/studio.endpoint';
import { updateStudioAction } from '@/app/admin/setting/studio.setting.action';

// 관리자 설정 하위 화면 공용 부품 — 카드/필드/토글/저장 바. 각 화면은 자기 필드만 모아 PATCH 한다.

export const inputCls =
  'w-full rounded-[12px] border border-[#E5E7EB] bg-white px-3.5 py-3 text-[15px] text-black placeholder-[#B1B8BE] outline-none focus:border-[#1E2124] disabled:opacity-60';

export function Card({ title, desc, children }: { title?: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className={'mx-4 mt-3 rounded-2xl bg-white border border-[#EEF0F2] px-4 py-4'}>
      {title && <h2 className={'text-[15px] font-bold text-[#191F28]'}>{title}</h2>}
      {desc && <p className={'mt-0.5 text-[12.5px] text-[#8B95A1] leading-relaxed'}>{desc}</p>}
      <div className={`${title || desc ? 'mt-3' : ''} flex flex-col gap-3.5`}>{children}</div>
    </section>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className={'block'}>
      <span className={'block text-[13px] font-semibold text-[#191F28]'}>{label}</span>
      <div className={'mt-1.5'}>{children}</div>
      {hint && <span className={'block mt-1 text-[11.5px] text-[#8B95A1] leading-relaxed'}>{hint}</span>}
    </label>
  );
}

export function TextInput({ value, onChange, placeholder, type = 'text', inputMode, maxLength, disabled }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      inputMode={inputMode}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      disabled={disabled}
      className={inputCls}
    />
  );
}

/** 숫자 입력 — 빈 값은 ''로 두고 저장 시 각 화면이 해석한다 */
export function NumberInput({ value, onChange, placeholder, suffix, disabled, min = 0 }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suffix?: string;
  disabled?: boolean;
  min?: number;
}) {
  return (
    <div className={'flex items-center gap-2'}>
      <input
        type={'number'}
        inputMode={'numeric'}
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ''))}
        placeholder={placeholder}
        disabled={disabled}
        className={`${inputCls} flex-1 min-w-0`}
      />
      {suffix && <span className={'shrink-0 text-[14px] font-semibold text-[#4E5968]'}>{suffix}</span>}
    </div>
  );
}

/**
 * 시각 입력 — 서버는 HH:mm 만 받는다. 삼성 WebView 가 로케일 포맷으로 내려주는 사고(date input 과 같은 계열)를
 * 막기 위해 숫자만 뽑아 HH:mm 으로 다시 조립한다. 못 읽으면 '' 로.
 */
export const normalizeTime = (raw: string): string => {
  const m = raw.match(/(\d{1,2})\D+(\d{2})/);
  if (!m) return '';
  const h = Math.min(23, Number(m[1]));
  return `${String(h).padStart(2, '0')}:${m[2]}`;
};

export function TimeInput({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <input
      type={'time'}
      value={value}
      onChange={(e) => onChange(normalizeTime(e.target.value))}
      disabled={disabled}
      className={inputCls}
    />
  );
}

export function Toggle({ label, desc, checked, onChange, disabled }: {
  label: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type={'button'}
      role={'switch'}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={'w-full flex items-center gap-3 text-left disabled:opacity-60'}
    >
      <span className={'flex-1 min-w-0'}>
        <span className={'block text-[14.5px] font-semibold text-[#191F28]'}>{label}</span>
        {desc && <span className={'block mt-0.5 text-[12px] text-[#8B95A1] leading-relaxed'}>{desc}</span>}
      </span>
      <span className={`relative shrink-0 w-[46px] h-[28px] rounded-full transition-colors ${checked ? 'bg-[#1E2124]' : 'bg-[#D1D6DB]'}`}>
        <span className={`absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white shadow transition-all ${checked ? 'left-[21px]' : 'left-[3px]'}`}/>
      </span>
    </button>
  );
}

/** 2~3개 중 하나 고르기 */
export function Segmented<T extends string>({ value, options, onChange, disabled }: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className={'flex gap-1.5 flex-wrap'}>
      {options.map((o) => (
        <button
          key={o.value}
          type={'button'}
          disabled={disabled}
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`h-[34px] px-3.5 rounded-full text-[13px] font-semibold transition-colors disabled:opacity-60 ${
            value === o.value ? 'bg-[#1F1F1F] text-white' : 'bg-white text-[#4E5968] border border-[#EEF0F2] active:bg-[#F4F5F7]'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** 하단 고정 저장 바 + 저장 상태 관리 */
export function useSave() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const save = async (body: UpdateStudioRequest, onOk?: () => void) => {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await updateStudioAction(body);
      if (!res.ok) { setError(res.message); return; }
      showToast('저장했어요');
      onOk?.();
    } finally {
      setSaving(false);
    }
  };
  return { saving, error, save, setError };
}

export function SaveBar({ saving, error, onSave, disabled }: { saving: boolean; error: string | null; onSave: () => void; disabled?: boolean }) {
  return (
    <div className={'fixed left-0 right-0 bottom-0 z-30 bg-white/95 backdrop-blur-sm border-t border-[#EDEFF2] px-4 pt-3'} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}>
      {error && <p className={'mb-2 text-[13px] text-[#E55B5B] font-medium'}>{error}</p>}
      <button
        type={'button'}
        onClick={onSave}
        disabled={saving || disabled}
        className={'w-full h-[50px] rounded-[14px] bg-[#1E2124] text-[15px] font-bold text-white active:scale-[0.98] transition-transform disabled:opacity-50'}
      >
        {saving ? '저장 중…' : '저장'}
      </button>
    </div>
  );
}

/** 설정 하위 화면 껍데기 — 상세 헤더 + 하단 저장 바 여백 */
export function SettingShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className={'w-full min-h-screen overflow-x-clip bg-[#F7F8FA] pb-32'}>
      {/* 가로 스크롤 차단은 AdminDetailHeader 안의 AdminNoHorizontalScroll 이 맡는다 */}
      <AdminDetailHeader title={title} subtitle={subtitle}/>
      {children}
    </div>
  );
}

export function LoadFailed({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <SettingShell title={title} subtitle={subtitle}>
      <p className={'px-8 pt-16 text-center text-[15px] text-[#6B7280]'}>설정을 불러오지 못했어요.{'\n'}원장 계정으로 로그인했는지 확인해주세요.</p>
    </SettingShell>
  );
}
