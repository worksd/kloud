'use client';

import React, { useEffect, useState } from 'react';
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { GetLessonResponse, LessonStatus } from "@/app/endpoint/lesson.endpoint";
import { GetPassPlanResponse } from "@/app/endpoint/pass.endpoint";
import { getPassPlanAction } from "@/app/passPlans/action/get.pass.plan.action";
import { getPassPlanListAction } from "@/app/passPlans/action/get.pass.plan.list.action";
import { getLessonsByDate } from "@/app/kiosk/get.lessons.by.date.action";
import { KioskPassPlanDetailModal } from "@/app/kiosk/KioskPassPlanDetailModal";
import { handleKioskTokenExpired } from "@/app/kiosk/kiosk.error";
import { formatLessonStart, isLessonPayable, lessonBlockLabel } from "@/app/kiosk/kiosk.lesson";
import { formatFeatureDescription, formatRuleDescription } from "@/utils/pass.description";
import { kioskImageSrc } from "@/app/kiosk/kiosk.image";

const formatApiDate = (d: Date): string =>
  `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;

const INTL_LOCALE: Record<Locale, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  jp: 'ja-JP',
  zh: 'zh-CN',
};

type KioskLessonListFormProps = {
  studioId: number;
  passPlans: GetPassPlanResponse[];
  locale: Locale;
  onSelectLesson: (lesson: GetLessonResponse) => void;
  onSelectPassPlan: (plan: GetPassPlanResponse) => void;
  onBack: () => void;
  onChangeLocale: (locale: Locale) => void;
  /** 'admin'(태블릿 상담실)이면 수업 그리드를 6열로 넓게 노출. 기본 'kiosk'는 3열. */
  variant?: 'kiosk' | 'admin';
};

type KioskTab = 'lessons' | 'pass-plans';

export const KioskLessonListForm = ({ studioId, passPlans: initialPassPlans, locale, onSelectLesson, onSelectPassPlan, onBack, onChangeLocale, variant = 'kiosk' }: KioskLessonListFormProps) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const admin = variant === 'admin';
  const [tab, setTab] = useState<KioskTab>('lessons');
  // 날짜 옵션 — 자정 기준 normalize.
  //  - kiosk(무인): 오늘부터 7일(오늘 ~ +6). 과거 결제 없음.
  //  - admin(상담실): 지난 한 달 조회 가능하도록 과거 30일 ~ +6일. 기본 선택은 항상 오늘.
  const PAST_DAYS = admin ? 30 : 0;
  const dateOptions = React.useMemo(() => {
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    return Array.from({ length: PAST_DAYS + 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() - PAST_DAYS + i);
      return d;
    });
  }, [PAST_DAYS]);
  // 기본 선택은 항상 오늘 (admin은 과거 30일이 앞에 붙어 dateOptions[0]가 한 달 전이므로 today로 초기화)
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [lessons, setLessons] = useState<GetLessonResponse[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [passPlans, setPassPlans] = useState<GetPassPlanResponse[]>(initialPassPlans);
  const [loadingPassPlans, setLoadingPassPlans] = useState(false);
  const [passPlanDetail, setPassPlanDetail] = useState<GetPassPlanResponse | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<number | null>(null);

  const formatPillLabel = (d: Date): string => {
    const weekday = d.toLocaleDateString(INTL_LOCALE[locale], { weekday: 'short' });
    return `${d.getMonth() + 1}.${d.getDate()} (${weekday})`;
  };

  // 수업 탭: 선택된 날짜의 수업 목록 조회
  useEffect(() => {
    if (tab !== 'lessons' || !studioId) return;
    setLoadingLessons(true);
    getLessonsByDate(studioId, formatApiDate(selectedDate))
      .then(async (res) => {
        if (await handleKioskTokenExpired(res)) return;
        // 취소된 수업은 키오스크에 노출 안 함 — 운영자/손님이 어차피 결제 못 하는 항목이라 리스트에서 제외
        if ('lessons' in res) setLessons(res.lessons.filter((l) => l.status !== LessonStatus.Cancelled));
      })
      .finally(() => setLoadingLessons(false));
  }, [tab, studioId, selectedDate]);

  // 패스권 탭 진입 시 목록 fetch (이미 받은 게 있으면 스킵)
  useEffect(() => {
    if (tab !== 'pass-plans' || passPlans.length > 0 || !studioId) return;
    setLoadingPassPlans(true);
    getPassPlanListAction({ studioId })
      .then(async (res) => {
        if (await handleKioskTokenExpired(res)) return;
        if ('passPlans' in res) setPassPlans(res.passPlans);
      })
      .finally(() => setLoadingPassPlans(false));
  }, [tab, studioId, passPlans.length]);

  const handleClickPassPlan = async (plan: GetPassPlanResponse) => {
    if (loadingDetailId) return;
    setLoadingDetailId(plan.id);
    try {
      const res = await getPassPlanAction({ id: plan.id });
      if (await handleKioskTokenExpired(res)) return;
      if ('id' in res) setPassPlanDetail(res);
    } finally {
      setLoadingDetailId(null);
    }
  };

  return (
    <div className="bg-white w-full h-screen flex flex-col overflow-hidden">
      {/* 상단 바 — 백 + 언어/홈 */}
      <KioskTopBar locale={locale} onChangeLocale={onChangeLocale} onBack={onBack} onHome={onBack} />

      {/* 날짜 선택 — 오늘부터 7일치 범위에서 화살표로 하루씩 이동 */}
      {(() => {
        const currentIdx = dateOptions.findIndex((d) => formatApiDate(d) === formatApiDate(selectedDate));
        const canPrev = currentIdx > 0;
        const canNext = currentIdx >= 0 && currentIdx < dateOptions.length - 1;
        // 비활성 시엔 invisible로 숨겨서 레이아웃은 유지하되 시각적으로 안 보이게 (가운데 날짜 위치 흔들림 방지)
        const ArrowButton = ({ hidden, onClick, direction }: { hidden: boolean; onClick: () => void; direction: 'left' | 'right' }) => (
          <button
            type="button"
            onClick={hidden ? undefined : onClick}
            aria-label={direction === 'left' ? 'previous day' : 'next day'}
            className="rounded-full flex items-center justify-center bg-[#F2F4F6] active:scale-[0.94] transition-transform"
            style={{ width: 'min(4.4vh, 48px)', height: 'min(4.4vh, 48px)', visibility: hidden ? 'hidden' : 'visible' }}
          >
            <svg viewBox="0 0 24 24" fill="none" style={{ width: '40%', height: '40%' }}>
              <path
                d={direction === 'left' ? 'M15 6L9 12L15 18' : 'M9 6L15 12L9 18'}
                stroke="#1E2124"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        );
        return (
          <div className="shrink-0 flex items-center justify-center" style={{ gap: 'min(2vw, 22px)', padding: 'min(1.2vw, 14px) 24px' }}>
            <ArrowButton hidden={!canPrev} direction="left" onClick={() => setSelectedDate(dateOptions[currentIdx - 1])} />
            <span className="text-black font-bold text-center" style={{ fontSize: 'min(2vh, 24px)', minWidth: 'min(18vh, 180px)' }}>
              {formatPillLabel(selectedDate)}
            </span>
            <ArrowButton hidden={!canNext} direction="right" onClick={() => setSelectedDate(dateOptions[currentIdx + 1])} />
          </div>
        );
      })()}

      {/* 본문: 좌측 사이드바 + 우측 컨텐츠 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 좌측 사이드바 */}
        <div className="shrink-0 flex flex-col gap-[8px] py-[16px] px-[12px] border-r border-[#F2F4F6]" style={{ width: 'min(18vw, 180px)' }}>
          <KioskSideTab
            label={t('kiosk_tab_lessons')}
            active={tab === 'lessons'}
            onClick={() => setTab('lessons')}
            iconSrc="/assets/ic_kiosk_lesson.svg"
          />
          <KioskSideTab
            label={t('kiosk_pass')}
            active={tab === 'pass-plans'}
            onClick={() => setTab('pass-plans')}
            iconSrc="/assets/ic_kiosk_pass_plan.svg"
          />
        </div>

        {/* 우측 컨텐츠 */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '16px 24px' }}>
          {tab === 'lessons' && (
            <>
              {loadingLessons && (
                <div className="flex items-center justify-center h-full text-[#86898C]" style={{ fontSize: 'min(1.8vh, 20px)' }}>{t('kiosk_loading')}</div>
              )}
              {!loadingLessons && lessons.length === 0 && (
                <div className="flex items-center justify-center h-full text-[#86898C]" style={{ fontSize: 'min(1.8vh, 20px)' }}>{t('kiosk_no_lessons')}</div>
              )}
              {!loadingLessons && lessons.length > 0 && (
                <div className={`grid gap-[12px] ${variant === 'admin' ? 'grid-cols-6' : 'grid-cols-3'}`}>
                  {lessons.map((lesson) => {
                    // admin(상담실)은 구매불가 게이팅 없음 — 지난/마감 수업도 직원이 선택해 진행 가능
                    const payable = admin || isLessonPayable(lesson);
                    const statusText = lessonBlockLabel(lesson, locale);
                    return (
                      <div
                        key={lesson.id}
                        onClick={payable ? () => onSelectLesson(lesson) : undefined}
                        className={`relative aspect-[3/5] overflow-hidden bg-[#E8E8EA] transition-transform ${admin ? 'rounded-[14px]' : 'rounded-[20px]'} ${
                          payable ? 'cursor-pointer active:scale-[0.97]' : 'cursor-not-allowed'
                        }`}
                      >
                        {lesson.thumbnailUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={kioskImageSrc(lesson.thumbnailUrl, 400)} alt="" className={`absolute inset-0 w-full h-full object-cover ${payable ? '' : 'grayscale opacity-60'}`} />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/75" />
                        {!payable && statusText && (
                          <div className={`absolute rounded-full bg-black/70 ${admin ? 'top-[6px] right-[6px] px-[7px] py-[2px]' : 'top-[8px] right-[8px] px-[10px] py-[3px]'}`} style={{ fontSize: admin ? 'min(1vh, 11px)' : 'min(1.2vh, 13px)' }}>
                            <span className="text-white font-bold">{statusText}</span>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0" style={{ padding: admin ? '6% 7% 7%' : '8% 8% 8%' }}>
                          <p className="text-white font-bold leading-snug line-clamp-2" style={{ fontSize: admin ? 'min(1.25vh, 14px)' : 'min(1.6vh, 18px)' }}>{lesson.title ?? ''}</p>
                          <p className="text-[#D5D5D5] mt-[3px]" style={{ fontSize: admin ? 'min(1.05vh, 12px)' : 'min(1.3vh, 14px)' }}>{formatLessonStart(lesson, locale)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {tab === 'pass-plans' && loadingPassPlans && (
            <div className="flex items-center justify-center h-full text-[#86898C]" style={{ fontSize: 'min(1.8vh, 20px)' }}>{t('kiosk_loading')}</div>
          )}
          {tab === 'pass-plans' && !loadingPassPlans && (
            <div className="flex flex-col gap-[10px]">
              {passPlans.length === 0 && (
                <div className="text-[#86898C]" style={{ fontSize: 'min(1.8vh, 20px)' }}>{t('kiosk_no_passplans')}</div>
              )}
              {passPlans.map((plan) => {
                const firstRule = plan.rules?.[0];
                const firstFeature = plan.features?.[0];
                const summary = firstRule?.target && firstRule?.benefit
                  ? formatRuleDescription({ target: firstRule.target, benefit: firstRule.benefit, duration: firstRule.duration, excludes: firstRule.excludes }, locale, plan.name)
                  : firstFeature
                    ? formatFeatureDescription(firstFeature.key, locale, firstFeature.value)
                    : plan.expireDateStamp ?? '';
                const isLoading = loadingDetailId === plan.id;
                return (
                  <button
                    key={plan.id}
                    onClick={() => handleClickPassPlan(plan)}
                    disabled={isLoading}
                    className={`w-full rounded-[16px] p-[16px] flex flex-col items-start text-left cursor-pointer active:scale-[0.99] transition-all ${
                      plan.isRecommended
                        ? 'bg-[#F4F1FF] border-2 border-[#A8A0FF]'
                        : 'bg-[#F9F9FB] border border-transparent'
                    } ${isLoading ? 'opacity-60' : ''}`}
                  >
                    {plan.isRecommended && (
                      <span className="inline-flex items-center gap-[4px] mb-[6px] px-[10px] py-[3px] rounded-full bg-[#1E2124]" style={{ fontSize: 'min(1.2vh, 13px)' }}>
                        <span className="text-[#FFC83D]">★</span>
                        <span className="text-white font-bold">{t('kiosk_recommended')}</span>
                      </span>
                    )}
                    <p className="text-black font-bold leading-snug" style={{ fontSize: 'min(1.8vh, 19px)' }}>{plan.name}</p>
                    {summary && (
                      <p className="text-[#86898C] mt-[4px] line-clamp-1" style={{ fontSize: 'min(1.4vh, 15px)' }}>{summary}</p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {passPlanDetail && (
        <KioskPassPlanDetailModal
          passPlan={passPlanDetail}
          locale={locale}
          onClose={() => setPassPlanDetail(null)}
          onPay={() => {
            const plan = passPlanDetail;
            setPassPlanDetail(null);
            onSelectPassPlan(plan);
          }}
        />
      )}
    </div>
  );
};

const KioskSideTab = ({ label, active, onClick, iconSrc }: { label: string; active: boolean; onClick: () => void; iconSrc?: string }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-[16px] py-[14px] rounded-[12px] font-bold transition-colors active:scale-[0.97] flex items-center gap-[10px] ${active ? 'bg-[#F2F4F6] text-[#1E2124]' : 'bg-transparent text-[#6D7882] hover:bg-[#F9F9FB]'}`}
    style={{ fontSize: 'min(1.8vh, 20px)' }}
  >
    {iconSrc && (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={iconSrc} alt="" width={20} height={20} className="shrink-0 block"/>
    )}
    <span>{label}</span>
  </button>
);

