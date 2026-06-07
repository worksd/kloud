// PC 전용 행사 목록 mock. 추후 BE 글로벌 list 엔드포인트(/events) 활용으로 교체.

import React from "react";
import Link from "next/link";

type MockEvent = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  period: string;
  cta: string;
  route: string;
  status: 'ongoing' | 'upcoming' | 'ended';
};

const MOCK_EVENTS: MockEvent[] = [
  {
    id: 1,
    title: '여름 챌린지 코레오 페스티벌',
    description: '전국 댄서들과 함께하는 한여름 챌린지. 우승자에게는 1년 무제한 패스 증정.',
    imageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/profile/1770556600909',
    period: '2026.07.01 - 2026.07.31',
    cta: '참가 신청',
    route: '/',
    status: 'upcoming',
  },
  {
    id: 2,
    title: '신규 회원 첫 수업 50% 할인',
    description: '처음 가입하신 회원분들께 첫 수업 결제 시 50% 즉시 할인 혜택을 드립니다.',
    imageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360449927.jpg',
    period: '상시 진행',
    cta: '쿠폰 받기',
    route: '/',
    status: 'ongoing',
  },
  {
    id: 3,
    title: '에스파이어 서울 오픈 1주년 기념',
    description: '오픈 1주년을 맞아 전 수업 30% 할인 + 굿즈 증정 이벤트',
    imageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360016489',
    period: '2026.06.01 - 2026.06.30',
    cta: '자세히 보기',
    route: '/',
    status: 'ongoing',
  },
  {
    id: 4,
    title: 'HOWL 하울 마스터클래스',
    description: '국내 톱 안무가 HOWL의 단독 마스터 클래스. 선착순 30명',
    imageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360449927.jpg',
    period: '2026.06.15',
    cta: '예약하기',
    route: '/',
    status: 'upcoming',
  },
  {
    id: 5,
    title: '봄맞이 첫 수업 이벤트',
    description: '봄 시즌 신규 가입자 대상 첫 수업 무료 체험',
    imageUrl: 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/profile/1770556600909',
    period: '2026.03.01 - 2026.04.30',
    cta: '종료된 이벤트',
    route: '/',
    status: 'ended',
  },
];

const STATUS_BADGE: Record<MockEvent['status'], { label: string; className: string }> = {
  ongoing: { label: '진행 중', className: 'bg-black text-white' },
  upcoming: { label: '예정', className: 'bg-[#EFF6FF] text-[#2563EB]' },
  ended: { label: '종료', className: 'bg-[#F1F3F6] text-[#86898C]' },
};

export default function EventsPcForm() {
  return (
    <div className="w-full min-h-screen bg-white">
      <div className="mx-auto w-full max-w-6xl px-8 pt-24 pb-20">
        <header className="mb-8">
          <h1 className="text-[28px] font-bold text-black tracking-tight">행사</h1>
          <p className="text-[14px] text-[#86898C] mt-1">진행 중인 이벤트와 프로모션을 확인하세요 <span className="ml-1 text-[#BCBFC2]">· mock data</span></p>
        </header>

        <div className="grid grid-cols-2 gap-x-6 gap-y-8">
          {MOCK_EVENTS.map((e) => {
            const isEnded = e.status === 'ended';
            const badge = STATUS_BADGE[e.status];
            return (
              <Link
                key={e.id}
                href={e.route}
                className={[
                  'flex flex-col gap-4 group rounded-2xl overflow-hidden border border-[#f0f1f3] bg-white',
                  isEnded ? 'opacity-60' : 'hover:shadow-md transition-shadow',
                ].join(' ')}
              >
                <div className="relative w-full aspect-[16/9] bg-[#F1F3F6]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={e.imageUrl}
                    alt={e.title}
                    className={[
                      'w-full h-full object-cover',
                      !isEnded ? 'transition-transform duration-300 group-hover:scale-[1.02]' : '',
                    ].join(' ')}
                  />
                  <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold ${badge.className}`}>
                    {badge.label}
                  </div>
                </div>
                <div className="flex flex-col gap-2 px-5 pb-5">
                  <h2 className="text-[17px] font-bold text-black leading-snug line-clamp-2">{e.title}</h2>
                  <p className="text-[13px] text-[#86898C] line-clamp-2 leading-relaxed">{e.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[12px] text-[#999] font-medium">{e.period}</span>
                    <span className={`text-[13px] font-bold ${isEnded ? 'text-[#BCBFC2]' : 'text-black'}`}>
                      {e.cta} {!isEnded && '→'}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
