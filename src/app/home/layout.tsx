import Logo from "../../../public/assets/logo_black.svg";
import NotificationIcon from "../../../public/assets/ic_notification.svg";
import { ReactNode } from "react";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";

export default async function HomeLayout({
                                           children,
                                           popularStudios,
                                           popularLessons,
                                           my
                                         }: Readonly<{
  children: ReactNode;
  my: ReactNode;
  popularStudios: ReactNode;
  popularLessons: ReactNode;
}>) {
  return (
    <div className="flex flex-col h-screen no-scrollbar">
      <div className="px-4 py-2 flex flex-row justify-between">
        <Logo className="scale-[0.7] origin-left"/>
        <NavigateClickWrapper method={'push'} route={KloudScreen.Notification}>
          <NotificationIcon/>
        </NavigateClickWrapper>

      </div>
      <div className="flex-1 overflow-y-auto">
        {popularLessons}
        {my}
        {popularStudios}
        {children}
      </div>
    </div>
  );
}