"use client"

import Image from "next/image";
import { isMobile } from "react-device-detect";
import { KloudScreen } from "@/shared/kloud.screen";
import { useRouter } from "next/navigation";

export const Poster = ({
                         id, posterUrl, studioLogoUrl, dDay, title, description
                       }:
                         {
                           id: number,
                           posterUrl: string,
                           studioLogoUrl: string,
                           dDay: string,
                           title: string,
                           description: string,
                         }
) => {
  const router = useRouter();
  const handleOnClick = () => {
    if (window) {
      window.KloudEvent.push(KloudScreen.LessonDetail(id))
    } else {
      router.push(KloudScreen.LessonDetail(id))
    }
  }

  return (
    <div
      className="flex flex-col"
      onClick={handleOnClick}
    >
      <div style={{width: '167px', height: '222px', position: 'relative'}}>
        <Image
          src="https://picsum.photos/250/250"
          alt="dd"
          fill
          style={{
            objectFit: 'cover',
            borderRadius: '4px',        // 둥근 모서리(선택 사항)
          }}
        />
      </div>

      <div className="body-400 mt-2">
        트릭스 힙합 클래스
      </div>
      <div className="body-200 text-gray-500">
        24.10.14(토) / 17:00
      </div>
    </div>

  )
}