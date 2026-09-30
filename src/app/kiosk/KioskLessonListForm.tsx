'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { GetLessonResponse, LessonStatus, BundleSummaryResponse } from "@/app/endpoint/lesson.endpoint";
import { GetPassPlanResponse } from "@/app/endpoint/pass.endpoint";
import { getPassPlanAction } from "@/app/passPlans/action/get.pass.plan.action";
import { getAllPassPlanListForKioskAction, getPassPlanListAction } from "@/app/passPlans/action/get.pass.plan.list.action";
import { getLessonsByDate } from "@/app/kiosk/get.lessons.by.date.action";
import { getBundlesAction } from "@/app/kiosk/get.bundles.action";
import { KioskPassPlanDetailModal } from "@/app/kiosk/KioskPassPlanDetailModal";
import { KioskTopBar } from "@/app/kiosk/KioskTopBar";
import { handleKioskTokenExpired } from "@/app/kiosk/kiosk.error";
import { formatLessonDate, formatLessonDuration, formatLessonStart, formatLessonTimeRange, isLessonPayable, lessonBlockLabel, lessonStatusLabel } from "@/app/kiosk/kiosk.lesson";
import { Toast } from "@/app/components/Toast";
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

/**
 * 장바구니(카트) — igin 다중결제 포팅. 무인 키오스크만 쓴다(admin은 탭=선택 그대로).
 * 넘기면 포스터 탭이 담기/빼기 토글로 바뀌고 상세는 길게 눌러야 열린다. 카트 바가 그리드 위에 겹쳐 뜬다.
 */
export type KioskLessonCart = {
  items: GetLessonResponse[];
  onToggle: (lesson: GetLessonResponse) => void;
  onRemove: (lesson: GetLessonResponse) => void;
  onCheckout: () => void;
};

type KioskLessonListFormProps = {
  studioId: number;
  passPlans: GetPassPlanResponse[];
  locale: Locale;
  onSelectLesson: (lesson: GetLessonResponse) => void;
  cart?: KioskLessonCart;
  onSelectPassPlan: (plan: GetPassPlanResponse) => void;
  onSelectBundle?: (bundle: BundleSummaryResponse) => void;
  onBack: () => void;
  /** 'admin'(태블릿 상담실)이면 포스터+정보 카드 4열, 기본 'kiosk'는 포스터 3열. */
  variant?: 'kiosk' | 'admin';
};

type KioskTab = 'promotion' | 'lessons' | 'pass-plans';

