'use client'
import React, { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { GetLessonResponse, JumbotronResponse } from "@/app/endpoint/lesson.endpoint";
import Image from "next/image";
import { KloudScreen } from "@/shared/kloud.screen";
import { kloudNav } from "@/app/lib/kloudNav";

const CardList = ({lessons}: { lessons: JumbotronResponse[] }) => {
  const [currentCard, setCurrentCard] = useState<number>(0);

  return (
    <div className="">
      <Swiper
        simulateTouch={true}
        grabCursor={true}
        centeredSlides={true}
        autoplay={{
          delay: 5000,
        }}
        initialSlide={currentCard}
        onSlideChange={(swiper) => {
          setCurrentCard(swiper.realIndex);
        }}
        modules={[Navigation, Pagination, Autoplay]}
      >
        {lessons?.map((item, index) => {
          return (
            <SwiperSlide key={index} className={"items-center"}>
              <div
                className={`w-full aspect-[390/441] relative`}
                onClick={() => {
                  kloudNav.push(KloudScreen.LessonDetail(item.id), {
                    ignoreSafeArea: true
                  })
                }}
              >
                <Image
                  src={item.thumbnailUrl ?? ''}
                  alt="썸네일"
                  fill
                  draggable={false}
                />

                {/* 그라데이션 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70"/>

                {/* 하단 텍스트 영역 */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <div className="w-[40px] h-[40px] rounded-full overflow-hidden flex-shrink-0 mb-2">
                    <img
                      src={item.studioImageUrl}
                      alt={'스튜디오 이미지'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h2 className="text-[22px] font-bold mb-2 leading-tight">
                    {item.title ?? ''}
                  </h2>
                  <p className="text-[16px]">
                    {item.description}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          )
        })}
      </Swiper>

      {/* Hello World 텍스트를 absolute로 배치 */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center text-white z-10">
        <DotIndicator total={lessons?.length ?? 0} current={currentCard}/>
      </div>
    </div>
  );
}

const DotIndicator = ({total, current}: { total: number; current: number }) => {
  return (
    <div className="flex justify-center gap-1 mt-2">
      {Array.from({length: total}).map((_, index) => (
        <div
          key={index}
          className={`w-2 h-2 rounded-full transition-all duration-200 ${
            index === current ? 'bg-white' : 'bg-white/50'
          }`}
        />
      ))}
    </div>
  );
};

export default CardList;