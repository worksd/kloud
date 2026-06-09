'use client';

// 수업 상세 진입 시 1회 POST /tracking-events.
// 클라이언트 측 5분 디바운스 — 새로고침/SPA 재마운트로 부풀리는 것 방지 (sessionStorage 기준).
// 가이드 권장 패턴.

import { useEffect } from "react";
import { recordLessonViewAction } from "@/app/lessons/[id]/action/recordLessonViewAction";

const TTL_MS = 5 * 60 * 1000;
const storageKey = (id: number) => `view:lessonDetail:${id}`;

export const LessonViewTracker = ({lessonId}: {lessonId: number}) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const k = storageKey(lessonId);
      const last = Number(sessionStorage.getItem(k) ?? 0);
      if (Date.now() - last < TTL_MS) return; // 5분 내 재호출 차단
      sessionStorage.setItem(k, String(Date.now()));
    } catch {
      // storage 접근 실패해도 호출은 시도
    }
    recordLessonViewAction({lessonId}).catch(() => {});
  }, [lessonId]);

  return null;
};
