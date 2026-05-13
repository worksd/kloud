'use client'

import React, { useEffect, useRef, useState } from "react";
import { hideDialogAction } from "@/app/home/hide.dialog.action";
import { getHideDialogIdsAction } from "@/app/home/get.hide.dialog.ids.action";
import { kloudNav } from "@/app/lib/kloudNav";
import { GetEventResponse } from "@/app/endpoint/event.endpoint";

/**
 * 홈 진입 시 한 번, 랜덤으로 이벤트 이미지 다이얼로그를 노출한다.
 * 이전엔 native(KloudEvent.showDialog) 위임이었으나 web에서 직접 모달 렌더하도록 변경.
 *
 * 기능:
 * - 이미지 클릭 또는 CTA 버튼 클릭 → route로 이동 후 닫힘
 * - "다시 보지 않기" 토글 → hideDialogAction으로 쿠키에 id 저장/제거
 * - 배경 / X 버튼 클릭 → 닫힘
 */
export default function EventScreen({
  events,
  hideDialogIds: initialHideDialogIds,
}: {
  os: string; // 호출처 시그니처 호환용 (현재 미사용)
  events: GetEventResponse[];
  hideDialogIds: number[];
}) {
  const hasInitialized = useRef(false);
  const [hideDialogIds, setHideDialogIds] = useState<number[]>(initialHideDialogIds);
  const [shown, setShown] = useState<GetEventResponse | null>(null);
  const [hideChecked, setHideChecked] = useState(false);

  // 최초 1회만 랜덤 픽 (사용자가 닫고 토글해도 새 다이얼로그 안 뜨게)
  useEffect(() => {
    if (hasInitialized.current) return;
    const available = events.filter((e) => !hideDialogIds.includes(e.id));
    if (available.length === 0) return;
    hasInitialized.current = true;
    const random = available[Math.floor(Math.random() * available.length)];
    setShown(random);
  }, [events, hideDialogIds]);

  // 다이얼로그 열려 있는 동안 body 스크롤 잠금
  useEffect(() => {
    if (!shown) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [shown]);

  const close = () => setShown(null);

  const onAction = async () => {
    const route = shown?.route;
    close();
    if (route) await kloudNav.push(route);
  };

  const toggleHideForever = async () => {
    if (!shown) return;
    const next = !hideChecked;
    setHideChecked(next);
    await hideDialogAction({ id: String(shown.id), clicked: next });
    if (next) {
      const ids = await getHideDialogIdsAction();
      setHideDialogIds(ids);
    } else {
      setHideDialogIds((prev) => prev.filter((id) => id !== shown.id));
    }
  };

  if (!shown) return null;

  const aspect = shown.imageRatio && shown.imageRatio > 0 ? shown.imageRatio : 1;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-6"
      onClick={close}
    >
      <div
        className="flex w-full max-w-[400px] flex-col items-stretch"
        onClick={(e) => e.stopPropagation()}
      >
        {shown.hideForeverMessage && (
          <button
            type="button"
            onClick={toggleHideForever}
            className="self-start flex items-center gap-2 mb-4 px-3 py-2 rounded-full bg-black/40 backdrop-blur text-white text-[13px] active:opacity-80"
          >
            <span
              className={`w-4 h-4 rounded-full border border-white flex items-center justify-center ${
                hideChecked ? 'bg-white' : ''
              }`}
            >
              {hideChecked && <span className="w-2 h-2 rounded-full bg-black"/>}
            </span>
            {shown.hideForeverMessage}
          </button>
        )}

        <div className="bg-white rounded-[16px] p-4">
          {/* 이미지 카드 */}
          <div
            className="w-full overflow-hidden rounded-[12px] cursor-pointer bg-[#F1F3F6]"
            style={{ aspectRatio: aspect }}
            onClick={onAction}
          >
            {/* next/image 대신 일반 img — 외부 임의 URL 호환 + aspect 비율 자유롭게 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shown.imageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>

          {shown.ctaButtonText && (
            <button
              type="button"
              onClick={onAction}
              className="mt-4 w-full h-12 bg-black text-white rounded-lg font-semibold active:scale-[0.98] transition-transform"
            >
              {shown.ctaButtonText}
            </button>
          )}
        </div>

        {/* 닫기 (X) */}
        <button
          type="button"
          onClick={close}
          aria-label="close"
          className="self-center mt-4 w-11 h-11 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
