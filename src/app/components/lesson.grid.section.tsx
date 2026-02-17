import { LessonGridItems } from "@/app/studios/[id]/lessons/lesson.grid.items";
import { KloudScreen } from "@/shared/kloud.screen";
import { GetBandLessonResponse, GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { translate } from "@/utils/translate";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";

export const LessonGridSection = async ({studioId, title, lessons}: {
  studioId: number,
  title: string,
  lessons: GetBandLessonResponse[]
}) => {
  return (
    <div className="w-screen pb-8">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-5 px-4">
        <div className="text-[20px] text-black font-bold">{title}</div>
        {lessons.length >= 4 &&
          <NavigateClickWrapper method={'push'} route={KloudScreen.StudioLessons(studioId)}>
            <span className="text-[13px] text-[#999] font-medium active:opacity-60 transition-opacity">
              {await translate('more')} &rsaquo;
            </span>
          </NavigateClickWrapper>
        }
      </div>

      {lessons.length > 0 ? (
        <LessonGridItems lessons={lessons}/>
      ) : (
        <div className="flex flex-col items-center text-[#86898C] pt-10">
          <p className="text-[16px] font-medium">{await translate('no_lessons')}</p>
        </div>
      )}
    </div>
  );
}