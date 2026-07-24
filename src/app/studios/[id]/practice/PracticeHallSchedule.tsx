'use client';

import React, { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import calendarStyles from "@/app/kiosk/CalendarStyles.module.css";
import { kloudNav } from "@/app/lib/kloudNav";
import { KloudScreen } from "@/shared/kloud.screen";
import { StudioRoomResponse, TimeSlotResponse } from "@/app/endpoint/studio.room.endpoint";
import { getRoomsAvailabilityByIdsAction, getStudioRoomSlotsAction } from "@/app/community/community.actions";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { PracticeAmenityIcon } from "@/app/studios/[id]/practice/PracticeAmenityIcon";

// 바닥재 코드 → 표시명
const FLOOR_LABEL: Record<string, Record<Locale, string>> = {
  Wood: { ko: '원목', en: 'Wood', jp: '木材', zh: '木地板' },
  Marley: { ko: '마루(마레)', en: 'Marley', jp: 'マーレー', zh: '玛丽地板' },
  Vinyl: { ko: '장판', en: 'Vinyl', jp: 'ビニール', zh: 'PVC地板' },
  Tile: { ko: '타일', en: 'Tile', jp: 'タイル', zh: '瓷砖' },
};

const LOCALE_TAG: Record<Locale, string> = { ko: 'ko-KR', en: 'en-US', jp: 'ja-JP', zh: 'zh-CN' };
const fmtMonthDayWeekday = (d: Date, locale: Locale) =>
  new Intl.DateTimeFormat(LOCALE_TAG[locale], { month: 'long', day: 'numeric', weekday: 'short' }).format(d);
const fmt = (n: number) => new Intl.NumberFormat('ko-KR').format(n);
const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// 예약은 1시간 간격 — 정시(:00) 슬롯만 노출/선택
const hourlyOnly = (slots: TimeSlotResponse[]) => slots.filter((s) => s.time.endsWith(':00'));

const nextHour = (time: string) => {
  const [h] = time.split(':').map(Number);
  return `${String((h + 1) % 24).padStart(2, '0')}:00`;
};

// availability 응답 → 슬롯. slots가 오면 그대로, 없으면 schedules(요일별 운영시간·가격) + bookings로 파생.
type AvailabilityBooking = { id?: number; startDate: string; endDate: string };
type AvailabilityRow = {
  slots?: TimeSlotResponse[];
  schedules?: { day?: number | null; startTime: string; status: string; price?: number | null }[];
  bookings?: AvailabilityBooking[];
  myBookings?: AvailabilityBooking[];   // 현재 사용자의 그날 예약
  maxCount?: number | null;
};
const deriveSlots = (row: AvailabilityRow, date: Date): TimeSlotResponse[] => {
  if (row.slots && row.slots.length > 0) return row.slots;

  const weekday = date.getDay(); // 0=일~6=토. schedules의 day와 매칭(Holiday=day null은 항상 적용)
  const cells = (row.schedules ?? []).filter((c) => c.day == null || c.day === weekday);

  // 그 날짜의 예약 시각(시 단위) → full 처리. 다른 예약(bookings) + 내 예약(myBookings) 모두.
  const ymd = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  const bookedHours = new Set<number>();
  for (const b of [...(row.bookings ?? []), ...(row.myBookings ?? [])]) {
    const [sd, st] = (b.startDate ?? '').split(' ');
    const [, et] = (b.endDate ?? '').split(' ');
    if (sd !== ymd) continue;
    const sh = Number((st ?? '').split(':')[0]);
    const eh = Number((et ?? '').split(':')[0]);
    for (let h = sh; h < eh; h++) bookedHours.add(h);
  }

  return cells
    .slice()
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map((c) => {
      const hour = Number(c.startTime.split(':')[0]);
      const active = /active/i.test(c.status);
      const booked = bookedHours.has(hour);
      return {
        time: c.startTime,
        status: !active ? 'closed' : booked ? 'full' : 'available',
        currentCount: booked ? 1 : 0,
        maxCount: row.maxCount ?? 1,
        price: c.price ?? null,
      } as TimeSlotResponse;
    });
};

// 시간당 가격을 연속된 동일 가격 구간으로 묶어 '가격 정책' 요약 생성 (가격 미정 슬롯은 제외)
type PriceBand = { start: string; end: string; price: number };
const priceBands = (slots: TimeSlotResponse[]): PriceBand[] => {
  const bands: PriceBand[] = [];
  for (const s of hourlyOnly(slots)) {
    if (s.price == null) continue;
    const last = bands[bands.length - 1];
    if (last && last.price === s.price && last.end === s.time) last.end = nextHour(s.time);
    else bands.push({ start: s.time, end: nextHour(s.time), price: s.price });
  }
  return bands;
};

// 홀 카드 탭 → 시간표 바텀시트(슬롯 선택 + 예약하기). 예약하기 누르면 시트 닫으며 결제 페이지 이동.
// navigateStudioId가 주어지면(홈 섹션 등) 카드 탭 시 시트 대신 스튜디오 상세(?studioRoomId=)로 이동 —
// 상세 페이지에서 딥링크로 해당 홀 시트가 자동으로 열린다.
// studioId가 주어지면(스튜디오 상세) 날짜 변경 시 GET /studios/:id/roomSlots로 예약 가능 시각을 갱신한다.
export function PracticeHallSchedule({ rooms: initialRooms, locale, navigateStudioId, studioId }: { rooms: StudioRoomResponse[]; locale: Locale; navigateStudioId?: number; studioId?: number }) {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });
  const router = useRouter();
  const pathname = usePathname();
  const [date, setDate] = useState<Date>(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; });
  // 카드 표시는 initialRooms(available 기반) 그대로. 시트 오픈 시 API 슬롯으로 갱신됨.
  const [rooms, setRooms] = useState<StudioRoomResponse[]>(initialRooms);

  // 시트 열림 상태를 URL ?studioRoomId= 로 동기화 (외부 딥링크로도 특정 홀 시트 접근 가능).
  // router.replace는 App Router에서 RSC 재요청(스튜디오 상세 재fetch)을 유발하므로,
  // URL만 바꾸는 history.replaceState 사용 — 시트 열/닫을 때마다 서버 재조회되지 않도록.
  const syncRoomIdToUrl = (roomId: number | null) => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (roomId == null) params.delete('studioRoomId');
    else params.set('studioRoomId', String(roomId));
    const qs = params.toString();
    const nextUrl = qs ? `${pathname}?${qs}` : pathname;
    if (window.location.pathname + window.location.search !== nextUrl) {
      window.history.replaceState(null, '', nextUrl);
    }
  };

  // 날짜 선택 캘린더 시트
  const [dateOpen, setDateOpen] = useState(false);
  const [dateClosing, setDateClosing] = useState(false);
  const closeDateSheet = (after?: () => void) => {
    if (dateClosing) return;
    setDateClosing(true);
    setTimeout(() => { setDateOpen(false); setDateClosing(false); after?.(); }, 200);
  };

  // 시간표 바텀시트 (홀 탭 시) — 드래그로 내려서 닫기 지원
  const [sheetRoomId, setSheetRoomId] = useState<number | null>(null);
  const [sel, setSel] = useState<{ start: number; end: number } | null>(null);
  const [priceOpen, setPriceOpen] = useState(false);   // 시간당 가격 안내 — 기본 접힘
  const [infoOpen, setInfoOpen] = useState(true);      // 홀 정보 — 기본 펼침
  const [dragY, setDragY] = useState(0);        // 드래그 중 아래로 이동한 거리(px)
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<number | null>(null);
  const closingRef = useRef(false);
  const sheetRoom = sheetRoomId != null ? rooms.find((r) => r.id === sheetRoomId) : undefined;

  // 실제 예약현황(슬롯)은 시트를 열었을 때만, 선택된 홀 하나만 studioRoomIds에 넣어 조회.
  // (카드 UI는 available만으로 표시 — API 호출은 시트 오픈부터). 홀+날짜 조합은 한 번만 조회.
  const loadedRef = useRef<Set<string>>(new Set());
  // 초기 진입 날짜(오늘). 이 날짜는 studios/:id 데이터(initialRooms)를 그대로 쓰고, 그 외엔 roomSlots로 교체.
  const initialDsRef = useRef<string>(toDateStr(date));
  useEffect(() => {
    if (sheetRoomId == null) return;                 // 시트가 열렸을 때만
    const ds = toDateStr(date);
    const key = `${sheetRoomId}-${ds}`;
    if (loadedRef.current.has(key)) return;          // 이 홀+날짜 이미 로드됨
    let alive = true;
    // 병행 조회: availability(시간대별 가격 + 내 예약) + roomSlots(그 날짜 예약 가능 정시).
    // roomSlots(availableHours)를 예약 가능 여부의 기준으로 삼되, 가격/내 예약은 availability에서 유지.
    const availabilityP = getRoomsAvailabilityByIdsAction({ studioRoomIds: String(sheetRoomId), date: ds });
    const slotsP = studioId != null ? getStudioRoomSlotsAction({ studioId, date: ds }) : Promise.resolve(null);
    Promise.all([availabilityP, slotsP])
      .then(([res, roomSlotsRes]) => {
        if (!alive || !('rooms' in res)) return;
        const row = res.rooms.find((r) => r.studioRoomId === sheetRoomId);
        if (!row) return;
        let slots = deriveSlots(row as AvailabilityRow, date);
        // roomSlots가 있으면 그 날짜 예약 가능 정시로 status를 덮어쓴다 (full=예약됨 표시는 유지).
        const hours = roomSlotsRes && typeof roomSlotsRes === 'object' && 'rooms' in roomSlotsRes
          ? roomSlotsRes.rooms.find((r) => r.id === sheetRoomId)?.availableHours
          : undefined;
        if (hours) {
          const hourSet = new Set(hours);
          slots = slots.map((s) => {
            const hour = Number(s.time.split(':')[0]);
            if (hourSet.has(hour)) return { ...s, status: 'available' as const };
            return { ...s, status: s.status === 'full' ? ('full' as const) : ('closed' as const) };
          });
        }
        const myBookings = ((row as AvailabilityRow).myBookings ?? []).map((b) => ({ id: b.id ?? 0, startDate: b.startDate, endDate: b.endDate }));
        setRooms((prev) => prev.map((r) => (r.id === sheetRoomId ? { ...r, slots, myBookings } : r)));
        loadedRef.current.add(key);
      });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetRoomId, date, studioId]);

  // 섹션 달력으로 날짜를 바꾸면 카드(미오픈 홀)의 예약가능 시각을 GET /studios/:id/roomSlots로 교체.
  // 초기 날짜(오늘)는 studios/:id에서 받은 initialRooms 슬롯을 그대로 사용(재조회 없음).
  // 열린 시트의 홀은 위 availability 효과가 상세 슬롯(가격/내 예약)으로 채우므로 여기서 건드리지 않는다.
  useEffect(() => {
    if (studioId == null) return; // 상세에서만 동작(홈은 카드 탭 시 상세로 이동)
    const ds = toDateStr(date);
    if (ds === initialDsRef.current) {
      // 오늘: studios/:id 데이터로 복원
      setRooms((prev) => prev.map((r) => {
        if (r.id === sheetRoomId) return r;
        const init = initialRooms.find((x) => x.id === r.id);
        return init ? { ...r, slots: init.slots } : r;
      }));
      return;
    }
    let alive = true;
    getStudioRoomSlotsAction({ studioId, date: ds }).then((res) => {
      if (!alive || !res || typeof res !== 'object' || !('rooms' in res)) return;
      const hoursById = new Map(res.rooms.map((r) => [r.id, new Set(r.availableHours ?? [])]));
      setRooms((prev) => prev.map((r) => {
        if (r.id === sheetRoomId) return r; // 열린 시트는 availability 효과가 처리
        const hourSet = hoursById.get(r.id) ?? new Set<number>();
        const slots = Array.from({ length: 24 }, (_, h): TimeSlotResponse => ({
          time: `${String(h).padStart(2, '0')}:00`,
          status: hourSet.has(h) ? 'available' : 'closed',
          currentCount: 0,
          maxCount: r.maxNumber ?? 0,
          price: r.unitPrice ?? null,
        }));
        return { ...r, slots };
      }));
    });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, studioId]);

  // entered=false → 화면 아래(offscreen), true → 제자리. transform+transition으로 open/close 애니메이션.
  const [entered, setEntered] = useState(false);
  const openSheet = (roomId: number) => { setSel(null); setDragY(0); closingRef.current = false; setSheetRoomId(roomId); syncRoomIdToUrl(roomId); };

  // 카드 탭 동작. 홈 섹션(navigateStudioId)에서는 시트 대신 스튜디오 상세로 이동, 상세에서 시트 자동 오픈.
  const onRoomCardClick = (roomId: number) => {
    if (navigateStudioId == null) { openSheet(roomId); return; }
    const route = `${KloudScreen.StudioDetail(navigateStudioId)}?studioRoomId=${roomId}`;
    if (typeof window !== 'undefined' && (window as { KloudEvent?: unknown }).KloudEvent) kloudNav.push(route);
    else router.push(route);
  };
  const closeSheet = (after?: () => void) => {
    if (closingRef.current) return;
    closingRef.current = true;
    setDragging(false);
    dragStart.current = null;
    setEntered(false); // → 아래로 슬라이드 다운
    syncRoomIdToUrl(null);
    setTimeout(() => { setSheetRoomId(null); setSel(null); setDragY(0); closingRef.current = false; after?.(); }, 300);
  };

  // 최초 진입 시 URL에 ?studioRoomId= 가 있으면 해당 홀 시트를 자동으로 연다 (딥링크)
  const didDeepLink = useRef(false);
  useEffect(() => {
    if (didDeepLink.current || typeof window === 'undefined') return;
    didDeepLink.current = true;
    const q = new URLSearchParams(window.location.search).get('studioRoomId');
    if (!q) return;
    const rid = Number(q);
    if (!Number.isNaN(rid) && rooms.some((r) => r.id === rid)) openSheet(rid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms]);

  // 시트 마운트 후 다음 프레임에 entered=true → 아래에서 위로 슬라이드 업
  useEffect(() => {
    if (sheetRoomId == null) return;
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [sheetRoomId]);

  // 드래그 핸들러 (핸들/헤더 영역) — 항상 시트 드래그. 터치 시 진행 중 애니메이션 멈추고 현재 위치에서 잡음.
  const onSheetDragStart = (e: React.TouchEvent) => { grabAtCurrent(e.touches[0].clientY); };
  const onSheetDragMove = (e: React.TouchEvent) => {
    if (dragStart.current == null) return;
    const dy = e.touches[0].clientY - dragStart.current;
    setDragY(dy > 0 ? dy : 0);
  };
  const onSheetDragEnd = () => {
    if (dragStart.current == null) return;
    dragStart.current = null;
    setDragging(false);
    if (dragY > 120) closeSheet();  // 충분히 내리면 닫기
    else setDragY(0);               // 아니면 원위치로 스냅백
  };

  // 시트의 현재 화면상 translateY(px) — 진행 중인 transition 중간값도 읽는다.
  const sheetRef = useRef<HTMLDivElement>(null);
  const currentTranslateY = () => {
    const el = sheetRef.current;
    if (!el) return 0;
    const tr = getComputedStyle(el).transform;
    if (!tr || tr === 'none') return 0;
    try { return new DOMMatrixReadOnly(tr).m42; } catch { return 0; }
  };
  // 터치 시작 시 진행 중인 애니메이션을 즉시 멈추고 현재 위치에서 잡는다. (재터치 시 스냅백/스크롤이 안 멈추던 문제)
  const grabAtCurrent = (clientY: number) => {
    const y = Math.max(0, currentTranslateY());
    setDragging(true);   // transition off → 현재 위치에 고정
    setDragY(y);
    dragStart.current = clientY - y;   // 이후 dy = clientY - dragStart = 절대 translateY
  };

  // 본문(스크롤 영역) 드래그 — 리스트가 맨 위(scrollTop<=0)일 때만 아래로 끌면 시트 드래그로 소비, 그 외엔 스크롤.
  const scrollRef = useRef<HTMLDivElement>(null);
  const onBodyDragStart = (e: React.TouchEvent) => { grabAtCurrent(e.touches[0].clientY); };
  const onBodyDragMove = (e: React.TouchEvent) => {
    if (dragStart.current == null) return;
    const dy = e.touches[0].clientY - dragStart.current;
    const atTop = (scrollRef.current?.scrollTop ?? 0) <= 0;
    if (dy > 0 && atTop) {
      setDragY(dy);
    } else if (dragY !== 0) {
      setDragY(0);
    }
  };

  // 날짜 바뀌면 선택 초기화 (슬롯 인덱스가 달라짐)
  useEffect(() => { setSel(null); }, [date]);

  // 바텀시트(시간표/캘린더) 열려 있으면 배경 스크롤 잠금 — dim 영역 스크롤 방지
  useEffect(() => {
    if (sheetRoomId == null && !dateOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [sheetRoomId, dateOpen]);

  // 정시 슬롯 시작시각 → 종료시각(1시간 뒤, 24시는 00:00으로 → 자정 넘김)
  const calcEndTime = (time: string) => {
    const [h] = time.split(':').map(Number);
    return `${String((h + 1) % 24).padStart(2, '0')}:00`;
  };

  // 결제 페이지에 startTime/endTime을 'YYYY-MM-DDTHH:mm'(KST, 자정 넘기면 +1일)로 전달.
  // 서버가 이 구간으로 최종금액 계산 (GET /payment는 startTime/endTime 쿼리 필수)
  const goPay = (roomId: number, startHHmm: string, endHHmm: string) => {
    const startDateStr = toDateStr(date);
    const crossesMidnight = endHHmm <= startHHmm; // 예: 23:00~00:00
    const endD = new Date(date);
    if (crossesMidnight) endD.setDate(endD.getDate() + 1);
    const startTime = `${startDateStr}T${startHHmm}`;
    const endTime = `${toDateStr(endD)}T${endHHmm}`;
    const route = KloudScreen.PracticeRoomPayment(roomId, startTime, endTime);
    // 네이티브는 KloudEvent push, 웹은 Next 라우터로 이동(window.location 경합 방지).
    if (typeof window !== 'undefined' && (window as { KloudEvent?: unknown }).KloudEvent) kloudNav.push(route);
    else router.push(route);
  };

  // 예약 가능: 서버 status만 신뢰 (price는 표시용, null이어도 예약 가능 여부와 무관)
  const isOpen = (s: TimeSlotResponse) => s.status === 'available';

  // 선택 날짜가 오늘이면 현재 시각 이전(시작 시각이 지금보다 과거)인 슬롯은 예약 불가.
  // 과거 날짜면 전부 지남, 미래 날짜면 전부 유효.
  const isPastSlot = (time: string) => {
    const now = new Date();
    const sel = new Date(date); sel.setHours(0, 0, 0, 0);
    const today0 = new Date(now); today0.setHours(0, 0, 0, 0);
    if (sel.getTime() !== today0.getTime()) return sel.getTime() < today0.getTime();
    const [h, m] = time.split(':').map(Number);
    const start = new Date(sel); start.setHours(h, m ?? 0, 0, 0);
    return start.getTime() < now.getTime();
  };

  // 실제 예약 가능(선택 가능): status available + 지나지 않은 시각
  const isBookable = (s: TimeSlotResponse) => isOpen(s) && !isPastSlot(s.time);

  // 연속 슬롯 선택(인접만 확장)
  // 최대 예약 시간(시간 단위) → 연속 선택 칸수 상한 (1칸=1시간). 미설정이면 무제한
  const maxSlots = sheetRoom?.maxBookingDuration ? sheetRoom.maxBookingDuration : Infinity;

  const onSlot = (idx: number, slots: TimeSlotResponse[]) => {
    if (!isBookable(slots[idx])) return;
    setSel((prev) => {
      if (!prev) return { start: idx, end: idx };
      const { start, end } = prev;
      if (idx >= start && idx <= end) {
        if (idx === start && idx === end) return null;
        if (idx === end) return { start, end: end - 1 };
        if (idx === start) return { start: start + 1, end };
        return { start: idx, end: idx };
      }
      const curLen = end - start + 1;
      if (idx === start - 1) return curLen + 1 > maxSlots ? prev : { start: idx, end };  // 앞으로 연장(최대 캡)
      if (idx === end + 1) return curLen + 1 > maxSlots ? prev : { start, end: idx };    // 뒤로 연장(최대 캡)
      return { start: idx, end: idx };
    });
  };

  return (
    <div>
      {/* 섹션 날짜 선택 — 상세에서만. 날짜를 바꾸면 카드 예약가능 시각을 roomSlots로 교체 */}
      {studioId != null && (
        <button
          onClick={() => setDateOpen(true)}
          className="mb-3 inline-flex items-center gap-1.5 h-9 pl-3 pr-2.5 rounded-full bg-[#F1F3F6] active:bg-[#E7EAEE] transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke="#4E5968" strokeWidth="1.6" />
            <path d="M3.5 9h17M8 3.5v3M16 3.5v3" stroke="#4E5968" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span className="text-[14px] font-bold text-[#171717]">{fmtMonthDayWeekday(date, locale)}</span>
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <path d="M6 9l6 6 6-6" stroke="#4E5968" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {/* 홀별 카드 — 탭하면 시간표 바텀시트(시트 안에서도 날짜 변경 가능) */}
      <div className="flex flex-col gap-4">
        {rooms.map((room) => {
          const slots = hourlyOnly(room.slots ?? []);
          const fullyBooked = slots.length > 0 && slots.every((s) => !isBookable(s));
          const tickTimes = slots.length > 0
            ? [...new Set([0, Math.floor(slots.length * 0.25), Math.floor(slots.length * 0.5), Math.floor(slots.length * 0.75), slots.length - 1])]
                .map((i) => t('community_hour').replace('{h}', String(parseInt(slots[i].time, 10))))
            : [];
          return (
            <button
              key={room.id}
              onClick={() => onRoomCardClick(room.id)}
              className="w-full text-left rounded-2xl border border-[#EEF0F2] p-4 active:bg-[#FAFBFC] transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[17px] font-bold text-[#171717]">{room.name}</p>
                  {room.minBookingDuration ? (
                    <p className="mt-1 text-[13px] text-[#86898C]">
                      {t('community_min_unit').replace('{min}', String(room.minBookingDuration))}
                    </p>
                  ) : null}
                  <p className={`mt-1 text-[13px] font-bold ${fullyBooked ? 'text-[#C4C9CF]' : 'text-[#171717]'}`}>
                    {fullyBooked ? t('community_reservation_closed') : t('community_available')}
                  </p>
                </div>
                {room.imageUrls?.[0] && (
                  <div className="w-[92px] h-[92px] rounded-2xl overflow-hidden bg-[#F1F3F6] shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={room.imageUrls[0]} alt={room.name} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* 얇은 시간 바 (요약) + 시간대 눈금 */}
              {slots.length > 0 && (
                <div className="mt-3 flex gap-[2px] items-center">
                  {slots.map((s) => (
                    <span key={s.time} className={`flex-1 h-[3px] rounded-full ${isBookable(s) ? 'bg-[#3CC0AF]' : 'bg-[#E4E8EC]'}`} />
                  ))}
                </div>
              )}
              {tickTimes.length > 0 && (
                <div className="mt-1.5 flex justify-between text-[10px] text-[#A0A5AB]">
                  {tickTimes.map((tt, i) => <span key={i}>{tt}</span>)}
                </div>
              )}
            </button>
          );
        })}
        {rooms.length === 0 && (
          <p className="py-10 text-center text-[14px] text-[#A0A5AB]">{t('community_no_rooms')}</p>
        )}
      </div>

      {/* 시간표 바텀시트 — 핸들/헤더를 아래로 끌면 닫힘 */}
      {sheetRoom && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div
            className="absolute inset-0 bg-black/50 touch-none"
            style={{ opacity: entered ? 1 : 0, transition: 'opacity 300ms ease' }}
            onClick={() => closeSheet()}
          />
          <div
            ref={sheetRef}
            className="relative w-full bg-white rounded-t-3xl flex flex-col max-h-[85vh]"
            style={{
              transform: `translateY(${entered ? dragY : (typeof window !== 'undefined' ? window.innerHeight : 1000)}px)`,
              transition: dragging ? 'none' : 'transform 300ms cubic-bezier(0.32,0.72,0,1)',
            }}
          >
            {/* 드래그 핸들 + 헤더 (이 영역을 아래로 끌면 닫힘) */}
            <div className="shrink-0 touch-none" onTouchStart={onSheetDragStart} onTouchMove={onSheetDragMove} onTouchEnd={onSheetDragEnd}>
              <div className="w-10 h-1 rounded-full bg-[#E6E8EA] mx-auto mt-3 mb-2" />

              {/* 헤더: 홀 이름 + 닫기(X) + 날짜 칩 */}
              <div className="px-5 pt-1 pb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  {sheetRoom.imageUrls?.[0] && (
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#F1F3F6] shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={sheetRoom.imageUrls[0]} alt={sheetRoom.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[18px] font-bold text-[#171717] truncate">{sheetRoom.name}</p>
                    {sheetRoom.maxBookingDuration ? (
                      <p className="text-[12px] text-[#86898C]">{t('kiosk_max_hours').replace('{count}', String(sheetRoom.maxBookingDuration))}</p>
                    ) : null}
                  </div>
                </div>
                <button
                  onClick={() => closeSheet()}
                  aria-label="close"
                  className="-mr-1 flex h-8 w-8 items-center justify-center rounded-full active:bg-[#F1F3F6] transition-colors shrink-0"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                    <path d="M6 6l12 12M18 6L6 18" stroke="#8A949E" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => setDateOpen(true)}
                className="mt-2 inline-flex items-center gap-1 h-8 pl-3 pr-2 rounded-full bg-[#F1F3F6] active:bg-[#E7EAEE] transition-colors"
              >
                <span className="text-[13px] font-bold text-[#171717]">{fmtMonthDayWeekday(date, locale)}</span>
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                  <path d="M6 9l6 6 6-6" stroke="#4E5968" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              </div>
            </div>

            {/* 시트 본문 전체 스크롤 (홀 정보 + 가격 안내 + 슬롯 목록이 함께 스크롤).
                맨 위에서 아래로 끌면 스크롤 대신 시트를 내려 닫는다. */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto overscroll-contain"
              onTouchStart={onBodyDragStart}
              onTouchMove={onBodyDragMove}
              onTouchEnd={onSheetDragEnd}
            >

            {/* 내 예약 — 그날 내가 이미 예약한 시간대 (myBookings) */}
            {(sheetRoom.myBookings?.length ?? 0) > 0 && (
              <div className="px-5 pb-3 shrink-0">
                <p className="text-[12px] font-bold text-[#4E5968] mb-1.5">{t('my_bookings')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {sheetRoom.myBookings!.map((b) => (
                    <span key={b.id} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#EAF7F4] text-[#1E9E8A] text-[12px] font-bold">
                      {(b.startDate.split(' ')[1] ?? b.startDate)} ~ {(b.endDate.split(' ')[1] ?? b.endDate)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 홀 정보 — 설명·면적·치수·바닥·시설 (접힘/펼침) */}
            {(() => {
              const enabledAmenities = (sheetRoom.amenities ?? []).filter((a) => a.enabled);
              const dim = sheetRoom.dimensions;
              const dimStr = dim && (dim.width || dim.depth || dim.height)
                ? `${dim.width ?? '-'} x ${dim.depth ?? '-'} x ${dim.height ?? '-'} m` : null;
              const floorStr = sheetRoom.floorType
                ? (FLOOR_LABEL[sheetRoom.floorType]?.[locale] ?? sheetRoom.floorType) : null;
              const specs: { label: string; value: string }[] = [];
              if (sheetRoom.maxNumber > 0) specs.push({ label: t('max_capacity'), value: t('community_max_people').replace('{count}', String(sheetRoom.maxNumber)) });
              if (sheetRoom.areaSize) specs.push({ label: t('community_area'), value: `${sheetRoom.areaSize}㎡` });
              if (dimStr) specs.push({ label: t('community_dimensions'), value: dimStr });
              if (floorStr) specs.push({ label: t('community_floor'), value: floorStr });
              const hasDesc = !!sheetRoom.description && sheetRoom.description.replace(/<[^>]*>/g, '').trim() !== '';
              if (!hasDesc && specs.length === 0 && enabledAmenities.length === 0) return null;
              return (
                <div className="px-5 pb-3 shrink-0">
                  <div className="rounded-xl bg-[#F7F8F9] px-4 py-3">
                    <button onClick={() => setInfoOpen((v) => !v)} className="w-full flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                          <circle cx="12" cy="12" r="9" stroke="#3CC0AF" strokeWidth="1.6" />
                          <path d="M12 11v5M12 8h.01" stroke="#3CC0AF" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        <span className="text-[13px] font-bold text-[#171717]">{t('community_room_info')}</span>
                      </span>
                      <svg viewBox="0 0 24 24" fill="none" className={`w-4 h-4 transition-transform ${infoOpen ? 'rotate-180' : ''}`}>
                        <path d="M6 9l6 6 6-6" stroke="#8A949E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    {infoOpen && (
                      <div className="mt-3 flex flex-col gap-3">
                        {hasDesc && (
                          <div
                            className="text-[13px] text-[#4E5968] leading-relaxed whitespace-pre-line break-words [&_h1]:text-[15px] [&_h1]:font-bold [&_h1]:text-[#171717] [&_h1]:my-1 [&_h2]:text-[14px] [&_h2]:font-bold [&_h2]:text-[#171717] [&_h2]:my-1 [&_p]:my-0.5"
                            dangerouslySetInnerHTML={{ __html: sheetRoom.description! }}
                          />
                        )}
                        {specs.length > 0 && (
                          <div className="flex flex-col gap-1.5">
                            {specs.map((s) => (
                              <div key={s.label} className="flex items-center justify-between">
                                <span className="text-[12px] text-[#86898C]">{s.label}</span>
                                <span className="text-[13px] font-medium text-[#171717]">{s.value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {enabledAmenities.length > 0 && (
                          <div>
                            <p className="text-[12px] text-[#86898C] mb-1.5">{t('community_room_facility')}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {enabledAmenities.map((a) => (
                                <span key={a.amenity} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#EEF0F2] text-[12px] font-medium text-[#333]">
                                  <PracticeAmenityIcon name={a.label} className="w-3.5 h-3.5 shrink-0" />
                                  {a.label}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* 시간당 가격 안내 — 시간대별 가격 정책 요약 (접힘/펼침) */}
            {(() => {
              const bands = priceBands(sheetRoom.slots ?? []);
              if (bands.length === 0) return null;
              const prices = bands.map((b) => b.price);
              const min = Math.min(...prices);
              const max = Math.max(...prices);
              const hint = min === max ? `${fmt(min)}${t('won')}` : `${fmt(min)}~${fmt(max)}${t('won')}`;
              return (
                <div className="px-5 pb-3 shrink-0">
                  <div className="rounded-xl bg-[#F7F8F9] px-4 py-3">
                    <button onClick={() => setPriceOpen((v) => !v)} className="w-full flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                          <path d="M3 8.5V6a1 1 0 011-1h5.2a1 1 0 01.7.3l9 9a1 1 0 010 1.4l-4.5 4.5a1 1 0 01-1.4 0l-9-9a1 1 0 01-.3-.7V8.5z" stroke="#3CC0AF" strokeWidth="1.6" strokeLinejoin="round" />
                          <circle cx="7" cy="9" r="1.2" fill="#3CC0AF" />
                        </svg>
                        <span className="text-[13px] font-bold text-[#171717]">{t('community_price_guide')}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        {!priceOpen && <span className="text-[13px] font-bold text-[#4E5968]">{hint}</span>}
                        <svg viewBox="0 0 24 24" fill="none" className={`w-4 h-4 transition-transform ${priceOpen ? 'rotate-180' : ''}`}>
                          <path d="M6 9l6 6 6-6" stroke="#8A949E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </button>
                    {priceOpen && (
                      <div className="mt-2.5">
                        {bands.length === 1 ? (
                          <p className="text-[13px] text-[#4E5968]">
                            {t('community_price_per_hour').replace('{price}', `${fmt(bands[0].price)}${t('won')}`)}
                          </p>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            {bands.map((b) => (
                              <div key={b.start} className="flex items-center justify-between">
                                <span className="text-[13px] text-[#4E5968]">{b.start} ~ {b.end}</span>
                                <span className="text-[13px] font-bold text-[#171717]">{fmt(b.price)}{t('won')}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* 슬롯 리스트 (1시간 간격) */}
            <div className="px-5 pb-3">
              {hourlyOnly(sheetRoom.slots ?? []).length === 0 ? (
                <p className="py-10 text-center text-[13px] text-[#A0A5AB]">{t('community_no_slots')}</p>
              ) : (
                <div className="flex flex-col divide-y divide-[#F5F6F7]">
                  {hourlyOnly(sheetRoom.slots ?? []).map((s, idx, arr) => {
                    const past = isPastSlot(s.time);
                    const bookable = isOpen(s) && !past;
                    const selected = sel != null && idx >= sel.start && idx <= sel.end;
                    return (
                      <button
                        key={s.time}
                        disabled={!bookable}
                        onClick={() => onSlot(idx, arr)}
                        className={`flex items-center justify-between py-3 px-3 rounded-lg transition-colors disabled:cursor-not-allowed ${selected ? 'bg-[#EAF7F4]' : bookable ? 'active:bg-[#FAFBFC]' : ''}`}
                      >
                        <span className={`text-[15px] font-medium ${!bookable ? 'text-[#C4C9CF]' : selected ? 'text-[#1E9E8A]' : 'text-[#171717]'}`}>
                          {s.time}
                          {bookable && s.price != null ? <span className="ml-2 text-[12px] font-normal text-[#86898C]">{fmt(s.price)}{t('won')}</span> : null}
                        </span>
                        <span className={`text-[13px] font-bold ${!bookable ? 'text-[#C4C9CF]' : selected ? 'text-[#1E9E8A]' : 'text-[#3CC0AF]'}`}>
                          {past ? t('slot_past') : !isOpen(s) ? t('closed') : selected ? t('community_selected') : t('community_available')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            </div>{/* /본문 스크롤 컨테이너 */}

            {/* 하단 예약하기 — 누르면 시트 닫으며 결제 이동 */}
            <div className="px-5 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] shrink-0 border-t border-[#F1F3F6]">
              <button
                type="button"
                disabled={!sel}
                onClick={() => {
                  if (!sel) return;
                  const arr = hourlyOnly(sheetRoom.slots ?? []);
                  const startTime = arr[sel.start].time;
                  const endTime = calcEndTime(arr[sel.end].time);
                  // 결제 페이지로 바로 이동. closeSheet의 URL 동기화(router.replace)와 경합 방지 위해 애니메이션 닫기 없이 이동.
                  goPay(sheetRoom.id, startTime, endTime);
                }}
                className={`w-full h-14 rounded-2xl flex items-center justify-center transition-transform ${sel ? 'bg-[#171717] active:scale-[0.98]' : 'bg-[#E4E8EC]'}`}
              >
                <span className={`text-[16px] font-bold ${sel ? 'text-white' : 'text-[#A0A5AB]'}`}>
                  {sel ? t('community_reserve_hours').replace('{count}', String(sel.end - sel.start + 1)) : t('reserve')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 날짜 선택 캘린더 시트 (시간표 시트 위에 뜨도록 z 상위) */}
      {dateOpen && (
        <div className={`fixed inset-0 z-[60] flex items-end ${dateClosing ? 'animate-[fadeOut_200ms_ease-in_forwards]' : 'animate-[fadeIn_180ms_ease-out]'}`}>
          <div className="absolute inset-0 bg-black/50 touch-none" onClick={() => closeDateSheet()} />
          <div className={`relative w-full bg-white rounded-t-3xl px-5 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] ${dateClosing ? 'animate-[slideDown_220ms_ease-in_forwards]' : 'animate-[slideUp_220ms_ease-out]'}`}>
            <div className="w-10 h-1 rounded-full bg-[#E6E8EA] mx-auto mb-3" />
            <div className="flex items-center justify-between mb-3">
              <p className="text-[17px] font-bold text-[#171717]">{t('community_select_date')}</p>
              <button
                onClick={() => closeDateSheet()}
                aria-label="close"
                className="-mr-1 flex h-8 w-8 items-center justify-center rounded-full active:bg-[#F1F3F6] transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path d="M6 6l12 12M18 6L6 18" stroke="#8A949E" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className={calendarStyles.calendarWrapper}>
              <Calendar
                onChange={(v) => {
                  const d = Array.isArray(v) ? v[0] : v;
                  if (d instanceof Date) {
                    d.setHours(0, 0, 0, 0);
                    loadedRef.current.clear(); // 날짜 바뀌면 시트 상세 슬롯 캐시 무효화 → 재조회
                    setDate(d);
                    closeDateSheet();
                  }
                }}
                value={date}
                formatDay={(_locale, d) => String(d.getDate())}
                locale={LOCALE_TAG[locale]}
                calendarType="gregory"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
