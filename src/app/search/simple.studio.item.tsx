'use client'
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import { useRouter } from "next/navigation";
import { isMobile } from "react-device-detect";
import { KloudScreen } from "@/shared/kloud.screen";

export const SearchStudioItems = ({studios}: { studios: GetStudioResponse[] }) => {
  return (
    <ul className="flex flex-col space-y-4 p-2">
      {studios.map((item) => (
        <SearchStudioItem key={item.id} item={item}/>
      ))}
    </ul>
  )
}

const SearchStudioItem = ({item}: { item: GetStudioResponse }) => {

  const router = useRouter();
  const handleOnClick = () => {
    if (window) {
      window.KloudEvent.push(KloudScreen.StudioDetail(item.id))
    } else {
      router.push(KloudScreen.StudioDetail(item.id))
    }
  }
  return (
    <div className="flex items-center justify-between w-full max-w-md p-4 bg-white rounded-lg shadow-md" onClick={handleOnClick}>
      {/* 프로필 이미지 및 정보 */}
      <div className="flex items-center space-x-4">
        {/* 프로필 이미지 */}
        <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
          <span className="text-white text-sm font-bold">Aspire</span>
        </div>
        {/* 텍스트 정보 */}
        <div>
          <div className="text-lg font-bold text-black">{item.name}</div>
          <div className="text-sm text-gray-500">{item.address}</div>
        </div>
      </div>
      {/* 팔로우 버튼 */}
      <button
        className="px-4 py-2 text-sm font-medium text-gray-500 border border-gray-300 rounded-full hover:bg-gray-100">
        팔로잉
      </button>
    </div>
  )
}