'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { QrCode, UserRoundCheck, UserRoundPlus } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { kloudNav } from '@/app/lib/kloudNav';
import { KloudScreen } from '@/shared/kloud.screen';
import { Locale } from '@/shared/StringResource';
import { getLocaleString } from '@/app/components/locale';
import { generateRandomNickname } from '@/utils/random.nickname';
import { registerKioskUserAction } from '@/app/kiosk/kiosk.actions';
import { isGuinnessErrorCase } from '@/app/guinnessErrorCase';

// 관리자 홈 숏컷 줄 — 출석 체크(오늘 수업 → 수업별 출석 QR 화면, 중앙 다이얼로그),
// 수강생 등록(이름+전화번호 다이얼로그. 닉네임은 키오스크처럼 랜덤), 키오스크 로그인(QR 다이얼로그).
// 결제 내역은 '매출' 탭으로 옮겨서 여기서 뺐다.
// 키오스크 로그인 QR 형식: `${origin}/kiosk?token=<관리자 accessToken>` — KioskBootstrap이
// urlToken을 저장하고 그대로 로그인하는 기존 플로우라, 키오스크에서 이 URL을 열거나 스캔하면 끝.

export type AdminSheetLesson = {
  id: number;
  title: string;
  thumbnailUrl?: string;
  /** 예: '오후 7:00 – 8:00' — 서버에서 locale에 맞게 포맷해 내려준다 */
  timeLabel?: string;
  /** 예: '강사 · 룸' */
  subLabel?: string;
};

// 바텀 탭 아이콘과 같은 언어 — 24px 그리드, stroke 1.5, 단색 #1F1F1F, 중성 타일.
// 알록달록한 파스텔 타일은 탭바·관리자 화면 톤과 겉돌아서 뺐다.
const ICON_INK = '#1F1F1F';

const Shortcut = ({ icon, label, onClick }: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <button
    type={'button'}
    onClick={onClick}
    className={'flex-1 min-w-0 flex flex-col items-center gap-2.5 rounded-[16px] py-3 px-1.5 active:opacity-70 transition-opacity'}
  >
    <span className={'w-[50px] h-[50px] rounded-[17px] bg-[#F4F5F7] flex items-center justify-center'}>
      {icon}
    </span>
    <span className={'text-[12.5px] font-semibold text-[#4E5968] text-center leading-tight'}>{label}</span>
  </button>
);

