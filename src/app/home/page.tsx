'use client'
import { useEffect, useState } from "react";
import { getEventList } from "@/app/home/get.event.list.action";
import { GetEventResponse } from "@/app/endpoint/event.endpoint";
import { hideDialogAction } from "@/app/home/hide.dialog.action";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { Poster } from "@/app/components/Poster";
import { GetNotificationResponse } from "@/app/endpoint/notification.endpoint";
import { getMe } from "@/app/home/get.me.action";
import Loading from "@/app/loading";

export default function Home({
                               searchParams
                             }: {
  searchParams: Promise<{ os: string }>}) {

  const [lessons, setLessons] = useState<GetLessonResponse[]>([]);
  const [notifications, setNotifications] = useState<GetNotificationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const events = await getEventList();
        if (events.length > 0) {
          const randomIndex = Math.floor(Math.random() * events.length);
          const event = events[randomIndex];
          const dialogInfo = {
            id: `${event.id}`,
            route: event.route,
            hideForeverMessage: event.hideForeverMessage,
            imageUrl: event.imageUrl,
            imageRatio: event.imageRatio,
            ctaButtonText: event.ctaButtonText,
            type: 'IMAGE',
          }
          window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
        }

      } catch (error) {
        console.error('이벤트 로딩 중 에러 발생:', error);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    window.onDialogConfirm = async (data: GetEventResponse) => {
      console.log(data.route)
      console.log((await searchParams).os)
      if (data.route) {
        const os = (await searchParams).os
        if (os === 'Android') {
          window.KloudEvent.push(data.route)
        }
        else if (os === 'iOS'){
          window.KloudEvent.rootNext(data.route)
        }
      }
    }
  }, [])

  useEffect(() => {
    window.onHideDialogConfirm = async ( data: { id: string, clicked: boolean}) => {
      await hideDialogAction({id: data.id, clicked: data.clicked})
    }
  })

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const me = await getMe();
        setIsLoading(false);

        setLessons(me.lessons ?? [])

      } catch (error) {
        setIsLoading(false);
        console.error('홈 컨텐츠 fetch 중 에러 발생:', error);
      }
    };
    fetchMe();
  }, []);

  return <>
    <div>
      <section className="sticky top-0 bg-white z-10">
        <div className="p-4">
          <div className="text-[24px] font-normal text-black">New</div>
        </div>
        {notifications && notifications.length > 0 && (
          <div className="flex overflow-x-auto snap-x snap-mandatory last:pr-6 scrollbar-hide">
            {notifications.map((item: GetNotificationResponse) => (
              <div
                key={item.id}
                className="min-w-[calc(100vw-32px)] snap-start pl-4"
              >
                <div className="bg-[#F7F8F9] p-4 rounded-2xl mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[18px]">{item.brand}</span>
                        <span className="font-bold text-black text-[14px]">{item.title}</span>
                      </div>
                      <p className="text-[#667085] mt-2 text-[14px]">
                        {item.description}
                      </p>
                    </div>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18L15 12L9 6" stroke="#000000" strokeWidth="2" strokeLinecap="round"
                            strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {notifications && notifications.length == 0 && (
          <div className="w-screen text-center text-[#BCBFC2] py-[42px]">새로운 공지사항이 없습니다</div>
        )}
      </section>
      <div className="p-4">
        <div className="text-[24px] font-normal text-black">Upcoming</div>
      </div>
      {lessons && lessons.length > 0 && (
        <div className="flex overflow-x-auto snap-x snap-mandatory last:pr-6 scrollbar-hide">
          {lessons.map((item: GetLessonResponse) => (
            <div
              key={item.id}
              className="pl-4"
            >
              <Poster
                width={167}
                id={item.id}
                posterUrl={item?.thumbnailUrl ?? ''}
                title={item.title ?? ''}
                startTime={item.startTime ?? ''}
                studioLogoUrl={item.studio?.profileImageUrl}
              />
            </div>
          ))}
        </div>
      )}
      {!isLoading && lessons && lessons.length == 0 && (
        <div className="w-screen text-center text-[#BCBFC2] py-[150px]">다가오는 수업이 없습니다</div>
      )}
      { isLoading && <div className="flex justify-center items-center mt-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-gray-900"></div>
      </div>
      }
    </div>
  </>;
}