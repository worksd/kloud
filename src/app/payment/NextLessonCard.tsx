'use client'

import { ReactNode } from "react";
import { NextLessonResponse } from "@/app/endpoint/payment.endpoint";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { formatRelativeLessonDate } from "@/utils/lesson.relative.date";

/**
 * 정규반 결제 — 고른 방식으로 결제하면 처음 듣게 되는 회차(pricePolicies[].nextLesson) 카드.
 * 상단 줄은 시작 안내 문구(label, '다음주 목요일(10.30) 수업부터 등록돼요')이고 그 아래가 회차 정보 — 안내 배너와 카드를 하나로 합친 형태.
 * 서버 값(휴강·취소 반영)이라 nextLesson 의 필드를 전부 그린다:
 *  - thumbnailUrl : 좌측 썸네일(없으면 회색 빈 박스)
 *  - title        : 회차 제목(빈 문자열이면 '첫 수업' 라벨만)
 *  - startDate    : 'yyyy.MM.dd HH:mm' → 상대 날짜 + 시각(수업 카드와 같은 formatRelativeLessonDate, 기기 로컬)
 *  - duration     : 분 단위 수업 시간(없으면 생략)
 *  - artist       : 그 회차의 메인 강사(반 담당 강사와 다를 수 있음). nickName || name, 사진 있으면 작은 원형으로
 *  - id           : data-lesson-id 로만 남긴다 — 결제 중 상세로 이탈시키지 않는다
 * 결제 폼은 마운트 후에만 그리므로(needsMountCheck) 상대 날짜의 하이드레이션 불일치는 없다.
 */
export const NextLessonCard = ({ lesson, label, locale }: {
  lesson: NextLessonResponse;
  /** 상단 시작 안내 문구 — 상대 날짜 계산과 '화요일(10.27)' 굵게 처리는 호출부(UnifiedPaymentInfo)가 한다 */
  label: ReactNode;
  locale: Locale;
}) => {
  const when = formatRelativeLessonDate({ startDate: lesson.startDate }, locale) || lesson.startDate;
  const artist = lesson.artist;
  const artistName = artist ? (artist.nickName || artist.name || '') : '';
  const duration = lesson.duration != null && lesson.duration > 0
    ? `${lesson.duration}${getLocaleString({ locale, key: 'minutes' })}`
    : null;

  return (
    <div data-lesson-id={lesson.id} className="mx-6 mt-3 rounded-2xl border border-[#EEEFF0] bg-white overflow-hidden">
      <div className="px-4 py-3 bg-[#F7F8FA]">
        <span className="text-[13px] font-medium text-[#4E5968]">{label}</span>
      </div>

      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="w-[56px] h-[56px] rounded-lg overflow-hidden bg-[#F2F3F5] shrink-0">
          {lesson.thumbnailUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={lesson.thumbnailUrl} alt={lesson.title} className="w-full h-full object-cover" />
          )}
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          {lesson.title && (
            <span className="text-[15px] font-bold text-black truncate">{lesson.title}</span>
          )}
          <span className="text-[13px] text-[#4E5968] truncate">
            {when}{duration && ` · ${duration}`}
          </span>
          {artistName && (
            <span className="mt-1.5 flex items-center gap-1.5 min-w-0">
              {artist?.profileImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={artist.profileImageUrl} alt={artistName} className="w-[18px] h-[18px] rounded-full object-cover shrink-0" />
              )}
              <span className="text-[12px] text-[#86898C] truncate">{artistName}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
