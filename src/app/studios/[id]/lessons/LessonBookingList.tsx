'use client'

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { kloudNav } from "@/app/lib/kloudNav";
import { KloudScreen } from "@/shared/kloud.screen";
import { GetBandLessonResponse, GetLessonButtonResponse, GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { getStudioLessonDetailAction } from "@/app/studios/[id]/lessons/get.lesson.buttons.action";
import { LessonLabel, LessonLevelLabel, LessonTypeLabel } from "@/app/components/LessonLabel";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { formatRelativeLessonDate } from "@/utils/lesson.relative.date";

// 시간표 등 외부에서 이 시트를 열 때 쓰는 window 이벤트 (studioId로 스코프)
export const openLessonSheetEvent = (studioId: number) => `studio-${studioId}-open-lesson-sheet`;

// 바텀시트 모션 — iOS 시트 감각에 맞춘 값들.
/** 열기/닫기 transition 길이(ms). 언마운트 타이머도 이 값을 그대로 쓴다. */
const SHEET_MS = 320;
/** iOS 시트가 쓰는 감속 곡선 — 초반에 빠르게 붙고 끝에서 부드럽게 멎는다. */
const SHEET_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';
/**
 * 이 거리를 넘어야 '드래그'로 확정한다(px). 이 전에는 preventDefault도 하지 않는다 —
 * 탭 도중의 미세한 손가락 움직임에 click이 취소되면 버튼이 안 눌린다.
 */
const DRAG_THRESHOLD = 12;
/** 이 이상 내리면 닫기(px) */
const DISMISS_DISTANCE = 96;
/** 이 이상 빠르면 거리와 무관하게 닫기(px/ms ≈ 0.6 → 600px/s) */
const DISMISS_VELOCITY = 0.6;

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

  // 상대 날짜는 클라이언트 '지금' 기준이라 SSR/클라 하이드레이션 미스매치 방지용 마운트 가드
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<GetLessonResponse | null>(null); // null=로딩중
  const [entered, setEntered] = useState(false);
  const [dragY, setDragY] = useState(0);          // 드래그 중 아래로 이동 거리(px)
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const dragActive = useRef(false);               // 임계값을 넘겨 '드래그로 확정'됐는지
  const dragYRef = useRef(0);                     // onDragEnd에서 최신값을 읽기 위한 미러
  const lastMove = useRef<{ y: number; t: number } | null>(null);
  const velocityRef = useRef(0);                  // px/ms, 아래 방향이 양수
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
    // 언마운트 지연은 transform transition과 같은 길이여야 한다. 짧으면 애니메이션 도중에
    // 시트가 사라져서 뚝 끊기는 느낌이 난다(기존 300ms vs 420ms 불일치).
    setTimeout(() => { setSelectedId(null); setDetail(null); setDragY(0); closingRef.current = false; after?.(); }, SHEET_MS);
  };

  // 시트 전체 드래그로 내려 닫기. 내부 스크롤이 맨 위일 때만 드래그 시작(그 외엔 스크롤 우선).
  // dragY를 state와 ref 양쪽에 두는 이유 — onDragEnd에서 최신 값을 읽어야 하는데
  // state는 클로저에 갇힌 값이 잡힐 수 있다.
  const onDragStart = (e: React.TouchEvent) => {
    if (closingRef.current) return;
    const t = e.touches[0];
    dragStart.current = { x: t.clientX, y: t.clientY };
    dragActive.current = false;
    lastMove.current = { y: t.clientY, t: e.timeStamp };
    velocityRef.current = 0;
  };

  const onDragMove = (e: React.TouchEvent) => {
    if (dragStart.current == null) return;
    const t = e.touches[0];
    const dy = t.clientY - dragStart.current.y;
    const dx = t.clientX - dragStart.current.x;

    // 임계값을 넘기 전에는 아무것도 하지 않는다. 여기서 preventDefault를 걸면
    // 탭 도중의 미세한 손가락 움직임에도 click이 취소돼서 버튼이 안 눌린다.
    if (!dragActive.current) {
      if (dy <= DRAG_THRESHOLD) return;                     // 아직 탭일 수 있음
      if ((scrollRef.current?.scrollTop ?? 0) > 0) return;  // 스크롤 중이면 스크롤 우선
      if (Math.abs(dx) > Math.abs(dy)) return;              // 가로 제스처는 무시
      dragActive.current = true;
      setDragging(true);
    }

    // 여기부터는 확정된 시트 드래그 — 브라우저 기본 스크롤/오버스크롤에 넘기지 않는다.
    if (e.cancelable) e.preventDefault();

    const prev = lastMove.current;
    if (prev && e.timeStamp > prev.t) {
      // px/ms. 순간값은 튀므로 이전 속도와 섞어 완만하게 만든다.
      const v = (t.clientY - prev.y) / (e.timeStamp - prev.t);
      velocityRef.current = velocityRef.current * 0.7 + v * 0.3;
    }
    lastMove.current = { y: t.clientY, t: e.timeStamp };

    // 임계값만큼 빼서 드래그가 0에서 이어지게 — 활성화 순간 시트가 툭 튀지 않는다.
    const next = Math.max(0, dy - DRAG_THRESHOLD);
    dragYRef.current = next;
    setDragY(next);
  };

  const onDragEnd = () => {
    if (dragStart.current == null) return;
    const wasActive = dragActive.current;
    dragStart.current = null;
    dragActive.current = false;
    lastMove.current = null;
    setDragging(false);
    // 임계값을 못 넘었으면 드래그가 아니라 탭 — 아무것도 건드리지 않는다.
    if (!wasActive) { velocityRef.current = 0; return; }
    // 거리 또는 속도 — 네이티브 시트는 짧게 튕겨도(플릭) 닫힌다. 거리만 보면
    // 빠르게 내렸을 때 스냅백해서 "안 닫힌다"고 느껴진다.
    const farEnough = dragYRef.current > DISMISS_DISTANCE;
    const fastEnough = velocityRef.current > DISMISS_VELOCITY;
    if (farEnough || fastEnough) {
      closeSheet();
    } else {
      dragYRef.current = 0;
      setDragY(0);              // 스냅백
    }
    velocityRef.current = 0;
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
                  <Image src={lesson.thumbnailUrl} alt={lesson.title} fill className="object-cover" quality={50} sizes="45vw" />
                )}
                {lesson.label?.isEnded && (
                  <div className="absolute bottom-0 w-full bg-black/60 py-2 text-white text-center font-bold text-[14px]">
                    {t('finish')}
                  </div>
                )}
              </div>
              <span className="mt-2 text-[15px] font-bold text-[#171717] leading-tight line-clamp-1">{lesson.title}</span>
              {(() => {
                const when = mounted ? formatRelativeLessonDate(lesson, locale) : '';
                const sub = when || lesson.description;
                return sub ? <span className="mt-0.5 text-[12px] text-[#86898C] line-clamp-1">{sub}</span> : null;
              })()}
            </button>
          ))}
        </div>
      </div>

      {/* 바텀시트 — 수업 상세 + 결제 진입 */}
      {selectedId != null && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div
            className="absolute inset-0 bg-black/50"
            style={{
              // dim은 드래그 진행도에 따라 함께 옅어진다 — 손끝에 반응하는 느낌의 핵심.
              opacity: entered ? Math.max(0, 1 - dragY / 400) : 0,
              transition: dragging ? 'none' : `opacity ${SHEET_MS}ms ease-out`,
            }}
            onClick={() => closeSheet()}
          />
          <div
            className="relative w-full bg-white rounded-t-3xl flex flex-col max-h-[88vh] will-change-transform"
            style={{
              transform: `translateY(${entered ? dragY : (typeof window !== 'undefined' ? window.innerHeight : 1000)}px)`,
              transition: dragging ? 'none' : `transform ${SHEET_MS}ms ${SHEET_EASE}`,
              // 세로 제스처를 우리가 소유한다. 없으면 브라우저 스크롤/오버스크롤과 경합해
              // 드래그가 씹힌다. 내부 스크롤은 자식(scrollRef)이 pan-y로 따로 처리.
              touchAction: 'none',
            }}
            onTouchStart={onDragStart}
            onTouchMove={onDragMove}
            onTouchEnd={onDragEnd}
            onTouchCancel={onDragEnd}
          >
            {/* 드래그 핸들 (닫기 X 제거) */}
            <div className="shrink-0 relative h-8">
              <div className="w-10 h-1 rounded-full bg-[#E6E8EA] mx-auto mt-3" />
            </div>

            {/* touch-action: pan-y — 부모가 none으로 잠근 세로 제스처를 여기서만 스크롤로 허용.
                맨 위에서 아래로 당기는 경우는 onDragMove가 preventDefault로 가로채 시트 드래그로 쓴다. */}
            <div ref={scrollRef} className="overflow-y-auto overscroll-contain [touch-action:pan-y]">
              {/* 포스터 + 하단 black dim(제목 · 종류/난이도/장르 · 일시 · 시간 · 강의실) */}
              {(detail?.thumbnailUrl ?? selectedCard?.thumbnailUrl) && (
                <div className="px-5 pt-1">
                  <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-[#F1F3F6]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={detail?.thumbnailUrl ?? selectedCard?.thumbnailUrl}
                      alt={detail?.title ?? selectedCard?.title ?? ''}
                      className="w-full h-full object-cover"
                    />
                    {(() => {
                      const hasChips = !!detail?.type || !!detail?.level || (!!detail?.genre && detail.genre !== 'Default');
                      const metaItems = [
                        detail?.startDate ?? undefined,
                        detail?.duration != null ? `${detail.duration}${t('minutes')}` : undefined,
                      ].filter(Boolean) as string[];
                      return (
                        <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                          {hasChips && (
                            <div className="flex items-center gap-1.5 mb-2">
                              {detail?.type && <LessonTypeLabel type={detail.type} locale={locale} />}
                              {detail?.level && <LessonLevelLabel label={detail.level} locale={locale} />}
                              {detail?.genre && detail.genre !== 'Default' && <LessonLabel label={detail.genre} locale={locale} />}
                            </div>
                          )}
                          <h2 className="text-white text-[19px] font-bold leading-snug line-clamp-2">
                            {detail?.title ?? selectedCard?.title}
                          </h2>
                          {metaItems.length > 0 && (
                            <p className="mt-1 text-[13px] font-medium text-white/85">{metaItems.join(' · ')}</p>
                          )}
                        </div>
                      );
                    })()}
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
                  <span className="text-[15px] font-bold text-[#A0A5AB]">{detail.buttonTitle || t('lesson_payment_unavailable')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
