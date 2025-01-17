'use client';
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
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import { useFormState } from "react-dom";
import { toggleFollowStudio } from "@/app/search/studio.follow.action";

export const StudioDetailForm = ({id}: { id: string }) => {
  const [studio, setStudio] = useState<GetStudioResponse | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [isFollow, setIsFollow] = useState(false)
  const [actionState, formAction] = useFormState(toggleFollowStudio, {
    studioId: 0,
    sequence: -1,
    errorCode: '',
    errorMessage: '',
    message: undefined,
    follow: undefined,
  });

  useEffect(() => {
    if (actionState.sequence >= 0) {
      setIsFollow(actionState.follow != null)

      if (actionState.message) {
        window.KloudEvent?.showToast(actionState.message)
      }
    }
  }, [actionState])

  useEffect(() => {
    const fetchStudio = async () => {
      try {
        const response = await getStudioDetail(id)
        if ('id' in response) {
          setStudio(response)
          setIsFollow(response.follow != null)
          actionState.studioId = response.id
          actionState.follow = response.follow
        }
      } catch (error) {
        console.error('스튜디오 정보를 불러오는데 실패했습니다:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudio()
  }, [id])

  const handleSubmit = () => {
    window.KloudEvent?.sendHapticFeedback()
  }

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
          <Image src={studio.profileImageUrl} alt={"studio logo"} width={60} height={60}
                 className="rounded-full"/>
          <form className="flex-col justify-center items-start gap-2 inline-flex" onSubmit={handleSubmit}>
            <div className="text-[#131517] text-xl font-bold leading-normal">{studio.name}</div>
            <button
              formAction={formAction}
              className={`px-2.5 py-1 text-sm font-medium rounded-full 
          ${isFollow
                ? 'text-gray-500 border border-gray-300 hover:bg-gray-100'
                : 'text-white bg-black hover:bg-gray-900'
              }`}
            >
              {isFollow ? '팔로잉' : '팔로우'}
            </button>
          </form>
        </div>
      </div>

      {/* 상세 영역 */}
      <div className="flex flex-col gap-2 mt-6">
        <div className="flex flex-row items-center px-4 gap-2">
          <LocationIcon className="flex-shrink-0"/>
          <div className="text-[#505356] text-[14px] font-medium">{studio.address}</div>
        </div>


        <div className="justify-start items-center gap-2 flex px-4">
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
            <LessonGridSection title="Hot" lessons={studio?.lessons ?? []}
            />
          </div>
        </div>

      </div>

    </div>
  );
}