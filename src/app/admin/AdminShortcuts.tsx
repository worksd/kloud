'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CreditCard, UserCheck, UserPlus } from 'lucide-react';
import { kloudNav } from '@/app/lib/kloudNav';
import { KloudScreen } from '@/shared/kloud.screen';
import { Locale } from '@/shared/StringResource';
import { getLocaleString } from '@/app/components/locale';
import { generateRandomNickname } from '@/utils/random.nickname';
import { registerKioskUserAction } from '@/app/kiosk/kiosk.actions';
import { isGuinnessErrorCase } from '@/app/guinnessErrorCase';
import { AdminPaymentsSheetContent } from '@/app/admin/AdminPaymentsSheet';
import { BottomSheet, BottomSheetHandle } from '@/app/components/BottomSheet';

// 관리자 홈 숏컷 줄 — 셋 다 바텀시트: 출석 체크(오늘 수업 → 수업별 출석 QR 화면),
// 결제 내역(목록+결제 취소), 수강생 등록(이름+전화번호, 닉네임은 키오스크처럼 랜덤).

export type AdminSheetLesson = {
  id: number;
  title: string;
  thumbnailUrl?: string;
  /** 예: '오후 7:00 – 8:00' — 서버에서 locale에 맞게 포맷해 내려준다 */
  timeLabel?: string;
  /** 예: '강사 · 룸' */
  subLabel?: string;
};

const Shortcut = ({ icon, iconBg, label, onClick }: {
  icon: React.ReactNode;
  /** 아이콘 뒤 원 배경색 */
  iconBg: string;
  label: string;
  onClick: () => void;
}) => (
  <button
    type={'button'}
    onClick={onClick}
    className={'flex-1 min-w-0 flex flex-col items-center gap-2.5 rounded-[16px] bg-[#F7F8F9] py-4 px-2 active:bg-[#F1F3F6] transition-colors'}
  >
    <span
      className={'w-[44px] h-[44px] rounded-full flex items-center justify-center'}
      style={{ backgroundColor: iconBg }}
    >
      {icon}
    </span>
    <span className={'text-[13px] font-semibold text-[#1E2124] text-center leading-tight'}>{label}</span>
  </button>
);

