'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { UserCheck } from 'lucide-react';
import { kloudNav } from '@/app/lib/kloudNav';
import { KloudScreen } from '@/shared/kloud.screen';

// 관리자 홈 숏컷 줄 + '오늘 수업 출석 체크' 바텀시트.
// 시트의 수업 row를 탭하면 그 수업의 출석 QR 스캔 화면(/qrs?lessonId=)으로 간다.

export type AdminSheetLesson = {
  id: number;
  title: string;
  thumbnailUrl?: string;
  /** 예: '오후 7:00 – 8:00' — 서버에서 locale에 맞게 포맷해 내려준다 */
  timeLabel?: string;
  /** 예: '강사 · 룸' */
  subLabel?: string;
};

type Labels = {
  attendance: string;
  sheetTitle: string;
  empty: string;
};

const Shortcut = ({ icon, iconBg, label, onClick, href }: {
  icon: React.ReactNode;
  /** 아이콘 뒤 원 배경색 */
  iconBg: string;
  label: string;
  onClick?: () => void;
  href?: string;
}) => {
  const inner = (
    <>
      <span
        className={'w-[44px] h-[44px] rounded-full flex items-center justify-center'}
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </span>
      <span className={'text-[13px] font-semibold text-[#1E2124] text-center leading-tight'}>{label}</span>
    </>
  );
  const cls = 'flex-1 min-w-0 flex flex-col items-center gap-2.5 rounded-[16px] bg-[#F7F8F9] py-4 px-2 active:bg-[#F1F3F6] transition-colors';
  if (href) return <a href={href} className={cls}>{inner}</a>;
  return <button type={'button'} onClick={onClick} className={cls}>{inner}</button>;
};

export function AdminShortcuts({ lessons, labels }: {
  lessons: AdminSheetLesson[];
  labels: Labels;
}) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  // 시트 열려있는 동안 body 스크롤 잠금 (수강생 바텀시트와 동일 패턴)
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const closeSheet = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => { setOpen(false); setClosing(false); }, 200);
  };

  const onLesson = (id: number) => {
    closeSheet();
    kloudNav.push(KloudScreen.QRScanWithLesson(id));
  };

  return (
    <>
      <div className={'flex gap-2.5 px-5 pb-2'}>
        <Shortcut
          icon={<UserCheck size={22} strokeWidth={2.2} className={'text-[#2E7D32]'}/>}
          iconBg={'#E8F5E9'}
          label={labels.attendance}
          onClick={() => setOpen(true)}
        />
      </div>

      {open && (
        <div
          className={`fixed inset-0 z-[60] flex items-end justify-center ${
            closing ? 'animate-[fadeOut_200ms_ease-out_forwards]' : 'animate-[fadeIn_200ms_ease-out]'
          }`}
          onClick={closeSheet}
        >
          <div className={'absolute inset-0 bg-black/40'}/>
          <div
            className={'relative w-full max-w-[640px] bg-white rounded-t-[24px] pt-2 animate-[slideUp_200ms_ease-out] flex flex-col'}
            style={{ maxHeight: '72vh', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={'mx-auto my-2 w-10 h-1 rounded-full bg-[#E5E7EB] shrink-0'}/>
            <p className={'px-6 pt-2 pb-3 text-[18px] font-bold text-black shrink-0'}>{labels.sheetTitle}</p>

            {lessons.length === 0 ? (
              <p className={'px-6 py-12 text-center text-[14px] text-[#8B95A1]'}>{labels.empty}</p>
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
          </div>
        </div>
      )}
    </>
  );
}
