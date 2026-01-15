'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { GetPaymentRecordResponse } from "@/app/endpoint/payment.record.endpoint";
import { PaymentRecordItem } from "@/app/paymentRecords/PaymentRecordItem";
import { getPaymentRecordsAction } from "@/app/paymentRecords/get.payment.records.action";
import { Locale } from "@/shared/StringResource";

type Props = {
  initialRecords: GetPaymentRecordResponse[];
  locale: Locale;
  noRecordsMessage: string;
};

export const PaymentRecordListClient = ({ initialRecords, locale, noRecordsMessage }: Props) => {
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
      <div className="w-full h-screen bg-white flex flex-col pb-20 box-border overflow-auto">
        <div className="text-black items-center text-center mt-40 font-medium">
          {noRecordsMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-white flex flex-col pb-20 box-border overflow-auto">
      <div className="flex flex-col mb-8">
        {records.map((paymentRecord) => (
          <PaymentRecordItem
            key={paymentRecord.paymentId}
            paymentRecord={paymentRecord}
            locale={locale}
          />
        ))}
      </div>

      {/* 무한스크롤 트리거 */}
      <div ref={loadMoreRef} className="flex items-center justify-center">
        {isLoading && (
          <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin p-4" />
        )}
      </div>
    </div>
  );
};
