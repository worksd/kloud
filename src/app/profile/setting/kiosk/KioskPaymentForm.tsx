'use client';

import React, {useState, useEffect, useCallback} from 'react';
import BackArrowIcon from '../../../../../public/assets/ic_back_arrow.svg';
import {GetLessonResponse} from "@/app/endpoint/lesson.endpoint";
import {Thumbnail} from '@/app/components/Thumbnail';
import {createKioskPaymentAction} from "@/app/profile/setting/kiosk/kiosk.actions";
import {isGuinnessErrorCase} from "@/app/guinnessErrorCase";
import {KioskPaymentResultItem} from "@/app/endpoint/payment.record.endpoint";
import {Locale} from "@/shared/StringResource";
import {getLocaleString} from "@/app/components/locale";

const toAmPm = (time: string): string => {
  const [h, m] = time.split(':').map(Number);
  const period = h < 12 ? '오전' : '오후';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${period} ${hour12}:${String(m).padStart(2, '0')}`;
};

const formatLessonTime = (lesson: GetLessonResponse): string | null => {
  if (lesson.startDate) {
    const timePart = lesson.startDate.split(' ')[1];
    if (timePart) {
      const start = toAmPm(timePart);
      if (lesson.duration) {
        const [h, m] = timePart.split(':').map(Number);
        const endMinutes = h * 60 + m + lesson.duration;
        const endH = Math.floor(endMinutes / 60) % 24;
        const endM = endMinutes % 60;
        const end = toAmPm(`${endH}:${String(endM).padStart(2, '0')}`);
        return `${start} - ${end}`;
      }
      return start;
    }
  }
  if (lesson.formattedDate) {
    return `${toAmPm(lesson.formattedDate.startTime)} - ${toAmPm(lesson.formattedDate.endTime)}`;
  }
  return null;
};

type Step = 'confirm' | 'loading' | 'complete';

type KioskPaymentFormProps = {
  studioName: string;
  lessons: GetLessonResponse[];
  userId: number;
  userName?: string;
  onBack: () => void;
  onComplete: () => void;
  locale: Locale;
};

export const KioskPaymentForm = ({studioName, lessons, userId, userName, onBack, onComplete, locale}: KioskPaymentFormProps) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({locale, key});

  const [step, setStep] = useState<Step>('confirm');
  const [countdown, setCountdown] = useState(180);
  const [completeCountdown, setCompleteCountdown] = useState(5);
  const [paymentResults, setPaymentResults] = useState<KioskPaymentResultItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onBack();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onBack]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const totalPrice = lessons.reduce((sum, l) => sum + (l.price ?? 0), 0);

  const handleSubmit = useCallback(async () => {
    setStep('loading');
    setError(null);
    try {
      const items = lessons.map((l) => ({lessonId: l.id}));
      const result = await createKioskPaymentAction(items, userId);
      if (isGuinnessErrorCase(result)) {
        setError(t('kiosk_submit_failed'));
        setStep('confirm');
      } else {
        setPaymentResults(result.lessons ?? []);
        setStep('complete');
      }
    } catch {
      setError(t('kiosk_submit_failed'));
      setStep('confirm');
    }
  }, [lessons, userId]);

  useEffect(() => {
    if (step !== 'complete') return;
    setCompleteCountdown(10);
    const timer = setInterval(() => {
      setCompleteCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step, onComplete]);

  if (step === 'loading') {
    return (
        <div className="bg-white w-full h-screen overflow-hidden flex flex-col items-center justify-center">
          <div className="w-[60px] h-[60px] border-4 border-gray-200 border-t-black rounded-full animate-spin mb-[32px]"/>
          <p className="text-black text-[28px] font-bold tracking-[-0.84px]">
            {t('kiosk_submit_processing')}
          </p>
        </div>
    );
  }

  if (step === 'complete') {
    const successItems = paymentResults.filter((r) => !r.reason);
    const failedItems = paymentResults.filter((r) => r.reason);
    const allFailed = successItems.length === 0 && failedItems.length > 0;

    return (
        <div className="bg-white w-full h-screen overflow-hidden flex flex-col items-center justify-center px-[48px]">
          {allFailed ? (
              <div className="w-[80px] h-[80px] rounded-full bg-red-500 flex items-center justify-center mb-[32px]">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
          ) : (
              <div className="w-[80px] h-[80px] rounded-full bg-black flex items-center justify-center mb-[32px]">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
          )}

          {allFailed ? (
              <>
                <p className="text-black text-[36px] font-bold tracking-[-1px] mb-[16px]">
                  {t('kiosk_fail_title')}
                </p>
                <p className="text-gray-400 text-[20px] mb-[32px]">
                  {t('kiosk_fail_desc')}
                </p>
              </>
          ) : (
              <>
                <p className="text-black text-[36px] font-bold tracking-[-1px] mb-[16px]">
                  {t('kiosk_success_title').replace('{0}', String(successItems.length))}
                </p>
                <p className="text-gray-400 text-[20px] mb-[32px]">
                  {t('kiosk_success_desc')}
                </p>
              </>
          )}

          {failedItems.length > 0 && (
              <div className="w-full max-w-[500px] bg-red-50 rounded-[16px] p-[20px] mb-[32px] flex flex-col gap-[8px]">
                {!allFailed && (
                    <p className="text-red-500 text-[16px] font-bold">{t('kiosk_partial_fail').replace('{0}', String(failedItems.length))}</p>
                )}
                {failedItems.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <p className="text-black text-[15px]">{item.lesson?.title ?? t('kiosk_lesson_selection')}</p>
                      <p className="text-red-500 text-[14px]">{item.reason}</p>
                    </div>
                ))}
              </div>
          )}

          <button
              onClick={onComplete}
              className="w-full max-w-[500px] h-[72px] rounded-[16px] bg-black text-white text-[22px] font-medium transition-colors"
          >
            {t('kiosk_confirm')}
          </button>

          <p className="text-gray-400 text-[16px] mt-[20px]">
            <span className="font-semibold text-black">{completeCountdown}</span>
            <span>초 {t('kiosk_countdown_suffix')}</span>
          </p>
        </div>
    );
  }

  // step === 'confirm'
  return (
      <div className="bg-white w-full h-screen overflow-hidden flex flex-col">
        <div className="h-[70px] px-[48px] flex items-center justify-between shrink-0 border-b border-gray-100">
          <button onClick={onBack}
                  className="w-[40px] h-[40px] flex items-center justify-center active:opacity-70 transition-opacity">
            <BackArrowIcon className="w-full h-full"/>
          </button>
          <p className="text-black text-[20px] font-bold">{t('kiosk_payment_confirm')}</p>
          <p className="text-gray-500 text-[16px] tracking-[-0.48px]">
            {studioName}
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center min-h-0 px-[48px] py-[40px]">
          <p className="text-black text-[36px] font-bold tracking-[-1px] mb-[40px]">
            {userName && <>{userName}{t('kiosk_name_suffix')}</>}{t('kiosk_payment_question').replace('{0}', String(lessons.length))}
          </p>

          <div className="w-full max-w-[700px] bg-gray-50 rounded-[20px] p-[32px] flex flex-col gap-[16px]">
            <div className="flex flex-col gap-[12px] max-h-[300px] overflow-y-auto scrollbar-hide">
              {lessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center gap-[16px]">
                    <div className="w-[52px] h-[68px] rounded-[10px] overflow-hidden shrink-0 bg-gray-200">
                      {lesson.thumbnailUrl ? (
                          <Thumbnail url={lesson.thumbnailUrl} className="w-full h-full" aspectRatio={52 / 68}/>
                      ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-gray-400 text-lg">🕺</span>
                          </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col gap-[2px] min-w-0">
                      <p className="text-black text-[17px] font-bold truncate">{lesson.title}</p>
                      <p className="text-gray-400 text-[14px]">
                        {[formatLessonTime(lesson), lesson.artists?.[0]?.nickName].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <p className="text-black text-[17px] font-bold shrink-0">
                      {(lesson.price ?? 0).toLocaleString()}{t('kiosk_won')}
                    </p>
                  </div>
              ))}
            </div>

            <div className="border-t border-gray-300 pt-[16px] flex items-center justify-between">
              <p className="text-black text-[20px] font-bold">{t('kiosk_total')}</p>
              <p className="text-black text-[28px] font-bold tracking-[-0.84px]">
                {totalPrice.toLocaleString()}{t('kiosk_won')}
              </p>
            </div>
          </div>

          {error && <p className="text-red-500 text-[16px] text-center mt-[16px]">{error}</p>}
        </div>

        <div className="px-[48px] pb-[40px] flex flex-col items-center gap-[20px] shrink-0">
          <p className="text-[18px] tracking-[-0.54px]">
            <span className="font-semibold text-black">{formatTime(countdown)}</span>
            <span className="text-gray-300"> {t('kiosk_countdown_suffix')}</span>
          </p>

          <button
              onClick={handleSubmit}
              className="w-full max-w-[700px] h-[80px] rounded-[20px] bg-black text-white flex items-center justify-center gap-[10px] hover:bg-gray-900 transition-colors"
          >
            <p className="text-[24px] font-medium tracking-[-0.72px]">{t('kiosk_submit')}</p>
          </button>
        </div>
      </div>
  );
};
