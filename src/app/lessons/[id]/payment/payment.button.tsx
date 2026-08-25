"use client";

import CommonSubmitButton from "@/app/components/buttons/CommonSubmitButton";
import {startTransition, useCallback, useEffect, useRef, useState} from "react";
import { KloudScreen } from "@/shared/kloud.screen";
import { PaymentRequest, requestPayment, Entity } from "@portone/browser-sdk/v2";
import { createAccountTransferMessage, createDialog, DialogInfo } from "@/utils/dialog.factory";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import {redirect, useRouter} from "next/navigation";
import { SimpleDialog } from "@/app/components/SimpleDialog";
import {DiscountResponse, PaymentMethodType} from "@/app/endpoint/payment.endpoint";
import { createManualPaymentRecordAction } from "@/app/lessons/[id]/action/create.manual.payment.record.action";
import { selectAndUsePassAction } from "@/app/lessons/[id]/action/selectAndUsePassActioin";
import { GetUserResponse } from "@/app/endpoint/user.endpoint";
import { GetBillingResponse } from "@/app/endpoint/billing.endpoint";
import { billingKeyPaymentAction } from "@/app/lessons/[id]/action/billing.key.payment.action";
import { createSubscriptionAction } from "@/app/lessons/[id]/action/create.subscription.action";
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import { trackEvent } from "@/app/lib/analytics";
import { checkCapacityLessonAction } from "@/app/lessons/[id]/payment/check.capacity.lesson.action";
import { kloudNav } from "@/app/lib/kloudNav";
import { getLocaleString } from "@/app/components/locale";
import { Locale } from "@/shared/StringResource";
import { depositorKey } from "@/shared/cookies.key";
import { GuestInfoBottomSheet } from "@/app/payment/GuestInfoBottomSheet";
import { getRoomBookingsAction } from "@/app/roomBookings/get.room.bookings.action";

// 연습실 예약 시간대는 KST 벽시계("yyyy.MM.dd HH:mm")로 저장 — 다이얼로그 표시엔 HH:mm만.
const roomTimeLabel = (s?: string) => s?.split(' ')[1]?.slice(0, 5) ?? s ?? '';

// depositor 쿠키를 server action 대신 client에서 직접 set.
// server action으로 cookies().set 호출 시 Next.js가 현재 라우트 RSC를 자동 revalidate해서
// 결제 직후 /payment SSR이 한 번 더 도는 부작용이 있었음.
const setDepositorCookie = (depositor: string) => {
  document.cookie = `${depositorKey}=${encodeURIComponent(depositor)}; Max-Age=15552000; Path=/; SameSite=Lax`;
}

export const PaymentTypes = [
  {value: 'lesson', prefix: 'LT', apiValue: 'lesson'},
  {value: 'passPlan', prefix: 'LP', apiValue: 'pass-plan'},
  {value: 'practiceRoom', prefix: 'PR', apiValue: 'practice-room'},
  // 번들(묶음) 결제 — paymentId prefix `BD`로 BE가 라우팅. 결제 API는 lesson/passPlan과 동일.
  {value: 'bundle', prefix: 'BD', apiValue: 'bundle'},
  // 수업 가격 정책(정기) 결제 — paymentId prefix `LGT`. itemId는 lesson이 아니라 가격 정책 id다.
  // 수업 결제 화면에서 정책을 고르면 lesson 결제가 이 타입으로 바뀐다.
  {value: 'lessonGroup', prefix: 'LGT', apiValue: 'lesson-group'},
] as const;

export type PaymentType = (typeof PaymentTypes)[number];

type PaymentInfo = {
  storeId: string
  channelKey: string
  paymentId: string
  orderName: string
  price: number
  /** PortOne customer.id. 비회원은 미지정(null) — phone은 customData로만 전달. */
  userId?: string
  method: string
  customData: string
  userName?: string
  userBirth?: string
  userPhone?: string
  locale?: string
  pgProvider?: string
}