/* ── 공통 상단 바 ── */
const KIOSK_LOCALES: { code: Locale; flag: string; label: string }[] = [
  { code: 'ko', flag: '🇰🇷', label: '한국어' },
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'jp', flag: '🇯🇵', label: '日本語' },
  { code: 'zh', flag: '🇨🇳', label: '中文' },
];

export const KioskTopBar = ({ locale, onChangeLocale, onBack, onHome }: {
  locale: Locale;
  onChangeLocale: (locale: Locale) => void;
  onBack: () => void;
  onHome: () => void;
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const current = KIOSK_LOCALES.find(l => l.code === locale) ?? KIOSK_LOCALES[0];

  return (
    <div className="shrink-0 flex items-center justify-between pr-[5.6%] h-[min(7vh,72px)]">
      {/* 백 버튼 — 너무 좌측 끝에 붙으면 답답해 보여서 약간 좌측 마진 */}
      <button
        onClick={onBack}
        className="ml-[min(1.6vw,18px)] w-[min(5.6vh,64px)] h-[min(5.6vh,64px)] flex items-center justify-center active:scale-[0.97] transition-transform"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/ic_back_arrow.svg" alt="" className="w-[min(4.4vh,48px)] h-[min(4.4vh,48px)]" />
      </button>

      <div className="flex items-center gap-[min(1.5vw,16px)]">
        {/* 언어 선택 */}
        <div className="relative">
          <button
            onClick={() => setShowPicker(v => !v)}
            className="h-[min(4vh,44px)] px-[1.8vw] rounded-[12px] bg-white border border-[#E6E8EA] flex items-center gap-[0.7vw] shadow-sm active:scale-[0.97] transition-transform"
          >
            <span className="text-[min(2vh,22px)]">{current.flag}</span>
            <span className="text-[min(1.6vh,18px)] font-medium text-[#1E2124]">{current.label}</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-[min(1.8vh,20px)] h-[min(1.8vh,20px)]">
              <path d="M6 9l6 6 6-6" stroke="#8A949E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {showPicker && (
            <div className="absolute top-full mt-2 right-0 bg-white border border-[#E6E8EA] rounded-[16px] shadow-lg z-30 overflow-hidden min-w-[180px]">
              {KIOSK_LOCALES.map(l => (
                <button
                  key={l.code}
                  onClick={() => { onChangeLocale(l.code); setShowPicker(false); }}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-left active:bg-gray-100 ${l.code === locale ? 'bg-gray-50 font-bold' : ''}`}
                >
                  <span className="text-[24px]">{l.flag}</span>
                  <span className="text-[16px] text-[#1E2124]">{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 홈 버튼 */}
        <button
          onClick={onHome}
          className="w-[min(4vh,44px)] h-[min(4vh,44px)] flex items-center justify-center active:scale-[0.97] transition-transform"
        >
          <svg viewBox="0 0 44 46" fill="none" className="w-[min(2.4vh,26px)] h-[min(2.4vh,26px)]">
            <path d="M6 20L22 6L38 20V40C38 41.1 37.1 42 36 42H8C6.9 42 6 41.1 6 40V20Z" stroke="#B1B8BE" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 42V24H28V42" stroke="#B1B8BE" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};
