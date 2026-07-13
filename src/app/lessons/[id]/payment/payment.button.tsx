"use client";

import CommonSubmitButton from "@/app/components/buttons/CommonSubmitButton";
import {startTransition, useCallback, useEffect, useState} from "react";
import { KloudScreen } from "@/shared/kloud.screen";
import { PaymentRequest, requestPayment } from "@portone/browser-sdk/v2";
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
  userId: string
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
  const handlePayment = async () => {
    if (!user || !('id' in user)) {
      setIsSubmitting(false);
      return;
    }

    if (type.value === 'practiceRoom' && !practiceRoomInfo) {
      const dialog = await createDialog({ id: 'Simple', message: getLocaleString({ locale, key: 'select_time' }) });
      window.KloudEvent?.showDialog(JSON.stringify(dialog));
      return;
    }

    if (price == 0) {
      setIsSubmitting(true);
      try {
        const res = await createManualPaymentRecordAction({
          methodType: 'free',
          item: type.apiValue,
          itemId: id,
          targetUserId: user.id,
          discounts: selectedDiscounts,
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
        userId: `${user.id}`,
        method: method && easyPayMethodMap[method] ? easyPayMethodMap[method]! : 'CARD',
        customData: JSON.stringify({
          actualPayerUserId,
          discounts: selectedDiscounts,
        }),
        userName: user.name ?? user.nickName ?? undefined,
        userPhone: user.phone ?? undefined,
        userBirth: user.birth ?? undefined,
        locale: method === 'foreign_card' ? 'EN_US' : locale === 'en' ? 'EN_US' : locale === 'zh' ? 'ZH_CN' : 'KO_KR',
      };

      if (appVersion === '') {
        // 결제 성공 시 이동할 결제 상세 경로
        const paymentRecordUrl = KloudScreen.PaymentRecordDetail(paymentInfo.paymentId);
        const mobileWebPaymentRequest: PaymentRequest = {
          storeId: paymentInfo.storeId,
          channelKey: paymentInfo.channelKey,
          paymentId: paymentInfo.paymentId,
          orderName: paymentInfo.orderName,
          payMethod: paymentInfo.method as any,
          totalAmount: paymentInfo.price,
          currency: 'CURRENCY_KRW',
          customer: {
            customerId: `${user.id}`,
            fullName: paymentInfo.userName ?? user.nickName ?? paymentInfo.userId,
          } as any,
          // 모바일 웹: 결제 후 결제 상세로 리다이렉트
          redirectUrl: `${window.location.origin}${paymentRecordUrl}`,
          customData: {
            actualPayerUserId,
            discounts: selectedDiscounts,
          }
        };

        // 모바일 웹은 redirectUrl로 이동해 아래 코드에 도달하지 않음.
        // PC 웹은 결제창(팝업) 종료 후 결과가 resolve됨 → 성공 시 결제 상세로 이동.
        const result = await requestPayment(mobileWebPaymentRequest);
        if (result?.code != null) {
          // 실패/취소 — PortOne이 code 반환
          const dialog = await createDialog({ id: 'PaymentFail' });
          if (dialog) setWebDialogInfo(dialog);
          return;
        }
        // 결제 성공 → 결제 상세로 이동
        router.replace(paymentRecordUrl);
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
              `${getLocaleString({locale, key: 'time'})}: ${practiceRoomInfo?.startDate ?? ''} ~ ${practiceRoomInfo?.endDate ?? ''}`,
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
      if (data.id == 'AccountTransfer' && user?.id) {
        const res = await createManualPaymentRecordAction({
          methodType: 'account_transfer',
          item: type.apiValue,
          itemId: id,
          targetUserId: user.id,
          depositor: depositor,
          discounts: selectedDiscounts,
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
          const passRoute = KloudScreen.MyPassDetail(selectedPass.id);
          if (appVersion == '') {
            router.replace(passRoute)
          } else {
            await kloudNav.navigateMain({route: passRoute});
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
  }, [depositor, selectedPass, isSubmitting, practiceRoomInfo])


  return (
    <div>
      <CommonSubmitButton originProps={{onClick: handlePayment}} disabled={disabled || isSubmitting}>
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
    </div>
  );
}