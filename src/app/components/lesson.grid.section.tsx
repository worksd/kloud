'use client';
import { LessonResponse } from "@/app/endpoint/studio.endpoint";
import { LessonGridItems } from "@/app/lessons/lesson.grid.items";
import RightArrowIcon from "../../../public/assets/right-arrow.svg"
import { KloudScreen } from "@/shared/kloud.screen";

export const LessonGridSection = ({title, lessons} : {title: string, lessons: LessonResponse[]}) => {

  const onClickMore = () => {
    if (window.KloudEvent) {
      window.KloudEvent.push(KloudScreen.Lessons)
    }
  }

  return (
    <div className="w-screen px-4 pb-8">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-5">
        <div className="text-[24px] text-black font-bold">{title}</div>
        <button className="text-[#86898C] flex items-center font-normal" onClick={onClickMore}>
          더보기
          <RightArrowIcon/>
        </button>
      </div>

      {/* 포스터 그리드 */}
      <LessonGridItems lessons={lessons} />
    </div>
  );
}