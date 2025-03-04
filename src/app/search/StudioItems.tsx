import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import RightArrowIcon from "../../../public/assets/right-arrow.svg";
import { StudioItem } from "@/app/search/StudioItem";
import { translate } from "@/utils/translate";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";

export const StudioItems = async ({studios}: { studios: GetStudioResponse[] }) => {

  return (
    <div>
      <div className="flex justify-between items-center mb-4 mt-4 px-4">
        <div className="text-[20px] text-black font-bold">{await translate('popular_studio')}</div>
        {studios.length > 5 && <NavigateClickWrapper method={'push'} route={KloudScreen.Studios}>
          <button className="text-[#86898C] flex items-center">
            {await translate('more')}
            <RightArrowIcon/>
          </button>
        </NavigateClickWrapper>
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