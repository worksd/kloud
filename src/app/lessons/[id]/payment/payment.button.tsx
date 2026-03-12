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
import { createBillingKeyPaymentAction } from "@/app/lessons/[id]/action/create.billing.key.payment.action";
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import { checkCapacityLessonAction } from "@/app/lessons/[id]/payment/check.capacity.lesson.action";
import { putDepositorNameAction } from "@/app/lessons/[id]/payment/put.depositor.name.action";
import { kloudNav } from "@/app/lib/kloudNav";
import { getLocaleString } from "@/app/components/locale";
import { Locale } from "@/shared/StringResource";

export const PaymentTypes = [
  {value: 'lesson', prefix: 'LT', apiValue: 'lesson'},
  {value: 'lessonGroup', prefix: 'LGT', apiValue: 'lesson-group'},
  {value: 'passPlan', prefix: 'LP', apiValue: 'pass-plan'},
  {value: 'membershipPlan', prefix: 'SM', apiValue: 'membership-plan'},
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

const getPayMethodAndPgProvider = (method?: PaymentMethodType): { payMethod: string, pgProvider?: string } => {
  switch (method) {
    case 'naver_pay':
      return { payMethod: 'EASY_PAY', pgProvider: 'NaverPay' };
    case 'kakao_pay':
      return { payMethod: 'EASY_PAY', pgProvider: 'KakaoPay' };
    case 'ali_pay':
      return { payMethod: 'EASY_PAY', pgProvider: 'AliPay' };
    case 'wechat_pay':
      return { payMethod: 'EASY_PAY', pgProvider: 'WeChatPay' };
    default:
      return { payMethod: 'CARD', pgProvider: 'TossPayments' };
  }
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
                                      }: {
  appVersion: string;
  id: number,
  selectedPass?: GetPassResponse,
  selectedBilling?: GetBillingResponse,
  selectedDiscounts?: DiscountResponse[],
  type: PaymentType,
  price: number,
  title: string,
  method?: PaymentMethodType,
  user?: GetUserResponse,
  depositor: string,
  disabled: boolean,
  paymentId: string,
  actualPayerUserId?: number,
  locale: Locale,
}) {

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [webDialogInfo, setWebDialogInfo] = useState<DialogInfo | null>(null);
  const router = useRouter();

  const onPaymentSuccess = useCallback(async ({ paymentId, delay }: { paymentId: string; delay: number }) => {
    try {
      setIsSubmitting(true);
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
  }, [router, appVersion]);
  const handlePayment = useCallback(async () => {
    if (!user || !('id' in user)) {
      setIsSubmitting(false);
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
        })
        if ('paymentId' in res) {
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

    if (method === 'credit') {
      if (type.value == 'lesson') {
        const capacityCheckResponse = await checkCapacityLessonAction({lessonId: id});

        if ('message' in capacityCheckResponse) {
          const dialog = await createDialog({id: 'Simple', message: capacityCheckResponse.message})
          window.KloudEvent?.showDialog(JSON.stringify(dialog));
          return;
        }
      }

      const { payMethod, pgProvider } = getPayMethodAndPgProvider(method);

      const paymentInfo: PaymentInfo = {
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID ?? '',
        channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY ?? '',
        paymentId,
        orderName: title,
        price,
        userId: `${user.id}`,
        method: payMethod,
        customData: JSON.stringify({
          actualPayerUserId,
          discounts: selectedDiscounts,
        }),
        userName: user.name ?? user.nickName ?? undefined,
        userPhone: user.phone ?? undefined,
        userBirth: user.birth ?? undefined,
        locale: locale ?? undefined,
        pgProvider,
      };

      if (appVersion === '') {
        const mobileWebPaymentRequest: PaymentRequest = {
          storeId: paymentInfo.storeId,
          channelKey: paymentInfo.channelKey,
          paymentId: paymentInfo.paymentId,
          orderName: paymentInfo.orderName,
          payMethod: paymentInfo.method as any,
          totalAmount: paymentInfo.price,
          currency: 'CURRENCY_KRW',
          customer: {
            fullName: paymentInfo.userName ?? user.nickName ?? paymentInfo.userId,
            phoneNumber: paymentInfo.userPhone,
            birthYear: paymentInfo.userBirth ? Number(paymentInfo.userBirth.slice(0, 2)) <= 26 ? 2000 + Number(paymentInfo.userBirth.slice(0, 2)) : 1900 + Number(paymentInfo.userBirth.slice(0, 2)) : undefined,
            birthMonth: paymentInfo.userBirth ? Number(paymentInfo.userBirth.slice(2, 4)) : undefined,
            birthday: paymentInfo.userBirth ? Number(paymentInfo.userBirth.slice(4, 6)) : undefined,
          } as any,
          redirectUrl: `${process.env.NEXT_PUBLIC_PORTONE_REDIRECT_URL ?? ''}?type=${type.value}&id=${id}`,
          customData: {
            actualPayerUserId,
            discounts: selectedDiscounts,
          }
        };

        await requestPayment(mobileWebPaymentRequest);
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
          price,
          depositor,
        })
        if (appVersion == '' && dialog) {
          setWebDialogInfo(dialog)
        } else {
          window.KloudEvent?.showDialog(JSON.stringify(dialog));
        }
      }
    } else if (method === 'pass') {
      const dialog = await createDialog({
        id: 'UsePass',
        message: `\n구매 패스권 : ${title}\n패스권 : ${selectedPass?.passPlan?.name}\n\n 위의 수강권을 구매하시겠습니까?`
      })
      if (appVersion == '' && dialog) {
        setWebDialogInfo(dialog)
      } else {
        window.KloudEvent?.showDialog(JSON.stringify(dialog));
      }
    } else if (method == 'billing') {
      if (selectedBilling && selectedBilling.billingKey) {
        const dialog = await createDialog({
          id: 'RequestBillingKeyPayment',
          title: `${title}을(를) 정기결제하시겠어요?`,
          message: [
            `해당 수업은 매월 자동으로 결제되는 정기결제 수업입니다.\n`,
            `수업명: ${title}\n`,
            `결제 금액: ${price.toLocaleString()}원`,
            `결제 수단: ${selectedBilling.cardName}`,
            ``,
            `결제를 진행하시겠습니까?`
          ].join('\n'),
          customData: selectedBilling.billingKey,
        });

        window.KloudEvent?.showDialog(JSON.stringify(dialog));
      } else {
        const dialog = await createDialog({id: 'BillingKeyNotFound'})
        window.KloudEvent?.showDialog(JSON.stringify(dialog));
      }
    }

  }, [id, method, depositor, selectedPass, selectedBilling]);

  useEffect(() => {
    window.onPaymentSuccess = async (data: { paymentId: string, transactionId: string }) => {
      await onPaymentSuccess({paymentId: data.paymentId, delay: 2000})
    }
  }, [onPaymentSuccess, selectedPass])

  useEffect(() => {
    window.onErrorInvoked = async (data: { code: string }) => {
      const dialog = await createDialog({id: 'PaymentFail'})
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
        });
        if ('paymentId' in res) {
          await onPaymentSuccess({paymentId: res.paymentId, delay: 0})
          await putDepositorNameAction({depositor})
        } else {
          const dialogInfo = await createDialog({id: 'Simple', message: res.message})
          window.KloudEvent?.showDialog(JSON.stringify(dialogInfo))
        }
      } else if (data.id == 'UsePass' && selectedPass?.id && type.value == 'lesson') {
        const res = await selectAndUsePassAction({
          passId: selectedPass?.id,
          lessonId: id,
        });
        if ('id' in res) {
          const pushRoute = 'id' in res ? KloudScreen.TicketDetail(res.id, false) : undefined
          if (appVersion == '') {
            router.replace(pushRoute ?? '/')
          } else {
            await kloudNav.navigateMain({route: pushRoute});
          }
        } else {
          const dialog = await createDialog({id: 'PaymentFail', message: res.message})
          window.KloudEvent?.showDialog(JSON.stringify(dialog));
        }
      } else if (data.id == 'RequestBillingKeyPayment') {
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
          const res = await createBillingKeyPaymentAction({
            item: type.apiValue,
            itemId: id,
            billingKey: data.customData ?? '',
            targetUserId: actualPayerUserId
          })
          if ('success' in res && res.success) {
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
  }, [depositor, selectedPass, isSubmitting])


  return (
    <div>
      <CommonSubmitButton originProps={{onClick: handlePayment}} disabled={disabled || isSubmitting}>
        <p className="flex-grow-0 flex-shrink-0 text-base font-bold text-center text-white">
          {method == 'pass'
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