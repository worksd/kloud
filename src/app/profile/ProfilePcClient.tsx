'use client'

// PC 웹 프로필 클라이언트 셸 — tving 웹처럼 좌측 사이드바 메뉴를 눌러도 라우팅하지 않고,
// 우측 컨텐츠 영역에서 해당 내역을 서버 액션으로 불러와 바로 뿌린다 (탭 방식).
// 한 번 연 탭은 mounted 유지(CSS hidden 토글)라 재방문 시 다시 불러오지 않는다.
// 문구는 서버(ProfilePcForm)에서 번역해 props로 내려받는다.

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { KloudScreen } from "@/shared/kloud.screen";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import EditIcon from "../../../public/assets/ic_edit.svg";
import { GetMeResponse } from "@/app/endpoint/user.endpoint";
import { Locale } from "@/shared/StringResource";
import { has, formatPhone } from "@/app/profile/profile.format";
import { TicketResponse } from "@/app/endpoint/ticket.endpoint";
import { GetPaymentRecordResponse } from "@/app/endpoint/payment.record.endpoint";
import { GetSubscriptionResponse } from "@/app/endpoint/subscription.endpoint";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { RoomBookingDetailResponse } from "@/app/endpoint/room.booking.endpoint";
import { getTicketsAction } from "@/app/tickets/get.tickets.action";
import { getPaymentRecordsAction } from "@/app/paymentRecords/get.payment.records.action";
import { getSubscriptionList } from "@/app/profile/mySubscription/action/get.subscription.list.action";
import { getMyPassListAction } from "@/app/profile/myPass/action/get.my.pass.list.action";
import { getRoomBookingsAction } from "@/app/roomBookings/get.room.bookings.action";
import { TicketListContent } from "@/app/tickets/TicketTabClient";
import { PaymentRecordListContent, UpcomingPaymentsContent } from "@/app/paymentRecords/PaymentRecordTabClient";
import { PassColumnList } from "@/app/profile/myPass/PassColumnList";
import { BookingCard, bookingDateKey, bookingNowKey } from "@/app/roomBookings/BookingCard";

export type ProfileTabKey = 'home' | 'tickets' | 'pass' | 'payments' | 'bookings';

export type ProfilePcTranslations = {
  editProfile: string;
  setting: string;
  homeTab: string;
  myTickets: string;
  myPass: string;
  paymentRecords: string;
  roomBookings: string;
  upcomingPayments: string;
  myActivePasses: string;
  myUsedPasses: string;
  roomBookingsUpcoming: string;
  roomBookingsPast: string;
  roomBookingsEmpty: string;
  practiceRoom: string;
  bookingStatus: Record<RoomBookingDetailResponse['status'], string>;
  noTicketsTitle: string;
  noTicketsMessage: string;
  noRecordsMessage: string;
  noActivePassesMessage: string;
};

// 카드 안 빈 상태 — 모바일 리스트 컴포넌트의 풀스크린용 여백(pt-36/mt-40) 대신 카드에 맞는 높이로
const EmptyMessage = ({children}: { children: React.ReactNode }) => (
  <p className="py-16 text-center text-[14px] text-[#A0A5AB] whitespace-pre-line">{children}</p>
);

const Spinner = () => (
  <div className="py-16 flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"/>
  </div>
);

export const ProfileContentCard = ({title, children}: { title?: string; children: React.ReactNode }) => (
  <section className="rounded-2xl border border-[#f0f1f3] bg-white p-6">
    {title && <h2 className="text-[16px] font-bold text-black mb-5">{title}</h2>}
    {children}
  </section>
);

// ── 탭 패널: 각자 서버 액션으로 데이터를 불러와 뿌린다 ─────────────────

const TicketsPanel = ({locale, t}: { locale: Locale, t: ProfilePcTranslations }) => {
  const [tickets, setTickets] = useState<TicketResponse[] | null>(null);
  useEffect(() => {
    getTicketsAction({page: 1}).then((res) => setTickets('tickets' in res ? res.tickets : []));
  }, []);

  return (
    <ProfileContentCard title={t.myTickets}>
      {tickets == null ? <Spinner/> : (
        <TicketListContent
          initialTickets={tickets}
          locale={locale}
          noTicketsTitle={t.noTicketsTitle}
          noTicketsMessage={t.noTicketsMessage}
        />
      )}
    </ProfileContentCard>
  );
};

