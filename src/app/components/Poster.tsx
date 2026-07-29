'use server'
import { KloudScreen } from "@/shared/kloud.screen";
import { Thumbnail } from "@/app/components/Thumbnail";
import Image from "next/image";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { translate } from "@/utils/translate";
import { LessonLabel, LessonPosterTypeLabel } from "@/app/components/LessonLabel";
import { GetLabelResponse } from "@/app/endpoint/lesson.endpoint";
import { LessonTags } from "@/app/components/LessonTags";
import { LessonRelativeDate } from "@/app/components/LessonRelativeDate";
import { getLocale } from "@/utils/translate";

export async function Poster({
                               id,
                               posterUrl,
                               studioName,
                               studioImageUrl,
                               description,
                               title,
                               width,
                               label,
                               type,
                               tags,
                               date,
                               startTime,
                               startDate,
                             }: {
  id: number,
  posterUrl: string,
  studioName?: string,
  studioImageUrl?: string,
  description: string,
  width?: number
  title?: string,
  label?: GetLabelResponse,
  type?: 'default' | 'subscription',
  tags?: string,
  /** 수업 시각 필드 — 넘기면 설명 대신 상대 시각(오늘/내일/이번 주 …)으로 렌더 */
  date?: string,
  startTime?: string,
  startDate?: string,
}) {
  const locale = await getLocale();
  const hasWhen = !!(date || startTime || startDate);
  const route = type === 'subscription'
    ? KloudScreen.LessonGroupDetail(id)
    : KloudScreen.LessonDetail(id);

  return (
    <NavigateClickWrapper method={'push'} route={route}>
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
          {(label?.type === 'PopUp' || label?.type === 'Workshop') && (
            <div className="absolute top-2 left-2 bg-[#1F1F1F] px-1 py-1 rounded-[4px] text-white font-paperlogy font-bold text-[11px] leading-none">
              {label.type === 'PopUp' ? '팝업' : '워크샵'}
            </div>
          )}
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

          {/* 태그 — ','로 split해서 노출 (제목 위) */}
          {tags && (
            <LessonTags tags={tags} className="mb-1.5"/>
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

          {/* 날짜 — 시각 필드가 있으면 상대 시각(오늘/내일/이번 주 …), 없으면 기존 설명 */}
          {hasWhen ? (
            <LessonRelativeDate
              when={{ date, startTime, startDate }}
              locale={locale}
              fallback={description}
              className="body-200 text-gray-500 text-[12px] truncate font-medium"
            />
          ) : description ? (
            <div className="body-200 text-gray-500 text-[12px] truncate font-medium">
              {description}
            </div>
          ) : null}
        </div>
      </div>
    </NavigateClickWrapper>
  )
}