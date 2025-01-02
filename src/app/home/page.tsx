import Logo from "../../../public/assets/logo_black.svg"
import { UpcomingLessons } from "@/app/home/upcoming.lessons";
import { NewNotifications } from "@/app/home/new.notifications";

export default function Home(props: any) {

  const notifications = [];
  const upcomingLessons = [
    {
      id: 0,
      title: '새믈1',
      date: 'asdf',
      studio: {
        id: 0,
        logoUrl: '',
        name: '',
      },
      posterUrl: ''
    },
    {
      id: 0,
      title: '새믈1',
      date: 'asdf',
      studio: {
        id: 0,
        logoUrl: '',
        name: '',
      },
      posterUrl: ''
    },
    {
      id: 0,
      title: '새믈1',
      date: 'asdf',
      studio: {
        id: 0,
        logoUrl: '',
        name: '',
      },
      posterUrl: ''
    },
  ];
  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      <div className="p-4">
        <div className="w-[105px]">
          <Logo className="scale-[0.7] origin-left"/>
        </div>
      </div>
      <NewNotifications/>
      <div>
        <div className="headline-200 text-left p-2">
          Upcoming
        </div>
        <div className="flex-1 overflow-y-auto">
          <UpcomingLessons lessons={upcomingLessons}/>
        </div>
      </div>
    </div>
  );
}