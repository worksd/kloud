'use client'
import { useEffect, useState } from "react";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { GetNotificationResponse } from "@/app/endpoint/notification.endpoint";
import { getEventList } from "@/app/home/get.event.list.action";
import { hideDialogAction } from "@/app/home/hide.dialog.action";
import { getMe } from "@/app/home/get.me.action";
import { Poster } from "@/app/components/Poster";
import { DialogInfo } from "@/app/setting/setting.menu.item";
import { registerDeviceAction } from "@/app/home/action/register.device.action";
import CardList from "@/app/components/Carousel";
import { getJumbotronList } from "@/app/home/action/get.jumbotron.list";
import { getStudioList } from "@/app/home/@popularStudios/get.studio.list.action";
import { StudioItems } from "@/app/search/StudioItems";
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";

export default function HomeScreen({os}: { os: string }) {
  const [jumbotrons, setJumbotrons] = useState<GetLessonResponse[]>([]);
  const [lessons, setLessons] = useState<GetLessonResponse[]>([]);
  const [studios, setStudios] = useState<GetStudioResponse[]>([]);
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
    window.onDialogConfirm = async (data: DialogInfo) => {
      if (data.route) {
        if (os === 'Android') {
          window.KloudEvent.push(data.route)
        } else if (os === 'iOS') {
          window.KloudEvent.rootNext(data.route)
        }
      }
    }
  }, [])

  useEffect(() => {
    window.onHideDialogConfirm = async (data: { id: string, clicked: boolean }) => {
      await hideDialogAction({id: data.id, clicked: data.clicked})
    }
  }, [])

  useEffect(() => {
    window.onFcmTokenComplete = async (data: { fcmToken: string, udid: string }) => {
      await registerDeviceAction({
        token: data.fcmToken,
        udid: data.udid,
      })
    }
  }, [])

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

  useEffect(() => {
    const fetchJumbotrons = async () => {
      const res = await getJumbotronList()
      if ('lessons' in res) {
        setJumbotrons(res.lessons ?? []);
      }
    }
    fetchJumbotrons()
  }, []);

  useEffect(() => {
    const fetchStudios = async () => {
      const res = await getStudioList();
      setStudios(res.studios ?? []);
    }
    fetchStudios()
  }, []);

  useEffect(() => {
    window.KloudEvent?.registerDevice()
  }, [])

  return (
    <div className="h-full overflow-y-auto no-scrollbar">
      <section className="flex flex-col">
        <CardList lessons={jumbotrons}/>
      </section>

      <section className="mt-4">
        <div className="p-4">
          <div className="text-[20px] text-black font-bold">다가오는 수업</div>
        </div>

        {lessons && lessons.length > 0 && (
          <div className="flex scrollbar-hide space-x-4">
            {lessons.map((item: GetLessonResponse, index: number) => (
              <div
                key={item.id}
                className={index === 0 ? 'pl-4' : ''}  // 첫 번째 아이템에만 왼쪽 패딩
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
          <div className="w-full text-center text-[#BCBFC2] py-10">
            <p className="text-lg mb-2 text-black font-medium">아직 신청한 수업이 없어요</p>
            <p className="text-sm text-gray-400">
              관심있는 수업을 찾아보세요!
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center items-center mt-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-gray-900"/>
          </div>
        )}


      </section>
      <section>
        <StudioItems studios={studios?.slice(0, 5) ?? []}/>
      </section>
    </div>
  );
}