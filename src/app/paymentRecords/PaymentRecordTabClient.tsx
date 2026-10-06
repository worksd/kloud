'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { GetPaymentRecordResponse } from "@/app/endpoint/payment.record.endpoint";
import { PaymentRecordItem } from "@/app/paymentRecords/PaymentRecordItem";
import { getPaymentRecordsAction } from "@/app/paymentRecords/get.payment.records.action";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { parsePaymentDate } from "@/app/paymentRecords/payment.date";
import BackArrowIcon from "../../../public/assets/ic_back_arrow.svg";

type Props = {
  initialRecords: GetPaymentRecordResponse[];
  locale: Locale;
  noRecordsMessage: string;
};

export const PaymentRecordTabClient = ({
  initialRecords,
  locale,
  noRecordsMessage,
}: Props) => {
  const handleBack = () => {
    (window as any).KloudEvent?.back();
  };

  // '다가오는 결제' 탭은 제거 — 예약 결제는 프로필 > 예약 결제(/profile/mySubscription)에서 관리
  return (
    <div className="w-full h-screen bg-white flex flex-col box-border">
      {/* Header: Back Arrow + Title */}
      <div className="flex flex-row items-center gap-3 px-5 pt-4 pb-3 flex-shrink-0">
        <button onClick={handleBack} className="flex items-center justify-start flex-shrink-0 -ml-1 p-1">
          <BackArrowIcon className="w-6 h-6 text-[#191F28]"/>
        </button>
        <span className="text-[20px] text-[#191F28] font-bold tracking-[-0.4px]">
          {getLocaleString({ locale, key: 'payment_records' })}
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        <PaymentRecordListContent
          initialRecords={initialRecords}
          locale={locale}
          noRecordsMessage={noRecordsMessage}
        />
      </div>
    </div>
  );
};

// PC 웹(프로필 셸)에서도 재사용 — 리스트/무한스크롤/빈 상태만 담당
export const PaymentRecordListContent = ({
  initialRecords,
  locale,
  noRecordsMessage,
}: {
  initialRecords: GetPaymentRecordResponse[];
  locale: Locale;
  noRecordsMessage: string;
}) => {
  const [records, setRecords] = useState<GetPaymentRecordResponse[]>(initialRecords);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialRecords.length > 0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const nextPage = page + 1;
    const res = await getPaymentRecordsAction({ page: nextPage });

    if ('paymentRecords' in res && res.paymentRecords.length > 0) {
      setRecords(prev => [...prev, ...res.paymentRecords]);
      setPage(nextPage);
    } else {
      setHasMore(false);
    }
    setIsLoading(false);
  }, [page, isLoading, hasMore]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, hasMore, isLoading]);

  if (records.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-4 text-[14px] text-[#8B95A1] text-center">
        {noRecordsMessage}
      </div>
    );
  }

  // 날짜별 그룹 — 서버가 최신순으로 내려주므로 연속 구간을 같은 날짜로 묶는다. 헤더는 '오늘/어제/9월 8일 (화)'
  const groups: { key: string; label: string; items: GetPaymentRecordResponse[] }[] = [];
  for (const r of records) {
    const parsed = parsePaymentDate(r.createdAt, locale);
    const key = parsed?.dateKey ?? '-';
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(r);
    else groups.push({ key, label: parsed?.dateLabel ?? (r.createdAt ?? ''), items: [r] });
  }

  return (
    <>
      <div className="flex flex-col mb-8">
        {groups.map((g) => (
          <section key={g.key}>
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-5 pt-4 pb-1.5">
              <h3 className="text-[13px] font-bold text-[#8B95A1] tracking-[-0.2px]">{g.label}</h3>
            </div>
            <div className="flex flex-col">
              {g.items.map((paymentRecord) => (
                <PaymentRecordItem
                  key={paymentRecord.paymentId}
                  paymentRecord={paymentRecord}
                  locale={locale}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div ref={loadMoreRef} className="flex items-center justify-center">
        {isLoading && (
          <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin p-4" />
        )}
      </div>
    </>
  );
};
