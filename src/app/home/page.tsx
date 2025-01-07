import Logo from "../../../public/assets/logo_black.svg"
import { UpcomingLessons } from "@/app/home/upcoming.lessons";
import { NotificationList } from "@/app/home/notification.list";

export default async function Home(props: any) {
  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      <div className="p-4">
        <div className="w-[105px]">
          <Logo className="scale-[0.7] origin-left"/>
        </div>
      </div>
      <NotificationList title="New"/>
      <div>
        <div className="headline-200 text-left p-4">
          Upcoming
        </div>
        <div className="flex-1 overflow-y-auto">
          <UpcomingLessons />
        </div>
      </div>
    </div>
  );
}

