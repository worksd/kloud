'use client'

import { useState, useEffect } from 'react';

/**
 * D day를 계산해서 문자열로 반환합니다.
 * @param input "2024.11.28"의 형태여야 함
 * @returns
 */

export const DdayText = ({input} : {input: string}) => {
  const [dday, setDday] = useState<{ text: string; textColor: string } | null>(null);

  useEffect(() => {
    if (!input) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // '.' 또는 '-'로 분리
    const [year, month, day] = input.split(/[-.]/).map(Number);

    // 유효한 날짜인지 확인
    if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) {
      return;
    }

    const targetDate = new Date(year, month - 1, day);
    targetDate.setHours(0, 0, 0, 0);

    // 유효한 날짜인지 한번 더 확인
    if (isNaN(targetDate.getTime())) {
      return;
    }

    const diffInMs = targetDate.getTime() - today.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    const text = diffInDays > 0 ? `D-${diffInDays}` : diffInDays === 0 ? "D-Day" : `D+${Math.abs(diffInDays)}`;
    const textColor = diffInDays <= 3 ? "text-[#FF434F]" : "text-black";

    setDday({ text, textColor });
  }, [input]);

  if (!input || !dday) return null;

  return <span className={`${dday.textColor} font-bold`}>{dday.text}</span>;
}