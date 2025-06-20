'use server'
import { KloudScreen } from "@/shared/kloud.screen";
import { Thumbnail } from "@/app/components/Thumbnail";
import { formatDateTime } from "@/utils/date.format";
import Image from "next/image";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { translate } from "@/utils/translate";
import { LessonGenreLabel, LessonTypeLabel } from "@/app/components/LessonGenreLabel";
import { LessonGenre } from "@/app/endpoint/lesson.endpoint";
import { LessonType } from "@/entities/lesson/lesson";

export async function Poster({
                               id,
                               posterUrl,
                               studioLogoUrl,
                               startTime,
                               title,
                               width,
                               dday,
                               genre,
                               type,
                             }: {
  id: number,
  posterUrl: string,
  studioLogoUrl?: string,
  startTime: string,
  width?: number
  title?: string,
  dday?: string,
  genre?: LessonGenre,
  type?: LessonType,
}) {
  const formatTime = await formatDateTime(startTime)
  return (
    <NavigateClickWrapper method={'push'} route={KloudScreen.LessonDetail(id)}>
      <div
        className="flex flex-col active:scale-[0.98] transition-transform duration-150"
        style={{width: `${width}px`}}
      >
        <div className="relative overflow-hidden">
          <Thumbnail
            className="relative z-0 object-cover w-full"
            width={width}
            url={posterUrl}
          />
          {genre && <div className={'absolute py-1 px-1 top-0 right-0 text-black'}>
            <LessonGenreLabel genre={genre}/>
          </div>}
          {type && <div className={'absolute py-1 px-1 top-0 left-0 text-black'}>
            <LessonTypeLabel type={type}/>
          </div>}
          {dday ? (
            <div
              className="absolute py-1 px-2 bottom-0 right-0 mb-2 mr-2 text-white bg-[#00000099] text-[12px] text-center font-semibold rounded-[999px]">
              {dday}
            </div>
          ) : (
            <div
              className="absolute bottom-0 w-full bg-black/60 py-2 text-white text-center font-bold text-[14px] rounded-b-[16px]">
              {await translate('finish')}
            </div>
          )}

          {studioLogoUrl && <Image
            className="absolute left-0 top-0 mt-2 ml-2 w-[24px] h-[24px] rounded-full flex-shrink-0"
            src={studioLogoUrl}
            alt={'로고 URL'}
            width={24}
            height={24}
          />}
        </div>

        <div className="ml-1 w-full">
          <div
            className="body-400 mt-2"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {title}
          </div>
          {title &&
            <div className="body-200 text-gray-500 truncate">
              {`${formatTime.date}(${await translate(formatTime.dayOfWeek)}) ${formatTime.time}`}
            </div>
          }
        </div>
      </div>
    </NavigateClickWrapper>
  )
}