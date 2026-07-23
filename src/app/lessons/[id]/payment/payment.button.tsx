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
  // 폰 인증 시트(비회원 결제 폐지 → 인증 로그인으로 대체) 열림 상태
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
      const buildCustomData = () => {
        const customData: Record<string, unknown> = { actualPayerUserId, discounts: selectedDiscounts };
        if (type.value === 'practiceRoom' && practiceRoomInfo) {
          customData.startDate = practiceRoomInfo.startDate;
          customData.endDate = practiceRoomInfo.endDate;
        }
        return customData;
      };
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
        if (type.value === 'lesson') {
          const capacityCheckResponse = await checkCapacityLessonAction({lessonId: id});
          if ('message' in capacityCheckResponse) {
            const dialog = await createDialog({id: 'Simple', message: capacityCheckResponse.message});
            if (appVersion == '' && dialog) setWebDialogInfo(dialog);
            else window.KloudEvent?.showDialog(JSON.stringify(dialog));
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
        const showFail = async (message?: string) => {
          const dialog = await createDialog({id: 'PaymentFail', message})
          if (appVersion == '' && dialog) setWebDialogInfo(dialog);
          else window.KloudEvent?.showDialog(JSON.stringify(dialog));
        };
        // 구독을 직접 만들어야하니깐 유지
        if (type.value === 'lessonGroup') {
          const res = await createSubscriptionAction({item: type.apiValue, itemId: id, billingKey: data.customData ?? ''})
          if ('subscription' in res) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const route = KloudScreen.MySubscriptionDetail(res.subscription.subscriptionId)
            if (appVersion == '') router.replace(route);
            else await kloudNav.navigateMain({route});
          } else if (isGuinnessErrorCase(res)) {
            await showFail(res.message);
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
            ...(type.value === 'practiceRoom' && practiceRoomInfo
              ? { startDate: practiceRoomInfo.startDate, endDate: practiceRoomInfo.endDate }
              : {}),
          })
          if ('success' in res && res.success) {
            if (type.value === 'lesson') purgeLessonCache(id);
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
  }, [depositor, selectedPass, isSubmitting, practiceRoomInfo])


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
            // 다른 방식(소셜/이메일) 로그인 화면으로. 로그인 후 현재 결제 페이지로 복귀.
            setGuestSheetOpen(false);
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