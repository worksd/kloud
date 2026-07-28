'use client';

import React, { useEffect, useState } from "react";
import { Locale } from "@/shared/StringResource";
import { formatRelativeLessonDate, LessonWhen } from "@/utils/lesson.relative.date";

// 수업 카드의 날짜 줄 — startDate/date/startTime을 상대 시각(오늘/내일/이번 주 목요일 …)으로 표시.
// 상대 시각은 '지금' 기준이라 하이드레이션 미스매치 방지용 마운트 가드. 마운트 전/값 없음 → fallback(설명).
export const LessonRelativeDate = ({ when, locale, fallback = '', className }: {
  when: LessonWhen;
  locale: Locale;
  fallback?: string;
  className?: string;
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const rel = mounted ? formatRelativeLessonDate(when, locale) : '';
  const text = rel || fallback;
  if (!text) return null;
  return <div className={className}>{text}</div>;
};
