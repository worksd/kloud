"use client";
import { Swiper, SwiperSlide } from "swiper/react";

export const NewNotifications = () => {
  return (
    <div className="flex flex-col bg-amber-400">

      <div className="headline-200">New</div>
      <div className="w-screen bg-amber-700">
        <Swiper
          loop={false} // 루프 활성화
        >
          {[1, 2, 3].map((index) => (
            <SwiperSlide key={index}>
              <div>
                Hello World
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

    </div>
  )
}