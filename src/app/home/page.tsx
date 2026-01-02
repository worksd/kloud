import {getHomeAction} from "@/app/home/get.home.action";
import React from "react";
import Logo from "../../../public/assets/logo_black.svg";
import {PassPurchaseButton} from "@/app/profile/PassPurchaseButton";
import MyStudioPage from "@/app/home/MyStudioPage";
import {NoMyStudioPage} from "@/app/home/NoMyStudioPage";
import {getHideDialogIdsAction} from "@/app/home/get.hide.dialog.ids.action";

export default async function Home({
                                     searchParams
                                   }: {
  searchParams: Promise<{ os: string }>
}) {
  const {os} = await searchParams
  const res = await getHomeAction()
  const hideDialogIds = await getHideDialogIdsAction()
  if ('studios' in res) {
    return (
        <div>
          <div
              className="fixed top-0 left-0 right-0 flex flex-row items-center justify-between h-16 px-6 py-2 bg-white z-10">
            <Logo className="scale-[0.7] origin-left"/>
          </div>
          <div className={'mt-20'}>
            {
              res.myStudio ? (
                  <MyStudioPage res={res.myStudio} os={os} hideDialogIds={hideDialogIds}/>
              ) : (
                  <NoMyStudioPage studios={res.recommendedStudios}/>
              )}

          </div>
          <div className={'fixed bottom-4 right-4'}>
            <PassPurchaseButton/>
          </div>
        </div>

    )
  } else {
    throw Error()
  }
}