const PaymentsPanel = ({locale, t}: { locale: Locale, t: ProfilePcTranslations }) => {
  const [records, setRecords] = useState<GetPaymentRecordResponse[] | null>(null);
  const [subscriptions, setSubscriptions] = useState<GetSubscriptionResponse[]>([]);
  useEffect(() => {
    Promise.all([getPaymentRecordsAction({page: 1}), getSubscriptionList()]).then(([paymentRes, subRes]) => {
      setSubscriptions('subscriptions' in subRes ? subRes.subscriptions : []);
      setRecords('paymentRecords' in paymentRes ? paymentRes.paymentRecords : []);
    });
  }, []);

  if (records == null) {
    return <ProfileContentCard title={t.paymentRecords}><Spinner/></ProfileContentCard>;
  }

  const hasUpcoming = subscriptions.some((sub) => sub.status === 'Active');
  return (
    <>
      {hasUpcoming && (
        <ProfileContentCard title={t.upcomingPayments}>
          <UpcomingPaymentsContent subscriptions={subscriptions} locale={locale}/>
        </ProfileContentCard>
      )}
      <ProfileContentCard title={t.paymentRecords}>
        {records.length === 0 ? (
          <EmptyMessage>{t.noRecordsMessage}</EmptyMessage>
        ) : (
          <PaymentRecordListContent
            initialRecords={records}
            locale={locale}
            noRecordsMessage={t.noRecordsMessage}
          />
        )}
      </ProfileContentCard>
    </>
  );
};

const PassPanel = ({locale, t}: { locale: Locale, t: ProfilePcTranslations }) => {
  const [passes, setPasses] = useState<GetPassResponse[] | null>(null);
  useEffect(() => {
    getMyPassListAction({order: 'newest'}).then((res) => setPasses('passes' in res ? res.passes : []));
  }, []);

  if (passes == null) {
    return <ProfileContentCard title={t.myActivePasses}><Spinner/></ProfileContentCard>;
  }

  // 탭 분류 기준은 모바일(MyPassForm)과 동일
  const activePasses = passes.filter((p) => p.status === 'Active' || p.status === 'Pending' || p.status === 'Waiting');
  const usedPasses = passes.filter((p) => !activePasses.includes(p));

  return (
    <>
      <ProfileContentCard title={t.myActivePasses}>
        {activePasses.length === 0 ? (
          <EmptyMessage>{t.noActivePassesMessage}</EmptyMessage>
        ) : (
          <PassColumnList passItems={activePasses} isActivePass={true} locale={locale}/>
        )}
      </ProfileContentCard>
      {usedPasses.length > 0 && (
        <ProfileContentCard title={t.myUsedPasses}>
          <PassColumnList passItems={usedPasses} isActivePass={false} locale={locale}/>
        </ProfileContentCard>
      )}
    </>
  );
};

const BookingsPanel = ({t}: { t: ProfilePcTranslations }) => {
  const [bookings, setBookings] = useState<RoomBookingDetailResponse[] | null>(null);
  useEffect(() => {
    getRoomBookingsAction().then((res) => setBookings('roomBookings' in res ? res.roomBookings : []));
  }, []);

  if (bookings == null) {
    return <ProfileContentCard title={t.roomBookings}><Spinner/></ProfileContentCard>;
  }

  if (bookings.length === 0) {
    return (
      <ProfileContentCard title={t.roomBookings}>
        <p className="py-16 text-center text-[14px] text-[#A0A5AB]">{t.roomBookingsEmpty}</p>
      </ProfileContentCard>
    );
  }

  // 분류/정렬 기준은 대관 목록 페이지와 동일
  const now = bookingNowKey();
  const isPast = (b: RoomBookingDetailResponse) => b.status === 'Cancelled' || bookingDateKey(b.endDate) < now;
  const upcoming = bookings.filter((b) => !isPast(b)).sort((a, b) => bookingDateKey(a.startDate) - bookingDateKey(b.startDate));
  const past = bookings.filter(isPast).sort((a, b) => bookingDateKey(b.startDate) - bookingDateKey(a.startDate));

  return (
    <>
      {upcoming.length > 0 && (
        <ProfileContentCard title={t.roomBookingsUpcoming}>
          <div className="flex flex-col gap-2.5">
            {upcoming.map((b) => (
              <BookingCard key={b.id} b={b} practiceRoomLabel={t.practiceRoom} statusText={t.bookingStatus}/>
            ))}
          </div>
        </ProfileContentCard>
      )}
      {past.length > 0 && (
        <ProfileContentCard title={t.roomBookingsPast}>
          <div className="flex flex-col gap-2.5">
            {past.map((b) => (
              <BookingCard key={b.id} b={b} practiceRoomLabel={t.practiceRoom} statusText={t.bookingStatus}/>
            ))}
          </div>
        </ProfileContentCard>
      )}
    </>
  );
};

// ── 셸 ─────────────────────────────────────────────────────────────

