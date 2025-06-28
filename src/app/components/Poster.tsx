'use server'
import { KloudScreen } from "@/shared/kloud.screen";
import { Thumbnail } from "@/app/components/Thumbnail";
import { formatDateTime } from "@/utils/date.format";
import Image from "next/image";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { translate } from "@/utils/translate";
import { LessonLabel, LessonPosterTypeLabel } from "@/app/components/LessonLabel";
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";

export async function Poster({
                               id,
                               posterUrl,
                               studio,
                               startTime,
                               title,
                               width,
                               dday,
                               genre,
                               type,
                             }: {
  id: number,
  posterUrl: string,
  studio?: GetStudioResponse,
  startTime: string,
  width?: number
  title?: string,
  dday?: string,
  genre?: string,
  type?: string,
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
          {type &&
            <LessonPosterTypeLabel label={type}/>
          }
          {!dday &&
            <div
              className="absolute bottom-0 w-full bg-black/60 py-2 text-white text-center font-bold text-[14px] rounded-b-[16px]">
              {await translate('finish')}
            </div>
          }
        </div>
        {/* 텍스트 영역 */}
        <div className="w-full mt-2">
          {/* 프로필 이미지가 여기로 이동 */}
          {studio && studio.profileImageUrl && (
            <div className="flex items-center gap-1 mb-1">
              <Image
                className="w-[24px] h-[24px] rounded-[20px] border"
                style={{
                  borderColor: '#F7F8F9',
                  borderWidth: '1px',
                }}
                src={studio.profileImageUrl}
                alt="스튜디오 로고"
                width={24}
                height={24}
              />
              {studio.name && (
                <span className="text-[12px] font-medium" style={{color: '#484B4D'}}>
              {studio.name}
              </span>
              )}
            </div>
          )}

          {/* 타이틀 */}
          <div
            className="text-black font-bold text-[14px]"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {title}
          </div>

          {/* 날짜 + 요일 + 시간 */}
          {title && (
            <div className="body-200 text-gray-500 text-[12px] truncate font-medium">
              {`${formatTime.date}(${await translate(formatTime.dayOfWeek)}) ${formatTime.time}`}
            </div>
          )}
          {genre && (
            <div className="mt-1">
              <LessonLabel label={genre}/>
            </div>
          )}
        </div>
      </div>
    </NavigateClickWrapper>
  )
}