export const KioskLessonListForm = ({ studioId, passPlans: initialPassPlans, locale, onSelectLesson, cart, onSelectPassPlan, onSelectBundle, onBack, variant = 'kiosk' }: KioskLessonListFormProps) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const admin = variant === 'admin';
  const cartEnabled = !!cart && !admin;
  const cartIds = new Set((cart?.items ?? []).map((l) => l.id));
  const [toast, setToast] = useState<string | null>(null);
  // 담기 애니메이션 목표(카트 바의 수량 배지)와 오버레이 컨테이너
  const cartBadgeRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  // 포스터 → 카트 배지로 날아가는 썸네일. 500ms easeInCubic, 크기 1→0.45, 75% 이후 페이드아웃 (igin 포팅)
  const flyToCart = useCallback((fromEl: HTMLElement, thumbnailUrl?: string) => {
    if (typeof window === 'undefined') return;
    const from = fromEl.getBoundingClientRect();
    const badge = cartBadgeRef.current?.getBoundingClientRect();
    const sx = from.left + from.width / 2;
    const sy = from.top + from.height / 2;
    // 배지가 아직 없으면(첫 담기) 카트 바가 뜰 자리 근처로
    const tx = badge ? badge.left + badge.width / 2 : window.innerWidth * 0.3;
    const ty = badge ? badge.top + badge.height / 2 : window.innerHeight - 88;
    const SIZE = 56;
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;left:${sx - SIZE / 2}px;top:${sy - SIZE / 2}px;width:${SIZE}px;height:${SIZE}px;border-radius:50%;overflow:hidden;background:#E8E8EA;z-index:60;pointer-events:none;box-shadow:0 6px 18px rgba(0,0,0,.25)`;
    if (thumbnailUrl) {
      const img = document.createElement('img');
      img.src = kioskImageSrc(thumbnailUrl, 200) ?? thumbnailUrl;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover';
      el.appendChild(img);
    }
    document.body.appendChild(el);
    const anim = el.animate(
      [
        { transform: 'translate(0,0) scale(1)', opacity: 1, offset: 0 },
        { transform: `translate(${(tx - sx) * 0.75}px,${(ty - sy) * 0.75}px) scale(${1 - 0.55 * 0.75})`, opacity: 1, offset: 0.75 },
        { transform: `translate(${tx - sx}px,${ty - sy}px) scale(0.45)`, opacity: 0, offset: 1 },
      ],
      { duration: 500, easing: 'cubic-bezier(0.32, 0, 0.67, 0)', fill: 'forwards' },
    );
    anim.onfinish = () => el.remove();
    anim.oncancel = () => el.remove();
  }, []);
  // 결제 불가 포스터 탭 — Completed면 '종료된 수업', 그 외는 상태 라벨 토스트
  const onBlockedTap = (lesson: GetLessonResponse) => {
    setToast(lesson.status === LessonStatus.Completed ? t('kiosk_lesson_ended_toast') : (lessonStatusLabel(lesson.status, locale) || lessonBlockLabel(lesson, locale)));
  };
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

  // 패스권 탭 진입 시 목록 fetch.
  // admin(상담실)은 비공개(Private) 포함 위해 '한 번은' 재조회한다.
  // (초기 passPlans는 공개만 담겨 올 수 있어, length>0로 스킵하면 비공개가 안 보이던 문제)
  //
  // admin과 일반은 엔드포인트 자체가 다르다 —
  //   admin  GET /passPlans?studioId={id}&withAll=true   (Private 포함, 페이지네이션 없음)
  //   일반   GET /studios/{id}/pass-plans                (판매중 공개만)
  const didFetchPassPlansRef = useRef(false);
  useEffect(() => {
    if (tab !== 'pass-plans' || !studioId) return;
    if (didFetchPassPlansRef.current) return;
    // 비admin은 이미 받은 공개 목록이 있으면 재조회 불필요. admin은 전체 조회 위해 항상 1회 조회.
    if (!admin && passPlans.length > 0) return;
    didFetchPassPlansRef.current = true;
    setLoadingPassPlans(true);
    const request = admin
      ? getAllPassPlanListForKioskAction({ studioId })
      : getPassPlanListAction({ studioId });
    request
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
      <div ref={bodyRef} className="relative flex-1 flex flex-col overflow-hidden">
        <div
          key={tab}
          className="flex-1 overflow-y-auto animate-[fadeIn_220ms_ease-out]"
          style={{
            padding: 'min(2.2vh, 24px) min(2.4vw, 32px)',
            // 카트 바가 그리드 위에 겹치므로 담긴 만큼 하단 여백을 준다 (igin: 150 + n*144)
            paddingBottom: cartEnabled && tab === 'lessons' && cartIds.size > 0 ? `${150 + cartIds.size * 144}px` : undefined,
          }}
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
                    const inCart = cartEnabled && cartIds.has(lesson.id);
                    return (
                      <KioskLessonPoster
                        key={lesson.id}
                        lesson={lesson}
                        locale={locale}
                        payable={payable}
                        statusText={statusText}
                        inCart={inCart}
                        // 카트 모드: 탭=담기/빼기, 길게=상세. 카트 없음: 탭=상세(기존)
                        onTap={(el) => {
                          if (!payable) { if (cartEnabled) onBlockedTap(lesson); return; }
                          if (!cartEnabled) { onSelectLesson(lesson); return; }
                          if (!inCart) flyToCart(el, lesson.thumbnailUrl);
                          cart!.onToggle(lesson);
                        }}
                        onLongPress={cartEnabled && payable ? () => onSelectLesson(lesson) : undefined}
                      />
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

        {/* 카트 바 — 그리드 위에 겹쳐 뜬다. 비면 아래로 미끄러져 나가며 사라지고 터치를 받지 않는다 (igin 포팅) */}
        {cartEnabled && tab === 'lessons' && (
          <KioskCartBar
            items={cart!.items}
            locale={locale}
            badgeRef={cartBadgeRef}
            onRemove={cart!.onRemove}
            onCheckout={cart!.onCheckout}
          />
        )}
      </div>

      {toast && (
        <Toast
          key={toast}
          message={<span className="text-white font-medium" style={{ fontSize: 'min(2.2vw, 24px)' }}>{toast}</span>}
          onDone={() => setToast(null)}
          className="px-[min(3vw,32px)] py-[min(1.8vw,20px)] rounded-[16px] bg-black/85"
          wrapperClassName="fixed left-1/2 -translate-x-1/2 z-40"
          wrapperStyle={{ bottom: 'min(7.4vw, 80px)' }}
        />
      )}

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



// 무인 포스터 카드 — 카트 모드에서는 탭=담기/빼기, 500ms 길게 누르면 상세. 담기면 진한 보더 + 12% 덮개 + 우상단 체크 배지.
const LONG_PRESS_MS = 500;
const KioskLessonPoster = ({ lesson, locale, payable, statusText, inCart, onTap, onLongPress }: {
  lesson: GetLessonResponse;
  locale: Locale;
  payable: boolean;
  statusText: string;
  inCart: boolean;
  onTap: (el: HTMLElement) => void;
  onLongPress?: () => void;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);
  const movedRef = useRef(false);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const clear = () => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } };
  const onPointerDown = (e: React.PointerEvent) => {
    firedRef.current = false;
    movedRef.current = false;
    startRef.current = { x: e.clientX, y: e.clientY };
    if (!onLongPress) return;
    clear();
    timerRef.current = setTimeout(() => { firedRef.current = true; onLongPress(); }, LONG_PRESS_MS);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const st = startRef.current;
    // 10px 넘게 움직이면 스크롤로 본다 — 길게 누르기 취소 + 손 뗄 때 탭으로 치지 않음
    if (st && Math.hypot(e.clientX - st.x, e.clientY - st.y) > 10) { movedRef.current = true; clear(); }
  };
  const onPointerUp = () => {
    clear();
    if (!firedRef.current && !movedRef.current && ref.current) onTap(ref.current);
    startRef.current = null;
  };
  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={clear}
      onPointerLeave={clear}
      onContextMenu={(e) => e.preventDefault()}
      className={`relative aspect-[3/5] overflow-hidden bg-[#E8E8EA] transition-transform rounded-[20px] select-none ${
        payable ? 'cursor-pointer active:scale-[0.97]' : 'cursor-not-allowed'
      }`}
      style={{ touchAction: 'pan-y', boxShadow: inCart ? 'inset 0 0 0 3.5px #1E2124' : undefined }}
    >
      {lesson.thumbnailUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={kioskImageSrc(lesson.thumbnailUrl, 400)} alt="" draggable={false} className={`absolute inset-0 w-full h-full object-cover ${payable ? '' : 'grayscale opacity-60'}`} />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/75" />
      {inCart && <div className="absolute inset-0 bg-black/[0.12] rounded-[20px]" />}
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
      {inCart && (
        <div className="absolute top-[8px] right-[8px] w-[34px] h-[34px] rounded-full bg-[#1E2124] flex items-center justify-center animate-[scaleIn_280ms_cubic-bezier(0.34,1.56,0.64,1)]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M5 12.5L10 17.5L19 8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0" style={{ padding: '8% 8% 8%' }}>
        <p className="text-white font-bold leading-snug line-clamp-2" style={{ fontSize: 'min(1.6vh, 18px)' }}>{lesson.title ?? ''}</p>
        <p className="text-[#D5D5D5] mt-[3px]" style={{ fontSize: 'min(1.3vh, 14px)' }}>{formatLessonStart(lesson, locale)}</p>
      </div>
    </div>
  );
};

// 카트 바 — 담은 수업 세로 목록 + 하단 행(수량 배지 · 합계 · 결제하기). 진한 배경, 큰 라운드, 그림자.
// 비면 280ms 동안 아래로 미끄러져 나가며 사라진다(마운트는 유지해 애니메이션이 보이게).
const KioskCartBar = ({ items, locale, badgeRef, onRemove, onCheckout }: {
  items: GetLessonResponse[];
  locale: Locale;
  badgeRef: React.MutableRefObject<HTMLDivElement | null>;
  onRemove: (lesson: GetLessonResponse) => void;
  onCheckout: () => void;
}) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const count = items.length;
  const total = items.reduce((s, l) => s + (l.price ?? 0), 0);
  const visible = count > 0;
  return (
    <div
      className="absolute left-[5.6%] right-[5.6%] bottom-[10px] z-30 rounded-[28px] bg-[#1E2124] text-white flex flex-col transition-all duration-[280ms] ease-out"
      style={{
        padding: 'min(1.6vh, 18px)',
        gap: 'min(1.2vh, 12px)',
        boxShadow: '0 14px 40px rgba(0,0,0,0.35)',
        transform: visible ? 'translateY(0)' : 'translateY(120%)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {/* 담은 항목 — 등장 시 0.7→1 bounce */}
      <div className="flex flex-col overflow-y-auto" style={{ gap: 'min(1vh, 10px)', maxHeight: '38vh' }}>
        {items.map((l) => (
          <div key={l.id} className="flex items-center gap-[14px] animate-[scaleIn_280ms_cubic-bezier(0.34,1.56,0.64,1)]">
            <div className="w-[104px] h-[132px] rounded-[14px] overflow-hidden bg-white/10 shrink-0">
              {l.thumbnailUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={kioskImageSrc(l.thumbnailUrl, 300)} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-[4px]">
              <p className="text-white text-[18px] font-bold leading-snug line-clamp-2">{l.title ?? ''}</p>
              <p className="text-white/70 text-[15px] truncate">
                {[formatLessonDate(l, locale), formatLessonStart(l, locale)].filter(Boolean).join(' · ')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRemove(l)}
              aria-label="remove"
              className="shrink-0 w-[38px] h-[38px] rounded-full bg-white/15 flex items-center justify-center active:scale-[0.92] transition-transform"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 6L18 18M6 18L18 6" stroke="white" strokeWidth="2.6" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* 하단 행 */}
      <div className="flex items-center gap-[12px]">
        <div
          ref={badgeRef}
          key={count}
          className="w-[40px] h-[40px] rounded-full bg-white text-[#1E2124] font-bold text-[18px] flex items-center justify-center shrink-0 animate-[scaleIn_200ms_ease-out]"
        >
          {count}
        </div>
        <span className="text-white text-[16px] font-bold">{t('kiosk_cart_count').replace('{count}', String(count))}</span>
        {total > 0 && (
          <span className="text-white/70 text-[16px]">{new Intl.NumberFormat('ko-KR').format(total)}{t('won')}</span>
        )}
        <div className="flex-1" />
        <button
          type="button"
          onClick={onCheckout}
          className="rounded-[16px] bg-white text-[#1E2124] font-bold text-[22px] active:scale-[0.97] transition-transform"
          style={{ padding: '14px 44px' }}
        >
          {t('kiosk_cart_pay_cta')}
        </button>
      </div>
    </div>
  );
};
