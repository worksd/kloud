'use server'
import { KloudScreen } from "@/shared/kloud.screen";
import { Thumbnail } from "@/app/components/Thumbnail";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";

export async function RecommendPoster({
                                        id,
                                        posterUrl,
                                        date,
                                        title,
                                        width = 160,
                                        type,
                                        label,
                                      }: {
  id: number,
  posterUrl: string,
  date: string,
  title?: string,
  width?: number,
  type?: 'default' | 'subscription',
  label?: { dday?: string },
}) {
  const route = type === 'subscription'
    ? KloudScreen.LessonGroupDetail(id)
    : KloudScreen.LessonDetail(id);

  return (
    <NavigateClickWrapper method="push" route={route}>
      <div
        className="flex flex-col gap-2 active:scale-[0.98] transition-transform duration-150"
        style={{width: `${width}px`}}
      >
        {/* 이미지 */}
        <div className="relative overflow-hidden rounded-xl">
          <Thumbnail
            className="relative z-0 object-cover w-full"
            width={width}
            url={posterUrl}
            aspectRatio={160 / 284}
          />

          {/* D-day 뱃지 — 우측 하단 */}
          {label?.dday && (
            <div className="absolute bottom-2 right-2 z-10 bg-black/60 rounded-xl px-2 py-1">
              <span className="text-white text-[12px] font-medium">{label.dday}</span>
            </div>
          )}
        </div>

        {/* 텍스트 영역 */}
        <div className="flex flex-col gap-1 px-1">
          <div className="text-black text-[14px] font-bold leading-[150%] line-clamp-2">
            {title}
          </div>
          {date && (
            <div className="text-[#6D7882] text-[12px] font-medium leading-[150%]">
              {date}
            </div>
          )}
        </div>
      </div>
    </NavigateClickWrapper>
  )
}
