import { api } from "@/app/api.client";
import React from "react";
import { StudioSheetItem } from "@/app/studios/setting/sheet/StudioSheetItem";
import { translate } from "@/utils/translate";
import CloseIcon from "../../../../../public/assets/ic_close.svg";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { cookies } from "next/headers";
import { studioKey } from "@/shared/cookies.key";


export default async function StudioSettingSheetPage() {
  const res = await api.studio.my({});

  if ('studios' in res) {
    return (
      <div>
        <div className="flex flex-row justify-between p-4 text-xl font-bold text-black mt-4">
          <div>{await translate('my_ticket_studio')}</div>
          <div className={'p-1'}>
            <NavigateClickWrapper method={'closeBottomSheet'}>
              <CloseIcon/>
            </NavigateClickWrapper>
          </div>

        </div>

        {
          res.studios.map(async (studio) => (
            <StudioSheetItem item={studio} key={studio.id}
                             isSelected={(await cookies()).get(studioKey)?.value == `${studio.id}`}/>
          ))
        }
      </div>
    )
      ;
  }
}