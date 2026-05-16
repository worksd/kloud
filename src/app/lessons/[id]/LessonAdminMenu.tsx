'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { MoreVertical, QrCode, Wallet } from 'lucide-react';
import { kloudNav } from '@/app/lib/kloudNav';
import { KloudScreen } from '@/shared/kloud.screen';
import { Locale } from '@/shared/StringResource';
import { getLocaleString } from '@/app/components/locale';
import { SettleUpLessonResponse } from '@/app/endpoint/lesson.endpoint';

type Props = {
  lessonId: number;
  locale: Locale;
  settleUp: SettleUpLessonResponse | null;
};

export function LessonAdminMenu({ lessonId, locale, settleUp }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);

  const closeSheet = () => setSheetOpen(false);

  const onClickQR = () => {
    closeSheet();
    kloudNav.push(KloudScreen.QRScanWithLesson(lessonId));
  };

  const onClickSettle = () => {
    closeSheet();
    setSettleOpen(true);
  };

  // 시트/모달 열려있는 동안 배경 스크롤 잠금
  useEffect(() => {
    const lock = sheetOpen || settleOpen;
    if (!lock) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheetOpen, settleOpen]);

  const qrLabel = getLocaleString({ locale, key: 'lesson_admin_qr_attendance' });
  const settleLabel = getLocaleString({ locale, key: 'lesson_settle_up_title' });

  return (
    <>
      <button
        type={'button'}
        onClick={() => setSheetOpen(true)}
        aria-label={'menu'}
        className={'w-9 h-9 -mr-1 flex items-center justify-center rounded-full active:bg-[#F2F4F6] transition-colors'}
      >
        <MoreVertical size={20} className={'text-[#5C5C5C]'}/>
      </button>

      {/* 바텀시트 */}
      {sheetOpen && (
        <div
          className={'fixed inset-0 z-[60] flex items-end justify-center'}
          onClick={closeSheet}
        >
          <div className={'absolute inset-0 bg-black/40'}/>
          <div
            className={'relative w-full max-w-[640px] bg-white rounded-t-[20px] pb-6 pt-2 animate-[slideUp_200ms_ease-out]'}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={'mx-auto my-2 w-10 h-1 rounded-full bg-[#E5E7EB]'}/>
            <button
              type={'button'}
              onClick={onClickQR}
              className={'w-full flex items-center gap-3 px-6 py-4 active:bg-[#F7F8F9] transition-colors'}
            >
              <QrCode size={20} className={'text-[#1E2124]'}/>
              <span className={'text-[15px] font-semibold text-black'}>{qrLabel}</span>
            </button>
            {settleUp && (
              <button
                type={'button'}
                onClick={onClickSettle}
                className={'w-full flex items-center gap-3 px-6 py-4 active:bg-[#F7F8F9] transition-colors'}
              >
                <Wallet size={20} className={'text-[#1E2124]'}/>
                <span className={'text-[15px] font-semibold text-black'}>{settleLabel}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 정산 다이얼로그 */}
      {settleOpen && settleUp && (
        <SettleUpDialog
          data={settleUp}
          locale={locale}
          onClose={() => setSettleOpen(false)}
        />
      )}
    </>
  );
}

function SettleUpDialog({
  data,
  locale,
  onClose,
}: {
  data: SettleUpLessonResponse;
  locale: Locale;
  onClose: () => void;
}) {
  const artistsHeading = getLocaleString({ locale, key: 'lesson_settle_up_artists' });
  const settleLabel = getLocaleString({ locale, key: 'lesson_settle_up_settle_amount' });
  const totalLabel = getLocaleString({ locale, key: 'lesson_settle_up_total_amount' });

  const [closing, setClosing] = useState(false);
  const close = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(onClose, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-center justify-center px-4 py-8 ${
        closing ? 'animate-[fadeOut_200ms_ease-out_forwards]' : 'animate-[fadeIn_200ms_ease-out]'
      }`}
      onClick={close}
    >
      <div className={'absolute inset-0 bg-black/60'}/>
      <div
        className={'relative w-full max-w-[480px] max-h-full bg-white rounded-[20px] flex flex-col overflow-hidden'}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className={'flex items-center justify-between px-5 py-4 border-b border-[#F1F3F6]'}>
          <div className={'flex flex-col min-w-0'}>
            <span className={'text-[12px] text-[#919191]'}>{data.date}</span>
            <span className={'mt-0.5 text-[16px] font-bold text-black truncate'}>{data.title}</span>
          </div>
          <button
            type={'button'}
            onClick={close}
            aria-label={'close'}
            className={'shrink-0 w-9 h-9 ml-2 rounded-full flex items-center justify-center active:bg-[#F2F4F6] transition-colors'}
          >
            <svg width={'18'} height={'18'} viewBox={'0 0 24 24'} fill={'none'}>
              <path d={'M6 6L18 18M6 18L18 6'} stroke={'#1E2124'} strokeWidth={'2'} strokeLinecap={'round'}/>
            </svg>
          </button>
        </div>

        {/* 본문 */}
        <div className={'flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5'}>
          {/* 강사별 정산 */}
          {data.artists && data.artists.length > 0 && (
            <section className={'flex flex-col'}>
              <h3 className={'text-[14px] font-bold text-black'}>{artistsHeading}</h3>
              <div className={'mt-2 flex flex-col gap-2'}>
                {data.artists.map((a) => (
                  <div
                    key={a.id}
                    className={'flex items-center gap-3 rounded-[12px] bg-[#FAFAFA] border border-[#F1F3F6] p-3'}
                  >
                    <Image
                      src={a.profileImageUrl || '/assets/default_profile.png'}
                      alt={''}
                      width={40}
                      height={40}
                      className={'rounded-full object-cover w-10 h-10 flex-shrink-0'}
                    />
                    <div className={'flex-1 min-w-0'}>
                      <div className={'text-[13px] font-semibold text-black truncate'}>{a.nickName}</div>
                      <div className={'mt-0.5 text-[10px] text-[#919191] truncate'}>{a.description}</div>
                    </div>
                    <div className={'flex flex-col items-end shrink-0'}>
                      <span className={'text-[10px] text-[#919191]'}>{settleLabel}</span>
                      <span className={'text-[14px] font-bold text-black leading-tight'}>{a.settleAmount.toLocaleString()}원</span>
                      <span className={'mt-0.5 text-[10px] text-[#919191]'}>
                        {totalLabel} {a.totalAmount.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 결제수단별 매출 */}
          {data.sales && data.sales.items && data.sales.items.length > 0 && (
            <SectionBlock title={data.sales.title} items={data.sales.items}/>
          )}

          {/* 강사 지급 내역 */}
          {data.settleUp && data.settleUp.items && data.settleUp.items.length > 0 && (
            <SectionBlock title={data.settleUp.title} items={data.settleUp.items}/>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionBlock({
  title,
  items,
}: {
  title: string;
  items: { key: string; value: string; type?: string }[];
}) {
  return (
    <section className={'flex flex-col'}>
      <h3 className={'text-[14px] font-bold text-black'}>{title}</h3>
      <dl className={'mt-2 flex flex-col'}>
        {items.map((item, idx) => {
          const isTotal = item.type === 'Total';
          return (
            <div
              key={`${item.key}-${idx}`}
              className={[
                'flex items-center justify-between py-2',
                idx > 0 && !isTotal ? 'border-t border-[#F7F8F9]' : '',
                isTotal ? 'mt-2 border-t border-[#E5E7EB] pt-3' : '',
              ].filter(Boolean).join(' ')}
            >
              <dt className={isTotal ? 'text-[13px] font-bold text-black' : 'text-[12px] text-[#5C5C5C]'}>
                {item.key}
              </dt>
              <dd className={isTotal ? 'text-[14px] font-bold text-black' : 'text-[12px] text-black'}>
                {item.value}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
