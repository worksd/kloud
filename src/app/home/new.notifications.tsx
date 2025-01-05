"use client";
import { Swiper, SwiperSlide } from "swiper/react";

export const NewNotifications = () => {
  const newItems = [
    {
      id: 1,
      title: "원밀리언 댄스 스튜디오",
      brand: "1M",
      description: "쿠폰에 유효기간이 남아있는 분들은 월-금 14:00-23:00까지 연제든지 연습실 사용이 가능합니..."
    },
    {
      id: 2,
      title: "프라이빗 댄스 스튜디오",
      brand: "PDS",
      description: "신규 회원 등록시 첫 수업 무료 체험이 가능합니다..."
    },
    {
      id: 3,
      title: "프라이빗 댄스 스튜디오",
      brand: "PDS",
      description: "신규 회원 등록시 첫 수업 무료 체험이 가능합니다..."
    },
    {
      id: 4,
      title: "프라이빗 댄스 스튜디오",
      brand: "PDS",
      description: "신규 회원 등록시 첫 수업 무료 체험이 가능합니다..."
    },
    {
      id: 5,
      title: "프라이빗 댄스 스튜디오",
      brand: "PDS",
      description: "신규 회원 등록시 첫 수업 무료 체험이 가능합니다..."
    },
    {
      id: 6,
      title: "프라이빗 댄스 스튜디오",
      brand: "PDS",
      description: "신규 회원 등록시 첫 수업 무료 체험이 가능합니다..."
    },
    // 추가 아이템...
  ];
  return (
    <section className="sticky top-0 bg-white z-10">
      <div className="p-4">
        <div className="text-[24px] font-normal text-black">New</div>
      </div>
      <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory">
        {newItems.map((item) => (
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
    </section>
  )
}