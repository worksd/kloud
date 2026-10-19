'use client';

import React, { useState } from "react";
import { kloudNav } from "@/app/lib/kloudNav";
import { KloudScreen } from "@/shared/kloud.screen";
import { StudioRegularClassResponse } from "@/app/endpoint/studio.endpoint";
import { CommunityPass } from "@/app/community/community.mock";
import { LessonTags } from "@/app/components/LessonTags";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { dayShortLabel, weeklyDaysLabel } from "@/utils/weekly.days";

export type StudioProgramTab = 'regularClass' | 'pass';

/**
 * 스튜디오 정규반·패스권 전체 목록 — 상단 고정 탭으로 나눠 한 페이지에서.
 *  - 비어 있는 탭은 숨긴다. 하나만 남으면 탭 줄 없이 제목 + 목록, 둘 다 비면 빈 상태.
 *  - 탭은 스크롤해도 상단에 붙어 있다(앱 웹뷰 top-0, PC 웹은 상단 내비 h-16 아래). 탭을 바꾸면 맨 위로 올린다.
 *  - 선택한 탭은 ?tab= 에 replace 해 둬 뒤로가기/새로고침/딥링크에서 같은 탭이 열린다.
 *  - 카드는 이 페이지 전용 — 스튜디오 상세의 미리보기 카드(StudioPassList 등)와 분리해 상세 화면엔 영향이 없다.
 *  - PC 웹은 2열 그리드.
 *  - 정규반 탭: 요일(days)이 있는 반이 하나라도 있으면 '전체 · 월 · 화 …' 요일 필터를 탭 아래에 붙인다.
 *    요일 칩은 실제로 다닐 수 있는 요일만. 요일을 고르면 그 요일에 다닐 수 있는 반만, days 없는 반은 뺀다.
 */
