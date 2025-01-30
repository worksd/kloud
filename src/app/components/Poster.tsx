"use client"

import { KloudScreen } from "@/shared/kloud.screen";
import { useRouter } from "next/navigation";
import { Thumbnail } from "@/app/components/Thumbnail";
import { formatDateTime } from "@/utils/date.format";
import Image from "next/image";
import { calculateDDays } from "@/utils";

export const Poster = ({
                         id,
                         posterUrl,
                         studioLogoUrl,
                         startTime,
                         title,
                         width = 160
                       }: {
  id: number,
  posterUrl: string,
  studioLogoUrl?: string,
  startTime: string,
  title: string,
  width?: number
}) => {
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
      className="flex flex-col active:scale-[0.98] transition-transform duration-150"
      onClick={handleOnClick}
      style={{width: `${width}px`}}
    >
      <div className="relative overflow-hidden">
        <Thumbnail
          className="relative z-0 object-cover w-full"
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
        <div className="body-200 text-gray-500 truncate">
          {`${formatDateTime(startTime).date}(${formatDateTime(startTime).dayOfWeek}) ${formatDateTime(startTime).time}`}
        </div>
      </div>
    </div>
  )
}