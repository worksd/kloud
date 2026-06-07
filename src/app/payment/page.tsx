import { notFound } from "next/navigation";
import { getPaymentAction } from "@/app/payment/get.payment.action";
import { cookies } from "next/headers";
import { depositorKey, userIdKey } from "@/shared/cookies.key";
import React from "react";
import { getLocale, translate } from "@/utils/translate";
import { PushAndBackRedirect } from "@/app/components/PushAndBackRedirect";
import PaymentMobileForm from "@/app/payment/PaymentMobileForm";
import PaymentPcForm from "@/app/payment/PaymentPcForm";

type PaymentPageType = 'lesson' | 'pass-plan' | 'lesson-group' | 'practice-room' | 'bundle';

export default async function UnifiedPaymentPage({ searchParams }: {
  searchParams: Promise<{
    type?: PaymentPageType
    item?: PaymentPageType
    id: string
    os?: string
    appVersion?: string
    targetUserId?: string
    date?: string
  }>
}) {
  const params = await searchParams;
  const { type, item, id, os, appVersion = '', targetUserId, date } = params;
  const paymentItem = item ?? type ?? 'lesson';
  const itemId = parseInt(id);
  const parsedTargetUserId = targetUserId ? parseInt(targetUserId) : undefined;

  const res = await getPaymentAction({
    item: paymentItem,
    id: itemId,
    targetUserId: parsedTargetUserId,
    date: paymentItem === 'practice-room' ? date : undefined,
  });

  // BE가 redirectUrl을 내려주면 결제 폼 진입 없이 그 route로 push 후 결제 페이지를 back.
  if ('redirectUrl' in res && res.redirectUrl) {
    return <PushAndBackRedirect route={res.redirectUrl}/>;
  }

  const cookieValue = (await cookies()).get(userIdKey)?.value;
  const actualPayerUserId = cookieValue ? Number(cookieValue) : undefined;

  if (!('user' in res)) {
    return notFound();
  }

  // 대리 결제 여부 확인
  const isProxyPayment = !!(actualPayerUserId && res.user.id !== actualPayerUserId);

  // 타입별로 데이터가 없는 경우 체크
  if (paymentItem === 'lesson' && !res.lesson) {
    return <div className="flex items-center justify-center p-4 text-black">{await translate('not_reserved_lesson')}</div>
  }
  if (paymentItem === 'lesson-group' && !res.lessonGroup) {
    return <div className="flex items-center justify-center p-4 text-black">{await translate('not_reserved_lesson')}</div>
  }
  if (paymentItem === 'pass-plan' && !res.passPlan) {
    return <div className="flex items-center justify-center p-4 text-black">{await translate('pass_plan_not_found')}</div>
  }
  if (paymentItem === 'bundle' && !res.bundle) {
    return <div className="flex items-center justify-center p-4 text-black">{await translate('not_reserved_lesson')}</div>
  }

  const getItemInfo = () => {
    switch (paymentItem) {
      case 'lesson':
        return {
          thumbnailUrl: res.lesson?.thumbnailUrl,
          title: res.lesson?.title,
          studioName: res.lesson?.studio?.name,
          studioImageUrl: res.lesson?.studio?.profileImageUrl,
        };
      case 'lesson-group':
        return {
          thumbnailUrl: res.lessonGroup?.thumbnailUrl,
          title: res.lessonGroup?.title,
          studioName: res.lessonGroup?.studioName,
          studioImageUrl: res.lessonGroup?.studioImageUrl,
        };
      case 'pass-plan':
        return {
          thumbnailUrl: res.passPlan?.studio?.profileImageUrl,
          title: res.passPlan?.name,
          studioName: res.passPlan?.studio?.name,
          studioImageUrl: res.passPlan?.studio?.profileImageUrl,
        };
      case 'bundle':
        return {
          thumbnailUrl: undefined,
          title: res.bundle?.name,
          studioName: undefined,
          studioImageUrl: undefined,
        };
      default:
        return {
          thumbnailUrl: undefined,
          title: undefined,
          studioName: undefined,
          studioImageUrl: undefined,
        };
    }
  };

  const { thumbnailUrl, title, studioName, studioImageUrl } = getItemInfo();
  const locale = await getLocale();
  const apiUrl = process.env.GUINNESS_API_SERVER ?? '';
  const beforeDepositor = (await cookies()).get(depositorKey)?.value ?? '';
  const isWeb = appVersion === '';

  // 공통 props
  const formProps = {
    payment: res,
    paymentItem,
    itemId,
    thumbnailUrl,
    title,
    studioName,
    studioImageUrl,
    os,
    appVersion,
    beforeDepositor,
    actualPayerUserId,
    isProxyPayment,
    locale,
    apiUrl,
  };

  // 앱 웹뷰: 모바일 폼만. 웹: PC + 모바일 둘 다 렌더 후 CSS lg:로 토글.
  // 웹 top bar (로고/메뉴/로그인)는 layout의 WebTopNav가 글로벌 처리 — page단 BackButton 제거.
  if (!isWeb) {
    return <PaymentMobileForm {...formProps} showBackButton={false}/>;
  }

  return (
    <>
      <div className="hidden lg:block">
        <PaymentPcForm {...formProps}/>
      </div>
      <div className="lg:hidden">
        <PaymentMobileForm {...formProps} showBackButton={false}/>
      </div>
    </>
  );
}
