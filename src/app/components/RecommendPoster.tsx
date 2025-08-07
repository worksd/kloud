'use server'
import { KloudScreen } from "@/shared/kloud.screen";
import { Thumbnail } from "@/app/components/Thumbnail";
import Image from "next/image";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";

export async function RecommendPoster({
                                        id,
                                        posterUrl,
                                        studioLogoUrl,
                                        date,
                                        title,
                                        width = 240
                                      }: {
  id: number,
  posterUrl: string,
  studioLogoUrl?: string,
  date: string,
  title?: string,
  width?: number
}) {
  return (
    <NavigateClickWrapper method="push" route={KloudScreen.LessonDetail(id)}>
      <div
        className="flex flex-col active:scale-[0.98] transition-transform duration-150"
        style={{width: `${width}px`}}
      >
        <div className="relative overflow-hidden rounded-lg">
          <Thumbnail
            className="relative z-0 object-cover w-full"
            width={width}
            url={posterUrl}
            aspectRatio={120 / 222}
          />

          {/* 타이틀 오버레이 */}
          <div
            className="absolute bottom-0 left-0 w-full rounded-[16px] h-[100px] bg-gradient-to-t from-black/70 to-transparent px-2 py-2 z-10 flex items-end"
          >
            <div className="text-white text-[18px] font-bold line-clamp-2">
              {title}
            </div>
          </div>


          {/* 스튜디오 로고 */}
          {studioLogoUrl && (
            <div className="absolute top-2 left-2 bg-white p-[2px] rounded-full shadow">
              <Image
                src={studioLogoUrl}
                alt="로고 URL"
                width={24}
                height={24}
                className="w-[24px] h-[24px] rounded-full"
              />
            </div>
          )}
        </div>
      </div>
    </NavigateClickWrapper>
  )
}