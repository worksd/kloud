"use client";

import CommonSubmitButton from "@/app/components/buttons/CommonSubmitButton";
import { useCallback, useEffect, useRef, useState } from "react";
import { KloudScreen } from "@/shared/kloud.screen";
import { getUserAction } from "@/app/onboarding/action/get.user.action";
import { getBottomMenuList } from "@/utils/bottom.menu.fetch.action";
import { useLocale } from "@/hooks/useLocale";
import { PaymentRequest, requestPayment } from "@portone/browser-sdk/v2";
import { createAccountTransferMessage, createDialog, DialogInfo } from "@/utils/dialog.factory";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { useRouter } from "next/navigation";
import { SimpleDialog } from "@/app/components/SimpleDialog";
import { PaymentMethodType } from "@/app/endpoint/payment.endpoint";
import { requestAccountTransferAction } from "@/app/lessons/[id]/action/request.account.transfer.action";
import { selectAndUsePassAction } from "@/app/lessons/[id]/action/selectAndUsePassActioin";
import { GetUserResponse } from "@/app/endpoint/user.endpoint";
import { GetBillingResponse } from "@/app/endpoint/billing.endpoint";
import { createSubscriptionAction } from "@/app/lessons/[id]/action/create.subscription.action";
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import { checkCapacityLessonAction } from "@/app/lessons/[id]/payment/check.capacity.lesson.action";
import { createFreePaymentRecord } from "@/app/lessons/[id]/payment/create.free.payment.record.action";
import { putDepositorNameAction } from "@/app/lessons/[id]/payment/put.depositor.name.action";
import { kloudNav } from "@/app/lib/kloudNav";

export const PaymentTypes = [
  {value: 'lesson', prefix: 'LT', apiValue: 'lesson'},
  {value: 'passPlan', prefix: 'LP', apiValue: 'pass-plan'},
] as const;

export type PaymentType = (typeof PaymentTypes)[number];

type PaymentInfo = {
  storeId?: string
  pg?: string
  channelKey?: string
  scheme?: string
  paymentId: string
  type: PaymentType,
  orderName: string
  method: PaymentMethodType
  userId: string
  price?: number
  amount?: string
  userCode?: string
  customData?: string
}

