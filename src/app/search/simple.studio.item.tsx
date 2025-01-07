'use client'
import { GetStudioResponse, StudioFollowResponse } from "@/app/endpoint/studio.endpoint";
import { useRouter } from "next/navigation";
import { KloudScreen } from "@/shared/kloud.screen";
import RightArrowIcon from "../../../public/assets/right-arrow.svg";
import Image from "next/image";
import { toggleFollowStudio } from "@/app/search/studio.follow.action";
import { useFormState } from "react-dom";
import { useEffect, useState } from "react";

export const SearchStudioItems = ({studios}: { studios: GetStudioResponse[] }) => {

  const onClickMore = () => {
    console.log('hello')
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4 mt-4 px-6">
        <div className="text-[24px] text-black font-bold">인기 스튜디오</div>
        <button className="text-[#86898C] flex items-center" onClick={onClickMore}>
          더보기
          <RightArrowIcon/>
        </button>
      </div>
      <ul className="flex flex-col space-y-4">
        {studios.map((item) => (
          <SearchStudioItem key={item.id} item={item}/>
        ))}
      </ul>
    </div>
  )
}

const SearchStudioItem = ({item}: { item: GetStudioResponse }) => {

  const [actionState, formAction] = useFormState(toggleFollowStudio, {
    studioId: item.id,
    sequence: -1,
    errorCode: '',
    errorMessage: '',
    message: undefined,
    follow: item.follow,
  });

  const [isFollow, setIsFollow] = useState(item.follow != null);

  const router = useRouter();
  const handleOnClick = () => {
    if (window.KloudEvent) {
      window.KloudEvent.push(KloudScreen.StudioDetail(item.id))
    } else {
      router.push(KloudScreen.StudioDetail(item.id))
    }
  }

  useEffect(() => {
    if (actionState.sequence >= 0) {
      setIsFollow(actionState.follow != null)

      if (window.KloudEvent && actionState.message) {
        window.KloudEvent.showToast(actionState.message)
      }
    }
  }, [actionState])

  return (
    <form className="px-6 space-y-4">
      <div className="flex items-center justify-between w-full max-w-md bg-white rounded-lg">
        {/* 프로필 이미지 및 정보 */}
        <div className="flex items-center space-x-4" onClick={handleOnClick}>
          {/* 프로필 이미지 */}
          <Image src={item.profileImageUrl} alt={"studio logo"} width={60} height={60}
                 className="rounded-full"/>
          {/* 텍스트 정보 */}
          <div>
            <div className="text-lg font-bold text-black">{item.name}</div>
            <div className="text-sm text-gray-500">{item.address}</div>
          </div>
        </div>
        {/* 팔로우 버튼 */}
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
      </div>
      <div className="w-full h-[1px] bg-[#f7f8f9]"/>
    </form>
  )
}


export interface ToggleFollowActionResult {
  studioId: number;
  sequence: number,
  errorCode?: string,
  errorMessage?: string,
  message?: string,
  follow?: StudioFollowResponse,
}