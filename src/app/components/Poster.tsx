"use client"

import Image from "next/image";
import { isMobile } from "react-device-detect";
import { KloudScreen } from "@/shared/kloud.screen";
import { useRouter } from "next/navigation";
import { Thumbnail } from "@/app/components/Thumbnail";

export const Poster = ({
                         id,
                         posterUrl,
                         studioLogoUrl,
                         dDay,
                         title,
                         description,
                         width = 167 // 기본값 167 설정
                       }:
                         {
                           id: number,
                           posterUrl: string,
                           studioLogoUrl: string,
                           dDay: string,
                           title: string,
                           description: string,
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
      <Thumbnail width={width}/>

      <div className="body-400 mt-2">
        트릭스 힙합 클래스
      </div>
      <div className="body-200 text-gray-500">
        24.10.14(토) / 17:00
      </div>
    </div>
  )
}