'use client'

import { GetLessonResponse } from '@/app/endpoint/lesson.endpoint';
import { ClientPoster } from "@/app/studios/[id]/lessons/ClientPoster";
import React, { useEffect, useState } from "react";
import Loading from "@/app/loading";

type Props = {
  lessons: GetLessonResponse[];
  studioId: number;
};

export const ClientLessonGridItems = ({ lessons }: Props) => {
  const [isRendering, setIsRendering] = useState(true);

  useEffect(() => {
    if (lessons.length > 0) {
      // 다음 프레임에서 로딩 UI 제거 (렌더링 끝나기 직전)
      const timeout = requestAnimationFrame(() => {
        setIsRendering(false);
      });
      return () => cancelAnimationFrame(timeout);
    }
  }, [lessons]);

  return (
    <div className="relative w-full px-4 flex justify-center">
      <div className="grid grid-cols-2 gap-3 w-full bg-white">
        {lessons.map((lesson) => (
          <ClientPoster
            key={lesson.id}
            id={lesson.id}
            posterUrl={lesson.thumbnailUrl ?? lesson.artist?.profileImageUrl ?? ''}
            studioLogoUrl={lesson.studio?.profileImageUrl ?? ''}
            title={lesson.title ?? ''}
            startTime={lesson.startTime ?? ''}
          />
        ))}
      </div>

      {/* 렌더링 중일 때만 스피너 오버레이 */}
      {isRendering && (
        <div className="absolute inset-0 z-10 bg-white/60 flex pt-20 justify-center">
          <Loading />
        </div>
      )}
    </div>
  );
};
