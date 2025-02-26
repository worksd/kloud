'use client'
import React, { useEffect, useState } from "react";
import { GetLessonResponse } from "@/app/endpoint/lesson.endpoint";
import { getEventList } from "@/app/home/get.event.list.action";
import { hideDialogAction } from "@/app/home/hide.dialog.action";
import { getMe } from "@/app/home/get.me.action";
import { Poster } from "@/app/components/Poster";
import { DialogInfo } from "@/app/setting/setting.menu.item";
import { registerDeviceAction } from "@/app/home/action/register.device.action";
import CardList from "@/app/components/Carousel";
import AnnouncementIcon from "../../../public/assets/announcement-right-arrow.svg"
import { getJumbotronList } from "@/app/home/action/get.jumbotron.list";
import { getStudioList } from "@/app/home/@popularStudios/get.studio.list.action";
import { StudioItems } from "@/app/search/StudioItems";
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import { GetAnnouncementResponse } from "@/app/endpoint/user.endpoint";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { KloudScreen } from "@/shared/kloud.screen";

export default function HomeScreen({os}: { os: string }) {
  const [jumbotrons, setJumbotrons] = useState<GetLessonResponse[]>([]);
  const [lessons, setLessons] = useState<GetLessonResponse[]>([]);
  const [studios, setStudios] = useState<GetStudioResponse[]>([]);
  const [announcements, setAnnouncements] = useState<GetAnnouncementResponse[]>([]);
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

        setAnnouncements(me.announcements ?? [])

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
    <div className="h-full overflow-y-auto no-scrollbar max-w-screen w-full">
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

      <section>
        {announcements && announcements.length > 0 && (
          <div className="flex flex-col">
            <div className="p-4">
              <div className="text-[20px] text-black font-bold">
                스튜디오 공지사항
              </div>
            </div>

            <Swiper
              simulateTouch={true}
              grabCursor={true}
              centeredSlides={true}
              modules={[Navigation, Pagination, Autoplay]}
              className={"overflow-hidden"}
            >
              {announcements?.map((item, index) => (
                <SwiperSlide key={index}>
                  <div className="px-4" onClick={() => window.KloudEvent?.push(KloudScreen.StudioDetail(item.studio.id))}> {/* 좌우 패딩 추가 */}
                    <div className="bg-[#F7F8F9] p-4 rounded-2xl mb-8">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 mr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-[24px] h-[24px] rounded-full overflow-hidden flex-shrink-0">
                              <img
                                src={item.studio.profileImageUrl}
                                alt="스튜디오"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="font-bold text-black text-[14px]">
                        {item.studio.name}
                            </span>
                          </div>
                          <p className="text-[#667085] mt-2 text-[14px]">
                            {item.body}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <AnnouncementIcon/>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </section>
    </div>
  );
}