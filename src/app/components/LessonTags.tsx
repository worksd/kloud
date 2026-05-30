import React from "react";

/**
 * 수업 카드 태그 영역. `,`로 구분된 string을 파싱.
 *
 * Figma 스펙:
 * - 공통: height 17, bg #1F1F1F, 흰색 Paperlogy 7Bold 11px
 * - 일반 태그: padding 0 2, border-radius 2
 * - 마지막 태그: 오른쪽 변이 위로 기울어진 평행사변형(vector 윗변 ~41 / 아랫변 ~35.6) + border-radius 2
 *   → SVG path로 그려 rounded와 비대칭 형태를 동시에 살림.
 */
export const LessonTags = ({ tags, className }: { tags?: string; className?: string }) => {
  if (!tags) return null;
  const parsed = tags.split(',').map((t) => t.trim()).filter(Boolean);
  if (parsed.length === 0) return null;
  const lastIdx = parsed.length - 1;

  return (
    <div className={`flex items-center gap-[3px] ${className ?? ''}`}>
      {parsed.map((tag, i) => {
        const isLast = i === lastIdx && parsed.length > 1;
        if (isLast) {
          // 평행사변형 + rounded 2 — 배경은 SVG로, 텍스트는 그 위에 absolute.
          // preserveAspectRatio="none"으로 가로폭에 따라 늘어나도록.
          return (
            <span
              key={`${tag}-${i}`}
              className="relative inline-flex min-h-[17px] items-center justify-center pl-[2px] pr-[8px] py-[2px]"
            >
              <svg
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="none"
                viewBox="0 0 41 17"
                aria-hidden
              >
                {/* 평행사변형 — 우변 기울기 완만하게(아랫변 우측 꼭지점을 오른쪽으로 당김).
                    윗변 ~41, 아랫변 ~38.6, 각 모서리 r=2 */}
                <path
                  d="M2 0 L39 0 Q41 0 40.7 2 L38.6 15 Q38.2 17 36.2 17 L2 17 Q0 17 0 15 L0 2 Q0 0 2 0 Z"
                  fill="#1F1F1F"
                />
              </svg>
              <span className="relative font-paperlogy font-bold text-[11px] leading-none text-white">
                {tag}
              </span>
            </span>
          );
        }
        return (
          <span
            key={`${tag}-${i}`}
            className="inline-flex min-h-[17px] items-center justify-center px-[4px] py-[2px] rounded-[2px] bg-[#1F1F1F] font-paperlogy font-bold text-[11px] leading-none text-white"
          >
            {tag}
          </span>
        );
      })}
    </div>
  );
};
