'use client';

import React, { useEffect, useState } from 'react';
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { GetLessonResponse, LessonStatus, BundleSummaryResponse } from "@/app/endpoint/lesson.endpoint";
import { GetPassPlanResponse } from "@/app/endpoint/pass.endpoint";
import { getPassPlanAction } from "@/app/passPlans/action/get.pass.plan.action";
import { getPassPlanListAction } from "@/app/passPlans/action/get.pass.plan.list.action";
import { getLessonsByDate } from "@/app/kiosk/get.lessons.by.date.action";
import { getBundlesAction } from "@/app/kiosk/get.bundles.action";
import { KioskPassPlanDetailModal } from "@/app/kiosk/KioskPassPlanDetailModal";
import { KioskTopBar } from "@/app/kiosk/KioskTopBar";
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

// "2026.06.16 05:52" → "6.16"
const bundleMonthDay = (raw?: string): string | null => {
  if (!raw) return null;
  const m = raw.match(/^(\d{4})\.(\d{1,2})\.(\d{1,2})/);
  return m ? `${parseInt(m[2], 10)}.${parseInt(m[3], 10)}` : null;
};
const bundleSalesPeriod = (b: BundleSummaryResponse): string | null => {
  const s = bundleMonthDay(b.startDate);
  const e = bundleMonthDay(b.endDate) ?? bundleMonthDay(b.closeDate);
  if (s && e) return `${s} ~ ${e}`;
  if (e) return `~ ${e}`;
  return null;
};

type KioskLessonListFormProps = {
  studioId: number;
  passPlans: GetPassPlanResponse[];
  locale: Locale;
  onSelectLesson: (lesson: GetLessonResponse) => void;
  onSelectPassPlan: (plan: GetPassPlanResponse) => void;
  onSelectBundle?: (bundle: BundleSummaryResponse) => void;
  onBack: () => void;
  onChangeLocale: (locale: Locale) => void;
  /** 'admin'(태블릿 상담실)이면 수업 그리드를 6열로 넓게 노출. 기본 'kiosk'는 3열. */
  variant?: 'kiosk' | 'admin';
};

type KioskTab = 'promotion' | 'lessons' | 'pass-plans';

