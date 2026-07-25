'use client';

import React, {useRef} from 'react';
import {Locale} from '@/shared/StringResource';
import {getLocaleString} from '@/app/components/locale';
import {kioskImageSrc} from '@/app/kiosk/kiosk.image';

type AdminKioskHomeFormProps = {
  studioName: string;
  studioImageUrl?: string;
  locale: Locale;
  canCheckIn: boolean;
  canPurchase: boolean;
  canBookRoom?: boolean;
  canLessonAttendance?: boolean;
  onSelectPayment: () => void;
  onSelectVisit: () => void;
  onSelectBookRoom: () => void;
  onSelectLessonAttendance: () => void;
  onAdminMode: () => void;
};

// 상담실 태블릿(admin) 홈 — 직원이 회원을 앞에 앉혀놓고 진행하는 UI.
// 무인 키오스크(KioskHomeForm)와 달리 큰 이미지 없이, 인사 문구 + 액션 카드 그리드로 구성.
export const AdminKioskHomeForm = ({
  studioName,
  studioImageUrl,
  locale,
  canCheckIn,
  canPurchase,
  canBookRoom = false,
  canLessonAttendance = false,
  onSelectPayment,
  onSelectVisit,
  onSelectBookRoom,
  onSelectLessonAttendance,
  onAdminMode,
}: AdminKioskHomeFormProps) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({locale, key});

  // 스튜디오명 5번 연속 탭 → 관리자 모드 (무인 홈과 동일 제스처)
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSecretTap = () => {
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0;
      onAdminMode();
      return;
    }
    tapTimerRef.current = setTimeout(() => { tapCountRef.current = 0; }, 1500);
  };

  const cards = [
    {
      key: 'payment',
      show: canPurchase,
      onClick: onSelectPayment,
      title: t('kiosk_payment_title'),
      desc: t('kiosk_admin_card_payment_desc'),
      // 결제 페이지(카드 결제 버튼)와 동일한 카드 아이콘. 다크 카드라 흰 카드 + 어두운 점으로 렌더.
      icon: (
        <svg width="40" height="52" viewBox="0 0 54 70" fill="none">
          <rect x="2" y="2" width="50" height="66" rx="8" fill="white"/>
          <circle cx="42" cy="14" r="3.5" fill="#1E2124"/>
        </svg>
      ),
      dark: true,
    },
    {
      key: 'lesson',
      show: canLessonAttendance,
      onClick: onSelectLessonAttendance,
      title: t('kiosk_lesson_attendance_title'),
      desc: t('kiosk_admin_card_lesson_desc'),
      // 수업 출석 — QR 스캔(출석 체크)
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect x="6" y="6" width="12" height="12" rx="2.5" stroke="#4E5968" strokeWidth="2.4"/>
          <rect x="22" y="6" width="12" height="12" rx="2.5" stroke="#4E5968" strokeWidth="2.4"/>
          <rect x="6" y="22" width="12" height="12" rx="2.5" stroke="#4E5968" strokeWidth="2.4"/>
          <rect x="24" y="24" width="4.5" height="4.5" rx="1" fill="#4E5968"/>
          <rect x="30.5" y="30.5" width="3.5" height="3.5" rx="1" fill="#4E5968"/>
        </svg>
      ),
      dark: false,
    },
    {
      key: 'studio',
      show: canCheckIn,
      onClick: onSelectVisit,
      title: t('kiosk_admin_studio_attendance'),
      desc: t('kiosk_admin_card_studio_desc'),
      // 스튜디오 출석 — 수강생 방문(사람)
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="14" r="6.5" stroke="#4E5968" strokeWidth="2.4"/>
          <path d="M8 33c1-6.5 6-11 12-11s11 4.5 12 11" stroke="#4E5968" strokeWidth="2.4" strokeLinecap="round"/>
        </svg>
      ),
      dark: false,
    },
    {
      key: 'room',
      show: canBookRoom,
      onClick: onSelectBookRoom,
      title: t('kiosk_reserve_room'),
      desc: t('kiosk_admin_card_room_desc'),
      // 연습실 예약 — 달력 + 체크(예약 확정)
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect x="7" y="9" width="26" height="24" rx="3.5" stroke="#4E5968" strokeWidth="2.4"/>
          <path d="M7 16h26M14 6.5v5M26 6.5v5" stroke="#4E5968" strokeWidth="2.4" strokeLinecap="round"/>
          <path d="M15.5 24.5l3 3 6-6" stroke="#4E5968" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      dark: false,
    },
  ].filter((c) => c.show);

  return (
    <div className="bg-[#F7F8FA] w-full h-screen flex flex-col overflow-hidden">
      {/* 상단 바 — 스튜디오 로고 + 이름 (언어선택·키오스크명 미노출) */}
      <div className="h-[84px] shrink-0 px-[48px] flex items-center border-b border-[#EDEFF2] bg-white">
        <button onClick={handleSecretTap} className="flex items-center gap-[14px] active:opacity-70 transition-opacity">
          {studioImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={kioskImageSrc(studioImageUrl, 96)} alt="" className="rounded-full object-cover shrink-0" style={{ width: 44, height: 44 }} />
          )}
          <span className="text-[#1E2124] text-[22px] font-bold">{studioName}</span>
        </button>
      </div>

      {/* 본문 — 인사 + 액션 카드 */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-[56px]">
        <p className="text-[#1E2124] text-[40px] font-bold tracking-[-1px] text-center">
          {t('kiosk_admin_greeting')}
        </p>
        <p className="text-[#8A949E] text-[20px] mt-[12px] mb-[48px] text-center">
          {t('kiosk_admin_subtitle')}
        </p>

        <div
          className="w-full grid gap-[20px]"
          style={{gridTemplateColumns: `repeat(${cards.length}, minmax(0, 1fr))`, maxWidth: cards.length === 1 ? 420 : cards.length === 2 ? 800 : cards.length === 3 ? 1120 : 1440}}
        >
          {cards.map((card) => (
            <button
              key={card.key}
              onClick={card.onClick}
              className={`flex flex-col items-start gap-[20px] rounded-[28px] p-[32px] text-left active:scale-[0.98] transition-transform ${
                card.dark ? 'bg-[#1E2124]' : 'bg-white border border-[#EDEFF2]'
              }`}
              style={{minHeight: 260}}
            >
              <div className={`w-[72px] h-[72px] rounded-[20px] flex items-center justify-center ${card.dark ? 'bg-white/10' : 'bg-[#F2F4F6]'}`}>
                {typeof card.icon === 'string' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={card.icon} alt="" width={40} height={40} className={`block ${card.dark ? 'brightness-0 invert' : ''}`}/>
                ) : (
                  card.icon
                )}
              </div>
              <div className="flex flex-col gap-[8px]">
                <span className={`text-[28px] font-bold leading-tight ${card.dark ? 'text-white' : 'text-[#1E2124]'}`}>
                  {card.title}
                </span>
                <span className={`text-[17px] leading-snug ${card.dark ? 'text-white/60' : 'text-[#8A949E]'}`}>
                  {card.desc}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
