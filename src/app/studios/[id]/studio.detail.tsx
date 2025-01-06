'use client';
import { api } from "@/app/api.client";
import { extractNumber } from "@/utils";
import { HeaderInDetail } from "@/app/components/headers";
import Image from "next/image";
import LocationIcon from "../../../../public/assets/location.svg";
import PhoneIcon from "../../../../public/assets/phone.svg";
import SnsButton from "@/app/components/buttons/SnsButton";
import Instagram from "../../../../public/assets/instagram-colored.svg";
import Youtube from "../../../../public/assets/youtube-colored.svg";
import { LessonGridSection } from "@/app/components/lesson.grid.section";
import { useEffect, useState } from "react";
import { getStudioDetail } from "@/app/studios/[id]/studio.detail.action";
import { notFound } from "next/navigation";

export const StudioDetailForm = ({id}: { id: string }) => {
  const [studio, setStudio] = useState<any>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStudio = async () => {
      try {
        const response = await getStudioDetail(id)
        if ('id' in response) {
          setStudio(response)
        }
      } catch (error) {
        console.error('스튜디오 정보를 불러오는데 실패했습니다:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudio()
  }, [id])

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-gray-900"></div>
    </div>
  }

  if (!studio) {
    return notFound();
  }

  return (
    <div className="w-full h-screen bg-white flex flex-col pb-20 box-border overflow-y-auto scrollbar-hide">
      {/* 헤더 */}
      <HeaderInDetail title={studio.name}/>

      {/* 수업 썸네일 */}
      <div
        style={{backgroundImage: `url(${studio.coverImageUrl ?? studio.profileImageUrl})`}}
        className="
            w-full
            relative
            aspect-[1/1]

            bg-cover
            bg-center
            bg-no-repeat

            before:content-['']
            before:absolute
            before:inset-0
            before:block
            before:bg-gradient-to-b
            before:from-transparent
            before:from-[65%]
            before:to-white
            before:to-100%
            before:z-[2]"
      >
        <div className="w-full pl-6 box-border items-center gap-3 inline-flex absolute bottom-0 z-20">
          <Image src={studio.profileImageUrl || "https://picsum.photos/250/250"} alt={"studio logo"} width={60} height={60}
                 className="rounded-full"/>
          <div className="flex-col justify-center items-start gap-2 inline-flex">
            <div className="text-[#131517] text-xl font-bold leading-normal">{studio.name}</div>

            <button className="px-2.5 py-1 bg-black rounded-[999px] justify-center items-center gap-2.5 inline-flex">
              <div className="text-center text-white text-sm font-medium leading-tight">팔로우</div>
            </button>
          </div>
        </div>
      </div>

      {/* 상세 영역 */}
      <div className="flex flex-col gap-2 mt-6">
        <div className="flex flex-row items-center px-6 gap-1">
          <LocationIcon className="flex-shrink-0"/>
          <div className="text-[#505356] text-[14px] font-medium">{studio.address}</div>
        </div>


        <div className="justify-start items-center gap-1 flex px-6">
          <PhoneIcon classname="flex-shrink-0"/>
          <div className="text-center text-[#505356] text-[14px] font-medium leading-tight">{studio.phone}</div>
        </div>

        <div className="self-stretch px-6 justify-start items-center gap-2 inline-flex">
          {studio.instagramAddress && <SnsButton link={studio.instagramAddress} logoPath={Instagram} alt="instagram"/>}
          {studio.youtubeUrl && <SnsButton link={studio.youtubeUrl} logoPath={Youtube} alt="youtube"/>}
        </div>

        <div>
          <div className="w-full h-1 bg-[#f7f8f9]"/>
          {/*<NotificationList title=""/>*/}
        </div>

        <div>
          <div className="w-full h-3 bg-[#f7f8f9]"/>
          <div className="mt-10">
            {studio.lessons.length > 0 && (
              <LessonGridSection title="Hot" lessons={studio.lessons}
              />
            )}
          </div>
        </div>

      </div>

    </div>
  );
}