'use server'
import { translate } from "@/utils/translate";
import { cookies } from "next/headers";
import { studioKey } from "@/shared/cookies.key";
import NoMyStudioPage from "@/app/studios/NoMyStudioPage";
import { api } from "@/app/api.client";
import MyStudioPage from "@/app/studios/MyStudioPage";
import ArrowDownIcon from "../../../public/assets/arrow-down.svg"
import Logo from "../../../public/assets/logo_black.svg";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";
import NotificationIcon from "../../../public/assets/ic_notification.svg";

export default async function StudioPage() {

  const res = await api.studio.my({});
  const cookieStudioId = (await cookies()).get(studioKey)?.value

  if ('studios' in res) {
    const serverStudioId = res.studios.length > 0 ? `${res.studios[0].id}` : undefined
    return (
      <div className="flex flex-col bg-white min-h-screen">
        {/* Fixed Top Bar */}
        <div
          className="fixed top-0 left-0 right-0 flex flex-row items-center justify-between h-16 px-6 py-2 bg-white z-10">
          <Logo className="scale-[0.7] origin-left"/>
          <NavigateClickWrapper method="push" route={KloudScreen.Notification}>
            <NotificationIcon/>
          </NavigateClickWrapper>
        </div>

        {/* Content Area */}
        <div className="pt-16"> {/* 헤더 높이만큼 패딩 줌 */}
          {(cookieStudioId || serverStudioId) ? (
            <MyStudioPage studioId={cookieStudioId ?? serverStudioId}/>
          ) : (
            <NoMyStudioPage/>
          )}
        </div>
      </div>
    );
  }
}