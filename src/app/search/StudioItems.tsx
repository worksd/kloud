'use client'
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import { KloudScreen } from "@/shared/kloud.screen";
import RightArrowIcon from "../../../public/assets/right-arrow.svg";
import { StudioItem } from "@/app/search/StudioItem";

export const StudioItems = ({studios}: { studios: GetStudioResponse[] }) => {

  const onClickMore = () => {
    window.KloudEvent?.push(KloudScreen.Studios)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4 mt-4 px-4">
        <div className="text-[24px] text-black font-bold">인기 스튜디오</div>
        <button className="text-[#86898C] flex items-center" onClick={onClickMore}>
          더보기
          <RightArrowIcon/>
        </button>
      </div>
      <ul className="flex flex-col">
        {studios.map((item) => (
          <StudioItem key={item.id} item={item}/>
        ))}
      </ul>
    </div>
  )
}