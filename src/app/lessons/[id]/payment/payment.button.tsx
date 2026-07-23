"use client";

import CommonSubmitButton from "@/app/components/buttons/CommonSubmitButton";
import {startTransition, useCallback, useEffect, useState} from "react";
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
import { createSubscriptionAction } from "@/app/lessons/[id]/action/create.subscription.action";
import { billingKeyPaymentAction } from "@/app/lessons/[id]/action/billing.key.payment.action";
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import { checkCapacityLessonAction } from "@/app/lessons/[id]/payment/check.capacity.lesson.action";
import { kloudNav } from "@/app/lib/kloudNav";
import { getLocaleString } from "@/app/components/locale";
import { Locale } from "@/shared/StringResource";
import { depositorKey } from "@/shared/cookies.key";
import { GuestInfoBottomSheet } from "@/app/payment/GuestInfoBottomSheet";

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
  {value: 'lessonGroup', prefix: 'LGT', apiValue: 'lesson-group'},
  {value: 'passPlan', prefix: 'LP', apiValue: 'pass-plan'},
  {value: 'practiceRoom', prefix: 'PR', apiValue: 'practice-room'},
  // 번들(묶음) 결제 — paymentId prefix `BD`로 BE가 라우팅. 결제 API는 lesson/passPlan과 동일.
  {value: 'bundle', prefix: 'BD', apiValue: 'bundle'},
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
                                        selectedPass,
                                        selectedBilling,
                                        selectedDiscounts,
                                        type,
                                        price,
                                        title,
                                        method,
                                        depositor,
                                        disabled,
                                        paymentId,
                                        user,
                                        actualPayerUserId,
                                        locale,
                                        hasRefundAccount,
                                        onBillingCardsChange,
                                        practiceRoomInfo,
                                      }: {
  appVersion: string;
  id: number,
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
  paymentId: string,
  actualPayerUserId?: number,
  locale: Locale,
  hasRefundAccount: boolean,
  onBillingCardsChange?: (cards: GetBillingResponse[]) => void,
  practiceRoomInfo?: { studioRoomId: number; startDate: string; endDate: string },
}) {

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [webDialogInfo, setWebDialogInfo] = useState<DialogInfo | null>(null);
  // 비회원(연습실 게스트) 결제 — 예약자 phone/name
  const [guestInfo, setGuestInfo] = useState<{ phone: string; name: string; countryCode: string } | null>(null);
  const [guestSheetOpen, setGuestSheetOpen] = useState(false);
  const router = useRouter();

  const onPaymentSuccess = useCallback(async ({ paymentId, delay }: { paymentId: string; delay: number }) => {
    try {
      setIsSubmitting(true);
      // 결제 성공 → lesson detail 캐시 무효화 (티켓 보유 반영된 fresh 응답 받도록)
      if (type.value === 'lesson') purgeLessonCache(id);
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
  }, [router, appVersion, id, type]);

  const handlePayment = async (guestOverride?: { phone: string; name: string; countryCode: string }) => {
    const isGuest = !user || !('id' in user);
    const guest = guestOverride ?? guestInfo;

    // 비회원 결제는 연습실만 허용. 정보 없으면 예약자 정보 바텀시트부터 띄운다.
    if (isGuest) {
      if (type.value !== 'practiceRoom') {
        setIsSubmitting(false);
        return;
      }
      if (!guest) {
        setGuestSheetOpen(true);
        return;
      }
    }

    if (type.value === 'practiceRoom' && !practiceRoomInfo) {
      const dialog = await createDialog({ id: 'Simple', message: getLocaleString({ locale, key: 'select_time' }) });
      window.KloudEvent?.showDialog(JSON.stringify(dialog));
      return;
    }

    // 결제 payload 공통값 (회원/비회원 분기)
    const payerName = isGuest ? guest!.name : (user!.name ?? user!.nickName ?? undefined);
    const payerPhone = isGuest ? guest!.phone : (user!.phone ?? undefined);
    // 비회원은 PortOne customer.id를 null로(=undefined). phone은 customData로만 전달(하단 buildCustomData).
    const customerId = isGuest ? undefined : `${user!.id}`;
    // customData: 연습실이면 예약 시간대(start/end), 비회원이면 phone/countryCode/name 동봉.
    // (studioRoomId는 paymentId(PR{roomId}-)에서 서버가 파싱하므로 넣지 않음)
    const buildCustomData = () => {
      const d: Record<string, unknown> = { actualPayerUserId, discounts: selectedDiscounts };
      if (type.value === 'practiceRoom' && practiceRoomInfo) {
        d.startDate = practiceRoomInfo.startDate;
        d.endDate = practiceRoomInfo.endDate;
      }
      if (isGuest && guest) {
        d.phone = guest.phone;
        d.countryCode = guest.countryCode;
        d.name = guest.name;
      }
      return d;
    };
    const roomManualFields = (type.value === 'practiceRoom' && practiceRoomInfo)
      ? { startDate: practiceRoomInfo.startDate, endDate: practiceRoomInfo.endDate }
      : {};
    const guestManualFields = (isGuest && guest)
      ? { phone: guest.phone, countryCode: guest.countryCode, name: guest.name }
      : {};

    if (price == 0) {
      setIsSubmitting(true);
      try {
        const res = await createManualPaymentRecordAction({
          methodType: 'free',
          item: type.apiValue,
          itemId: id,
          targetUserId: isGuest ? undefined : user!.id,
          discounts: selectedDiscounts,
          ...roomManualFields,
          ...guestManualFields,
        })
        if ('paymentId' in res) {
          if (type.value === 'lesson') purgeLessonCache(id);
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
      if (type.value == 'lesson') {
        const capacityCheckResponse = await checkCapacityLessonAction({lessonId: id});

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
        userId: customerId,
        method: method && easyPayMethodMap[method] ? easyPayMethodMap[method]! : 'CARD',
        customData: JSON.stringify(buildCustomData()),
        userName: payerName,
        userPhone: payerPhone,
        userBirth: isGuest ? undefined : (user!.birth ?? undefined),
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
            customerId,
            fullName: paymentInfo.userName ?? customerId,
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

        // 모바일 웹은 redirectUrl로 이동해 아래 코드에 도달하지 않음.
        // PC 웹은 결제창(팝업) 종료 후 결과가 resolve됨 → 성공 시 결제 상세로 이동.
        const result = await requestPayment(mobileWebPaymentRequest);
        if (result?.code != null) {
          // 실패/취소 — PortOne이 code 반환. 결제상세로 안 보냄.
          const dialog = await createDialog({ id: 'PaymentFail' });
          if (dialog) setWebDialogInfo(dialog);
          return;
        }
        // 성공 → 결제 결과 검증 핸들러로 이동 (webhook 반영 대기 후 결제상세로 redirect)
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
        if (type.value === 'lesson') {
          const capacityCheckResponse = await checkCapacityLessonAction({lessonId: id});
          if ('message' in capacityCheckResponse) {
            const dialog = await createDialog({id: 'Simple', message: capacityCheckResponse.message});
            window.KloudEvent?.showDialog(JSON.stringify(dialog));
            return;
          }
        }
        const dialog = await createDialog({
          id: 'RequestBillingKeyPayment',
          title: title,
          message: [
            `${getLocaleString({locale, key: 'billing_key_payment_amount'})}: ${(price ?? 0).toLocaleString()}${getLocaleString({locale, key: 'won'})}`,
            `${getLocaleString({locale, key: 'billing_key_payment_method'})}: ${selectedBilling.cardName}`,
            ``,
            `${getLocaleString({locale, key: 'billing_key_payment_confirm_question'})}`
          ].join('\n'),
          customData: selectedBilling.billingKey,
        });

        window.KloudEvent?.showDialog(JSON.stringify(dialog));
      } else {
        const dialog = await createDialog({id: 'BillingKeyNotFound'})
        window.KloudEvent?.showDialog(JSON.stringify(dialog));
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
        const isGuest = !user || !('id' in user);
        const res = await createManualPaymentRecordAction({
          methodType: 'account_transfer',
          item: type.apiValue,
          itemId: id,
          targetUserId: isGuest ? undefined : user!.id,
          depositor: depositor,
          discounts: selectedDiscounts,
          ...(type.value === 'practiceRoom' && practiceRoomInfo
            ? { startDate: practiceRoomInfo.startDate, endDate: practiceRoomInfo.endDate }
            : {}),
          ...(isGuest && guestInfo
            ? { phone: guestInfo.phone, countryCode: guestInfo.countryCode, name: guestInfo.name }
            : {}),
        });
        if ('paymentId' in res) {
          setDepositorCookie(depositor)
          await onPaymentSuccess({paymentId: res.paymentId, delay: 0})
        } else {
          const dialogInfo = await createDialog({id: 'Simple', message: res.message})
          window.KloudEvent?.showDialog(JSON.stringify(dialogInfo))
        }
      } else if (data.id == 'UsePass' && selectedPass?.id && (type.value == 'lesson' || type.value == 'practiceRoom')) {
        if (type.value === 'practiceRoom' && !practiceRoomInfo) return;
        const res = await selectAndUsePassAction({
          passId: selectedPass.id,
          lessonId: type.value === 'lesson' ? id : undefined,
          studioRoomId: type.value === 'practiceRoom' ? practiceRoomInfo!.studioRoomId : undefined,
          startDate: practiceRoomInfo?.startDate,
          endDate: practiceRoomInfo?.endDate,
        });
        if ('id' in res) {
          if (type.value === 'lesson') purgeLessonCache(id);
          const pushRoute = KloudScreen.TicketDetail(res.id, false);
          if (appVersion == '') {
            router.replace(pushRoute ?? '/')
          } else {
            await kloudNav.navigateMain({route: pushRoute});
          }
        } else if (type.value === 'practiceRoom' && 'success' in res && res.success) {
          // 연습실 예약 완료 → 패스권 상세가 아니라 예약(대관) 내역으로 이동.
          // (응답에 bookingId가 있으면 RoomBookingDetail로 딥링크, 없으면 목록)
          const bookingId = 'roomBookingId' in res ? (res as { roomBookingId?: number }).roomBookingId : undefined;
          const route = bookingId != null ? KloudScreen.RoomBookingDetail(bookingId) : KloudScreen.RoomBookings;
          if (appVersion == '') {
            router.replace(route)
          } else {
            await kloudNav.navigateMain({route});
          }
        } else {
          const dialog = await createDialog({id: 'PaymentFail', message: res.message})
          window.KloudEvent?.showDialog(JSON.stringify(dialog));
        }
      } else if (data.id == 'RequestBillingKeyPayment') {
        // 구독을 직접 만들어야하니깐 유지
        if (type.value === 'lessonGroup') {
          const res = await createSubscriptionAction({item: type.apiValue, itemId: id, billingKey: data.customData ?? ''})
          if ('subscription' in res) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const route = KloudScreen.MySubscriptionDetail(res.subscription.subscriptionId)
            await kloudNav.navigateMain({route});
          } else if (isGuinnessErrorCase(res)) {
            const dialog = await createDialog({id: 'PaymentFail', message: res.message})
            window.KloudEvent?.showDialog(JSON.stringify(dialog));
          }
        } else {
          const res = await billingKeyPaymentAction({
            item: type.apiValue,
            itemId: id,
            billingKey: data.customData ?? '',
            paymentId,
            targetUserId: actualPayerUserId,
            discounts: selectedDiscounts?.map(d => ({
              key: d.key,
              amount: d.amount,
              type: d.type as 'membership' | 'subscription' | 'passRule',
              itemId: d.itemId,
              passRuleId: d.passRule?.id,
            })),
          })
          if ('success' in res && res.success) {
            if (type.value === 'lesson') purgeLessonCache(id);
            await new Promise(resolve => setTimeout(resolve, 2000));
            const route = KloudScreen.PaymentRecordDetail(paymentId)
            await kloudNav.navigateMain({route});
          } else if (isGuinnessErrorCase(res)) {
            const dialog = await createDialog({id: 'PaymentFail', message: res.message})
            window.KloudEvent?.showDialog(JSON.stringify(dialog));
          }
        }
      }
    } catch (e) {
      setIsSubmitting(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    window.onDialogConfirm = async (data: DialogInfo) => {
      await onConfirmDialog(data)
    }
  }, [depositor, selectedPass, isSubmitting, practiceRoomInfo, guestInfo])


  return (
    <div>
      <CommonSubmitButton originProps={{onClick: () => handlePayment()}} disabled={disabled || isSubmitting}>
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
          await onConfirmDialog(dialogInfo);
          setWebDialogInfo(null);
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
          onConfirm={(info) => {
            setGuestInfo(info);
            setGuestSheetOpen(false);
            void handlePayment(info);
          }}
          onLogin={() => {
            setGuestSheetOpen(false);
            // 로그인 후 현재 결제 페이지로 복귀
            const returnUrl = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
            const route = KloudScreen.LoginIntro(`?returnUrl=${encodeURIComponent(returnUrl)}`);
            if (appVersion === '') router.push(route);
            else kloudNav.push(route);
          }}
        />
      )}
    </div>
  );
}