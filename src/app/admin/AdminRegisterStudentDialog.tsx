'use client';

import { showToast } from '@/app/components/toast.host';
import React, { useEffect, useRef, useState } from 'react';
import { Locale } from '@/shared/StringResource';
import { getLocaleString } from '@/app/components/locale';
import { registerStudentAction } from '@/app/admin/students/students.action';
import { isGuinnessErrorCase } from '@/app/guinnessErrorCase';
import { formatPhone } from '@/app/forms/form.ui';

/**
 * 수강생 등록 다이얼로그 — 이름 + 전화번호로 POST /students (토큰 소속 학원에 수강생 추가).
 * 번호로 계정을 찾거나 만들며, 이미 수강생이면 기존 수강생이 그대로 온다(멱등). 기존 계정의 이름은 바꾸지 않는다.
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
    // 한국(82) 번호는 서버 규칙상 11자리
    if (ph.length !== 11) { setError(t('admin_register_phone_invalid')); return; }
    registeringRef.current = true;
    setRegistering(true);
    setError(null);
    try {
      const res = await registerStudentAction({ phone: ph, countryCode: '82', name: nm });
      if (isGuinnessErrorCase(res)) {
        // 액션이 모든 실패를 {code, message}로 정규화해 준다 — 서버 사유를 그대로 보여준다
        setError(res.message ? `${res.message} (${res.code})` : `${t('admin_register_failed')} (${res.code})`);
        return;
      }
      showToast(t('admin_register_success'));
      registeringRef.current = false;
      onRegistered?.();
      setClosing(true);
      setTimeout(() => { setClosing(false); onClose(); }, 200);
    } catch (e) {
      // 여기까지 오는 건 서버 액션 호출 자체의 실패(네트워크·Next 액션 오류) — 사유를 붙인다
      const reason = e instanceof Error ? e.message : String(e);
      setError(`${t('admin_register_failed')} (${reason})`);
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
          value={formatPhone(phone)}
          onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 11)); setError(null); }}
          placeholder={'010-1234-5678'}
          maxLength={13}
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