export function AdminShortcuts({ lessons, locale, kioskToken }: {
  lessons: AdminSheetLesson[];
  locale: Locale;
  /** 키오스크 로그인 QR에 실을 관리자 accessToken */
  kioskToken?: string;
}) {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });

  // 출석 체크 — 오늘 수업 목록 다이얼로그 (수강생 등록·키오스크 QR과 같은 연출)
  const [attOpen, setAttOpen] = useState(false);
  const [attClosing, setAttClosing] = useState(false);

  // 키오스크 로그인 QR 다이얼로그 — 열릴 때 fadeIn+scaleIn, 닫힐 때 fadeOut
  const [qrOpen, setQrOpen] = useState(false);
  const [qrClosing, setQrClosing] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const openKioskQr = () => {
    if (!kioskToken) return;
    setQrUrl(`${window.location.origin}/kiosk?token=${encodeURIComponent(kioskToken)}`);
    setQrOpen(true);
  };
  const closeKioskQr = () => {
    if (qrClosing) return;
    setQrClosing(true);
    setTimeout(() => { setQrOpen(false); setQrClosing(false); }, 200);
  };

  // 수강생 등록 — 바텀시트가 아니라 중앙 다이얼로그(키오스크 QR 다이얼로그와 같은 연출)
  const [regOpen, setRegOpen] = useState(false);
  const [regClosing, setRegClosing] = useState(false);
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const registeringRef = useRef(false);

  const openAttendance = () => setAttOpen(true);
  const closeAttendance = () => {
    if (attClosing) return;
    setAttClosing(true);
    setTimeout(() => { setAttOpen(false); setAttClosing(false); }, 200);
  };

  const openRegister = () => {
    setRegName('');
    setRegPhone('');
    setRegError(null);
    setRegOpen(true);
  };

  // 등록 중에는 닫히지 않게 — 중복 요청/미완료 상태 방지
  const closeRegister = () => {
    if (registeringRef.current || regClosing) return;
    setRegClosing(true);
    setTimeout(() => { setRegOpen(false); setRegClosing(false); }, 200);
  };

  const onLesson = (id: number) => {
    closeAttendance();
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
      registeringRef.current = false;
      setRegClosing(true);
      setTimeout(() => { setRegOpen(false); setRegClosing(false); }, 200);
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
      <div className={'flex gap-1 px-2'}>
        <Shortcut
          icon={<UserRoundCheck size={24} strokeWidth={1.5} style={{ color: ICON_INK }}/>}
          label={t('admin_home_shortcut_attendance')}
          onClick={openAttendance}
        />
        <Shortcut
          icon={<UserRoundPlus size={24} strokeWidth={1.5} style={{ color: ICON_INK }}/>}
          label={t('admin_home_shortcut_register')}
          onClick={openRegister}
        />
        <Shortcut
          icon={<QrCode size={24} strokeWidth={1.5} style={{ color: ICON_INK }}/>}
          label={t('admin_home_shortcut_kiosk_login')}
          onClick={openKioskQr}
        />
      </div>

      {/* 키오스크 로그인 QR — 키오스크 카메라/스캐너로 스캔 */}
      {qrOpen && (
        <div
          className={`fixed inset-0 z-[70] flex items-center justify-center px-8 ${
            qrClosing ? 'animate-[fadeOut_200ms_ease-out_forwards]' : 'animate-[fadeIn_200ms_ease-out]'
          }`}
          onClick={closeKioskQr}
        >
          <div className={'absolute inset-0 bg-black/40'}/>
          <div
            className={'relative w-full max-w-[360px] bg-white rounded-[24px] p-6 flex flex-col items-center animate-[scaleIn_260ms_ease-out]'}
            onClick={(e) => e.stopPropagation()}
          >
            <p className={'text-[17px] font-bold text-black'}>{t('admin_kiosk_login_title')}</p>
            <p className={'mt-1.5 text-[13px] leading-relaxed text-[#8B95A1] text-center whitespace-pre-line'}>
              {t('admin_kiosk_login_desc')}
            </p>
            <div className={'mt-5 p-4 rounded-[16px] border border-[#F1F3F6] bg-white'}>
              <QRCodeCanvas value={qrUrl} size={220}/>
            </div>
            <p className={'mt-3 text-[11px] text-[#B1B8BE] text-center'}>{t('admin_kiosk_login_caution')}</p>
            <button
              type={'button'}
              onClick={closeKioskQr}
              className={'mt-4 w-full h-[48px] rounded-[12px] bg-[#1E2124] text-[15px] font-bold text-white active:scale-[0.98] transition-transform'}
            >
              {t('kiosk_confirm')}
            </button>
          </div>
        </div>
      )}

      {/* 출석 체크 — 오늘 수업 목록, 탭하면 그 수업의 출석 QR 화면 */}
      {attOpen && (
        <div
          className={`fixed inset-0 z-[70] flex items-center justify-center px-6 ${
            attClosing ? 'animate-[fadeOut_200ms_ease-out_forwards]' : 'animate-[fadeIn_200ms_ease-out]'
          }`}
          onClick={closeAttendance}
        >
          <div className={'absolute inset-0 bg-black/40'}/>
          <div
            className={'relative w-full max-w-[380px] max-h-[72vh] bg-white rounded-[24px] pt-6 pb-4 flex flex-col animate-[scaleIn_260ms_ease-out]'}
            onClick={(e) => e.stopPropagation()}
          >
            <p className={'px-6 text-[17px] font-bold text-black'}>{t('admin_home_sheet_title')}</p>
            {lessons.length === 0 ? (
              <p className={'px-6 py-12 text-center text-[14px] text-[#8B95A1]'}>{t('kiosk_lesson_attendance_no_lessons')}</p>
            ) : (
              <ul className={'mt-3 flex-1 min-h-0 overflow-y-auto px-3 flex flex-col gap-1'}>
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
            <div className={'px-6 pt-3'}>
              <button
                type={'button'}
                onClick={closeAttendance}
                className={'w-full h-[48px] rounded-[12px] bg-[#F2F4F6] text-[15px] font-semibold text-[#1E2124] active:scale-[0.98] transition-transform'}
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 수강생 등록 — 이름 + 전화번호, 닉네임은 랜덤 생성 */}
      {regOpen && (
        <div
          className={`fixed inset-0 z-[70] flex items-center justify-center px-8 ${
            regClosing ? 'animate-[fadeOut_200ms_ease-out_forwards]' : 'animate-[fadeIn_200ms_ease-out]'
          }`}
          onClick={closeRegister}
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
            <div className={'mt-5 flex gap-2.5'}>
              <button
                type={'button'}
                onClick={closeRegister}
                disabled={registering}
                className={'flex-1 h-[50px] rounded-[14px] bg-[#F2F4F6] text-[15px] font-semibold text-[#1E2124] active:scale-[0.98] transition-transform disabled:opacity-60'}
              >
                {t('cancel')}
              </button>
              <button
                type={'button'}
                onClick={submitRegister}
                disabled={registering}
                className={'flex-[1.4] h-[50px] rounded-[14px] bg-[#1E2124] text-[15px] font-bold text-white active:scale-[0.98] transition-transform disabled:opacity-60'}
              >
                {registering ? `${t('admin_register_submit')}…` : t('admin_register_submit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
