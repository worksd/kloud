import { HeaderInDetail } from "@/app/components/headers";
import Image from "next/image";
import LocationIcon from "../../../../public/assets/location.svg";
import PhoneIcon from "../../../../public/assets/phone.svg";
import { LessonGridSection } from "@/app/components/lesson.grid.section";
import React from "react";
import { getStudioDetail } from "@/app/studios/[id]/studio.detail.action";
import { notFound } from "next/navigation";
import { GetAnnouncementResponse } from "@/app/endpoint/user.endpoint";
import { StudioFollowButton } from "@/app/studios/[id]/StudioFollowButton";
import { translate } from "@/utils/translate";
import { PassPlanPurchaseSubmitButton } from "@/app/lessons/[id]/PassPlanPurchaseSubmitButton";

export const StudioDetailForm = async ({id}: { id: number }) => {

  const studio = await getStudioDetail(id);

  if (!('id' in studio)) return notFound();

  return (
    <div className="w-full h-screen bg-white flex flex-col pb-20 box-border overflow-y-auto no-scrollbar">
      {/* 헤더 */}
      <HeaderInDetail title={studio.name}/>

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
            <StudioFollowButton studioId={id} follow={studio.follow}/>
          </div>

        </div>
      </div>

      {/* 상세 영역 */}
      <div className="flex flex-col gap-2 mt-6">
        <div className="flex flex-row items-center px-4 gap-2">
          <LocationIcon className="flex-shrink-0"/>
          <div className="text-[#505356] text-[14px] font-medium">{studio.address}</div>
        </div>


        {studio.phone && studio.phone.length > 0 && <div className="justify-start items-center gap-2 flex px-4">
          <PhoneIcon className="flex-shrink-0"/>
          <div className="text-center text-[#505356] text-[14px] font-medium leading-tight">{studio.phone}</div>
        </div>}


        {/*<div className="self-stretch px-6 justify-start items-center gap-2 inline-flex">*/}
        {/*  {studio.instagramAddress && <InstagramIcon/>}*/}
        {/*  {studio.youtubeUrl && <YoutubeIcon/>}*/}
        {/*</div>*/}

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
                      <div className="bg-[#F7F8F9] p-4 rounded-2xl mb-8 flex flex-col">
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
            <LessonGridSection studioId={studio.id} title="Hot" lessons={studio?.lessons ?? []}
            />
          </div>
        </div>
      </div>

      <div className="left-0 w-full h-fit fixed bottom-2 px-6">
        <PassPlanPurchaseSubmitButton studioId={studio.id}/>
      </div>

    </div>
  );
}