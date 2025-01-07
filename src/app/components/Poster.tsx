"use client"

import { KloudScreen } from "@/shared/kloud.screen";
import { useRouter } from "next/navigation";
import { Thumbnail } from "@/app/components/Thumbnail";
import { formatDateTime } from "@/app/lessons/[id]/lesson.info.section";
import { calculateDDays } from "@/utils";

export const Poster = ({
                         id,
                         posterUrl,
                         studioLogoUrl,
                         startTime,
                         title,
                         width
                       }:
                         {
                           id: number,
                           posterUrl: string,
                           studioLogoUrl: string,
                           startTime: string,
                           title: string,
                           width?: number // optional로 설정
                         }
) => {
  const router = useRouter();
  const handleOnClick = () => {
    if (window.KloudEvent) {
      window.KloudEvent.push(KloudScreen.LessonDetail(id))
    } else {
      router.push(KloudScreen.LessonDetail(id))
    }
  }

  return (
    <div
      className="flex flex-col active:scale-[0.98] transition-transform duration-150 select-none"
      onClick={handleOnClick}
    >
      <div className="relative overflow-hidden">
        <Thumbnail
          className="relative z-0 object-cover"
          width={width}
          url={posterUrl}
        />
        {(() => {
          const d_days = calculateDDays(startTime);
          return d_days ? (
            <div
              className="absolute py-1 px-2 bottom-0 right-0 mb-2 mr-2 text-white bg-[#00000099] text-[12px] text-center font-semibold rounded-[999px]">
              {d_days}
            </div>
          ) : null;
        })()}
      </div>

      <div className="body-400 mt-2">
        {title}
      </div>
      <div className="body-200 text-gray-500">
        {`${formatDateTime(startTime).date} ${formatDateTime(startTime).time}`}
      </div>
    </div>
  )
}