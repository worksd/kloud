"use client"

import { KloudScreen } from "@/shared/kloud.screen";
import { useRouter } from "next/navigation";
import { Thumbnail } from "@/app/components/Thumbnail";
import { formatDateTime } from "@/app/lessons/[id]/lesson.info.section";

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
      className="flex flex-col active:scale-[0.98] transition-transform duration-150 select-none [-webkit-touch-callout:none]"
      onClick={handleOnClick}
    >
      <Thumbnail
        width={width}
        url={posterUrl}
      />

      <div className="body-400 mt-2">
        {title}
      </div>
      <div className="body-200 text-gray-500">
        {`${formatDateTime(startTime).date} ${formatDateTime(startTime).time}`}
      </div>
    </div>
  )
}