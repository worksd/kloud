import React from 'react';
import { requireAdmin } from '@/app/admin/admin.guard';
import { getBillingCardsAction, getStudioSubscriptionAction } from '@/app/admin/setting/payment/payment.setting.action';
import { PaymentSettingsForm } from '@/app/admin/setting/payment/PaymentSettingsForm';

// 관리자 설정 > 요금제·결제수단 — GET /studios/me/subscription(현재 요금제·대표 카드) + GET /billing(카드 목록).
// 둘 중 하나가 실패해도 화면은 뜬다(각 섹션이 자기 실패를 안내).
export default async function AdminSettingPaymentPage() {
  const { studioName } = await requireAdmin();
  const [subscription, cards] = await Promise.all([getStudioSubscriptionAction(), getBillingCardsAction()]);
  return <PaymentSettingsForm initialSubscription={subscription} initialCards={cards} studioName={studioName}/>;
}
