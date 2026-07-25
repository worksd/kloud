// 결제 페이지 진입점 — 데이터 조회/에러 처리까지만 하고, 화면은 PC/모바일 폼으로 분기한다.
//  - 앱 웹뷰(appVersion 있음): PaymentMobileForm
//  - 웹: PC + 모바일 둘 다 렌더 후 CSS lg:로 토글 (PaymentPcForm / PaymentMobileForm)
// 결제 실행 로직(UnifiedPaymentInfo → payment.button)은 두 폼이 그대로 공유.
import { notFound } from "next/navigation";
import { getPaymentAction } from "@/app/payment/get.payment.action";
import { cookies } from "next/headers";
import { depositorKey, userIdKey } from "@/shared/cookies.key";
import React from "react";
import { getLocale, translate } from "@/utils/translate";
import { PushAndBackRedirect } from "@/app/components/PushAndBackRedirect";
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import { PaymentErrorView, PaymentErrorLesson } from "@/app/payment/PaymentErrorView";
import PaymentMobileForm from "@/app/payment/PaymentMobileForm";
import PaymentPcForm from "@/app/payment/PaymentPcForm";
import { PaymentFormProps, PaymentPageType } from "@/app/payment/payment.form.props";

export default async function UnifiedPaymentPage({ searchParams }: {
  searchParams: Promise<{
    type?: PaymentPageType
    item?: PaymentPageType
    id: string
    os?: string
    appVersion?: string
    targetUserId?: string
    date?: string
    startTime?: string
    endTime?: string
  }>
}) {
  const params = await searchParams;
  const { type, item, id, os, appVersion = '', targetUserId, date, startTime, endTime } = params;
  const paymentItem = item ?? type ?? 'lesson';
  const itemId = parseInt(id);
  const parsedTargetUserId = targetUserId ? parseInt(targetUserId) : undefined;

  // 연습실 결제는 장소·시간대(startTime/endTime)가 이미 선택된 상태로만 진입 가능.
  if (paymentItem === 'practice-room' && (!startTime || !endTime)) {
    notFound();
  }

  const res = await getPaymentAction({
    item: paymentItem,
    id: itemId,
    targetUserId: parsedTargetUserId,
    // 연습실: startTime/endTime 구간으로 서버가 최종금액 계산 (date 대신)
    startTime: paymentItem === 'practice-room' ? startTime : undefined,
    endTime: paymentItem === 'practice-room' ? endTime : undefined,
  });

  // BE가 redirectUrl을 내려주면 결제 폼 진입 없이 그 route로 push 후 결제 페이지를 back.
  if ('redirectUrl' in res && res.redirectUrl) {
    return <PushAndBackRedirect route={res.redirectUrl}/>;
  }

  const cookieValue = (await cookies()).get(userIdKey)?.value;
  const actualPayerUserId = cookieValue ? Number(cookieValue) : undefined;

  // 에러 응답(code+message)이면 notFound('페이지를 찾을 수 없습니다') 대신 서버 메시지를 노출.
  // 예: BUNDLE_DUPLICATE_REGISTRATION(이미 신청한 묶음) 등 도메인 에러.
  if (isGuinnessErrorCase(res)) {
    // 일부 에러는 충돌 수업 목록을 함께 내려줌 (예: BUNDLE_DUPLICATE_REGISTRATION)
    const errorLessons = (res as { lessons?: PaymentErrorLesson[] }).lessons ?? [];
    return (
      <PaymentErrorView
        title={await translate('payment_error_title')}
        message={res.message || await translate('unknown_error_message')}
        backLabel={await translate('back')}
        lessons={errorLessons}
      />
    );
  }

  // 비회원 연습실 결제는 로그인 없이도 진행(@OptionalAuth — studioRoom+paymentId만 있으면 됨).
  // 그 외 아이템은 user가 있어야 하므로 없으면 notFound.
  if (!('user' in res) && paymentItem !== 'practice-room') {
    return notFound();
  }

  // 대리 결제 여부 확인 (비회원은 user 없음 → false)
  const isProxyPayment = !!(actualPayerUserId && res.user && res.user.id !== actualPayerUserId);

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
        // 번들 응답엔 studio 정보가 따로 안 옴 — title만 표기, studio는 비움.
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

  // PC/모바일 공용 props — 데이터 준비는 여기서 끝내고 두 폼에 같은 값을 넘긴다.
  const formProps: PaymentFormProps = {
    payment: res,
    paymentItem,
    itemId,
    thumbnailUrl,
    title,
    studioName,
    studioImageUrl,
    os,
    appVersion,
    beforeDepositor: (await cookies()).get(depositorKey)?.value ?? '',
    actualPayerUserId,
    isProxyPayment,
    locale: await getLocale(),
    apiUrl: process.env.GUINNESS_API_SERVER ?? '',
    preStartTime: startTime,
    preEndTime: endTime,
  };

  // 앱 웹뷰(appVersion 있음)는 모바일 폼만.
  // 웹은 PC/모바일 둘 다 렌더하고 CSS lg:로 토글 — 서버에서 UA를 판별하지 않아 캐시 안전.
  const isWeb = appVersion === '';
  if (!isWeb) {
    return <PaymentMobileForm {...formProps} />;
  }

  return (
    <>
      <div className="hidden lg:block">
        <PaymentPcForm {...formProps} />
      </div>
      <div className="lg:hidden">
        <PaymentMobileForm {...formProps} />
      </div>
    </>
  );
}
