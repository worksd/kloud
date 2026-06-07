// PC 전용 연습실 목록 mock. studioId 없이도 보이는 글로벌 list 페이지.
// 카드 클릭 시 각 스튜디오의 연습실 상세(/studioRooms/{id})로 이동.

import React from "react";
import Link from "next/link";
import { KloudScreen } from "@/shared/kloud.screen";

type MockRoom = {
  id: number;
  name: string;
  studioName: string;
  studioImageUrl: string;
  address: string;
  coverImageUrl: string;
  hourlyPrice: number;
  maxPeople: number;
};

const MOCK_ROOMS: MockRoom[] = [
  {
    id: 13,
    name: '동부여성발전센터 대강당',
    studioName: '에스파이어 서울',
    studioImageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360016489',
    address: '경기 부천시 소사구 경인로 477',
    coverImageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/profile/1770556600909',
    hourlyPrice: 30000,
    maxPeople: 101,
  },
  {
    id: 14,
    name: 'A스튜디오 그룹실',
    studioName: '로우그래피',
    studioImageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360449927.jpg',
    address: '서울 강남구 테헤란로 521',
    coverImageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/profile/1770556600909',
    hourlyPrice: 25000,
    maxPeople: 12,
  },
  {
    id: 15,
    name: 'B 연습실',
    studioName: '로우그래피',
    studioImageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360449927.jpg',
    address: '서울 강남구 테헤란로 521',
    coverImageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360449927.jpg',
    hourlyPrice: 15000,
    maxPeople: 6,
  },
  {
    id: 16,
    name: '에스파이어 소강당',
    studioName: '에스파이어 서울',
    studioImageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360016489',
    address: '경기 부천시 소사구 경인로 477',
    coverImageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360449927.jpg',
    hourlyPrice: 20000,
    maxPeople: 30,
  },
];

export default function StudioRoomsPcForm() {
  return (
    <div className="w-full min-h-screen bg-white">
      <div className="mx-auto w-full max-w-6xl px-8 pt-24 pb-20">
        <header className="mb-8">
          <h1 className="text-[28px] font-bold text-black tracking-tight">연습실</h1>
          <p className="text-[14px] text-[#86898C] mt-1">시간 단위로 대관 가능한 연습실을 둘러보세요 <span className="ml-1 text-[#BCBFC2]">· mock data</span></p>
        </header>

        <div className="grid grid-cols-3 gap-x-5 gap-y-8">
          {MOCK_ROOMS.map((r) => (
            <Link
              key={r.id}
              href={KloudScreen.StudioRoomDetail(r.id)}
              className="flex flex-col gap-3 group"
            >
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#F1F3F6]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.coverImageUrl}
                  alt={r.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm">
                  <span className="text-[12px] font-bold text-white">
                    {new Intl.NumberFormat('ko-KR').format(r.hourlyPrice)}원/시간
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.studioImageUrl} alt="" className="w-4 h-4 rounded-full object-cover"/>
                  <span className="text-[12px] text-[#86898C] font-medium truncate">{r.studioName}</span>
                </div>
                <span className="text-[15px] font-bold text-black truncate">{r.name}</span>
                <div className="flex items-center gap-1.5 text-[12px] text-[#86898C]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z" stroke="#86898C" strokeWidth="1.5"/>
                    <path d="M12 22C16 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 14.4183 8 18 12 22Z" stroke="#86898C" strokeWidth="1.5"/>
                  </svg>
                  <span className="truncate">{r.address}</span>
                </div>
                <span className="text-[12px] text-[#86898C]">최대 {r.maxPeople}명</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