export function StudioProgramsTabs({ studioId, studioImageUrl, regularClasses, passes, initialTab, locale, isWeb, title }: {
  studioId: number;
  studioImageUrl?: string;
  regularClasses: StudioRegularClassResponse[];
  passes: CommunityPass[];
  initialTab: StudioProgramTab;
  locale: Locale;
  /** 브라우저 웹 — PC 상단 내비(h-16) 아래로 탭을 붙이고, PC 폭에서 2열 그리드 */
  isWeb: boolean;
  /** 웹에서만 — 탭 위에 그리는 페이지 제목 (앱은 네이티브 헤더가 단다) */
  title?: string;
}) {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });

  const available: StudioProgramTab[] = [
    ...(regularClasses.length > 0 ? ['regularClass' as const] : []),
    ...(passes.length > 0 ? ['pass' as const] : []),
  ];
  // 요청한 탭이 비어 있으면 남은 탭으로
  const [tab, setTab] = useState<StudioProgramTab>(available.includes(initialTab) ? initialTab : (available[0] ?? initialTab));

  // 요일 필터 — 반들의 days 합집합(0=일~6=토 중 월요일부터 보이게 정렬). 하나도 없으면 필터 숨김
  const dayOptions = Array.from(new Set(regularClasses.flatMap((rc) => rc.days ?? [])))
    .sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
  const [day, setDay] = useState<number | null>(null);
  const filteredClasses = day == null ? regularClasses : regularClasses.filter((rc) => rc.days?.includes(day));
  const showDayFilter = tab === 'regularClass' && dayOptions.length > 0;

  const onDayChange = (next: number | null) => {
    if (next === day) return;
    setDay(next);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
  };

  const onChange = (next: StudioProgramTab) => {
    if (next === tab) return;
    setTab(next);
    if (typeof window === 'undefined') return;
    // 두 목록 길이가 달라 스크롤 위치를 그대로 두면 화면이 튄다 — 맨 위로
    window.scrollTo({ top: 0 });
    const url = new URL(window.location.href);
    url.searchParams.set('tab', next);
    window.history.replaceState(window.history.state, '', url.toString());
  };

  const labelOf = (key: StudioProgramTab) => key === 'regularClass' ? t('studio_regular_classes') : t('community_pass');
  const countOf = (key: StudioProgramTab) => key === 'regularClass' ? regularClasses.length : passes.length;
  const grid = isWeb ? 'grid grid-cols-1 lg:grid-cols-2 gap-3' : 'grid grid-cols-1 gap-3';
  const stickyTop = isWeb ? 'top-0 lg:top-16' : 'top-0';

  const titleEl = title ? (
    <h1 className="px-4 pt-4 pb-2 text-[22px] font-bold text-[#171717]">{title}</h1>
  ) : null;

  if (available.length === 0) {
    return (
      <div className="flex flex-col">
      {titleEl}
      <div className="flex flex-col items-center justify-center gap-3 py-24 px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-[#F4F5F7] flex items-center justify-center">
          <TicketIcon className="w-7 h-7" color="#B0B8C1" />
        </div>
        <p className="text-[15px] font-bold text-[#4E5968]">{t('programs_empty')}</p>
      </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {titleEl}
      {/* 상단 고정 헤더 — 탭이 둘이면 탭, 하나면 제목만 */}
      <div className={`sticky ${stickyTop} z-20 bg-white border-b border-[#EEF0F2]`}>
        {available.length > 1 ? (
          <div className="px-4">
            <div role="tablist" className="relative flex">
              {available.map((key) => {
                const active = key === tab;
                return (
                  <button
                    key={key}
                    role="tab"
                    type="button"
                    aria-selected={active}
                    onClick={() => onChange(key)}
                    className={`relative flex-1 h-12 flex items-center justify-center gap-1.5 text-[15px] font-bold transition-colors ${active ? 'text-[#171717]' : 'text-[#9AA0A6] active:text-[#4E5968]'}`}
                  >
                    {labelOf(key)}
                    <span className={`text-[13px] font-semibold tabular-nums ${active ? 'text-[#3CC0AF]' : 'text-[#B0B8C1]'}`}>{countOf(key)}</span>
                  </button>
                );
              })}
              {/* 선택 탭 언더바 — 하나를 두고 옮겨서 탭을 바꾸면 옆으로 미끄러져 간다 */}
              <span
                aria-hidden
                className="absolute left-0 bottom-0 h-[2px] rounded-full bg-[#171717] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ width: `${100 / available.length}%`, transform: `translateX(${available.indexOf(tab) * 100}%)` }}
              />
            </div>
          </div>
        ) : (
          <div className="h-12 px-4 flex items-center gap-1.5">
            <span className="text-[17px] font-bold text-[#171717]">{labelOf(tab)}</span>
            <span className="text-[14px] font-semibold text-[#3CC0AF] tabular-nums">{countOf(tab)}</span>
          </div>
        )}
        {showDayFilter && (
          <div className="flex gap-2 px-4 py-2.5 overflow-x-auto scrollbar-hide border-t border-[#F4F5F7]">
            {[null, ...dayOptions].map((d) => {
              const active = d === day;
              return (
                <button
                  key={d ?? 'all'}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onDayChange(d)}
                  className={`shrink-0 h-8 px-3.5 rounded-lg text-[13px] font-semibold transition-colors ${active ? 'bg-[#171717] text-white' : 'bg-[#F4F5F7] text-[#4E5968] active:bg-[#EAECEF]'}`}
                >
                  {d == null ? t('programs_day_all') : dayShortLabel(d, locale)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div key={`${tab}-${day ?? 'all'}`} className="px-4 pt-4 pb-10 animate-[fadeIn_200ms_ease-out]">
        {tab === 'regularClass' && filteredClasses.length === 0 && (
          <p className="py-20 text-center text-[14px] font-semibold text-[#9AA0A6]">{t('regular_class_day_empty')}</p>
        )}
        <div className={grid}>
          {tab === 'regularClass'
            ? filteredClasses.map((rc) => (
                <RegularClassCard key={rc.id} rc={rc} studioImageUrl={studioImageUrl} artistLabel={t('regular_class_artist')} locale={locale} />
              ))
            : passes.map((p) => (
                <PassCard key={p.id} pass={p} won={t('won')} />
              ))}
        </div>

        {/* 패스 구매 안내사항 — 예전 패스권 구매 페이지(/passPlans) 하단에 있던 유효기간·양도·환불 규정.
            정규반도 가격정책(패스)으로 사는 거라 두 탭 모두에 깐다 */}
        <div className="mt-6 rounded-2xl bg-[#F7F8F9] px-5 py-5 flex flex-col gap-3">
          <div className="text-[14px] font-bold text-[#555]">{t(tab === 'regularClass' ? 'regular_class_enroll_information' : 'purchase_pass_information')}</div>
          <div className="text-[13px] text-[#999] whitespace-pre-line leading-relaxed">{t('pass_refund_policy')}</div>
        </div>
      </div>
    </div>
  );
}

/** 정규반 카드 — 큰 썸네일(반 이미지 → 강사 사진 → 학원 로고) + 태그 + 이름 + 담당 강사 + 요일 + 설명. 탭하면 정규반 결제로 */
function RegularClassCard({ rc, studioImageUrl, artistLabel, locale }: {
  rc: StudioRegularClassResponse;
  studioImageUrl?: string;
  artistLabel: string;
  locale: Locale;
}) {
  const artistName = rc.artist ? (rc.artist.nickName || rc.artist.name) : '';
  const daysLabel = weeklyDaysLabel(rc.days, locale);
  const thumbUrl = rc.imageUrl || rc.artist?.profileImageUrl || studioImageUrl;
  return (
    <button
      onClick={() => kloudNav.push(KloudScreen.RegularClassPayment(rc.id))}
      className="w-full text-left rounded-2xl border border-[#EEF0F2] bg-white p-3.5 flex gap-3.5 cursor-pointer transition-colors active:bg-[#FAFBFC] hover:bg-[#FAFBFC]"
    >
      <div className="shrink-0 w-[84px] h-[84px] rounded-xl overflow-hidden bg-[#F1F3F6]">
        {thumbUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbUrl} alt={rc.name} className="w-full h-full object-cover" />
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        {rc.tag && <LessonTags tags={rc.tag} className="self-start" />}
        <span className="text-[16px] font-bold text-[#171717] leading-snug line-clamp-1">{rc.name}</span>
        {artistName && (
          <span className="text-[13px] font-medium text-[#4E5968] truncate">{artistLabel} · {artistName}</span>
        )}
        {daysLabel && (
          <span className="self-start px-2 py-0.5 rounded-md bg-[#F4F5F7] text-[11px] font-semibold text-[#6D7882]">{daysLabel}</span>
        )}
        {rc.description && (
          <p className="text-[12px] text-[#86898C] leading-snug line-clamp-2">{rc.description}</p>
        )}
      </div>
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0 self-center">
        <path d="M9 6l6 6-6 6" stroke="#B0B8C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/** 패스권 카드 — 태그 + 이름 / 혜택 요약 / 유효기간, 오른쪽에 가격. 탭하면 바로 결제로 */
function PassCard({ pass: p, won }: { pass: CommunityPass; won: string }) {
  return (
    <button
      onClick={() => kloudNav.push(KloudScreen.PassPlanPayment(p.id))}
      className="w-full text-left rounded-2xl border border-[#EEF0F2] bg-white px-4 py-4 flex items-center gap-4 cursor-pointer transition-colors active:bg-[#FAFBFC] hover:bg-[#FAFBFC]"
    >
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {p.tag && <LessonTags tags={p.tag} className="self-start" />}
        <span className="text-[16px] font-bold text-[#171717] leading-snug line-clamp-1">{p.name}</span>
        {p.description && (
          <p className="text-[12px] text-[#86898C] leading-snug line-clamp-2">{p.description}</p>
        )}
        {p.period && (
          <span className="mt-0.5 self-start px-2 py-0.5 rounded-md bg-[#F4F5F7] text-[11px] font-semibold text-[#6D7882]">{p.period}</span>
        )}
      </div>
      <span className="shrink-0 text-[17px] font-bold text-[#171717] tabular-nums">
        {new Intl.NumberFormat('ko-KR').format(p.price)}{won}
      </span>
    </button>
  );
}

const TicketIcon = ({ className, color }: { className?: string; color: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 8.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1a2 2 0 0 0 0 5v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1a2 2 0 0 0 0-5v-1Z"
      stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M14 7v10" stroke={color} strokeWidth="1.6" strokeDasharray="2 2" />
  </svg>
);
