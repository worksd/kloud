'use client'
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import { KloudScreen } from "@/shared/kloud.screen";
import RightArrowIcon from "../../../public/assets/right-arrow.svg";
import { StudioItem } from "@/app/search/StudioItem";
import { useLocale } from "@/hooks/useLocale";

export const StudioItems = ({studios}: { studios: GetStudioResponse[] }) => {

  const { t } = useLocale()
  const onClickMore = () => {
    window.KloudEvent?.push(KloudScreen.Studios)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4 mt-4 px-4">
        <div className="text-[20px] text-black font-bold">{t('popular_studio')}</div>
        {studios.length > 5 && <button className="text-[#86898C] flex items-center" onClick={onClickMore}>
          {t('more')}
          <RightArrowIcon/>
        </button>
        }
      </div>
      <ul className="flex flex-col">
        {studios.map((item) => (
          <StudioItem key={item.id} item={item}/>
        ))}
      </ul>
    </div>
  )
}