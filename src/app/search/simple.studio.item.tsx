import { Poster } from "@/app/components/Poster";
import { Studio } from "@/entities/studio/studio";

export const SearchStudioItems = ({studios}: {studios: Studio[]}) => {
  return (
    <ul className="flex flex-col space-y-4 p-2">
      {studios.map((item) => (
        <SearchStudioItem key={item.id} item={item} />
      ))}
    </ul>
  )
}

const SearchStudioItem = ({item} : {item: Studio}) => {
  return (
    <div className="flex items-center justify-between w-full max-w-md p-4 bg-white rounded-lg shadow-md">
      {/* 프로필 이미지 및 정보 */}
      <div className="flex items-center space-x-4">
        {/* 프로필 이미지 */}
        <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
          <span className="text-white text-sm font-bold">Aspire</span>
        </div>
        {/* 텍스트 정보 */}
        <div>
          <div className="text-lg font-bold text-black">에스파이어 서울</div>
          <div className="text-sm text-gray-500">서울 마포구</div>
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