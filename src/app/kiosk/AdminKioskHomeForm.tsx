'use client';

import React, {useRef} from 'react';
import {Locale} from '@/shared/StringResource';
import {getLocaleString} from '@/app/components/locale';
import {KioskLessonAttendanceIcon, KioskRoomBookingIcon, KioskPaymentIcon} from '@/app/kiosk/kiosk.home.icons';
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
  onSelectAttendance: () => void;
  onSelectBookRoom: () => void;
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
  onSelectAttendance,
  onSelectBookRoom,
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
      // 결제 — 카드 아이콘(다크 카드라 흰 카드 + 어두운 점). 무인 홈과 공통 컴포넌트.
      icon: <KioskPaymentIcon />,
      dark: true,
    },
    {
      key: 'attendance',
      show: canCheckIn || canLessonAttendance,
      onClick: onSelectAttendance,
      title: t('kiosk_attendance_menu'),
      desc: t('kiosk_admin_card_lesson_desc'),
      icon: <KioskLessonAttendanceIcon />,
      dark: false,
    },
    {
      key: 'room',
      show: canBookRoom,
      onClick: onSelectBookRoom,
      title: t('kiosk_reserve_room'),
      desc: t('kiosk_admin_card_room_desc'),
      icon: <KioskRoomBookingIcon />,
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