export const ProfilePcClient = ({user, locale, t, initialTab = 'home', homeContent}: {
  user: GetMeResponse;
  locale: Locale;
  t: ProfilePcTranslations;
  initialTab?: ProfileTabKey;
  /** 홈 탭 컨텐츠 — 서버에서 렌더한 노드 (다음 예정 수업/보유 패스권/홀 예약 내역) */
  homeContent: React.ReactNode;
}) => {
  const [tab, setTab] = useState<ProfileTabKey>(initialTab);
  // 한 번 방문한 탭은 mounted 유지 → 데이터 캐시 (재클릭 시 refetch 없음)
  const [visited, setVisited] = useState<Set<ProfileTabKey>>(() => new Set([initialTab]));

  // 탭은 URL 동기화 없이 클라이언트 state로만 관리 (?tab= 쿼리는 진입 시 초기 탭 지정용으로만)
  const openTab = (key: ProfileTabKey) => {
    setTab(key);
    setVisited((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };

  // 탭이 바뀌면 스크롤은 맨 위에서 시작.
  // 패널 교체 직후 이미지/리스트 로드로 레이아웃이 늦게 움직이며 잔여 스크롤이 남을 수 있어
  // 즉시 + 다음 프레임 + 짧은 지연까지 여러 번 밀어 확실히 0으로 고정한다.
  useEffect(() => {
    const reset = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    reset();
    const raf = requestAnimationFrame(reset);
    const t1 = setTimeout(reset, 60);
    const t2 = setTimeout(reset, 200);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [tab]);

  const panel = (key: ProfileTabKey, node: React.ReactNode) =>
    visited.has(key) && (
      <div className={tab === key ? 'flex flex-col gap-4' : 'hidden'}>{node}</div>
    );

  const tabs: { key: ProfileTabKey; label: string; count?: number }[] = [
    { key: 'home', label: t.homeTab },
    { key: 'tickets', label: t.myTickets, count: user.ticketCount ?? 0 },
    { key: 'pass', label: t.myPass, count: user.passCount ?? 0 },
    { key: 'payments', label: t.paymentRecords, count: user.paymentRecordCount ?? 0 },
    { key: 'bookings', label: t.roomBookings, count: user.bookingCount ?? 0 },
  ];

  return (
    <div className="w-full min-h-screen bg-white pt-12 pb-24">
      <div className="mx-auto w-full max-w-[1040px] px-8">

        {/* ── 채널 헤더 — 유튜브 프로필 스타일: 큰 아바타 + 이름/핸들 + 액션 버튼 ── */}
        <div className="flex items-center gap-8">
          {has(user.profileImageUrl) ? (
            <div className="w-[140px] h-[140px] rounded-full overflow-hidden shrink-0">
              <Image
                src={user.profileImageUrl!}
                alt="profile"
                width={140}
                height={140}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-[140px] h-[140px] rounded-full bg-[#F1F3F6] shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-14 h-14">
                <circle cx="12" cy="8.5" r="3.5" stroke="#C4C9CF" strokeWidth="1.6"/>
                <path d="M5 20c.8-3.2 3.6-5 7-5s6.2 1.8 7 5" stroke="#C4C9CF" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>
          )}
          <div className="flex flex-col gap-1.5 min-w-0">
            <h1 className="text-[28px] font-bold text-black leading-tight truncate">
              {has(user.nickName) ? user.nickName : '-'}
              {has(user.name) && <span className="text-[16px] font-normal text-[#8A949E]"> ({user.name})</span>}
            </h1>
            <p className="text-[14px] text-[#8A949E] truncate">
              {has(user.email) ? user.email : has(user.phone) ? formatPhone(user.phone!) : ''}
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <NavigateClickWrapper method={'push'} route={KloudScreen.ProfileEdit}>
                <button className="h-9 px-4 rounded-full bg-[#f1f3f6] hover:bg-[#e6e8eb] text-[13px] font-semibold text-black flex items-center gap-1.5 transition-colors">
                  <EditIcon viewBox="0 0 24 24" className="w-4 h-4"/>
                  {t.editProfile}
                </button>
              </NavigateClickWrapper>
            </div>
          </div>
        </div>

        {/* ── 탭 바 — 활성 탭 밑줄 (유튜브 채널 탭 방식) ── */}
        <div className="mt-9 border-b border-[#f0f1f3]">
          <div className="flex gap-1">
            {tabs.map(({key, label, count}) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  onClick={() => openTab(key)}
                  className={`relative px-4 py-3 text-[15px] transition-colors ${
                    active ? 'text-black font-bold' : 'text-[#8A949E] font-medium hover:text-black'
                  }`}
                >
                  {label}
                  {count != null && count > 0 && (
                    <span className={`ml-1.5 text-[12px] font-paperlogy ${active ? 'text-[#6d7882]' : 'text-[#B0B8BF]'}`}>{count}</span>
                  )}
                  {active && <span className="absolute bottom-0 left-3 right-3 h-[3px] rounded-full bg-black"/>}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 탭 컨텐츠 ── */}
        <div className="py-8">
          {panel('home', homeContent)}
          {panel('tickets', <TicketsPanel locale={locale} t={t}/>)}
          {panel('pass', <PassPanel locale={locale} t={t}/>)}
          {panel('payments', <PaymentsPanel locale={locale} t={t}/>)}
          {panel('bookings', <BookingsPanel t={t}/>)}
        </div>
      </div>
    </div>
  );
};
