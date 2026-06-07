// PC 전용 스튜디오 목록 mock. 추후 BE 글로벌 list 엔드포인트(GetStudioList) 활용으로 교체.

import React from "react";
import Link from "next/link";
import { KloudScreen } from "@/shared/kloud.screen";

type MockStudio = {
  id: number;
  name: string;
  address: string;
  profileImageUrl: string;
  coverImageUrl: string;
  lessonCount: number;
  passPlanCount: number;
  genres: string[];
};

const MOCK_STUDIOS: MockStudio[] = [
  {
    id: 14,
    name: '에스파이어 서울',
    address: '경기 부천시 소사구 경인로 477',
    profileImageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360016489',
    coverImageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/profile/1770556600909',
    lessonCount: 18,
    passPlanCount: 5,
    genres: ['Hiphop', 'Choreography', 'K-pop'],
  },
  {
    id: 1,
    name: '로우그래피',
    address: '서울 강남구 테헤란로 521',
    profileImageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360449927.jpg',
    coverImageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360449927.jpg',
    lessonCount: 32,
    passPlanCount: 7,
    genres: ['Locking', 'Popping', 'House'],
  },
  {
    id: 2,
    name: '댄스풀 강남',
    address: '서울 강남구 역삼로 211',
    profileImageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/profile/1770556600909',
    coverImageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360016489',
    lessonCount: 24,
    passPlanCount: 4,
    genres: ['Girls Hiphop', 'Krump'],
  },
  {
    id: 3,
    name: '비트 스튜디오',
    address: '서울 마포구 와우산로 94',
    profileImageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360449927.jpg',
    coverImageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/profile/1770556600909',
    lessonCount: 12,
    passPlanCount: 3,
    genres: ['Waacking', 'Vogue'],
  },
  {
    id: 4,
    name: '플로어 댄스 아카데미',
    address: '경기 성남시 분당구 정자로 65',
    profileImageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360016489',
    coverImageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360449927.jpg',
    lessonCount: 22,
    passPlanCount: 6,
    genres: ['Breaking', 'Hiphop'],
  },
  {
    id: 5,
    name: '서울 스튜디오',
    address: '서울 종로구 종로 12',
    profileImageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/profile/1770556600909',
    coverImageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/profile/1770556600909',
    lessonCount: 15,
    passPlanCount: 4,
    genres: ['K-pop', 'Choreography'],
  },
];

export default function StudiosPcForm() {
  return (
    <div className="w-full min-h-screen bg-white">
      <div className="mx-auto w-full max-w-6xl px-8 pt-24 pb-20">
        <header className="mb-8">
          <h1 className="text-[28px] font-bold text-black tracking-tight">스튜디오</h1>
          <p className="text-[14px] text-[#86898C] mt-1">전국의 댄스 스튜디오를 둘러보세요 <span className="ml-1 text-[#BCBFC2]">· mock data</span></p>
        </header>

        <div className="grid grid-cols-3 gap-x-5 gap-y-10">
          {MOCK_STUDIOS.map((s) => (
            <Link
              key={s.id}
              href={KloudScreen.StudioDetail(s.id)}
              className="flex flex-col gap-3 group"
            >
              {/* cover + 프로필 오버레이 */}
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#F1F3F6]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.coverImageUrl}
                  alt={s.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"/>
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.profileImageUrl} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"/>
                </div>
              </div>

              {/* 본문 */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[16px] font-bold text-black truncate">{s.name}</span>
                <div className="flex items-center gap-1.5 text-[12px] text-[#86898C]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z" stroke="#86898C" strokeWidth="1.5"/>
                    <path d="M12 22C16 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 14.4183 8 18 12 22Z" stroke="#86898C" strokeWidth="1.5"/>
                  </svg>
                  <span className="truncate">{s.address}</span>
                </div>

                {/* 메타 — 수업 수 + 패스권 수 */}
                <div className="flex items-center gap-3 mt-1 text-[12px] text-[#666]">
                  <span>수업 <span className="font-bold text-black">{s.lessonCount}</span></span>
                  <span className="w-px h-3 bg-[#dcdee0]"/>
                  <span>패스권 <span className="font-bold text-black">{s.passPlanCount}</span></span>
                </div>

                {/* 장르 태그 */}
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {s.genres.map((g) => (
                    <span key={g} className="px-2 py-0.5 text-[11px] font-medium text-[#666] bg-[#F5F6F8] rounded-full">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
