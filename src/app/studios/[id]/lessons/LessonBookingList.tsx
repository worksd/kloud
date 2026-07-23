'use client'

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { kloudNav } from "@/app/lib/kloudNav";
import { KloudScreen } from "@/shared/kloud.screen";
import { GetBandLessonResponse, GetLessonButtonResponse, GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { getStudioLessonDetailAction } from "@/app/studios/[id]/lessons/get.lesson.buttons.action";
import { LessonLevelLabel } from "@/app/components/LessonLabel";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

// 시간표 등 외부에서 이 시트를 열 때 쓰는 window 이벤트 (studioId로 스코프)
export const openLessonSheetEvent = (studioId: number) => `studio-${studioId}-open-lesson-sheet`;

// 'yyyy.MM.dd HH:mm' (KST) → epoch(ms). activateAt 비교용.
function parseKstLocalToEpoch(activateAt: string): number {
  const [d, t] = activateAt.trim().split(' ');
  const [Y, M, D] = d.split('.').map(Number);
  const [h, m, sStr] = (t ?? '').split(':');
  return Date.UTC(Y, M - 1, D, Number(h) - 9, Number(m), Number(sStr ?? 0));
}

// 활성화 시점이 지난 버튼 중 최신 것. activateAt 없으면 항상 ON & 최우선. (LessonDetailButton과 동일 규칙)
function pickAvailableButton(buttons: GetLessonButtonResponse[], nowUtcMs: number): GetLessonButtonResponse | null {
  const alwaysOn = buttons.find((b) => b.activateAt == null);
  if (alwaysOn) return alwaysOn;
  let latest: { btn: GetLessonButtonResponse; ts: number } | null = null;
  for (const btn of buttons) {
    const ts = parseKstLocalToEpoch(btn.activateAt!);
    if (!Number.isFinite(ts) || ts > nowUtcMs) continue;
    if (!latest || ts > latest.ts) latest = { btn, ts };
  }
  return latest ? latest.btn : null;
}

// 스튜디오 상세 수업 목록. 카드 탭 → 바텀시트로 상세 정보(장르·레벨·시간·강사·홀·가격) + 바로 결제 진입.
export function LessonBookingList({
  lessons,
  studioId,
  title,
  locale,
  appVersion = '',
}: {
  lessons: GetBandLessonResponse[];
  studioId: number;
  title: string;
  locale: Locale;
  appVersion?: string;
}) {
  const router = useRouter();
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<GetLessonResponse | null>(null); // null=로딩중
  const [entered, setEntered] = useState(false);
  const [dragY, setDragY] = useState(0);          // 드래그 중 아래로 이동 거리(px)
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);

  const openSheet = (lessonId: number) => {
    setSelectedId(lessonId);
    setDetail(null);
    setDragY(0);
    closingRef.current = false;
    getStudioLessonDetailAction({ lessonId }).then((res) => setDetail(res));
  };

  // 시간표 등 외부(같은 스튜디오)에서 발생시킨 이벤트로도 이 시트를 연다.
  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<{ lessonId: number }>).detail?.lessonId;
      if (typeof id === 'number') openSheet(id);
    };
    window.addEventListener(openLessonSheetEvent(studioId), handler);
    return () => window.removeEventListener(openLessonSheetEvent(studioId), handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studioId]);
  const closeSheet = (after?: () => void) => {
    if (closingRef.current) return;
    closingRef.current = true;
    setDragging(false);
    dragStart.current = null;
    setEntered(false); // 슬라이드 다운
    setTimeout(() => { setSelectedId(null); setDetail(null); setDragY(0); closingRef.current = false; after?.(); }, 300);
  };

  // 시트 전체 드래그로 내려 닫기. 내부 스크롤이 맨 위일 때만 드래그 시작(그 외엔 스크롤 우선).
  const onDragStart = (e: React.TouchEvent) => { dragStart.current = e.touches[0].clientY; };
  const onDragMove = (e: React.TouchEvent) => {
    if (dragStart.current == null) return;
    const dy = e.touches[0].clientY - dragStart.current;
    const atTop = (scrollRef.current?.scrollTop ?? 0) <= 0;
    if (dy > 0 && atTop) {
      setDragging(true);
      setDragY(dy);
    } else if (dragY !== 0) {
      setDragY(0);
    }
  };
  const onDragEnd = () => {
    if (dragStart.current == null) return;
    dragStart.current = null;
    setDragging(false);
    if (dragY > 120) closeSheet();   // 충분히 내리면 닫기
    else setDragY(0);                // 아니면 스냅백
  };

  // 마운트 직후 초기 transform(화면 밖)이 페인트된 다음 프레임에 entered=true로 → 확실히 슬라이드업 애니메이션
  useEffect(() => {
    if (selectedId == null) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => { raf2 = requestAnimationFrame(() => setEntered(true)); });
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
  }, [selectedId]);

  useEffect(() => {
    if (selectedId == null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [selectedId]);

  const goPay = (route: string) => {
    if (appVersion === '') router.push(route);
    else kloudNav.push(route);
  };

  const availableButton = detail?.buttons ? pickAvailableButton(detail.buttons, Date.now()) : null;
  const selectedCard = lessons.find((l) => l.id === selectedId);

  return (
    <div className="w-full pb-8">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-5 px-4">
        <div className="text-[20px] text-black font-bold">{title}</div>
        {lessons.length >= 4 && (
          <button
            onClick={() => kloudNav.push(KloudScreen.StudioLessons(studioId))}
            className="text-[13px] text-[#999] font-medium active:opacity-60 transition-opacity"
          >
            {t('more')} &rsaquo;
          </button>
        )}
      </div>

      {/* 수업 카드 그리드 */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-3 w-full">
          {lessons.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => openSheet(lesson.id)}
              className="flex flex-col text-left active:scale-[0.98] transition-transform duration-150"
            >
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#F1F3F6]">
                {lesson.thumbnailUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={lesson.thumbnailUrl} alt={lesson.title} className="absolute inset-0 w-full h-full object-cover" />
                )}
                {lesson.label?.isEnded && (
                  <div className="absolute bottom-0 w-full bg-black/60 py-2 text-white text-center font-bold text-[14px]">
                    {t('finish')}
                  </div>
                )}
              </div>
              <span className="mt-2 text-[15px] font-bold text-[#171717] leading-tight line-clamp-1">{lesson.title}</span>
              {lesson.description && (
                <span className="mt-0.5 text-[12px] text-[#86898C] line-clamp-1">{lesson.description}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 바텀시트 — 수업 상세 + 결제 진입 */}
      {selectedId != null && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div
            className="absolute inset-0 bg-black/50"
            style={{ opacity: entered ? 1 : 0, transition: 'opacity 380ms ease-out' }}
            onClick={() => closeSheet()}
          />
          <div
            className="relative w-full bg-white rounded-t-3xl flex flex-col max-h-[88vh] will-change-transform"
            style={{
              transform: `translateY(${entered ? dragY : (typeof window !== 'undefined' ? window.innerHeight : 1000)}px)`,
              transition: dragging ? 'none' : 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
            onTouchStart={onDragStart}
            onTouchMove={onDragMove}
            onTouchEnd={onDragEnd}
          >
            {/* 드래그 핸들 + 닫기 버튼 (이미지 위쪽 헤더) */}
            <div className="shrink-0 relative h-12">
              <div className="w-10 h-1 rounded-full bg-[#E6E8EA] mx-auto mt-3" />
              <button
                onClick={() => closeSheet()}
                aria-label="close"
                className="absolute right-3 top-2.5 flex h-8 w-8 items-center justify-center rounded-full active:bg-[#F1F3F6] transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path d="M6 6l12 12M18 6L6 18" stroke="#8A949E" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div ref={scrollRef} className="overflow-y-auto overscroll-contain">
              {/* 대표 이미지 */}
              {(detail?.thumbnailUrl ?? selectedCard?.thumbnailUrl) && (
                <div className="px-5 pt-2">
                  <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-[#F1F3F6]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={detail?.thumbnailUrl ?? selectedCard?.thumbnailUrl}
                      alt={detail?.title ?? selectedCard?.title ?? ''}
                      className="w-full h-full object-cover"
                    />
                    {/* D-day 배지 */}
                    {detail?.dday && (
                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2 py-0.5 rounded-full bg-[#3CC0AF] text-white text-[11px] font-bold">{detail.dday}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 제목 + 레벨/장르 */}
              <div className="px-5 pt-3.5">
                <div className="flex items-center gap-1.5">
                  {detail?.level && <LessonLevelLabel label={detail.level} locale={locale} />}
                  {detail?.genre && (
                    <span className="px-2 py-0.5 rounded-[4px] bg-[#F1F3F6] text-[#4E5968] text-[12px] font-bold">{detail.genre}</span>
                  )}
                </div>
                <h2 className="mt-1.5 text-[20px] font-bold text-[#171717] leading-snug">
                  {detail?.title ?? selectedCard?.title}
                </h2>
                {detail?.startDate && (
                  <p className="mt-1 text-[13px] text-[#86898C]">{detail.startDate}</p>
                )}
              </div>

              {/* 정보 행: 수업시간 · 강의실 */}
              <div className="px-5 mt-4 flex flex-col gap-2.5">
                {detail?.duration != null && (
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[#86898C]">{t('lesson_duration')}</span>
                    <span className="text-[14px] font-medium text-[#171717]">{detail.duration}{t('minutes')}</span>
                  </div>
                )}
                {detail?.room?.name && (
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[#86898C]">{t('lesson_room')}</span>
                    <span className="text-[14px] font-medium text-[#171717]">{detail.room.name}</span>
                  </div>
                )}
              </div>

              {/* 강사 */}
              {detail?.artists && detail.artists.length > 0 && (
                <div className="px-5 mt-4">
                  <p className="text-[13px] text-[#86898C] mb-2">{t('kiosk_artist')}</p>
                  <div className="flex flex-wrap gap-3">
                    {detail.artists.map((a) => (
                      <div key={a.id} className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-[#F1F3F6] shrink-0">
                          {a.profileImageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={a.profileImageUrl} alt={a.nickName || a.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex flex-col leading-tight">
                          <span className="text-[14px] font-bold text-[#171717]">{a.nickName || a.name}</span>
                          {a.nickName && a.name && <span className="text-[11px] text-[#A0A5AB]">{a.name}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 소개 */}
              {detail?.description && (
                <div className="px-5 mt-4">
                  <p className="text-[13px] text-[#4E5968] leading-relaxed whitespace-pre-line">{detail.description}</p>
                </div>
              )}

              <div className="h-4" />
            </div>

            {/* 하단 결제 버튼 */}
            <div className="px-5 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] border-t border-[#F1F3F6] shrink-0">
              {detail === null ? (
                <div className="w-full h-14 rounded-2xl bg-[#F1F3F6] flex items-center justify-center">
                  <span className="text-[15px] font-bold text-[#A0A5AB]">···</span>
                </div>
              ) : availableButton?.route ? (
                <button
                  onClick={() => closeSheet(() => goPay(availableButton.route!))}
                  className="w-full h-14 rounded-2xl bg-[#171717] flex items-center justify-center active:scale-[0.98] transition-transform"
                >
                  <span className="text-[16px] font-bold text-white">{availableButton.title}</span>
                </button>
              ) : (
                <div className="w-full h-14 rounded-2xl bg-[#E4E8EC] flex items-center justify-center">
                  <span className="text-[15px] font-bold text-[#A0A5AB]">{t('lesson_payment_unavailable')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
