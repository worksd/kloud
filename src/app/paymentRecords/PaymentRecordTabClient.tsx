'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { GetPaymentRecordResponse } from "@/app/endpoint/payment.record.endpoint";
import { GetSubscriptionResponse } from "@/app/endpoint/subscription.endpoint";
import { PaymentRecordItem } from "@/app/paymentRecords/PaymentRecordItem";
import { getPaymentRecordsAction } from "@/app/paymentRecords/get.payment.records.action";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { KloudScreen } from "@/shared/kloud.screen";
import BackArrowIcon from "../../../public/assets/ic_back_arrow.svg";

type Props = {
  initialRecords: GetPaymentRecordResponse[];
  subscriptions: GetSubscriptionResponse[];
  locale: Locale;
  noRecordsMessage: string;
};

export const PaymentRecordTabClient = ({
  initialRecords,
  subscriptions,
  locale,
  noRecordsMessage,
}: Props) => {
  const [activeTab, setActiveTab] = useState<'records' | 'upcoming'>('records');

  const handleBack = () => {
    (window as any).KloudEvent?.back();
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col box-border">
      {/* Header: Back Arrow + Tabs */}
      <div className="flex flex-row items-center gap-4 px-5 pt-4 pb-3 flex-shrink-0">
        <button onClick={handleBack} className="flex items-center justify-start flex-shrink-0">
          <BackArrowIcon className="w-6 h-6 text-black"/>
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={`transition-all duration-300 ${
            activeTab === 'records'
              ? 'text-[20px] text-black font-bold'
              : 'text-[16px] text-gray-400 font-medium'
          }`}
        >
          {getLocaleString({ locale, key: 'payment_records' })}
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`transition-all duration-300 ${
            activeTab === 'upcoming'
              ? 'text-[20px] text-black font-bold'
              : 'text-[16px] text-gray-400 font-medium'
          }`}
        >
          {getLocaleString({ locale, key: 'upcoming_payments' })}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'records' ? (
          <PaymentRecordListContent
            initialRecords={initialRecords}
            locale={locale}
            noRecordsMessage={noRecordsMessage}
          />
        ) : (
          <UpcomingPaymentsContent
            subscriptions={subscriptions}
            locale={locale}
          />
        )}
      </div>
    </div>
  );
};

const PaymentRecordListContent = ({
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
      <div className="text-black items-center text-center mt-40 font-medium">
        {noRecordsMessage}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col mb-8">
        {records.map((paymentRecord) => (
          <PaymentRecordItem
            key={paymentRecord.paymentId}
            paymentRecord={paymentRecord}
            locale={locale}
          />
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

const UpcomingPaymentsContent = ({
  subscriptions,
  locale,
}: {
  subscriptions: GetSubscriptionResponse[];
  locale: Locale;
}) => {
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'Active');

  if (activeSubscriptions.length === 0) {
    return (
      <div className="text-black items-center text-center mt-40 font-medium">
        {getLocaleString({ locale, key: 'no_upcoming_payments' })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-4 pt-2">
      {activeSubscriptions.map((sub) => (
        <NavigateClickWrapper
          key={sub.subscriptionId}
          method={'push'}
          route={KloudScreen.MySubscriptionDetail(sub.subscriptionId)}
        >
          <div className="border rounded-xl p-4 shadow-sm hover:shadow-md transition bg-white active:scale-[0.98] active:bg-gray-50 duration-150">
            <div className="flex flex-col gap-1">
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 self-start font-medium">
                {getLocaleString({ locale, key: 'active' })}
              </span>
              <h2 className="text-[16px] font-semibold text-black mt-1">{sub.productName}</h2>
              {sub.studio && (
                <p className="text-sm text-gray-500">{sub.studio.name}</p>
              )}
              {sub.paymentScheduledAt && (
                <p className="text-sm text-gray-600 mt-1">
                  <span className="text-gray-400">{getLocaleString({ locale, key: 'payment_record_scheduled' })}</span>
                  {' '}
                  <span className="font-medium">{sub.paymentScheduledAt}</span>
                </p>
              )}
            </div>
          </div>
        </NavigateClickWrapper>
      ))}
    </div>
  );
};
