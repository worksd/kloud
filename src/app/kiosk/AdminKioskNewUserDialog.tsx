'use client';

import React, {useState} from 'react';
import {Locale} from '@/shared/StringResource';
import {getLocaleString} from '@/app/components/locale';
import {KioskNameKeyboard} from '@/app/kiosk/KioskNameKeyboard';

type Props = {
  phone: string;
  locale: Locale;
  onConfirm: (name: string) => void;
  onCancel: () => void;
};

const formatPhone = (digits: string) => {
  const d = digits.replace(/\D/g, '');
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)} ${d.slice(3)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 7)} ${d.slice(7)}`;
};

// admin(상담실) 신규 회원 등록 — 무인 KioskNewUserDialog와 별개.
// 직원이 회원의 이름을 직접 입력해서 등록한다.
export const AdminKioskNewUserDialog = ({phone, locale, onConfirm, onCancel}: Props) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({locale, key});
  const [name, setName] = useState('');
  const canConfirm = name.trim().length > 0;

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center px-[5%] animate-[fadeIn_200ms_ease-out]">
      <div className="bg-white rounded-[28px] w-full max-w-[720px] p-[32px] flex flex-col animate-[scaleIn_200ms_ease-out]">
        <p className="text-[#86898C] font-medium mb-[6px] text-[18px]">{t('kiosk_new_user_notice')}</p>
        <p className="text-black font-bold text-[26px] leading-snug">{t('kiosk_new_user_title')}</p>

        {/* 전화번호 */}
        <div className="mt-[18px] bg-[#F9F9FB] rounded-[16px] px-[20px] py-[14px] flex items-center justify-between">
          <span className="text-[#86898C] text-[16px]">{t('kiosk_label_phone')}</span>
          <span className="text-black font-bold text-[20px]">{formatPhone(phone)}</span>
        </div>

        {/* 이름 입력 */}
        <p className="text-gray-400 text-[16px] mt-[20px] mb-[8px]">{t('kiosk_label_name')}</p>
        <div className="h-[64px] rounded-[14px] border-2 border-gray-200 flex items-center px-[20px] mb-[14px]">
          <span className={`text-[24px] font-medium truncate ${name ? 'text-black' : 'text-gray-300'}`}>
            {name || t('kiosk_admin_new_user_name_placeholder')}
          </span>
        </div>

        <KioskNameKeyboard onChange={setName}/>

        {/* 버튼 */}
        <div className="mt-[20px] flex gap-[12px]">
          <button
            onClick={onCancel}
            className="flex-1 h-[64px] rounded-[16px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.97] transition-transform"
          >
            <span className="text-[#1E2124] font-bold text-[22px]">{t('kiosk_cancel')}</span>
          </button>
          <button
            onClick={() => { if (canConfirm) onConfirm(name.trim()); }}
            disabled={!canConfirm}
            className={`flex-[2] h-[64px] rounded-[16px] flex items-center justify-center active:scale-[0.97] transition-transform ${canConfirm ? 'bg-[#1E2124]' : 'bg-[#CDD1D5]'}`}
          >
            <span className="text-white font-bold text-[22px]">{t('kiosk_confirm')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
