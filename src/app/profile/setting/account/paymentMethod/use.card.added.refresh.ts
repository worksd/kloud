'use client'
// 결제 화면에서 '새 카드 추가'로 카드 등록 페이지에 갔다 돌아왔을 때 카드 목록을 다시 불러오고, 새로 생긴 카드를 바로 선택 상태로.
// 앱: 네이티브가 화면이 돌아오면 window.onReload 를 부른다(결제수단 관리와 같은 훅). 웹: 뒤로가기(bfcache 포함) pageshow·focus.
import { useEffect, useRef } from "react";
import { GetBillingResponse } from "@/app/endpoint/billing.endpoint";
import { getBillingListAction } from "@/app/profile/setting/account/paymentMethod/get.billing.list.action";

export const useCardAddedRefresh = ({ cards, onCardsChangeAction, selectBillingCard }: {
  cards: GetBillingResponse[];
  onCardsChangeAction: (cards: GetBillingResponse[]) => void;
  selectBillingCard?: (card: GetBillingResponse) => void;
}) => {
  const known = useRef(new Set(cards.map((c) => c.billingKey)));
  useEffect(() => { cards.forEach((c) => known.current.add(c.billingKey)); }, [cards]);

  useEffect(() => {
    let busy = false;
    const refresh = async () => {
      if (busy) return;
      busy = true;
      try {
        const res = await getBillingListAction();
        if (!('billings' in res)) return;
        const added = res.billings.find((c) => c.billingKey && !known.current.has(c.billingKey));
        if (!added) return;
        onCardsChangeAction(res.billings);
        selectBillingCard?.(added);
      } finally {
        busy = false;
      }
    };
    const prevReload = window.onReload;
    window.onReload = async (data) => { await refresh(); prevReload?.(data); };
    const onShow = () => { refresh(); };
    window.addEventListener('pageshow', onShow);
    window.addEventListener('focus', onShow);
    return () => {
      window.onReload = prevReload;
      window.removeEventListener('pageshow', onShow);
      window.removeEventListener('focus', onShow);
    };
  }, [onCardsChangeAction, selectBillingCard]);
};
