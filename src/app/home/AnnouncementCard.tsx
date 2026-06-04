'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnnouncementResponse } from '@/app/endpoint/announcement.endpoint';
import { kloudNav } from '@/app/lib/kloudNav';
import { KloudScreen } from '@/shared/kloud.screen';
import { Locale } from '@/shared/StringResource';
import { getLocaleString } from '@/app/components/locale';

// "2026-05-21 10:00" → "2026.05.21 10:00"
const formatCreatedAt = (s: string): string => {
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{2})/);
  if (!m) return s;
  const [, y, mo, d, h, mi] = m;
  return `${y}.${mo.padStart(2, '0')}.${d.padStart(2, '0')} ${h.padStart(2, '0')}:${mi}`;
};

export function AnnouncementCard({
  announcement,
  studioId,
  showMore = false,
  locale,
}: {
  announcement: AnnouncementResponse;
  /** showMore=true일 때 더보기 버튼 라우팅에 사용. 미사용 시 0 등 더미 가능. */
  studioId?: number;
  /** 홈에선 true (더보기 노출), 목록 페이지 내에선 false. */
  showMore?: boolean;
  locale: Locale;
}) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerClosing, setViewerClosing] = useState(false);

  const onMore = () => {
    if (studioId !== undefined) {
      kloudNav.push(KloudScreen.AnnouncementList(studioId));
    }
  };

  const onImageClick = () => {
    setViewerOpen(true);
  };

  const closeViewer = () => {
    if (viewerClosing) return;
    setViewerClosing(true);
    setTimeout(() => {
      setViewerOpen(false);
      setViewerClosing(false);
    }, 200);
  };

  // 뷰어 열린 동안 배경 스크롤 잠금
  useEffect(() => {
    if (!viewerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [viewerOpen]);

  const titleEmpty = !announcement.title?.trim();
  const bodyEmpty = !announcement.body?.trim();

  return (
    <div className={'px-5 pt-6 pb-6'}>
      <div
        className={'bg-white border border-[#E5E8EB] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]'}
      >
        {announcement.imageUrl && (
          <div
            onClick={onImageClick}
            className={'relative w-full bg-[#F2F4F6] cursor-pointer active:opacity-90 transition-opacity'}
            style={{ aspectRatio: '16 / 9' }}
          >
            <Image
              src={announcement.imageUrl}
              alt={''}
              fill
              className={'object-cover'}
              sizes={'(max-width: 640px) 100vw, 640px'}
            />
          </div>
        )}

        <div className={'pt-4 px-5 pb-5 flex flex-col gap-2'}>
          {/* 메타 — 좌측 공지 배지/날짜, 우측 더보기(홈에서만) */}
          <div className={'flex items-center justify-between gap-2'}>
            <div className={'flex items-center gap-1.5 min-w-0'}>
              <span className={'inline-flex items-center h-5 px-2 rounded-full bg-[#F2F4F6] text-[#4E5968] text-[10px] font-semibold shrink-0'}>
                {getLocaleString({ locale, key: 'announcement_badge' })}
              </span>
              <span className={'text-[11px] text-[#8B95A1] tabular-nums truncate'}>
                {formatCreatedAt(announcement.createdAt)}
              </span>
            </div>
            {showMore && (
              <button
                type={'button'}
                onClick={onMore}
                className={'inline-flex items-center gap-0.5 text-[12px] font-semibold text-[#4E5968] active:opacity-70 shrink-0'}
              >
                {getLocaleString({ locale, key: 'view_more' })}
                <svg width={'14'} height={'14'} viewBox={'0 0 24 24'} fill={'none'}>
                  <path d={'M9 6l6 6-6 6'} stroke={'#4E5968'} strokeWidth={'2'} strokeLinecap={'round'} strokeLinejoin={'round'}/>
                </svg>
              </button>
            )}
          </div>

          {/* 제목 */}
          {titleEmpty ? (
            <div className={'text-[17px] font-medium text-[#B0B8C1] leading-[1.4] whitespace-pre-wrap break-words'}>
              {getLocaleString({ locale, key: 'announcement_title_placeholder' })}
            </div>
          ) : (
            <div className={'text-[17px] font-bold text-[#191F28] leading-[1.4] whitespace-pre-wrap break-words'}>
              {announcement.title}
            </div>
          )}

          {/* 본문 */}
          {bodyEmpty ? (
            <div className={'mt-1 text-[13px] text-[#B0B8C1] leading-[1.7] whitespace-pre-wrap break-words'}>
              {getLocaleString({ locale, key: 'announcement_body_placeholder' })}
            </div>
          ) : (
            <div className={'mt-1 text-[13px] text-[#4E5968] leading-[1.7] whitespace-pre-wrap break-words'}>
              {announcement.body}
            </div>
          )}

          {/* 인스타그램 링크 — 클릭 시 외부 브라우저로 열어 인스타에서 게시물 확인 */}
          {announcement.instagramLink && (
            <button
              type={'button'}
              onClick={(e) => {
                e.stopPropagation();
                window.KloudEvent?.openExternalBrowser(announcement.instagramLink!);
              }}
              className={'mt-3 inline-flex items-center gap-1.5 self-start text-[12px] font-semibold text-[#4E5968] active:opacity-70'}
            >
              {/* Instagram 로고 — gradient stroke */}
              <svg width={'16'} height={'16'} viewBox={'0 0 24 24'} fill={'none'}>
                <rect x={'2.5'} y={'2.5'} width={'19'} height={'19'} rx={'5'} stroke={'#4E5968'} strokeWidth={'1.6'}/>
                <circle cx={'12'} cy={'12'} r={'4'} stroke={'#4E5968'} strokeWidth={'1.6'}/>
                <circle cx={'17.5'} cy={'6.5'} r={'1.2'} fill={'#4E5968'}/>
              </svg>
              <span>{getLocaleString({ locale, key: 'view_on_instagram' })}</span>
              <svg width={'12'} height={'12'} viewBox={'0 0 24 24'} fill={'none'}>
                <path d={'M9 6l6 6-6 6'} stroke={'#4E5968'} strokeWidth={'2'} strokeLinecap={'round'} strokeLinejoin={'round'}/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 이미지 원본 뷰어 */}
      {viewerOpen && announcement.imageUrl && (
        <div
          className={`fixed inset-0 z-[80] flex items-center justify-center ${
            viewerClosing ? 'animate-[fadeOut_200ms_ease-out_forwards]' : 'animate-[fadeIn_200ms_ease-out]'
          }`}
          onClick={closeViewer}
        >
          <div className={'absolute inset-0 bg-black/85'}/>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={announcement.imageUrl}
            alt={''}
            className={'relative max-w-[92vw] max-h-[70vh] w-auto h-auto object-contain rounded-2xl'}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type={'button'}
            onClick={closeViewer}
            aria-label={'close'}
            // ignoreSafeArea 페이지에서 띄워지면 status bar에 X가 가려질 수 있어 top 보정 (헤더 pt-16과 정렬)
            className={'absolute top-16 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center active:bg-white/20'}
          >
            <svg width={'18'} height={'18'} viewBox={'0 0 24 24'} fill={'none'}>
              <path d={'M6 6L18 18M6 18L18 6'} stroke={'white'} strokeWidth={'2'} strokeLinecap={'round'}/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
