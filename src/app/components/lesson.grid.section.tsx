'use client';
import { LessonGridItems } from "@/app/studios/[id]/lessons/lesson.grid.items";
import RightArrowIcon from "../../../public/assets/right-arrow.svg"
import { KloudScreen } from "@/shared/kloud.screen";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";

export const LessonGridSection = ({studioId, title, lessons} : {studioId?: number, title: string, lessons: GetLessonResponse[]}) => {

  const onClickMore = () => {
    if (studioId) {
      window.KloudEvent?.push(KloudScreen.StudioLessons(studioId))
    }
  }

  return (
    <div className="w-screen px-4 pb-8">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-5">
        <div className="text-[24px] text-black font-bold">{title}</div>
        {lessons.length >= 4 &&
          <button className="text-[#86898C] flex items-center font-normal" onClick={onClickMore}>
            더보기
            <RightArrowIcon/>
          </button>
        }
      </div>

      {lessons.length > 0 ? (
        <LessonGridItems lessons={lessons}/>
      ) : (
        <div className="flex flex-col items-center text-[#86898C]">
          <p className="text-[16px] font-medium">등록된 수업이 없습니다</p>
        </div>
      )}
    </div>
  );
}