export function AdminShortcuts({ lessons, locale }: {
  lessons: AdminSheetLesson[];
  locale: Locale;
}) {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });

  const [openSheet, setOpenSheet] = useState<'attendance' | 'register' | 'payments' | null>(null);
  const sheetRef = useRef<BottomSheetHandle>(null);

  // 수강생 등록 폼
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const registeringRef = useRef(false);

  const closeSheet = () => setOpenSheet(null);

  const openRegister = () => {
    setRegName('');
    setRegPhone('');
    setRegError(null);
    setOpenSheet('register');
  };

  const onLesson = (id: number) => {
    sheetRef.current?.close();
    kloudNav.push(KloudScreen.QRScanWithLesson(id));
  };

  const submitRegister = async () => {
    if (registeringRef.current) return;
    const name = regName.trim();
    const phone = regPhone.replace(/\D/g, '');
    if (!name) { setRegError(t('admin_register_name_required')); return; }
    if (phone.length < 10 || phone.length > 11) { setRegError(t('admin_register_phone_invalid')); return; }
    registeringRef.current = true;
    setRegistering(true);
    setRegError(null);
    try {
      // 키오스크 신규 가입과 동일 — phone-login(isAdmin)으로 유저 생성 후 랜덤 닉네임 + 입력한 이름 저장
      const res = await registerKioskUserAction(phone, '82', generateRandomNickname(), name);
      if (isGuinnessErrorCase(res)) {
        setRegError(res.message || t('admin_register_failed'));
        return;
      }
      window.KloudEvent?.showToast?.(t('admin_register_success'));
      sheetRef.current?.close();
    } catch {
      setRegError(t('admin_register_failed'));
    } finally {
      registeringRef.current = false;
      setRegistering(false);
    }
  };

  const inputCls = 'mt-1.5 w-full rounded-[12px] border border-[#E5E7EB] px-3.5 py-3 text-[15px] text-black placeholder-[#B1B8BE] outline-none focus:border-[#1E2124] disabled:opacity-60';

  return (
    <>
      <div className={'flex gap-2.5 px-5 pb-2'}>
        <Shortcut
          icon={<UserCheck size={22} strokeWidth={2.2} className={'text-[#2E7D32]'}/>}
          iconBg={'#E8F5E9'}
          label={t('admin_home_shortcut_attendance')}
          onClick={() => setOpenSheet('attendance')}
        />
        <Shortcut
          icon={<CreditCard size={22} strokeWidth={2.2} className={'text-[#1A5CE5]'}/>}
          iconBg={'#E8F0FE'}
          label={t('admin_home_shortcut_payments')}
          onClick={() => setOpenSheet('payments')}
        />
        <Shortcut
          icon={<UserPlus size={22} strokeWidth={2.2} className={'text-[#7C3AED]'}/>}
          iconBg={'#F1E9FE'}
          label={t('admin_home_shortcut_register')}
          onClick={openRegister}
        />
      </div>

      {/* 오늘 수업 — 탭하면 그 수업의 출석 QR 화면 */}
      {openSheet === 'attendance' && (
        <BottomSheet ref={sheetRef} title={t('admin_home_sheet_title')} onClose={closeSheet}>
          {lessons.length === 0 ? (
            <p className={'px-6 py-12 text-center text-[14px] text-[#8B95A1]'}>{t('kiosk_lesson_attendance_no_lessons')}</p>
          ) : (
            <ul className={'flex-1 min-h-0 overflow-y-auto px-4 flex flex-col gap-1'}>
              {lessons.map((l) => (
                <li key={l.id}>
                  <button
                    type={'button'}
                    onClick={() => onLesson(l.id)}
                    className={'w-full flex items-center gap-3.5 px-2 py-2.5 rounded-[14px] active:bg-[#F7F8F9] transition-colors text-left'}
                  >
                    <div className={'w-[56px] h-[70px] rounded-[10px] overflow-hidden bg-[#F1F3F6] shrink-0 relative'}>
                      {l.thumbnailUrl ? (
                        <Image src={l.thumbnailUrl} alt={''} fill sizes={'56px'} className={'object-cover'}/>
                      ) : (
                        <div className={'w-full h-full flex items-center justify-center text-[22px]'}>🕺</div>
                      )}
                    </div>
                    <div className={'flex-1 min-w-0 flex flex-col gap-[3px]'}>
                      {l.timeLabel && (
                        <span className={'text-[12px] font-bold text-[#4E5968]'}>{l.timeLabel}</span>
                      )}
                      <span className={'text-[15px] font-bold text-black leading-snug line-clamp-1'}>{l.title}</span>
                      {l.subLabel && (
                        <span className={'text-[12px] text-[#8B95A1] truncate'}>{l.subLabel}</span>
                      )}
                    </div>
                    <svg width={'18'} height={'18'} viewBox={'0 0 24 24'} fill={'none'} className={'shrink-0'}>
                      <path d={'M9 6l6 6-6 6'} stroke={'#B1B8BE'} strokeWidth={'2'} strokeLinecap={'round'} strokeLinejoin={'round'}/>
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </BottomSheet>
      )}

      {/* 결제 내역 — 목록 + 결제 취소 (열릴 때 fetch) */}
      {openSheet === 'payments' && (
        <BottomSheet ref={sheetRef} title={t('admin_payments_title')} onClose={closeSheet}>
          <AdminPaymentsSheetContent locale={locale}/>
        </BottomSheet>
      )}

      {/* 수강생 등록 — 이름 + 전화번호, 닉네임은 랜덤 생성 */}
      {openSheet === 'register' && (
        <BottomSheet ref={sheetRef} title={t('admin_register_title')} onClose={closeSheet} locked={registering}>
          <div className={'px-6'}>
            <p className={'text-[13px] font-semibold text-black'}>{t('admin_register_name_label')}</p>
            <input
              type={'text'}
              value={regName}
              onChange={(e) => { setRegName(e.target.value); setRegError(null); }}
              placeholder={t('admin_register_name_placeholder')}
              disabled={registering}
              className={inputCls}
            />
            <p className={'mt-4 text-[13px] font-semibold text-black'}>{t('admin_register_phone_label')}</p>
            <input
              type={'tel'}
              inputMode={'numeric'}
              value={regPhone}
              onChange={(e) => { setRegPhone(e.target.value.replace(/[^\d]/g, '')); setRegError(null); }}
              placeholder={'01012345678'}
              maxLength={11}
              disabled={registering}
              className={inputCls}
            />
            {regError && <p className={'mt-2 text-[13px] text-[#E55B5B] font-medium'}>{regError}</p>}
            <button
              type={'button'}
              onClick={submitRegister}
              disabled={registering}
              className={'mt-5 w-full h-[52px] rounded-[14px] bg-[#1E2124] text-[16px] font-bold text-white active:scale-[0.98] transition-transform disabled:opacity-60'}
            >
              {registering ? `${t('admin_register_submit')}…` : t('admin_register_submit')}
            </button>
          </div>
        </BottomSheet>
      )}
    </>
  );
}
