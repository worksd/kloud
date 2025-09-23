'use server'
import { KloudScreen } from "@/shared/kloud.screen";
import { Thumbnail } from "@/app/components/Thumbnail";
import Image from "next/image";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { translate } from "@/utils/translate";
import { LessonLabel, LessonPosterTypeLabel } from "@/app/components/LessonLabel";
import { GetLabelResponse } from "@/app/endpoint/lesson.endpoint";

export async function Poster({
                               id,
                               posterUrl,
                               studioName,
                               studioImageUrl,
                               description,
                               title,
                               width,
                               label,
                             }: {
  id: number,
  posterUrl: string,
  studioName?: string,
  studioImageUrl?: string,
  description: string,
  width?: number
  title?: string,
  label?: GetLabelResponse,
}) {
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
          {label?.type &&
            <LessonPosterTypeLabel label={label.type}/>
          }
          {label?.isEnded == true &&
            <div
              className="absolute bottom-0 w-full bg-black/60 py-2 text-white text-center font-bold text-[14px] rounded-b-[16px]">
              {await translate('finish')}
            </div>
          }
        </div>
        {/* 텍스트 영역 */}
        <div className="w-full mt-2">
          {/* 프로필 이미지가 여기로 이동 */}
          {studioImageUrl && (
            <div className="flex items-center gap-1 mb-1">
              <Image
                className="w-[24px] h-[24px] rounded-[20px] border"
                style={{
                  borderColor: '#F7F8F9',
                  borderWidth: '1px',
                }}
                src={studioImageUrl}
                alt="스튜디오 로고"
                width={24}
                height={24}
              />
              {studioName && (
                <span className="text-[12px] font-medium" style={{color: '#484B4D'}}>
              {studioName}
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
          {description && (
            <div className="body-200 text-gray-500 text-[12px] truncate font-medium">
              {description}
            </div>
          )}
          {label?.genre && label.genre != 'Default' && (
            <div className="mt-1">
              <LessonLabel label={label.genre}/>
            </div>
          )}
        </div>
      </div>
    </NavigateClickWrapper>
  )
}