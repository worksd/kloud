import { LessonGridItems } from "@/app/studios/[id]/lessons/lesson.grid.items";
import RightArrowIcon from "../../../public/assets/right-arrow.svg"
import { KloudScreen } from "@/shared/kloud.screen";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { translate } from "@/utils/translate";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";

export const LessonGridSection = async ({studioId, title, lessons}: {
  studioId: number,
  title: string,
  lessons: GetLessonResponse[]
}) => {
  return (
    <div className="w-screen px-4 pb-8">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-5">
        <div className="text-[24px] text-black font-bold">{title}</div>
        {lessons.length >= 4 &&
          <NavigateClickWrapper method={'push'} route={KloudScreen.StudioLessons(studioId)}>
            <button className="text-[#86898C] flex items-center font-normal">
              {await translate('more')}
              <RightArrowIcon/>
            </button>
          </NavigateClickWrapper>
        }
      </div>

      {lessons.length > 0 ? (
        <LessonGridItems lessons={lessons}/>
      ) : (
        <div className="flex flex-col items-center text-[#86898C]">
          <p className="text-[16px] font-medium">{await translate('no_lessons')}</p>
        </div>
      )}
    </div>
  );
}