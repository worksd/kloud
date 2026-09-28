'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Locale } from '@/shared/StringResource';
import { getLocaleString } from '@/app/components/locale';
import { generateRandomNickname } from '@/utils/random.nickname';
import { registerKioskUserAction } from '@/app/kiosk/kiosk.actions';
import { isGuinnessErrorCase } from '@/app/guinnessErrorCase';

/**
 * 수강생 등록 다이얼로그 — 이름 + 전화번호, 닉네임은 키오스크처럼 랜덤 생성.
 * 관리자 홈 숏컷과 수강생 탭이 같이 쓴다. 열릴 때 fadeIn+scaleIn, 닫힐 때 fadeOut.
 * 등록 중에는 닫히지 않는다(중복 요청/미완료 상태 방지).
 */
export function AdminRegisterStudentDialog({ open, locale, onClose, onRegistered }: {
  open: boolean;
  locale: Locale;
  onClose: () => void;
  /** 등록 성공 직후 — 목록 새로고침 등 */
  onRegistered?: () => void;
}) {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });

  const [closing, setClosing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const registeringRef = useRef(false);

  // 열릴 때마다 입력 초기화
  useEffect(() => {
    if (open) { setName(''); setPhone(''); setError(null); setClosing(false); }
  }, [open]);

  const close = () => {
    if (registeringRef.current || closing) return;
    setClosing(true);
    setTimeout(() => { setClosing(false); onClose(); }, 200);
  };

  const submit = async () => {
    if (registeringRef.current) return;
    const nm = name.trim();
    const ph = phone.replace(/\D/g, '');
    if (!nm) { setError(t('admin_register_name_required')); return; }
    if (ph.length < 10 || ph.length > 11) { setError(t('admin_register_phone_invalid')); return; }
    registeringRef.current = true;
    setRegistering(true);
    setError(null);
    try {
      // 키오스크 신규 가입과 동일 — phone-login(isAdmin)으로 유저 생성 후 랜덤 닉네임 + 입력한 이름 저장
      const res = await registerKioskUserAction(ph, '82', generateRandomNickname(), nm);
      if (isGuinnessErrorCase(res)) {
        setError(res.message || t('admin_register_failed'));
        return;
      }
      window.KloudEvent?.showToast?.(t('admin_register_success'));
      registeringRef.current = false;
      onRegistered?.();
      setClosing(true);
      setTimeout(() => { setClosing(false); onClose(); }, 200);
    } catch {
      setError(t('admin_register_failed'));
    } finally {
      registeringRef.current = false;
      setRegistering(false);
    }
  };

  if (!open) return null;

  const inputCls = 'mt-1.5 w-full rounded-[12px] border border-[#E5E7EB] px-3.5 py-3 text-[15px] text-black placeholder-[#B1B8BE] outline-none focus:border-[#1E2124] disabled:opacity-60';

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-center justify-center px-8 ${
        closing ? 'animate-[fadeOut_200ms_ease-out_forwards]' : 'animate-[fadeIn_200ms_ease-out]'
      }`}
      onClick={close}
    >
      <div className={'absolute inset-0 bg-black/40'}/>
      <div
        className={'relative w-full max-w-[380px] bg-white rounded-[24px] p-6 animate-[scaleIn_260ms_ease-out]'}
        onClick={(e) => e.stopPropagation()}
      >
        <p className={'text-[17px] font-bold text-black mb-4'}>{t('admin_register_title')}</p>
        <p className={'text-[13px] font-semibold text-black'}>{t('admin_register_name_label')}</p>
        <input
          type={'text'}
          value={name}
          onChange={(e) => { setName(e.target.value); setError(null); }}
          placeholder={t('admin_register_name_placeholder')}
          disabled={registering}
          className={inputCls}
        />
        <p className={'mt-4 text-[13px] font-semibold text-black'}>{t('admin_register_phone_label')}</p>
        <input
          type={'tel'}
          inputMode={'numeric'}
          value={phone}
          onChange={(e) => { setPhone(e.target.value.replace(/[^\d]/g, '')); setError(null); }}
          placeholder={'01012345678'}
          maxLength={11}
          disabled={registering}
          className={inputCls}
        />
        {error && <p className={'mt-2 text-[13px] text-[#E55B5B] font-medium'}>{error}</p>}
        <div className={'mt-5 flex gap-2.5'}>
          <button
            type={'button'}
            onClick={close}
            disabled={registering}
            className={'flex-1 h-[50px] rounded-[14px] bg-[#F2F4F6] text-[15px] font-semibold text-[#1E2124] active:scale-[0.98] transition-transform disabled:opacity-60'}
          >
            {t('cancel')}
          </button>
          <button
            type={'button'}
            onClick={submit}
            disabled={registering}
            className={'flex-[1.4] h-[50px] rounded-[14px] bg-[#1E2124] text-[15px] font-bold text-white active:scale-[0.98] transition-transform disabled:opacity-60'}
          >
            {registering ? `${t('admin_register_submit')}…` : t('admin_register_submit')}
          </button>
        </div>
      </div>
    </div>
  );
}
