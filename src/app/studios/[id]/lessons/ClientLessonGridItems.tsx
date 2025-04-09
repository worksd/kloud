'use client'

import { GetLessonResponse } from '@/app/endpoint/lesson.endpoint';
import { ClientPoster } from "@/app/studios/[id]/lessons/ClientPoster";
import React from "react";
import Loading from "@/app/loading";

type Props = {
  lessons: GetLessonResponse[];
  studioId: number;
};

export const ClientLessonGridItems = ({lessons}: Props) => {
  return (
    <div className="relative w-full px-4 flex justify-center">
      {/* 콘텐츠 */}
      <div className="absolute inset-0 flex items-center justify-center pt-40">
        <Loading/>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full">
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

    </div>
  );
};