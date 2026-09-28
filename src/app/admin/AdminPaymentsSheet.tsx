'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { CalendarDays, ChevronRight, X } from 'lucide-react';
import { GetPaymentRecordResponse } from '@/app/endpoint/payment.record.endpoint';
import { Locale } from '@/shared/StringResource';
import { getLocaleString } from '@/app/components/locale';
import { getPaymentRecordsAction } from '@/app/paymentRecords/get.payment.records.action';
import { PaymentMethodIcon } from '@/app/components/PaymentMethodIcon';
import { Squircle } from '@/app/components/Squircle';
import { paymentIssueBadge } from '@/app/admin/payment.status';
import { kloudNav } from '@/app/lib/kloudNav';
import { KloudScreen } from '@/shared/kloud.screen';

// 관리자 결제 내역 — 파트너 토큰의 GET /paymentRecords(스튜디오 결제).
// 행을 탭하면 관리자 결제 상세(/admin/payments/:paymentId)로 이동한다. 취소 등 개별 처리는 상세에서.

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * createdAt은 KST 벽시계 문자열('2026.09.22 17:59')이다.
 * new Date()로 파싱하면 기기/서버 타임존에 따라 날짜가 밀릴 수 있어 문자열에서 직접 뽑는다.
 */
const dateKeyOf = (createdAt?: string): string => {
  const m = createdAt?.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
  return m ? `${m[1]}-${pad(Number(m[2]))}-${pad(Number(m[3]))}` : '';
};

/** 행에는 시간만 — 날짜는 그룹 구분선이 들고 있다. '오후 5:52' 형식 */
const formatTime = (createdAt?: string): string => {
  const m = createdAt?.match(/(\d{1,2}):(\d{2})/);
  if (!m) return '';
  // 이미 12시간제(오전/오후)로 내려오는 경우가 있어 그대로 살린다 — 24시간제로 오해해 변환하면 시각이 틀어진다
  const given = createdAt?.includes('오전') ? '오전' : createdAt?.includes('오후') ? '오후' : undefined;
  const h24 = Number(m[1]);
  if (given) return `${given} ${h24}:${m[2]}`;
  const meridiem = h24 < 12 ? '오전' : '오후';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${meridiem} ${h12}:${m[2]}`;
};

/** UTC+9로 옮겨 getUTC*로 읽으면 기기 타임존과 무관하게 KST 날짜가 된다 */
const kstKey = (offsetDays = 0): string => {
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + offsetDays));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
};

/**
 * <input type="date"> 값을 'yyyy-MM-dd'로 정규화.
 * 삼성 WebView(키오스크 SM-X230 등)는 스펙과 달리 '2026.06.23'처럼 로케일 구분자로 내려줘
 * 서버 검증(^\d{4}-\d{2}-\d{2}$)에 400이 났다. valueAsDate가 있으면 그걸 우선 쓰고, 없으면 문자열에서 뽑는다.
 */
const normalizeDateInput = (el: HTMLInputElement): string => {
  const v = el.valueAsDate;
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    // valueAsDate는 UTC 자정 기준 — getUTC*로 읽어야 날짜가 안 밀린다
    return `${v.getUTCFullYear()}-${pad(v.getUTCMonth() + 1)}-${pad(v.getUTCDate())}`;
  }
  const m = el.value.match(/(\d{4})[.\-/]\s*(\d{1,2})[.\-/]\s*(\d{1,2})/);
  return m ? `${m[1]}-${pad(Number(m[2]))}-${pad(Number(m[3]))}` : '';
};

/** 카톡 날짜 구분선 문구 — 오늘/어제는 말로, 그 외는 'M월 D일 (요일)' */
const dateLabelOf = (key: string): string => {
  if (key === kstKey(0)) return '오늘';
  if (key === kstKey(-1)) return '어제';
  const [y, m, d] = key.split('-').map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${m}월 ${d}일 (${weekday})`;
};

