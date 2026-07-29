'use client';

import React from 'react';
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { KioskTopBar } from "@/app/kiosk/KioskTopBar";
import { KioskLessonAttendanceIcon, KioskStudioAttendanceIcon } from "@/app/kiosk/kiosk.home.icons";

// 출석 체크 진입 시, 스튜디오 출석 / 수업 출석 둘 다 가능할 때만 노출되는 선택 화면.
// (하나만 가능하면 KioskForm이 이 화면을 건너뛰고 해당 출석으로 바로 이동한다.)
export const KioskAttendanceSelectForm = ({
  locale,
  onSelectStudio,
  onSelectLesson,
  onBack,
  onHome,
}: {
  locale: Locale;
  onSelectStudio: () => void;
  onSelectLesson: () => void;
  onBack: () => void;
  onHome: () => void;
}) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });

  return (
    <div className="bg-white w-full h-screen flex flex-col overflow-hidden animate-[fadeIn_260ms_ease-out]">
      <KioskTopBar title={t('kiosk_attendance_menu')} onBack={onBack} onHome={onHome} />

      <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-[5.6%]">
        <p className="text-[#1E2124] font-bold text-center" style={{ fontSize: 'min(3.4vw, 38px)', marginBottom: 'min(4vw, 44px)' }}>
          {t('kiosk_attendance_select_title')}
        </p>
        <div className="w-full grid grid-cols-2" style={{ maxWidth: 'min(80vw, 880px)', gap: 'min(2.9vw, 32px)' }}>
          <button
            onClick={onSelectStudio}
            className="flex flex-col items-center justify-center gap-[min(2.6vh,28px)] bg-[#F2F4F6] rounded-[32px] cursor-pointer active:scale-[0.98] transition-transform"
            style={{ height: 'min(30vh, 300px)' }}
          >
            <KioskStudioAttendanceIcon size={56} />
            <span className="text-[#1E2124] font-bold leading-tight" style={{ fontSize: 'min(2.6vw, 30px)' }}>{t('kiosk_visit_title')}</span>
          </button>
          <button
            onClick={onSelectLesson}
            className="flex flex-col items-center justify-center gap-[min(2.6vh,28px)] bg-[#F2F4F6] rounded-[32px] cursor-pointer active:scale-[0.98] transition-transform"
            style={{ height: 'min(30vh, 300px)' }}
          >
            <KioskLessonAttendanceIcon size={56} />
            <span className="text-[#1E2124] font-bold leading-tight" style={{ fontSize: 'min(2.6vw, 30px)' }}>{t('kiosk_lesson_attendance_title')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
