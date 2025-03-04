'use client'
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { KloudScreen } from "@/shared/kloud.screen";
import AnnouncementIcon from "../../../../public/assets/announcement-right-arrow.svg";
import React from "react";
import { GetAnnouncementResponse } from "@/app/endpoint/user.endpoint";

export const AnnouncementBand = ({announcements} : {announcements: GetAnnouncementResponse[]}) => {
  return (

    <Swiper
      simulateTouch={true}
      grabCursor={true}
      centeredSlides={true}
      modules={[Navigation, Pagination, Autoplay]}
      className={"overflow-hidden"}
    >
      {announcements?.map((item, index) => (
        <SwiperSlide key={index}>
          <div className="px-4"
               onClick={() => window.KloudEvent?.push(KloudScreen.StudioDetail(item.studio.id))}> {/* 좌우 패딩 추가 */}
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
                  <p className="text-[#667085] mt-2 text-[14px] line-clamp-2">
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
  )
}