// 결제 대상 사용자 — 회원(user) 또는 폰 인증으로 방금 로그인한 사용자를 하나로 정규화.
type Payer = { id: number; name?: string; phone?: string; birth?: string };

const easyPayMethodMap: Partial<Record<PaymentMethodType, string>> = {
  naver_pay: 'naverpay',
  kakao_pay: 'kakaopay',
  toss_pay: 'tosspay',
}

// 결제 성공 직후 해당 lesson의 detail 캐시를 무효화. server action이 아닌 route handler를
// fetch로 호출해서 /payment 페이지 RSC refresh(=GET /payment 재호출) 부작용 없이 캐시만 비움.
// fire-and-forget — 응답 대기 불필요(사용자가 lesson으로 돌아오기까지 시간 충분).
const purgeLessonCache = (lessonId: number) => {
  fetch('/api/cache/purge-lesson', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lessonId }),
  }).catch(() => {});
}


export default function PaymentButton({
                                        appVersion,
                                        id,
                                        lessonId,
                                        selectedPass,
                                        selectedBilling,
                                        selectedDiscounts,
                                        type,
                                        price,
                                        title,
                                        method,
                                        depositor,
                                        disabled,
                                        disabledReason,
                                        paymentId,
                                        user,
                                        actualPayerUserId,
                                        locale,
                                        hasRefundAccount,
                                        onBillingCardsChange,
                                        practiceRoomInfo,
                                        canSubscribe,
                                        subscriptionCycleLabel,
                                      }: {
  appVersion: string;
  id: number,
  /**
   * 실제 수업 id. lesson 결제면 id와 같고, 가격 정책(lessonGroup) 결제면 itemId가 정책 id라 따로 받는다.
   * 정원 확인·캐시 무효화·패스권 사용처럼 "어느 수업이냐"가 필요한 동작은 전부 이 값을 쓴다.
   */
  lessonId?: number,
  selectedPass?: GetPassResponse,
  selectedBilling?: GetBillingResponse,
  selectedDiscounts?: DiscountResponse[],
  type: PaymentType,
  price: number | null,
  title: string,
  method?: PaymentMethodType,
  user?: GetUserResponse,
  depositor: string,
  disabled: boolean,
  /** disabled 사유 — PC 웹(lg)에서 버튼 hover 시 툴팁으로 노출 */
  disabledReason?: string,
  paymentId: string,
  actualPayerUserId?: number,
  locale: Locale,
  hasRefundAccount: boolean,
  onBillingCardsChange?: (cards: GetBillingResponse[]) => void,
  practiceRoomInfo?: { studioRoomId: number; startDate: string; endDate: string },
  /** GET /payment의 canSubscribe — true면 billing 결제가 단건이 아니라 구독 생성(POST /subscription)으로 간다 */
  canSubscribe?: boolean,
  /** 정기결제 주기 문장 라벨 (예: '4주마다', '매달') — 선택한 가격 정책으로 연산된 값 */
  subscriptionCycleLabel?: string,
}) {

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [webDialogInfo, setWebDialogInfo] = useState<DialogInfo | null>(null);
  // 비회원(연습실 게스트) 결제 — 예약자 phone/name
  // 폰 인증 시트(비회원 결제 폐지 → 인증 로그인으로 대체) 열림 상태
  const [guestSheetOpen, setGuestSheetOpen] = useState(false);
  const router = useRouter();

  // 수업 결제(lesson)와 가격 정책 결제(lessonGroup)는 결제 상품만 다를 뿐 둘 다 한 수업을 사는 것이다.
  // 정원 확인·캐시 무효화·패스권 사용은 결제 itemId가 아니라 targetLessonId 기준으로 돌아야 한다
  // (lessonGroup은 itemId가 가격 정책 id라 그대로 쓰면 엉뚱한 수업을 건드린다).
  const isLessonPurchase = type.value === 'lesson' || type.value === 'lessonGroup';
  const targetLessonId = lessonId ?? (type.value === 'lesson' ? id : undefined);

  const onPaymentSuccess = useCallback(async ({ paymentId, delay }: { paymentId: string; delay: number }) => {
    try {
      setIsSubmitting(true);
      // 결제 성공 → lesson detail 캐시 무효화 (티켓 보유 반영된 fresh 응답 받도록)
      if (isLessonPurchase && targetLessonId != null) purgeLessonCache(targetLessonId);
      await new Promise((r) => setTimeout(r, delay));
      const pushRoute = KloudScreen.PaymentRecordDetail(paymentId);
      const isWeb = !appVersion?.trim();
      if (isWeb) {
        const href = '/' + String(pushRoute).replace(/^\/+/, '');
        setIsSubmitting(false);
        startTransition(() => {
          router.push(href);
        });
        setTimeout(() => {
          if (window.location.pathname !== href) {
            router.refresh();
          }
        }, 0);
        setTimeout(() => {
          if (window.location.pathname !== href) {
            window.location.assign(href);
          }
        }, 100);
      } else {
        await kloudNav.navigateMain({ route: pushRoute });
      }
    } catch (e) {
      const dialog = await createDialog({ id: 'PaymentFail' });
      window.KloudEvent?.showDialog(JSON.stringify(dialog));
    } finally {
      setIsSubmitting(false);
    }
  }, [router, appVersion, isLessonPurchase, targetLessonId]);

  // authedPayer: 폰 인증 성공 시 handlePayment로 전달받는 사용자. 없으면 로그인된 user 사용.
  const handlePayment = async (authedPayer?: { userId: number; name: string; phone: string }) => {
    let payer: Payer | null = null;
    if (authedPayer) payer = { id: authedPayer.userId, name: authedPayer.name, phone: authedPayer.phone };
    else if (user && 'id' in user) payer = { id: user.id, name: user.name ?? user.nickName ?? undefined, phone: user.phone ?? undefined, birth: user.birth ?? undefined };

    // 저장된 토큰(로그인) 없으면 폰 인증 시트부터. 인증 성공 시 토큰이 저장되므로 handlePayment 재호출.
    if (!payer) {
      setGuestSheetOpen(true);
      return;
    }

    const roomManualFields = (type.value === 'practiceRoom' && practiceRoomInfo)
      ? { startDate: practiceRoomInfo.startDate, endDate: practiceRoomInfo.endDate }
      : {};

    if (price == 0) {
      setIsSubmitting(true);
      try {
        const res = await createManualPaymentRecordAction({
          methodType: 'free',
          item: type.apiValue,
          itemId: id,
          targetUserId: payer.id,
          discounts: selectedDiscounts,
          ...roomManualFields,
        })
        if ('paymentId' in res) {
          if (isLessonPurchase && targetLessonId != null) purgeLessonCache(targetLessonId);
          const route = KloudScreen.PaymentRecordDetail(res.paymentId)
          if (appVersion == '' && route) {
            router.replace(route)
          } else {
            await kloudNav.navigateMain({route});
          }
        } else {
          const dialog = await createDialog({id: 'Simple', message: res.message})
          window.KloudEvent?.showDialog(JSON.stringify(dialog));
        }
      } finally {
        setIsSubmitting(false);
      }
      return
    }

    if (method === 'credit' || method === 'foreign_card' || method === 'naver_pay' || method === 'kakao_pay' || method === 'toss_pay') {
      const buildCustomData = () => {
        const customData: Record<string, unknown> = { actualPayerUserId, discounts: selectedDiscounts };
        if (type.value === 'practiceRoom' && practiceRoomInfo) {
          customData.startDate = practiceRoomInfo.startDate;
          customData.endDate = practiceRoomInfo.endDate;
        }
        // 정기수업 시작 회차 — 결제 화면에 띄운 회차부터 계약을 잡도록 웹훅에 전달.
        // 기존 키(actualPayerUserId/discounts 등)는 유지하고 키만 추가할 것 (파싱 실패 시 구독·대리결제 분기 전체가 빠진다)
        if (type.value === 'lessonGroup' && targetLessonId != null) {
          customData.firstLessonId = targetLessonId;
        }
        return customData;
      };
      if (isLessonPurchase && targetLessonId != null) {
        const capacityCheckResponse = await checkCapacityLessonAction({lessonId: targetLessonId});

        if ('message' in capacityCheckResponse) {
          const dialog = await createDialog({id: 'Simple', message: capacityCheckResponse.message})
          window.KloudEvent?.showDialog(JSON.stringify(dialog));
          return;
        }
      }

      const paymentInfo: PaymentInfo = {
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID ?? '',
        channelKey: method === 'toss_pay'
          ? (process.env.NEXT_PUBLIC_PORTONE_TOSS_SIMPLE_CHANNEL_KEY ?? '')
          : method === 'foreign_card'
            ? (process.env.NEXT_PUBLIC_PORTONE_FOREIGN_CHANNEL_KEY ?? '')
            : (process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY ?? ''),
        paymentId,
        orderName: title,
        price: price ?? 0,
        userId: `${payer.id}`,
        method: method && easyPayMethodMap[method] ? easyPayMethodMap[method]! : 'CARD',
        customData: JSON.stringify(buildCustomData()),
        userName: payer.name,
        userPhone: payer.phone,
        userBirth: payer.birth,
        locale: method === 'foreign_card' ? 'EN_US' : locale === 'en' ? 'EN_US' : locale === 'zh' ? 'ZH_CN' : 'KO_KR',
      };

      if (appVersion === '') {
        // 간편결제(카카오/네이버/토스)는 payMethod='EASY_PAY' + easyPayProvider로 보내야 동작. 그 외는 CARD.
        const easyPayProvider =
          method === 'kakao_pay' ? Entity.EasyPayProvider.KAKAOPAY
          : method === 'naver_pay' ? Entity.EasyPayProvider.NAVERPAY
          : method === 'toss_pay' ? Entity.EasyPayProvider.TOSSPAY
          : undefined;
        const mobileWebPaymentRequest = {
          storeId: paymentInfo.storeId,
          channelKey: paymentInfo.channelKey,
          paymentId: paymentInfo.paymentId,
          orderName: paymentInfo.orderName,
          payMethod: easyPayProvider ? 'EASY_PAY' : 'CARD',
          totalAmount: paymentInfo.price,
          currency: 'CURRENCY_KRW',
          customer: {
            customerId: `${payer.id}`,
            fullName: paymentInfo.userName ?? `${payer.id}`,
          } as any,
          // 결제 결과 검증 핸들러(/payment-redirect)로 리다이렉트 — PortOne이 paymentId/message를 붙여줌.
          // 실패/취소면 message 표시, 성공이면 결제기록 확인 후 결제상세로 이동 (webhook 반영 대기 포함).
          redirectUrl: `${process.env.NEXT_PUBLIC_PORTONE_REDIRECT_URL ?? ''}?type=${type.value}&id=${id}`,
          customData: buildCustomData(),
          // 네이버/토스는 카드 결제수단만 (네이티브와 동일)
          ...(easyPayProvider ? {
            easyPay: {
              easyPayProvider,
              ...(method === 'naver_pay' || method === 'toss_pay'
                ? { availablePayMethods: ['CARD'] }
                : {}),
            },
          } : {}),
        } as PaymentRequest;
        const result = await requestPayment(mobileWebPaymentRequest);
        if (result?.code != null) {
          // 실패/취소 — PortOne이 code 반환. 결제상세로 안 보냄.
          const dialog = await createDialog({ id: 'PaymentFail' });
          if (dialog) setWebDialogInfo(dialog);
          return;
        }
        router.push(`/payment-redirect?paymentId=${paymentInfo.paymentId}`);
        return;
      }

      window.KloudEvent?.requestPayment(JSON.stringify(paymentInfo));
    } else if (method === 'account_transfer') {
      if (depositor.length === 0) {
        const dialog = await createDialog({id: 'EmptyDepositor'})
        window.KloudEvent?.showDialog(JSON.stringify(dialog));
      } else {
        const dialog = await createAccountTransferMessage({
          title,
          price: price ?? 0,
          depositor,
          hasRefundAccount,
        })
        if (appVersion == '' && dialog) {
          setWebDialogInfo(dialog)
        } else {
          window.KloudEvent?.showDialog(JSON.stringify(dialog));
        }
      }
    } else if (method === 'pass') {
      const isPracticeRoom = type.apiValue === 'practice-room';
      if (isPracticeRoom && !practiceRoomInfo) {
        const d = await createDialog({ id: 'Simple', message: getLocaleString({ locale, key: 'select_time' }) });
        window.KloudEvent?.showDialog(JSON.stringify(d));
        return;
      }
      const dialog = await createDialog({
        id: 'UsePass',
        title: isPracticeRoom
          ? getLocaleString({locale, key: 'use_pass_confirm_question'})
          : title,
        message: isPracticeRoom
          ? [
              `${getLocaleString({locale, key: 'practice_room'})}: ${title}`,
              `${getLocaleString({locale, key: 'time'})}: ${roomTimeLabel(practiceRoomInfo?.startDate)} ~ ${roomTimeLabel(practiceRoomInfo?.endDate)}`,
              `${getLocaleString({locale, key: 'use_pass_confirm_pass'})}: ${selectedPass?.passPlan?.name ?? ''}`,
            ].join('\n')
          : [
              `${getLocaleString({locale, key: 'use_pass_confirm_lesson'})}: ${title}`,
              `${getLocaleString({locale, key: 'use_pass_confirm_pass'})}: ${selectedPass?.passPlan?.name ?? ''}`,
              ``,
              `${getLocaleString({locale, key: 'billing_key_payment_confirm_question'})}`
            ].join('\n'),
      })
      if (appVersion == '' && dialog) {
        setWebDialogInfo(dialog)
      } else {
        window.KloudEvent?.showDialog(JSON.stringify(dialog));
      }
    } else if (method == 'billing') {
      if (selectedBilling && selectedBilling.billingKey) {
        // 일반 카드 결제 흐름(credit/foreign/easy-pay)과 동일하게 빌링키 결제도
        // lesson 정원 확인을 선행 — 정원 초과 시 결제 다이얼로그 진입 차단.
        if (isLessonPurchase && targetLessonId != null) {
          const capacityCheckResponse = await checkCapacityLessonAction({lessonId: targetLessonId});
          if ('message' in capacityCheckResponse) {
            const dialog = await createDialog({id: 'Simple', message: capacityCheckResponse.message});
            if (appVersion == '' && dialog) setWebDialogInfo(dialog);
            else window.KloudEvent?.showDialog(JSON.stringify(dialog));
            return;
          }
        }
        // canSubscribe=true면 단건 빌링키 결제가 아니라 구독 생성(POST /subscription) — 확인 문구도 정기결제용
        const dialog = await createDialog({
          id: canSubscribe ? 'RequestSubscription' : 'RequestBillingKeyPayment',
          title: title,
          message: [
            `${getLocaleString({locale, key: 'billing_key_payment_amount'})}: ${(price ?? 0).toLocaleString()}${getLocaleString({locale, key: 'won'})}`,
            `${getLocaleString({locale, key: 'billing_key_payment_method'})}: ${selectedBilling.cardName}`,
            ...(canSubscribe
              ? [getLocaleString({locale, key: 'subscription_confirm_notice'}).replace(
                  '{cycle}',
                  subscriptionCycleLabel ?? getLocaleString({locale, key: 'cycle_monthly'}),
                )]
              : []),
            ``,
            `${getLocaleString({locale, key: 'billing_key_payment_confirm_question'})}`
          ].join('\n'),
          customData: selectedBilling.billingKey,
        });

        if (appVersion == '' && dialog) setWebDialogInfo(dialog);
        else window.KloudEvent?.showDialog(JSON.stringify(dialog));
      } else {
        const dialog = await createDialog({id: 'BillingKeyNotFound'})
        if (appVersion == '' && dialog) setWebDialogInfo(dialog);
        else window.KloudEvent?.showDialog(JSON.stringify(dialog));
      }
    }

  };

  useEffect(() => {
    window.onPaymentSuccess = async (data: { paymentId: string, transactionId: string }) => {
      await onPaymentSuccess({paymentId: data.paymentId, delay: 2000})
    }
  }, [onPaymentSuccess, selectedPass])

  useEffect(() => {
    window.onErrorInvoked = async (data: { paymentId: string, message?: string }) => {
      const dialog = await createDialog({id: 'PaymentFail', message: data.message})
      window.KloudEvent?.showDialog(JSON.stringify(dialog));
    }
  }, [])

  const onConfirmDialog = async (data: DialogInfo) => {
    try {
      setIsSubmitting(true);
      if (data.id == 'AccountTransfer') {
        // 폰 인증 직후엔 user prop이 아직 갱신 전일 수 있으나, 토큰이 쿠키에 있어 서버가 사용자 식별.
        const payerUserId = (user && 'id' in user) ? user.id : undefined;
        const res = await createManualPaymentRecordAction({
          methodType: 'account_transfer',
          item: type.apiValue,
          itemId: id,
          targetUserId: payerUserId,
          depositor: depositor,
          discounts: selectedDiscounts,
          ...(type.value === 'practiceRoom' && practiceRoomInfo
            ? { startDate: practiceRoomInfo.startDate, endDate: practiceRoomInfo.endDate }
            : {}),
        });
        if ('paymentId' in res) {
          setDepositorCookie(depositor)
          await onPaymentSuccess({paymentId: res.paymentId, delay: 0})
        } else {
          const dialogInfo = await createDialog({id: 'Simple', message: res.message})
          window.KloudEvent?.showDialog(JSON.stringify(dialogInfo))
        }
      } else if (data.id == 'UsePass' && selectedPass?.id && (isLessonPurchase || type.value == 'practiceRoom')) {
        if (type.value === 'practiceRoom' && !practiceRoomInfo) return;
        const res = await selectAndUsePassAction({
          passId: selectedPass.id,
          lessonId: isLessonPurchase ? targetLessonId : undefined,
          studioRoomId: type.value === 'practiceRoom' ? practiceRoomInfo!.studioRoomId : undefined,
          startDate: practiceRoomInfo?.startDate,
          endDate: practiceRoomInfo?.endDate,
        });
        if ('id' in res) {
          if (isLessonPurchase && targetLessonId != null) purgeLessonCache(targetLessonId);
          const pushRoute = KloudScreen.TicketDetail(res.id, false);
          if (appVersion == '') {
            router.replace(pushRoute ?? '/')
          } else {
            await kloudNav.navigateMain({route: pushRoute});
          }
        } else if (type.value === 'practiceRoom' && 'success' in res && res.success) {
          // 패스권으로 연습실 대관 완료 → 예약 상세(roomBookings/:id)로 이동.
          // 응답에 roomBookingId가 있으면 그대로 딥링크, 없으면 목록 API로 방금 만든 예약(최신)을 찾아 상세로.
          // 목록 조회가 실패하면 그냥 메인으로 보낸다.
          const bookingId = 'roomBookingId' in res ? (res as { roomBookingId?: number }).roomBookingId : undefined;
          let route: string | undefined = bookingId != null ? KloudScreen.RoomBookingDetail(bookingId) : undefined;
          if (route == null) {
            try {
              const list = await getRoomBookingsAction();
              if ('roomBookings' in list && list.roomBookings.length > 0) {
                // createdAt(yyyy.MM.dd HH:mm) 최신 예약 = 방금 생성한 예약
                const key = (s?: string) => Number((s ?? '').replace(/\D/g, '').slice(0, 12)) || 0;
                const latest = list.roomBookings.reduce((a, b) => (key(b.createdAt) >= key(a.createdAt) ? b : a));
                route = KloudScreen.RoomBookingDetail(latest.id);
              }
            } catch { /* 목록 조회 실패 → 아래에서 메인으로 */ }
          }
          if (route) {
            if (appVersion == '') router.replace(route);
            else await kloudNav.navigateMain({ route });
          } else {
            if (appVersion == '') router.replace('/');
            else await kloudNav.navigateMain({});
          }
        } else {
          const dialog = await createDialog({id: 'PaymentFail', message: res.message})
          window.KloudEvent?.showDialog(JSON.stringify(dialog));
        }
      } else if (data.id == 'RequestSubscription') {
        // 정기결제(구독) 생성 — 단건 결제가 아니라 매달 자동결제를 건다
        const res = await createSubscriptionAction({
          item: type.apiValue,
          itemId: id,
          billingKey: data.customData ?? '',
          // 정기수업 시작 회차 — 결제 화면에 띄운 회차부터. lesson-group 외에는 서버가 무시
          ...(type.value === 'lessonGroup' && targetLessonId != null ? { firstLessonId: targetLessonId } : {}),
        });
        if ('subscription' in res && res.subscription?.subscriptionId) {
          if (isLessonPurchase && targetLessonId != null) purgeLessonCache(targetLessonId);
          const route = KloudScreen.MySubscriptionDetail(res.subscription.subscriptionId);
          if (appVersion == '') {
            router.push(route);
          } else {
            // 첫 회차 결제 웹훅 반영 대기 후 구독 상세로 스택 초기화 이동
            await new Promise(resolve => setTimeout(resolve, 2000));
            await kloudNav.navigateMain({ route });
          }
        } else if (isGuinnessErrorCase(res)) {
          const dialog = await createDialog({id: 'PaymentFail', message: res.message})
          if (appVersion == '' && dialog) setWebDialogInfo(dialog);
          else window.KloudEvent?.showDialog(JSON.stringify(dialog));
        }
      } else if (data.id == 'RequestBillingKeyPayment') {
        const showFail = async (message?: string) => {
          const dialog = await createDialog({id: 'PaymentFail', message})
          if (appVersion == '' && dialog) setWebDialogInfo(dialog);
          else window.KloudEvent?.showDialog(JSON.stringify(dialog));
        };
        const res = await billingKeyPaymentAction({
          item: type.apiValue,
          itemId: id,
          billingKey: data.customData ?? '',
          paymentId,
          // 정기수업 시작 회차 — lesson-group 외에는 서버가 무시
          ...(type.value === 'lessonGroup' && targetLessonId != null ? { firstLessonId: targetLessonId } : {}),
          targetUserId: actualPayerUserId,
          discounts: selectedDiscounts?.map(d => ({
            key: d.key,
            amount: d.amount,
            type: d.type as 'membership' | 'subscription' | 'passRule',
            itemId: d.itemId,
            passRuleId: d.passRule?.id,
          })),
          ...(type.value === 'practiceRoom' && practiceRoomInfo
            ? { startDate: practiceRoomInfo.startDate, endDate: practiceRoomInfo.endDate }
            : {}),
        })
        if ('success' in res && res.success) {
          if (isLessonPurchase && targetLessonId != null) purgeLessonCache(targetLessonId);
          // 웹은 결제 결과 검증 핸들러(/payment-redirect)로, 네이티브는 결제상세로.
          if (appVersion == '') {
            router.push(`/payment-redirect?paymentId=${paymentId}`);
          } else {
            await new Promise(resolve => setTimeout(resolve, 2000));
            await kloudNav.navigateMain({ route: KloudScreen.PaymentRecordDetail(paymentId) });
          }
        } else if (isGuinnessErrorCase(res)) {
          await showFail(res.message);
        }
      }
    } catch (e) {
      setIsSubmitting(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 다이얼로그 확인은 항상 최신 렌더의 클로저를 타야 한다 — deps 나열(depositor/selectedPass…)로는
  // paymentId·선택 정책(id/type)·할인·카드 갱신을 다 좇지 못해, 가격 정책을 바꿔 골라도
  // 마운트 시점의 기본(첫 번째) 정책 paymentId로 결제되는 스테일 클로저 버그가 났다.
  const onConfirmDialogRef = useRef(onConfirmDialog);
  onConfirmDialogRef.current = onConfirmDialog;
  useEffect(() => {
    window.onDialogConfirm = async (data: DialogInfo) => {
      await onConfirmDialogRef.current(data)
    }
  }, [])


  return (
    <div className="relative group">
      {/* 비활성 사유 툴팁 — PC 웹(lg) hover 시에만. 앱/모바일은 기존 그대로 */}
      {disabled && disabledReason && appVersion === '' && (
        <div className="hidden lg:group-hover:flex absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="relative bg-[#1F1F1F] text-white text-[12px] font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
            {disabledReason}
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1F1F1F]"/>
          </div>
        </div>
      )}
      <CommonSubmitButton
        originProps={{onClick: () => {
          // 결제 시도 시점 — 성공/실패 이전이라 '결제 버튼을 눌렀다' 자체를 센다.
          trackEvent('click_payment_button', {
            item: type.apiValue,
            itemId: id,
            method: method ?? null,
            price: price ?? 0,
          });
          handlePayment();
        }}}
        disabled={disabled || isSubmitting}
      >
        <p className="flex-grow-0 flex-shrink-0 text-base font-bold text-center text-white">
          {price == null
            ? method === 'pass'
              ? getLocaleString({locale, key: 'use_pass'})
              : getLocaleString({locale, key: 'payment'})
            : price === 0
              ? `0${getLocaleString({locale, key: 'won'})} ${getLocaleString({locale, key: 'payment'})}`
              : method == 'pass'
                ? getLocaleString({locale, key: 'use_pass'})
                : `${new Intl.NumberFormat("ko-KR").format(price)}${getLocaleString({
                  locale,
                  key: 'won'
                })} ${getLocaleString({locale, key: 'payment'})}`
          }
        </p>
      </CommonSubmitButton>
      {webDialogInfo != null && <SimpleDialog
        dialogInfo={webDialogInfo}
        onClickConfirmAction={async (dialogInfo) => {
          // 확인 다이얼로그 먼저 닫고 실행 — onConfirmDialog가 실패 시 새 에러 다이얼로그를 띄우면 유지되도록.
          // (닫기를 await 뒤에 두면 방금 띄운 에러 다이얼로그까지 null로 덮여 사라짐)
          setWebDialogInfo(null);
          await onConfirmDialog(dialogInfo);
        }}
        onClickCancelAction={() => setWebDialogInfo(null)}/>
      }
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"/>
        </div>
      )}
      {guestSheetOpen && (
        <GuestInfoBottomSheet
          locale={locale}
          itemType={type.apiValue}
          onClose={() => setGuestSheetOpen(false)}
          onAuthenticated={(info) => {
            // 폰 인증 로그인 성공(토큰 쿠키 저장 완료) → 그 payer로 바로 결제 재개
            setGuestSheetOpen(false);
            void handlePayment({ userId: info.userId, name: info.name, phone: info.phone });
          }}
          onLogin={() => {
            // 다른 방식(소셜/이메일) 로그인 화면으로. PC 웹은 WebLoginRedirect가 공통 다이얼로그로 보낸다.
            setGuestSheetOpen(false);
            const route = KloudScreen.LoginIntro('');
            if (appVersion === '') router.push(route);
            else kloudNav.push(route);
          }}
        />
      )}
    </div>
  );
}