/**
 * @param inline 페이지 본문에 그대로 박아 쓸 때 true — 자체 스크롤 컨테이너를 쓰지 않고
 *               페이지 스크롤에 맡긴다(관리자 '매출' 탭). 기본값은 바텀시트용 레이아웃.
 */
export function AdminPaymentsSheetContent({ locale, inline = false, title }: {
  locale: Locale;
  inline?: boolean;
  /** 주면 제목 + 날짜 필터 줄을 컴포넌트가 직접 그린다 */
  title?: string;
}) {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });

  const [records, setRecords] = useState<GetPaymentRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  /** 특정 일자만 보기 — GET /paymentRecords?date=yyyy-MM-dd. 빈 문자열이면 전체 */
  const [date, setDate] = useState('');

  // 첫 로드 + 날짜 필터가 바뀔 때마다 1페이지부터 다시
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setPage(1);
    (async () => {
      try {
        const res = await getPaymentRecordsAction({ page: 1, date: date || undefined });
        if (!alive) return;
        const list = 'paymentRecords' in res ? res.paymentRecords : [];
        setRecords(list);
        setHasMore(list.length > 0);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [date]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await getPaymentRecordsAction({ page: page + 1, date: date || undefined });
      const next = 'paymentRecords' in res ? res.paymentRecords : [];
      if (next.length === 0) { setHasMore(false); return; }
      setRecords((prev) => [...prev, ...next]);
      setPage((p) => p + 1);
    } finally {
      setLoadingMore(false);
    }
  };

  // 관리자 전용 결제 상세 — 수강생용 화면이 아니라 학원 관점(결제자·수단·상태 + 관리자 취소)
  const openDetail = (paymentId: string) => kloudNav.push(KloudScreen.AdminPaymentDetail(paymentId));

  // 제목 줄 + 날짜 필터 — 달력 아이콘은 네이티브 날짜 선택기를 띄우는 투명 input을 덮어씌운다
  const header = title ? (
    <div className={'px-5 pb-1 flex items-center justify-between gap-2'}>
      <h2 className={'text-[15px] font-bold text-[#191F28]'}>{title}</h2>
      <div className={'flex items-center gap-1.5 shrink-0'}>
        {date && (
          <button
            type={'button'}
            onClick={() => setDate('')}
            className={'inline-flex items-center gap-1 rounded-full bg-[#191F28] pl-2.5 pr-1.5 py-1 text-[11.5px] font-bold text-white font-paperlogy active:opacity-80 transition-opacity'}
          >
            {dateLabelOf(date)}
            <X size={13} strokeWidth={2.2}/>
          </button>
        )}
        <label
          className={'relative w-9 h-9 rounded-full flex items-center justify-center text-[#4E5968] active:bg-[#F2F4F6] transition-colors cursor-pointer'}
          aria-label={'날짜 선택'}
        >
          <CalendarDays size={19} strokeWidth={1.8}/>
          <input
            type={'date'}
            value={date}
            onChange={(e) => setDate(normalizeDateInput(e.target))}
            className={'absolute inset-0 w-full h-full opacity-0 cursor-pointer'}
          />
        </label>
      </div>
    </div>
  ) : null;

  if (loading) {
    return (
      <>
        {header}
        <div className={'py-14 flex items-center justify-center'}>
          <div className={'w-8 h-8 border-[3px] border-gray-200 border-t-black rounded-full animate-spin'}/>
        </div>
      </>
    );
  }

  if (records.length === 0) {
    return (
      <>
        {header}
        <p className={'px-6 py-12 text-center text-[14px] text-[#8B95A1]'}>
          {date ? '이 날짜에는 결제 내역이 없어요' : t('admin_payments_empty')}
        </p>
      </>
    );
  }

  return (
    <>
    {header}
    <div className={inline ? 'px-5' : 'flex-1 min-h-0 overflow-y-auto px-5'}>
      <ul className={'flex flex-col'}>
        {records.map((r, i) => {
          const issue = paymentIssueBadge(r.status);
          const key = dateKeyOf(r.createdAt);
          // 날짜가 바뀌는 첫 건 위에 구분선을 깐다 (같은 날짜끼리는 행 사이 얇은 선만)
          const isFirstOfDay = key !== '' && key !== dateKeyOf(records[i - 1]?.createdAt);
          return (
            <React.Fragment key={r.paymentId}>
              {isFirstOfDay && (
                <li className={'flex justify-center py-3'}>
                  <span className={'rounded-full bg-[#191F28] px-2.5 py-1 text-[11.5px] font-bold text-white font-paperlogy'}>
                    {dateLabelOf(key)}
                  </span>
                </li>
              )}
              <li className={isFirstOfDay ? '' : 'border-t border-[#F1F3F6]'}>
              <button
                type={'button'}
                onClick={() => openDetail(r.paymentId)}
                className={'w-full flex items-center gap-3 py-3 text-left active:bg-[#FAFBFC] transition-colors'}
              >
                <Squircle size={44} className={'bg-[#F1F3F6]'}>
                  {r.productImageUrl && (
                    <Image src={r.productImageUrl} alt={''} fill sizes={'44px'} className={'object-cover'}/>
                  )}
                </Squircle>
                <div className={'flex-1 min-w-0'}>
                  <p className={'text-[14px] font-semibold text-black truncate'}>{r.productName}</p>
                  {/* 결제자·결제수단·시간은 잘리지 않게 줄바꿈시킨다 (truncate하면 수단이 먼저 잘려나갔다) */}
                  <div className={'mt-0.5 flex items-start gap-1 min-w-0 text-[12px] text-[#8B95A1]'}>
                    {/* 카드사·간편결제 로고 (농협카드/카카오페이 등) — 없으면 결제 방식별 플랫 아이콘 */}
                    {r.paymentMethodLabel && (
                      <span className={'shrink-0 mt-[1px]'}>
                        <PaymentMethodIcon methodType={r.methodType} label={r.paymentMethodLabel} size={20}/>
                      </span>
                    )}
                    <span className={'flex-1 min-w-0 leading-snug break-words'}>
                      {/* 결제수단(계좌이체·키오스크·카드…)이 먼저 읽히게 진한 글씨로 앞에 둔다 */}
                      {r.paymentMethodLabel && (
                        <span className={'font-semibold text-[#4E5968]'}>{r.paymentMethodLabel}</span>
                      )}
                      {[r.depositor, formatTime(r.createdAt)].filter(Boolean).map((v) => (
                        <span key={v}>{' · '}{v}</span>
                      ))}
                    </span>
                  </div>
                </div>
                {/* 금액 + 상태 칩 — 취소·대기 등 확인이 필요한 건에만 라벨이 붙는다 */}
                <div className={'shrink-0 flex flex-col items-end gap-1'}>
                  <span className={'text-[14px] font-bold text-black'}>{r.amount.toLocaleString()}원</span>
                  {issue && (
                    <span className={`px-1.5 py-[1px] rounded-full text-[10.5px] font-semibold whitespace-nowrap ${issue.cls}`}>
                      {issue.label}
                    </span>
                  )}
                </div>
                <ChevronRight size={18} className={'shrink-0 text-[#B1B8BE]'}/>
              </button>
              </li>
            </React.Fragment>
          );
        })}
      </ul>
      {hasMore && (
        <button
          type={'button'}
          onClick={loadMore}
          disabled={loadingMore}
          className={'my-3 w-full h-[44px] rounded-[12px] bg-[#F2F4F6] text-[14px] font-semibold text-[#1E2124] active:bg-[#E8EAED] transition-colors disabled:opacity-60'}
        >
          {loadingMore ? '…' : t('admin_payments_load_more')}
        </button>
      )}
    </div>
    </>
  );
}
