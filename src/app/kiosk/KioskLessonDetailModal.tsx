'use client';

import React from 'react';
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import {
  formatLessonDate,
  formatLessonDuration,
  formatLessonTimeRange,
  isLessonPayable,
  lessonStatusLabel,
} from "@/app/kiosk/kiosk.lesson";

type KioskLessonDetailModalProps = {
  lesson: GetLessonResponse;
  locale: Locale;
  onClose: () => void;
  onPayment: () => void;
};

export const KioskLessonDetailModal = ({ lesson, locale, onClose, onPayment }: KioskLessonDetailModalProps) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const fmt = (n: number) => new Intl.NumberFormat('ko-KR').format(n);

  const dateLabel = formatLessonDate(lesson, locale);
  const timeRange = formatLessonTimeRange(lesson, locale);
  const durationLabel = formatLessonDuration(lesson, locale);
  const timeLabel = timeRange && durationLabel ? `${timeRange} · ${durationLabel}` : (timeRange || durationLabel);
  const roomLabel = lesson.room?.name ?? '';
  const artist = lesson.artists?.[0];
  const tags = [lesson.level, lesson.genre].filter((v): v is string => Boolean(v));
  const payable = isLessonPayable(lesson.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-[fadeIn_200ms_ease-out]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-[92.6%] max-w-[1100px] bg-white rounded-[42px] flex flex-col overflow-hidden animate-[fadeIn_200ms_ease-out]"
        onClick={e => e.stopPropagation()}
      >
        {/* 본문: 좌 썸네일 / 우 정보 */}
        <div
          className="flex"
          style={{
            padding: 'min(4.4vw,48px) min(4.4vw,48px) min(2.6vw,28px)',
            gap: 'min(3.7vw,40px)',
          }}
        >
          {/* 썸네일 */}
          <div
            className="flex-shrink-0 rounded-[32px] overflow-hidden bg-[#E8E8EA]"
            style={{ width: '40%', aspectRatio: '640 / 853' }}
          >
            {lesson.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={lesson.thumbnailUrl} alt="" className="w-full h-full object-cover" />
            ) : null}
          </div>

          {/* 정보 컬럼 */}
          <div
            className="flex-1 flex flex-col overflow-y-auto"
            style={{ gap: 'min(1.6vw, 18px)', maxHeight: 'min(48vh, 520px)' }}
          >
            <p className="text-black font-bold leading-tight" style={{ fontSize: 'min(3.4vw, 38px)' }}>
              {lesson.title ?? ''}
            </p>

            {tags.length > 0 && (
              <div className="flex flex-wrap" style={{ gap: 'min(0.8vw, 10px)' }}>
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-[#F2F4F6] text-[#1E2124] font-medium rounded-full"
                    style={{
                      padding: 'min(0.6vw, 8px) min(1.4vw, 16px)',
                      fontSize: 'min(1.6vw, 18px)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-col" style={{ gap: 'min(1vw, 12px)', marginTop: 'min(0.6vw, 8px)' }}>
              {dateLabel && <InfoRow icon="calendar" label={dateLabel} />}
              {timeLabel && <InfoRow icon="clock" label={timeLabel} />}
              {roomLabel && <InfoRow icon="pin" label={roomLabel} />}
            </div>

            {artist && (
              <div
                className="flex items-center bg-[#F9F9FB] rounded-[20px]"
                style={{
                  padding: 'min(1.4vw, 16px) min(2vw, 22px)',
                  gap: 'min(1.2vw, 14px)',
                  marginTop: 'min(0.6vw, 8px)',
                }}
              >
                <div
                  className="rounded-full overflow-hidden bg-[#E8E8EA] flex-shrink-0"
                  style={{ width: 'min(4vw, 44px)', height: 'min(4vw, 44px)' }}
                >
                  {artist.profileImageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={artist.profileImageUrl} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[#86898C]" style={{ fontSize: 'min(1.4vw, 16px)' }}>{t('kiosk_artist')}</span>
                  <span className="text-black font-bold truncate" style={{ fontSize: 'min(2vw, 22px)' }}>
                    {artist.nickName || artist.name}
                  </span>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* 가격 바 */}
        <div
          className="border-t border-[#F2F4F6] flex items-center justify-between"
          style={{ padding: 'min(2vw, 22px) min(5.6vw, 60px)' }}
        >
          <span className="text-[#6D7882]" style={{ fontSize: 'min(2vw, 22px)' }}>{t('payment_amount')}</span>
          <span className="flex items-baseline" style={{ gap: 'min(0.6vw, 6px)' }}>
            <span className="text-black font-bold" style={{ fontSize: 'min(3.7vw, 40px)' }}>{fmt(lesson.price ?? 0)}</span>
            <span className="text-[#86898C]" style={{ fontSize: 'min(1.8vw, 20px)' }}>{t('won')}</span>
          </span>
        </div>

        {/* 하단 버튼 */}
        <div
          className="flex"
          style={{
            gap: 'min(2.6vw, 28px)',
            padding: 'min(2.6vw, 28px) min(4vw, 44px) min(4.4vw, 48px)',
          }}
        >
          <button
            onClick={onClose}
            className="flex-[280] rounded-[32px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.97] transition-transform"
            style={{ height: 'min(13.9vw, 150px)' }}
          >
            <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(4.2vw, 45px)' }}>{t('kiosk_back')}</span>
          </button>
          <button
            onClick={payable ? onPayment : undefined}
            disabled={!payable}
            className={`flex-[604] rounded-[32px] flex items-center justify-center transition-transform ${
              payable ? 'bg-[#1E2124] active:scale-[0.97]' : 'bg-[#CDD1D5] cursor-not-allowed'
            }`}
            style={{ height: 'min(13.9vw, 150px)' }}
          >
            <span className={`font-bold ${payable ? 'text-white' : 'text-[#86898C]'}`} style={{ fontSize: 'min(4.2vw, 45px)' }}>
              {payable ? t('kiosk_payment_title') : lessonStatusLabel(lesson.status, locale)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ icon, label }: { icon: 'calendar' | 'clock' | 'pin' | 'people'; label: string }) => (
  <div className="flex items-center" style={{ gap: 'min(1vw, 12px)' }}>
    <Icon name={icon} />
    <span className="text-[#1E2124]" style={{ fontSize: 'min(1.9vw, 21px)' }}>{label}</span>
  </div>
);

const Icon = ({ name }: { name: 'calendar' | 'clock' | 'pin' | 'people' }) => {
  const stroke = '#6D7882';
  const sw = 1.8;
  const style = { width: 'min(2.2vw, 24px)', height: 'min(2.2vw, 24px)', flexShrink: 0 };
  switch (name) {
    case 'calendar':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={style}>
          <rect x="3" y="5" width="18" height="16" rx="2" stroke={stroke} strokeWidth={sw} />
          <path d="M3 10H21M8 3V7M16 3V7" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
    case 'clock':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={style}>
          <circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth={sw} />
          <path d="M12 7V12L15 14" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
    case 'pin':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={style}>
          <path d="M12 21S5 14 5 9.5C5 5.91 8.13 3 12 3C15.87 3 19 5.91 19 9.5C19 14 12 21 12 21Z" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
          <circle cx="12" cy="9.5" r="2.5" stroke={stroke} strokeWidth={sw} />
        </svg>
      );
    case 'people':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={style}>
          <circle cx="9" cy="8" r="3.5" stroke={stroke} strokeWidth={sw} />
          <path d="M3 20C3 16.5 5.7 14 9 14S15 16.5 15 20" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <circle cx="17" cy="9" r="2.5" stroke={stroke} strokeWidth={sw} />
          <path d="M17 14C19.3 14 21 16 21 18" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
  }
};
