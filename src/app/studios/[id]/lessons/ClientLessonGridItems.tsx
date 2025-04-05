'use client'

import { useEffect, useRef, useState } from 'react';
import { GetLessonResponse } from '@/app/endpoint/lesson.endpoint';
import { ClientPoster } from "@/app/studios/[id]/lessons/ClientPoster";
import { getStudioLessonList } from "@/app/studios/[id]/lessons/get.studio.lesson.list.action";

type Props = {
  lessons: GetLessonResponse[];
  studioId: number;
};

export const ClientLessonGridItems = ({lessons: initialLessons, studioId}: Props) => {
  const [lessons, setLessons] = useState<GetLessonResponse[]>(initialLessons);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [mounted, setMounted] = useState(false);

  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!observerRef.current || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting) {
          setIsLoading(true);
          const nextPage = page + 1;
          const newLessonsResponse = await getStudioLessonList({studioId: studioId, page: nextPage})
          if ('lessons' in newLessonsResponse) {
            if (newLessonsResponse.lessons.length === 0) {
              setHasMore(false);
            } else {
              setLessons(lessons.concat(newLessonsResponse.lessons));
              setPage(nextPage);
            }
          }
          setIsLoading(false);
        }
      },
      {threshold: 1.0}
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [page, hasMore, isLoading, lessons, mounted]);

  if (!mounted) return;

  return (
    <div className="w-full px-4 flex justify-center w-full">
      <div className="grid grid-cols-2 gap-3 w-full">
        {lessons.map((lesson, index) => (
          <ClientPoster
            key={lesson.id}
            id={lesson.id}
            posterUrl={lesson.thumbnailUrl ?? lesson.artist?.profileImageUrl ?? ''}
            studioLogoUrl={lesson.studio?.profileImageUrl ?? ''}
            title={lesson.title ?? ''}
            startTime={lesson.startTime ?? ''}
          />
        ))}

        {/* 감시할 요소 (리스트 3개 전이 아닌 맨 끝에서 감시) */}
        {hasMore && <div ref={observerRef} className="col-span-2 h-10"/>}
      </div>
      {isLoading && <p className="text-center mt-4">불러오는 중...</p>}
    </div>
  );
};