export default function PaymentButton({
                                        url,
                                        appVersion,
                                        id,
                                        selectedPass,
                                        selectedBilling,
                                        type,
                                        price,
                                        title,
                                        method,
                                        depositor,
                                        disabled,
                                        paymentId,
                                        user
                                      }: {
  url: string;
  appVersion: string;
  id: number,
  selectedPass?: GetPassResponse,
  selectedBilling?: GetBillingResponse,
  type: PaymentType,
  price: number,
  title: string,
  method?: PaymentMethodType,
  user?: GetUserResponse,
  depositor: string,
  disabled: boolean,
  paymentId: string,
}) {

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [webDialogInfo, setWebDialogInfo] = useState<DialogInfo | null>(null);
  const router = useRouter();
  const sseRef = useRef<EventSource | null>(null);

  const onPaymentSuccess = useCallback(async (paymentId: string) => {
    try {
      setIsSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 2000)); // 웹훅이 서버에 결제내역을 등록할때까지 딜레이
      const pushRoute = KloudScreen.PaymentRecordDetail(paymentId);
      const bottomMenuList = await getBottomMenuList();
      const bootInfo = JSON.stringify({ bottomMenuList, route: pushRoute });
      kloudNav.navigateMain(bootInfo);
    } catch (e) {
      console.log(e);
      const dialog = await createDialog({ id: 'PaymentFail' });
      window.KloudEvent?.showDialog(JSON.stringify(dialog));
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const handlePayment = useCallback(async () => {
    if (!user || !('id' in user)) {
      setIsSubmitting(false);
      return;
    }

    if (price == 0) {
      const res = await createFreePaymentRecord({item: type.apiValue, itemId: id})
      if ('paymentId' in res) {
        const route = KloudScreen.PaymentRecordDetail(res.paymentId)
        if (appVersion == '' && route) {
          router.replace(route)
        } else {
          const bottomMenuList = await getBottomMenuList();
          const bootInfo = JSON.stringify({
            bottomMenuList: bottomMenuList,
            route: route,
          });
          kloudNav.navigateMain(bootInfo);
        }
      } else {
        const dialog = await createDialog({id: 'Simple', message: res.message})
        window.KloudEvent?.showDialog(JSON.stringify(dialog));
      }
      return
    }

    if (method === 'credit') {
      if (type.value == 'lesson') {
        const capacityCheckResponse = await checkCapacityLessonAction({lessonId: id});

        if (!('success' in capacityCheckResponse && capacityCheckResponse.success)) {
          const dialog = await createDialog({id: 'CapacityFull'})
          window.KloudEvent?.showDialog(JSON.stringify(dialog));
          return;
        }
      }

      if (appVersion === '') {
        const mobileWebPaymentRequest: PaymentRequest = {
          storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID ?? '',
          channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY ?? '',
          paymentId,
          orderName: title,
          payMethod: 'CARD',
          totalAmount: price,
          currency: 'CURRENCY_KRW',
          customer: {fullName: `${user.id}`},
          redirectUrl: `${process.env.NEXT_PUBLIC_PORTONE_REDIRECT_URL ?? ''}?type=${type.value}&id=${id}`,
        };

        await requestPayment(mobileWebPaymentRequest);
        return;
      }

      const paymentInfo: PaymentInfo = {
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID ?? '',
        channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY ?? '',
        paymentId,
        orderName: title,
        method: 'credit',
        type,
        price,
        userId: `${user.id}`,
        customData: '',
        userCode: process.env.NEXT_PUBLIC_USER_CODE, // TODO: V2 마이그레이션 시 삭제 예정
        pg: process.env.NEXT_PUBLIC_IOS_PORTONE_PG,
        scheme: 'iamport',
        amount: `${price}`,
      };

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
        message: `\n구매상품 : ${title}\n패스권 : ${selectedPass?.passPlan?.name}\n\n 위의 수강권을 구매하시겠습니까?`
      })
      if (appVersion == '' && dialog) {
        setWebDialogInfo(dialog)
      } else {
        window.KloudEvent?.showDialog(JSON.stringify(dialog));
      }
    } else if (method == 'billing') {
      if (selectedBilling && selectedBilling.billingKey.length > 0) {
        const dialog = await createDialog({
          id: 'RequestBillingKeyPayment',
          title: `${title}을(를) 정기결제하시겠어요?`,
          message: [
            `해당 상품은 매월 자동으로 결제되는 정기결제 상품입니다.\n`,
            `상품명: ${title}\n`,
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

  }, [id, method, depositor, selectedPass]);

  const {t} = useLocale()
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    window.onPaymentSuccess = async (data: { paymentId: string, transactionId: string }) => {
      await onPaymentSuccess(data.paymentId)
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
      if (data.id == 'AccountTransfer') {
        const res = await requestAccountTransferAction({
          item: type.apiValue,
          itemId: id,
          depositor: depositor,
        });
        if ('paymentId' in res) {
          await onPaymentSuccess(res.paymentId)
          await putDepositorNameAction({ depositor })
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
          const pushRoute = 'id' in res ? KloudScreen.TicketDetail(res.id, false) : null
          if (appVersion == '') {
            router.replace(pushRoute ?? '/')
          } else {
            const bottomMenuList = await getBottomMenuList();
            const bootInfo = JSON.stringify({
              bottomMenuList: bottomMenuList,
              route: pushRoute,
            });
            window.KloudEvent?.navigateMain(bootInfo);
          }
        } else {
          const dialog = await createDialog({id: 'PaymentFail', message: res.message})
          window.KloudEvent?.showDialog(JSON.stringify(dialog));
        }
      } else if (data.id == 'RequestBillingKeyPayment') {
        const res = await createSubscriptionAction({item: type.value, itemId: id, billingKey: data.customData ?? ''})
        if ('subscription' in res) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          const bottomMenuList = await getBottomMenuList();
          const bootInfo = JSON.stringify({
            bottomMenuList: bottomMenuList,
            route: KloudScreen.MySubscriptionDetail(res.subscription.subscriptionId),
          });
          window.KloudEvent?.navigateMain(bootInfo);
        } else if (isGuinnessErrorCase(res)) {
          const dialog = await createDialog({id: 'PaymentFail', message: res.message})
          window.KloudEvent?.showDialog(JSON.stringify(dialog));
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
          {mounted
            ? method == 'pass'
              ? t('use_pass')
              : `${new Intl.NumberFormat("ko-KR").format(price)}${t('won')} ${t('payment')}`
            : ''}
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