export const KioskLessonListForm = ({ studioId, passPlans: initialPassPlans, locale, onSelectLesson, onSelectPassPlan, onSelectBundle, onBack, onChangeLocale, variant = 'kiosk' }: KioskLessonListFormProps) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const admin = variant === 'admin';
  const [tab, setTab] = useState<KioskTab>('lessons');
  // 프로모션(번들) — 무인은 onSale=true, admin은 전부. 비어있으면 탭 자체를 숨긴다.
  const [bundles, setBundles] = useState<BundleSummaryResponse[]>([]);
  // 번들 조회가 끝나기 전엔 사이드바 탭을 그리지 않는다 — 프로모션 탭이 뒤늦게 맨 위에 끼어들면서
  // 수업/패스권 탭이 아래로 밀리는 위치 변경을 막기 위함.
  const [bundlesLoaded, setBundlesLoaded] = useState(false);
  useEffect(() => {
    if (!studioId) return;
    getBundlesAction(admin ? undefined : true)
      .then(async (res) => {
        if (await handleKioskTokenExpired(res)) return;
        // 응답 껍데기가 { bundles } / { content } / { items } / 배열 등 어떤 형태로 와도 배열을 추출
        const r = res as Record<string, unknown> | BundleSummaryResponse[];
        const list = Array.isArray(r)
          ? r
          : (r.bundle ?? r.bundles ?? r.content ?? r.items ?? r.data ?? r.list ?? []);
        if (process.env.NODE_ENV !== 'production') console.log('[kiosk bundles]', admin ? '(all)' : '(onSale)', res);
        setBundles(Array.isArray(list) ? (list as BundleSummaryResponse[]) : []);
      })
      .catch((e) => { console.warn('[kiosk bundles] failed', e); })
      .finally(() => setBundlesLoaded(true));
  }, [studioId, admin]);
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
    // admin(상담실)은 전부(withAll) 불러온다. 응답 형태는 기존 StudioPassPlanListResponse 유지.
    getPassPlanListAction({ studioId, withAll: admin ? true : undefined })
      .then(async (res) => {
        if (await handleKioskTokenExpired(res)) return;
        if ('passPlans' in res) setPassPlans(res.passPlans);
      })
      .finally(() => setLoadingPassPlans(false));
  }, [tab, studioId, passPlans.length, admin]);

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
      <KioskTopBar locale={locale} onChangeLocale={onChangeLocale} onBack={onBack} onHome={onBack} hideLocale={admin} />

      {/* 상단 안내 — 탭별 제목. 수업 탭은 그 아래 날짜 선택(오늘부터 7일)도 노출. */}
      {(() => {
        const currentIdx = dateOptions.findIndex((d) => formatApiDate(d) === formatApiDate(selectedDate));
        const canPrev = currentIdx > 0;
        const canNext = currentIdx >= 0 && currentIdx < dateOptions.length - 1;
        const heading = tab === 'promotion' ? t('kiosk_select_promotion') : tab === 'pass-plans' ? t('kiosk_select_pass_plan') : t('kiosk_select_lesson');
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
          <div className="shrink-0 flex flex-col items-center" style={{ gap: 'min(1vw, 10px)', padding: 'min(1.4vw, 16px) 24px' }}>
            <span className="text-black font-bold text-center" style={{ fontSize: 'min(2.4vh, 28px)' }}>{heading}</span>
            {/* 날짜 선택은 수업 탭에서만 쓰지만, 탭을 바꿔도 헤더 높이가 변하지 않게 항상 렌더하고
                다른 탭에선 visibility로만 숨긴다 (아래 좌측 사이드바가 위아래로 흔들리는 것 방지). */}
            <div
              className="flex items-center justify-center"
              style={{ gap: 'min(2vw, 22px)', visibility: tab === 'lessons' ? 'visible' : 'hidden' }}
              aria-hidden={tab !== 'lessons'}
            >
              <ArrowButton hidden={!canPrev} direction="left" onClick={() => setSelectedDate(dateOptions[currentIdx - 1])} />
              <span className="text-[#4E5968] font-bold text-center" style={{ fontSize: 'min(1.8vh, 22px)', minWidth: 'min(18vh, 180px)' }}>
                {formatPillLabel(selectedDate)}
              </span>
              <ArrowButton hidden={!canNext} direction="right" onClick={() => setSelectedDate(dateOptions[currentIdx + 1])} />
            </div>
          </div>
        );
      })()}

      {/* 본문: 좌측 사이드바 + 우측 컨텐츠 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 좌측 사이드바 */}
        <div className="shrink-0 flex flex-col gap-[8px] py-[16px] px-[12px] border-r border-[#F2F4F6]" style={{ width: 'min(18vw, 180px)' }}>
          {bundlesLoaded && (
            <>
              {/* 프로모션(번들) — 번들이 있을 때만 맨 위에 노출 */}
              {bundles.length > 0 && (
                <KioskSideTab
                  label={t('kiosk_tab_promotion')}
                  active={tab === 'promotion'}
                  onClick={() => setTab('promotion')}
                  iconSrc="/assets/ic_kiosk_pass_plan.svg"
                />
              )}
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
            </>
          )}
        </div>

        {/* 우측 컨텐츠 */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '16px 24px' }}>
          {tab === 'promotion' && (
            <div className={`grid gap-[16px] ${admin ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {bundles.map((b) => {
                const discountRate = b.originalPrice > b.price && b.originalPrice > 0
                  ? Math.round((1 - b.price / b.originalPrice) * 100) : 0;
                const visible = b.items.slice(0, 4);
                const remaining = b.items.length - visible.length;
                const period = bundleSalesPeriod(b);
                return (
                  <button
                    key={b.id}
                    onClick={() => onSelectBundle?.(b)}
                    className="w-full rounded-[16px] bg-white border border-[#F1F3F6] overflow-hidden active:bg-[#F7F8F9] transition-colors text-left"
                  >
                    {/* 아이템 이미지 — 균등 분배 */}
                    <div className="w-full flex gap-px bg-white" style={{ height: 'min(20vh, 176px)' }}>
                      {visible.map((item, idx) => {
                        const thumb = item.imageUrl ?? item.thumbnailUrl;
                        const showOverlay = idx === visible.length - 1 && remaining > 0;
                        return (
                          <div key={`${item.itemType}-${item.itemId}`} className="relative flex-1 bg-[#F1F3F6] overflow-hidden">
                            {thumb && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={kioskImageSrc(thumb, 400)} alt="" className="w-full h-full object-cover"/>
                            )}
                            {showOverlay && (
                              <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                                <span className="text-white font-bold" style={{ fontSize: 'min(2vh,20px)' }}>+{remaining}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {/* 텍스트 */}
                    <div className="p-[16px]">
                      {(discountRate > 0 || period) && (
                        <div className="flex items-center gap-[6px] mb-[8px] flex-wrap">
                          {discountRate > 0 && (
                            <span className="px-[8px] py-[2px] rounded-full bg-[#FEF2F2] text-[#EF4444] font-bold" style={{ fontSize: 'min(1.3vh,13px)' }}>{discountRate}% OFF</span>
                          )}
                          {period && (
                            <span className="px-[8px] py-[2px] rounded-full bg-[#F3F4F6] text-[#4E5968] font-medium" style={{ fontSize: 'min(1.3vh,13px)' }}>{period}</span>
                          )}
                        </div>
                      )}
                      <div className="text-black font-bold truncate" style={{ fontSize: 'min(1.9vh,20px)' }}>{b.name}</div>
                      {b.description && (
                        <div className="mt-[2px] text-[#86898C] line-clamp-1" style={{ fontSize: 'min(1.4vh,14px)' }}>{b.description}</div>
                      )}
                      <div className="mt-[8px] flex items-baseline gap-[8px] flex-wrap">
                        <span className="text-black font-bold" style={{ fontSize: 'min(2.1vh,22px)' }}>
                          {new Intl.NumberFormat('ko-KR').format(b.price)}{t('won')}
                        </span>
                        {discountRate > 0 && (
                          <span className="text-[#BFC2C5] line-through" style={{ fontSize: 'min(1.4vh,14px)' }}>
                            {new Intl.NumberFormat('ko-KR').format(b.originalPrice)}{t('won')}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

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
                    <div className="flex items-center gap-[6px] flex-wrap">
                      {plan.isRecommended && (
                        <span className="inline-flex items-center gap-[4px] mb-[6px] px-[10px] py-[3px] rounded-full bg-[#1E2124]" style={{ fontSize: 'min(1.2vh, 13px)' }}>
                          <span className="text-[#FFC83D]">★</span>
                          <span className="text-white font-bold">{t('kiosk_recommended')}</span>
                        </span>
                      )}
                      {/* admin 조회(withAll)에 포함되는 비공개 패스권 태그 */}
                      {admin && plan.status === 'Private' && (
                        <span className="inline-flex items-center mb-[6px] px-[10px] py-[3px] rounded-full bg-[#E8E8EA]" style={{ fontSize: 'min(1.2vh, 13px)' }}>
                          <span className="text-[#6D7882] font-bold">{t('kiosk_private')}</span>
                        </span>
                      )}
                    </div>
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

