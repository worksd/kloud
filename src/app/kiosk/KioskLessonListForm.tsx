'use client';

import React, { useEffect, useState } from 'react';
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { GetPassPlanResponse } from "@/app/endpoint/pass.endpoint";
import { getPassPlanAction } from "@/app/passPlans/action/get.pass.plan.action";
import { getPassPlanListAction } from "@/app/passPlans/action/get.pass.plan.list.action";
import { getLessonsByDate } from "@/app/kiosk/get.lessons.by.date.action";
import { KioskPassPlanDetailModal } from "@/app/kiosk/KioskPassPlanDetailModal";
import { handleKioskTokenExpired } from "@/app/kiosk/kiosk.error";
import { formatFeatureDescription, formatRuleDescription } from "@/utils/pass.description";

export type KioskLesson = {
  id: number;
  title: string;
  time: string;
  thumbnailUrl: string;
  price: number;
};

const formatApiDate = (d: Date): string =>
  `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;

const formatDisplayDate = (d: Date): string =>
  `${String(d.getFullYear()).slice(-2)}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;

const toAmPm = (hhmm: string): string => {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h < 12 ? '오전' : '오후';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${period} ${hour12}:${String(m).padStart(2, '0')}`;
};

const lessonTimeLabel = (l: GetLessonResponse): string => {
  if (l.startDate) {
    const time = l.startDate.split(' ')[1];
    if (time) return toAmPm(time);
  }
  if (l.formattedDate?.startTime) return toAmPm(l.formattedDate.startTime);
  return '';
};

const toKioskLesson = (l: GetLessonResponse): KioskLesson => ({
  id: l.id,
  title: l.title ?? '',
  time: lessonTimeLabel(l),
  thumbnailUrl: l.thumbnailUrl ?? '',
  price: l.price ?? 0,
});

type KioskLessonListFormProps = {
  studioId: number;
  passPlans: GetPassPlanResponse[];
  locale: Locale;
  onSelectLesson: (lesson: KioskLesson) => void;
  onSelectPassPlan: (plan: GetPassPlanResponse) => void;
  onBack: () => void;
  onChangeLocale: (locale: Locale) => void;
};

type KioskTab = 'lessons' | 'pass-plans';

export const KioskLessonListForm = ({ studioId, passPlans: initialPassPlans, locale, onSelectLesson, onSelectPassPlan, onBack, onChangeLocale }: KioskLessonListFormProps) => {
  const today = React.useMemo(() => new Date(), []);
  const selectedDate = React.useMemo(() => formatDisplayDate(today), [today]);
  const [tab, setTab] = useState<KioskTab>('lessons');
  const [lessons, setLessons] = useState<KioskLesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [passPlans, setPassPlans] = useState<GetPassPlanResponse[]>(initialPassPlans);
  const [loadingPassPlans, setLoadingPassPlans] = useState(false);
  const [passPlanDetail, setPassPlanDetail] = useState<GetPassPlanResponse | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<number | null>(null);

  // 수업 탭: 오늘 날짜의 수업 목록 조회
  useEffect(() => {
    if (tab !== 'lessons' || !studioId) return;
    setLoadingLessons(true);
    getLessonsByDate(studioId, formatApiDate(today))
      .then(async (res) => {
        if (await handleKioskTokenExpired(res)) return;
        if ('lessons' in res) setLessons(res.lessons.map(toKioskLesson));
      })
      .finally(() => setLoadingLessons(false));
  }, [tab, studioId, today]);

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

      {/* 날짜 바 — 가운데 정렬 */}
      <div className="shrink-0 flex items-center justify-center px-[5.6%]" style={{ gap: 'min(1vw, 8px)', paddingTop: 'min(1vw, 12px)', paddingBottom: 'min(1vw, 12px)' }}>
        <span className="text-black font-bold" style={{ fontSize: 'min(1.8vh, 20px)' }}>{selectedDate}</span>
        <div className="rounded-full bg-[#F2F4F6] flex items-center justify-center" style={{ width: 'min(2.4vh, 26px)', height: 'min(2.4vh, 26px)' }}>
          <svg viewBox="0 0 24 14" fill="none" style={{ width: 'min(1.2vh, 12px)', height: 'auto' }}>
            <path d="M2 2L12 12L22 2" stroke="#6D7882" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* 본문: 좌측 사이드바 + 우측 컨텐츠 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 좌측 사이드바 */}
        <div className="shrink-0 flex flex-col gap-[8px] py-[16px] px-[12px] border-r border-[#F2F4F6]" style={{ width: 'min(18vw, 180px)' }}>
          <KioskSideTab
            label="수업"
            active={tab === 'lessons'}
            onClick={() => setTab('lessons')}
            iconSrc="/assets/ic_kiosk_lesson.svg"
          />
          <KioskSideTab
            label="패스권"
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
                <div className="text-[#86898C]" style={{ fontSize: 'min(1.8vh, 20px)' }}>불러오는 중...</div>
              )}
              {!loadingLessons && lessons.length === 0 && (
                <div className="text-[#86898C]" style={{ fontSize: 'min(1.8vh, 20px)' }}>오늘 예정된 수업이 없습니다</div>
              )}
              {!loadingLessons && lessons.length > 0 && (
                <div className="grid grid-cols-3 gap-[12px]">
                  {lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      onClick={() => onSelectLesson(lesson)}
                      className="relative aspect-[3/5] rounded-[20px] overflow-hidden bg-[#E8E8EA] cursor-pointer active:scale-[0.97] transition-transform"
                    >
                      {lesson.thumbnailUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={lesson.thumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/75" />
                      <div className="absolute bottom-0 left-0 right-0" style={{ padding: '8% 8% 8%' }}>
                        <p className="text-white font-bold leading-snug line-clamp-2" style={{ fontSize: 'min(1.6vh, 18px)' }}>{lesson.title}</p>
                        <p className="text-[#D5D5D5] mt-[4px]" style={{ fontSize: 'min(1.3vh, 14px)' }}>{lesson.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'pass-plans' && (
            <div className="flex flex-col gap-[10px]">
              {loadingPassPlans && (
                <div className="text-[#86898C]" style={{ fontSize: 'min(1.8vh, 20px)' }}>불러오는 중...</div>
              )}
              {!loadingPassPlans && passPlans.length === 0 && (
                <div className="text-[#86898C]" style={{ fontSize: 'min(1.8vh, 20px)' }}>패스권이 없습니다</div>
              )}
              {passPlans.map((plan) => {
                const firstRule = plan.rules?.[0];
                const firstFeature = plan.features?.[0];
                const summary = firstRule?.target && firstRule?.benefit
                  ? formatRuleDescription({ target: firstRule.target, benefit: firstRule.benefit, excludes: firstRule.excludes }, locale, plan.name)
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
                        <span className="text-white font-bold">추천</span>
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
    <div className="shrink-0 flex items-center justify-between px-[5.6%] h-[min(7vh,72px)]">
      {/* 백 버튼 */}
      <button
        onClick={onBack}
        className="w-[min(4vh,44px)] h-[min(4vh,44px)] flex items-center justify-center active:scale-[0.97] transition-transform"
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-[min(2.4vh,26px)] h-[min(2.4vh,26px)]">
          <path d="M15 6L9 12L15 18" stroke="#1E2124" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
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
