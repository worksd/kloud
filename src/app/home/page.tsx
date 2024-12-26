import Logo from "../../../public/assets/logo_black.svg"
import { UpcomingLessons } from "@/app/home/upcoming.lessons";

export default function Home(props: any) {

  const notifications = [];
  const upcomingLessons = [];


  return (
    <div className="w-screen min-h-screen bg-white flex flex-col">
      <div className="w-screen p-4">
        <Logo/>
      </div>

      <UpcomingLessons lessons={[
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
      ]}/>

      {/*<div className="flex flex-1 flex-col items-center justify-center space-y-[24px]">*/}
      {/*  <div className="headline-200">*/}
      {/*    관심있는 스튜디오를 찾아 추가해보세요!*/}
      {/*  </div>*/}

      {/*  <div className="full-width-button">*/}
      {/*    스튜디오 둘러보기*/}
      {/*  </div>*/}
      {/*</div>*/}
    </div>
  );
}