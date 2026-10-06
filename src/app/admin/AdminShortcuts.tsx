'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Banknote, QrCode, UserRoundCheck } from 'lucide-react';
import { kloudNav } from '@/app/lib/kloudNav';
import { KloudScreen } from '@/shared/kloud.screen';
import { Locale } from '@/shared/StringResource';
import { getLocaleString } from '@/app/components/locale';

// 관리자 홈 숏컷 줄 — 출석 체크(오늘 수업 → 수업별 출석 QR 화면, 중앙 다이얼로그),
// 현장결제(/admin/onsite-payment 페이지로 push), 키오스크 로그인(카메라로 키오스크 QR 스캔 → /kiosk-login).
// 수강생 등록은 '수강생' 탭으로 옮겼다.
// 결제 내역은 '매출' 탭으로 옮겨서 여기서 뺐다.
// 키오스크 로그인은 QR 로그인(SSE) 가이드(2026-10-04) 방향 — 키오스크가 QR을 띄우고 이 폰이 찍어 승인한다.
// 예전의 '관리자 토큰을 QR로 띄워 키오스크가 읽는' 방식은 폐기.

export type AdminSheetLesson = {
  id: number;
  title: string;
  thumbnailUrl?: string;
  /** 예: '오후 7:00 – 8:00' — 서버에서 locale에 맞게 포맷해 내려준다 */
  timeLabel?: string;
  /** 예: '강사 · 룸' */
  subLabel?: string;
  /** 현장결제 기본 금액 — 정책 수업이면 선택한 정책 가격으로 대체 */
  price?: number;
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

export function AdminShortcuts({ lessons, locale }: {
  lessons: AdminSheetLesson[];
  locale: Locale;
}) {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });

  // 출석 체크 — 오늘 수업 목록 다이얼로그 (수강생 등록·키오스크 QR과 같은 연출)
  const [attOpen, setAttOpen] = useState(false);
  const [attClosing, setAttClosing] = useState(false);

  const openAttendance = () => setAttOpen(true);
  const closeAttendance = () => {
    if (attClosing) return;
    setAttClosing(true);
    setTimeout(() => { setAttOpen(false); setAttClosing(false); }, 200);
  };

  const onLesson = (id: number) => {
    closeAttendance();
    kloudNav.push(KloudScreen.QRScanWithLesson(id));
  };

  return (
    <>
      <div className={'flex gap-1 px-2'}>
        <Shortcut
          icon={<UserRoundCheck size={24} strokeWidth={1.5} style={{ color: ICON_INK }}/>}
          label={t('admin_home_shortcut_attendance')}
          onClick={openAttendance}
        />
        <Shortcut
          icon={<Banknote size={24} strokeWidth={1.5} style={{ color: ICON_INK }}/>}
          label={t('admin_home_shortcut_onsite')}
          onClick={() => kloudNav.push(KloudScreen.AdminOnsitePayment)}
        />
        <Shortcut
          icon={<QrCode size={24} strokeWidth={1.5} style={{ color: ICON_INK }}/>}
          label={t('admin_home_shortcut_kiosk_login')}
          onClick={() => kloudNav.push(KloudScreen.KioskLogin)}
        />
      </div>

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
    </>
  );
}
