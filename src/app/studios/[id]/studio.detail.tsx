import { HeaderInDetail } from "@/app/components/headers";
import Image from "next/image";
import LocationIcon from "../../../../public/assets/location.svg";
import { LessonGridSection } from "@/app/components/lesson.grid.section";
import React from "react";
import { getStudioDetail } from "@/app/studios/[id]/studio.detail.action";
import { notFound } from "next/navigation";
import { GetAnnouncementResponse } from "@/app/endpoint/user.endpoint";
import { translate } from "@/utils/translate";
import { PassPlanPurchaseSubmitButton } from "@/app/lessons/[id]/PassPlanPurchaseSubmitButton";
import { TimeTable } from "@/app/studios/timetable/TimeTable";
import { StudioIcon } from "@/app/studios/[id]/StudioIcon";
import { TimeTableServerComponent } from "@/app/home/TimeTableServerComponent";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import LeftArrow from "../../../../public/assets/left-arrow.svg";
import { ScrollContainer } from "@/app/studios/[id]/ScrollContainer";

export const StudioDetailForm = async ({id, appVersion}: { id: number, appVersion: string }) => {

  const studio = await getStudioDetail(id);

  if (!('id' in studio)) return notFound();

  return (
    <ScrollContainer className="w-full h-screen bg-white flex flex-col pb-20 box-border overflow-y-auto no-scrollbar studio-detail-container">
      {/* 헤더 */}
      <NavigateClickWrapper method={'back'}>
        <button
          type="button"
          aria-label="뒤로가기"
          className={[
            'absolute left-3 z-10',
            // 큰 터치 타깃 + 반투명 배경
            'inline-flex h-10 w-10 items-center justify-center rounded-full',
            'backdrop-blur text-white shadow mt-10',
          ].join(' ')}
        >
          <LeftArrow className="h-5 w-5"/>
        </button>
      </NavigateClickWrapper>
      {/* 수업 썸네일 */}
      <div
        style={{backgroundImage: `url(${studio.coverImageUrl ?? studio.profileImageUrl})`}}
        className="
            w-full
            relative
            aspect-[1/1]

            bg-cover
            bg-center
            bg-no-repeat

            before:content-['']
            before:absolute
            before:inset-0
            before:block
            before:bg-gradient-to-b
            before:from-transparent
            before:from-[65%]
            before:to-white
            before:to-100%
            before:z-25"
      >
        <div className="w-full pl-6 box-border items-center gap-3 inline-flex absolute bottom-0 z-20">
          <div className="w-[60px] h-[60px] rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={studio.profileImageUrl}
              alt="studio logo"
              width={60}
              height={60}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-col justify-center items-start gap-2 inline-flex">
            <div className="text-[#131517] text-xl font-bold leading-normal">{studio.name}</div>
          </div>

        </div>
      </div>

      {/* 상세 영역 */}
      <div className="flex flex-col gap-2 mt-6">
        <div className="flex flex-row items-center px-6 gap-2">
          <LocationIcon className="flex-shrink-0"/>
          <div className="text-[#505356] text-[14px] font-medium">{studio.address}</div>
        </div>

        <div className="self-stretch px-6 justify-start items-center gap-2 inline-flex py-3">
          {studio.instagramAddress && <StudioIcon type={'instagram'} url={studio.instagramAddress} appVersion={appVersion}/>}
          {studio.youtubeUrl && <StudioIcon type={'youtube'} url={studio.youtubeUrl} appVersion={appVersion}/>}
        </div>

        <section>
          {studio.banners && studio.banners.length > 0 && (
              <div className="flex flex-col">
                {studio.banners && studio.banners.length > 0 && (
                    <div className="flex overflow-x-auto snap-x snap-mandatory last:pr-6 scrollbar-hide">
                      {studio.banners.map((banner) => {
                        const isExpired = new Date(banner.endDate) < new Date();
                        if (isExpired) return null;

                        return (
                            <NavigateClickWrapper
                                key={banner.id}
                                method="push"
                                route={banner.route}
                            >
                              <div className="min-w-[calc(100vw-32px)] snap-start pl-4">
                                <div className="w-full aspect-[32/9] relative rounded-2xl mb-2 overflow-hidden">
                                  <Image
                                      src={banner.imageUrl}
                                      alt={banner.description || '배너'}
                                      fill
                                      className="object-cover"
                                  />
                                </div>
                              </div>
                            </NavigateClickWrapper>
                        );
                      })}
                    </div>
                )}
              </div>
          )}
        </section>


        <TimeTableServerComponent studioId={studio.id}/>

        <section>
          {studio.announcements && studio.announcements.length > 0 && (
              <div className="flex flex-col">
                <div className="p-4">
                  <div className="text-[20px] text-black font-bold">
                    {await translate('studio_announcement')}
                  </div>
                </div>
                {studio.announcements && studio.announcements.length > 0 && (
                    <div className="flex overflow-x-auto snap-x snap-mandatory last:pr-6 scrollbar-hide">
                      {studio.announcements.map((item: GetAnnouncementResponse) => (
                          <div
                              key={item.id}
                              className="min-w-[calc(100vw-32px)] snap-start pl-4"
                          >
                            <div className="bg-[#F7F8F9] p-4 rounded-2xl flex flex-col">
                              <div>
                                <div className="flex items-center gap-2">
                                  <div className="w-[24px] h-[24px] rounded-full overflow-hidden flex-shrink-0">
                                    <img
                                        src={studio.profileImageUrl}
                                        alt="스튜디오"
                                        className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <span className="font-bold text-black text-[14px]">
                              {studio.name}
                            </span>
                                </div>
                              </div>
                              <p className="text-[#667085] mt-2 text-[14px]">
                                {item.body}
                              </p>
                            </div>
                          </div>
                      ))}
                    </div>
                )}
              </div>
          )}
        </section>

        <div>
          <div className="w-full h-3 bg-[#f7f8f9]"/>
          <div className="mt-4">
            <LessonGridSection studioId={studio.id} title={await translate('ongoing_lessons')}
                               lessons={studio?.lessons ?? []}
            />
          </div>
        </div>
      </div>

      {studio.passPlans && studio.passPlans.length > 0 &&
        <div className="left-0 w-full h-fit fixed bottom-0 px-6 py-6 bg-white">
          <PassPlanPurchaseSubmitButton studioId={studio.id}/>
        </div>
      }

    </ScrollContainer>
  );
}