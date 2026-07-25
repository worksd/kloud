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
import { formatLessonDuration, formatLessonStart, formatLessonTimeRange, isLessonPayable, lessonBlockLabel } from "@/app/kiosk/kiosk.lesson";
import { formatFeatureDescription, formatRuleDescription } from "@/utils/pass.description";
import { kioskImageSrc } from "@/app/kiosk/kiosk.image";
import { LessonTypeLabel } from "@/app/components/LessonLabel";
import { LessonType } from "@/entities/lesson/lesson";

// 워크샵/팝업만 썸네일에 타입 태그를 노출한다 (정규/오디션은 표시 안 함).
const showLessonTypeTag = (type?: LessonType): boolean =>
  type === LessonType.Workshop || type === LessonType.PopUp;

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
  /** 'admin'(태블릿 상담실)이면 포스터+정보 카드 4열, 기본 'kiosk'는 포스터 3열. */
  variant?: 'kiosk' | 'admin';
};

type KioskTab = 'promotion' | 'lessons' | 'pass-plans';

export const KioskLessonListForm = ({ studioId, passPlans: initialPassPlans, locale, onSelectLesson, onSelectPassPlan, onSelectBundle, onBack, variant = 'kiosk' }: KioskLessonListFormProps) => {
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
  // lessons가 담고 있는 날짜(yyyy.MM.dd). 날짜를 바꿔도 새 응답이 오기 전까진 이전 목록을 그대로 두고,
  // 응답이 도착해 이 값이 바뀌는 순간 목록을 remount해서 fade로 갈아 끼운다 (로딩 문구로 깜빡이지 않게).
  const [lessonsKey, setLessonsKey] = useState<string | null>(null);
  const [passPlans, setPassPlans] = useState<GetPassPlanResponse[]>(initialPassPlans);
  const [loadingPassPlans, setLoadingPassPlans] = useState(false);
  const [passPlanDetail, setPassPlanDetail] = useState<GetPassPlanResponse | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<number | null>(null);

  const formatPillLabel = (d: Date): string => {
    const weekday = d.toLocaleDateString(INTL_LOCALE[locale], { weekday: 'short' });
    return `${d.getMonth() + 1}.${d.getDate()} (${weekday})`;
  };
  const todayKey = React.useMemo(() => formatApiDate(new Date()), []);
  const selectedKey = formatApiDate(selectedDate);
  const currentDateIdx = dateOptions.findIndex((d) => formatApiDate(d) === selectedKey);

  // 수업 탭: 선택된 날짜의 수업 목록 조회.
  // 요청 중에도 이전 날짜 목록을 화면에 남겨두고(setLessons를 미리 비우지 않음) 응답 도착 시 한 번에 교체 → 교차 fade.
  useEffect(() => {
    if (tab !== 'lessons' || !studioId) return;
    const dateKey = formatApiDate(selectedDate);
    setLoadingLessons(true);
    getLessonsByDate(studioId, dateKey)
      .then(async (res) => {
        if (await handleKioskTokenExpired(res)) return;
        // 취소된 수업은 키오스크에 노출 안 함 — 운영자/손님이 어차피 결제 못 하는 항목이라 리스트에서 제외
        if ('lessons' in res) {
          setLessons(res.lessons.filter((l) => l.status !== LessonStatus.Cancelled));
          setLessonsKey(dateKey);
        }
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
    <div className="bg-white w-full h-screen flex flex-col overflow-hidden animate-[fadeIn_260ms_ease-out]">
      {/* 타이틀은 두지 않는다 — 아래 상단 탭이 현재 위치를 대신 알려준다 */}
      <KioskTopBar onBack={onBack} onHome={onBack} />

      {/* ① 상단 탭 — 수업 / 패스권 / 프로모션. 번들 조회가 끝난 뒤 한 번에 그려서
          프로모션 탭이 뒤늦게 끼어들며 앞 탭을 밀지 않게 한다. */}
      <div
        className="shrink-0 flex items-end border-b border-[#F2F4F6]"
        style={{ height: 'min(7.5vh, 68px)', gap: 'min(1.4vw, 18px)', padding: '0 min(2.4vw, 32px)' }}
      >
        {bundlesLoaded && (
          <>
            <KioskTopTab label={t('kiosk_tab_lessons')} iconSrc="/assets/ic_kiosk_lesson.svg" active={tab === 'lessons'} onClick={() => setTab('lessons')} />
            <KioskTopTab label={t('kiosk_pass')} iconSrc="/assets/ic_kiosk_pass_plan.svg" active={tab === 'pass-plans'} onClick={() => setTab('pass-plans')} />
            {bundles.length > 0 && (
              <KioskTopTab label={t('kiosk_tab_promotion')} iconSrc="/assets/ic_kiosk_pass_plan.svg" active={tab === 'promotion'} onClick={() => setTab('promotion')} />
            )}
          </>
        )}
      </div>

      {/* ② 날짜 필터 — 화살표 내비게이션. 수업 탭 전용이라 패스권/프로모션 탭에서는 아예 렌더하지 않는다.
          (탭은 이 줄 위에 있어서 사라져도 탭 위치는 그대로다) */}
      {tab === 'lessons' && (
        <div
          className="shrink-0 flex items-center justify-center border-b border-[#F2F4F6]"
          style={{ height: 'min(8vh, 74px)', gap: 'min(2vw, 24px)' }}
        >
          <DateArrowButton
            hidden={currentDateIdx <= 0}
            direction="left"
            onClick={() => setSelectedDate(dateOptions[currentDateIdx - 1])}
          />
          <span className="text-[#4E5968] font-bold text-center" style={{ fontSize: 'min(1.5vh, 16px)', minWidth: 'min(16vh, 160px)' }}>
            {selectedKey === todayKey ? `${t('kiosk_today')} · ${formatPillLabel(selectedDate)}` : formatPillLabel(selectedDate)}
          </span>
          <DateArrowButton
            hidden={currentDateIdx < 0 || currentDateIdx >= dateOptions.length - 1}
            direction="right"
            onClick={() => setSelectedDate(dateOptions[currentDateIdx + 1])}
          />
        </div>
      )}

      {/* 본문 — 탭이 상단으로 올라가서 컨텐츠가 화면 전체 폭을 쓴다.
          탭이 바뀌면 remount(key)해서 fade. 날짜 전환 fade는 수업 목록 블록이 자체적으로 처리한다. */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          key={tab}
          className="flex-1 overflow-y-auto animate-[fadeIn_220ms_ease-out]"
          style={{ padding: 'min(2.2vh, 24px) min(2.4vw, 32px)' }}
        >
          {/* 프로모션(번들) — 한 줄에 하나씩 */}
          {tab === 'promotion' && (
            <div className="grid grid-cols-2" style={{ gap: 'min(1.8vh, 20px)' }}>
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
            /* 날짜 전환은 교차 fade — 목록 블록을 lessonsKey(=응답이 담고 있는 날짜)로 remount한다.
               로딩 중에는 이전 날짜 목록을 흐리게 남겨둬서 로딩 문구로 깜빡이지 않는다.
               (첫 진입만 예외적으로 로딩 문구 노출) */
            <div
              key={lessonsKey ?? 'initial'}
              className={`animate-[fadeIn_240ms_ease-out] transition-opacity duration-200 ${
                loadingLessons && lessonsKey !== selectedKey ? 'opacity-30' : 'opacity-100'
              }`}
            >
              {loadingLessons && lessonsKey === null && (
                <div className="flex items-center justify-center h-full text-[#86898C]" style={{ fontSize: 'min(1.8vh, 20px)' }}>{t('kiosk_loading')}</div>
              )}
              {lessonsKey !== null && lessons.length === 0 && (
                <div className="flex items-center justify-center h-full text-[#86898C]" style={{ fontSize: 'min(1.8vh, 20px)' }}>{t('kiosk_no_lessons')}</div>
              )}
              {/* admin(상담실)은 포스터를 크게 보여주고 그 아래 정보 블록에 시간/소요시간·제목·강사·가격·정원을 얹는다.
                  사이드바를 없애 폭이 남으므로 4열. 무인 키오스크는 손님용 포스터 그리드(3열) 유지. */}
              {lessons.length > 0 && admin && (
                <div className="grid grid-cols-4" style={{ gap: 'min(1.8vh, 20px)' }}>
                  {lessons.map((lesson) => (
                    <AdminLessonCard
                      key={lesson.id}
                      lesson={lesson}
                      locale={locale}
                      onClick={() => onSelectLesson(lesson)}
                    />
                  ))}
                </div>
              )}
              {lessons.length > 0 && !admin && (
                <div className="grid grid-cols-3" style={{ gap: 'min(2vh, 22px)' }}>
                  {lessons.map((lesson) => {
                    const payable = isLessonPayable(lesson);
                    const statusText = lessonBlockLabel(lesson, locale);
                    return (
                      <div
                        key={lesson.id}
                        onClick={payable ? () => onSelectLesson(lesson) : undefined}
                        className={`relative aspect-[3/5] overflow-hidden bg-[#E8E8EA] transition-transform rounded-[20px] ${
                          payable ? 'cursor-pointer active:scale-[0.97]' : 'cursor-not-allowed'
                        }`}
                      >
                        {lesson.thumbnailUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={kioskImageSrc(lesson.thumbnailUrl, 400)} alt="" className={`absolute inset-0 w-full h-full object-cover ${payable ? '' : 'grayscale opacity-60'}`} />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/75" />
                        {showLessonTypeTag(lesson.type) && (
                          <div className="absolute top-[8px] left-[8px]">
                            <LessonTypeLabel type={lesson.type!} locale={locale} />
                          </div>
                        )}
                        {!payable && statusText && (
                          <div className="absolute rounded-full bg-black/70 top-[8px] right-[8px] px-[10px] py-[3px]" style={{ fontSize: 'min(1.2vh, 13px)' }}>
                            <span className="text-white font-bold">{statusText}</span>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0" style={{ padding: '8% 8% 8%' }}>
                          <p className="text-white font-bold leading-snug line-clamp-2" style={{ fontSize: 'min(1.6vh, 18px)' }}>{lesson.title ?? ''}</p>
                          <p className="text-[#D5D5D5] mt-[3px]" style={{ fontSize: 'min(1.3vh, 14px)' }}>{formatLessonStart(lesson, locale)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === 'pass-plans' && loadingPassPlans && (
            <div className="flex items-center justify-center h-full text-[#86898C]" style={{ fontSize: 'min(1.8vh, 20px)' }}>{t('kiosk_loading')}</div>
          )}
          {/* 패스권 — 한 줄에 하나씩 */}
          {tab === 'pass-plans' && !loadingPassPlans && (
            <div className="grid grid-cols-1" style={{ gap: 'min(1.4vh, 14px)' }}>
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

// admin(상담실) 수업 카드 — 썸네일 좌 + 라벨 우. 직원이 손님에게 읽어줄 정보를 한 카드에 모은다.
// 시간·소요시간 / 제목 / 강사 / 가격 / 정원 + 판매 불가 상태 배지.
// admin은 지난·마감 수업도 선택 가능(게이팅 없음) — 상태는 배지로만 알려준다.
const AdminLessonCard = ({ lesson, locale, onClick }: { lesson: GetLessonResponse; locale: Locale; onClick: () => void }) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const timeRange = formatLessonTimeRange(lesson, locale) || formatLessonStart(lesson, locale);
  const duration = formatLessonDuration(lesson, locale);
  const artistNames = (lesson.artists ?? []).map((a) => a.nickName || a.name).filter(Boolean).join(', ');
  const priceText = lesson.price != null ? `${new Intl.NumberFormat('ko-KR').format(lesson.price)}${t('kiosk_won')}` : null;
  const capacityText = lesson.limit != null
    ? t('kiosk_capacity').replace('{current}', String(lesson.currentStudentCount ?? 0)).replace('{limit}', String(lesson.limit))
    : null;
  const isFull = lesson.limit != null && (lesson.currentStudentCount ?? 0) >= lesson.limit;
  const statusText = lessonBlockLabel(lesson, locale);

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-[18px] border border-[#F1F3F6] bg-white overflow-hidden flex flex-col cursor-pointer active:bg-[#F7F8F9] transition-colors"
    >
      {/* 썸네일 — 포스터 비율로 크게. 좌상단 타입 태그(워크샵/팝업) + 우상단 상태 배지를 이미지 위에 얹는다 */}
      <div className="relative w-full aspect-[3/4] bg-[#F1F3F6] overflow-hidden">
        {lesson.thumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={kioskImageSrc(lesson.thumbnailUrl, 600)} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        {showLessonTypeTag(lesson.type) && (
          <div className="absolute top-[10px] left-[10px]">
            <LessonTypeLabel type={lesson.type!} locale={locale} />
          </div>
        )}
        {statusText && (
          <span
            className="absolute top-[10px] right-[10px] rounded-full bg-black/70 text-white font-bold"
            style={{ fontSize: 'min(1.25vh, 13px)', padding: '3px 10px' }}
          >
            {statusText}
          </span>
        )}
      </div>

      {/* 정보 블록 — 시간·소요시간 / 제목 / 강사 / 가격 · 정원 */}
      <div className="flex flex-col" style={{ padding: 'min(1.3vh, 14px)', gap: 'min(0.45vh, 5px)' }}>
        <span className="text-[#4E5968] font-bold truncate" style={{ fontSize: 'min(1.5vh, 16px)' }}>
          {timeRange}
          {duration && <span className="text-[#8A949E] font-medium">{` · ${duration}`}</span>}
        </span>

        <p className="text-black font-bold leading-snug line-clamp-1" style={{ fontSize: 'min(1.85vh, 20px)' }}>{lesson.title ?? ''}</p>

        {artistNames && (
          <p className="text-[#6D7882] truncate" style={{ fontSize: 'min(1.4vh, 15px)' }}>{artistNames}</p>
        )}

        <div className="flex items-baseline justify-between" style={{ gap: '8px', marginTop: 'min(0.4vh, 4px)' }}>
          {priceText && (
            <span className="text-black font-bold" style={{ fontSize: 'min(1.7vh, 18px)' }}>{priceText}</span>
          )}
          {capacityText && (
            <span className={`shrink-0 font-bold ${isFull ? 'text-[#EF4444]' : 'text-[#8A949E]'}`} style={{ fontSize: 'min(1.35vh, 14px)' }}>
              {capacityText}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

// 상단 탭 — 선택된 탭 아래에 밑줄 인디케이터. (좌측 사이드바를 대체)
const KioskTopTab = ({ label, iconSrc, active, onClick }: { label: string; iconSrc?: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`shrink-0 relative font-bold transition-colors flex items-center ${active ? 'text-[#1E2124]' : 'text-[#B1B8BE]'}`}
    style={{ height: '100%', padding: '0 min(0.6vw, 8px)', gap: 'min(0.5vw, 7px)', fontSize: 'min(1.7vh, 19px)' }}
  >
    {iconSrc && (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={iconSrc} alt="" style={{ width: 'min(2.2vh, 22px)', height: 'min(2.2vh, 22px)', opacity: active ? 1 : 0.4 }} />
    )}
    {label}
    <span
      className="absolute left-0 right-0 bottom-0 rounded-t-full bg-[#1E2124] transition-opacity"
      style={{ height: 3, opacity: active ? 1 : 0 }}
    />
  </button>
);

// 날짜 이동 화살표 — 끝(첫날/마지막날)에서는 visibility로만 숨겨서 가운데 날짜 위치가 흔들리지 않게 한다.
const DateArrowButton = ({ hidden, onClick, direction }: { hidden: boolean; onClick: () => void; direction: 'left' | 'right' }) => (
  <button
    type="button"
    onClick={hidden ? undefined : onClick}
    aria-label={direction === 'left' ? 'previous day' : 'next day'}
    className="rounded-full flex items-center justify-center bg-[#F2F4F6] active:scale-[0.94] transition-transform"
    style={{ width: 'min(5vh, 52px)', height: 'min(5vh, 52px)', visibility: hidden ? 'hidden' : 'visible' }}
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

