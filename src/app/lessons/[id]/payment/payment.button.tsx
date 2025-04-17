"use client";

import CommonSubmitButton from "@/app/components/buttons/CommonSubmitButton";
import { useCallback, useEffect, useState } from "react";
import { KloudScreen } from "@/shared/kloud.screen";
import { createTicketAction } from "@/app/lessons/[id]/payment/create.ticket.action";
import { getUserAction } from "@/app/onboarding/action/get.user.action";
import { getBottomMenuList } from "@/utils/bottom.menu.fetch.action";
import { useLocale } from "@/hooks/useLocale";
import { PaymentRequest, requestPayment } from "@portone/browser-sdk/v2";
import { createAccountTransferMessage, createDialog, DialogInfo } from "@/utils/dialog.factory";
import { createPassAction } from "@/app/passPlans/[id]/payment/create.pass.action";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { useRouter } from "next/navigation";
import { SimpleDialog } from "@/app/components/SimpleDialog";
import { PaymentMethodType } from "@/app/endpoint/payment.endpoint";


export const PaymentTypes = [
  {value: 'lesson', prefix: 'LT'},
  {value: 'passPlan', prefix: 'LP'},
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
}

export default function PaymentButton({
                                        appVersion,
                                        id,
                                        selectedPass,
                                        type,
                                        price,
                                        title,
                                        userId,
                                        os,
                                        method,
                                        depositor,
                                        disabled
                                      }: {
  appVersion: string;
  id: number,
  selectedPass?: GetPassResponse,
  userId: number,
  type: PaymentType,
  price: number,
  title: string,
  os: string,
  method?: PaymentMethodType,
  depositor: string,
  disabled: boolean,
}) {

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [webDialogInfo, setWebDialogInfo] = useState<DialogInfo | null>(null);
  const router = useRouter();

  const onPaymentSuccess = async ({paymentId}: { paymentId: string }) => {
    try {
      console.log(`${paymentId} 결제 성공해버렸어!`)
      setIsSubmitting(true);
      if (type.value == 'lesson') {
        const res = await createTicketAction({paymentId: paymentId, lessonId: id, status: 'Paid'});
        if ('id' in res) {
          const pushRoute = KloudScreen.TicketDetail(res.id ?? 0, true)
          const bottomMenuList = await getBottomMenuList();
          const bootInfo = JSON.stringify({
            bottomMenuList: bottomMenuList,
            route: pushRoute,
          });
          window.KloudEvent?.navigateMain(bootInfo);
        } else {
          const dialogInfo = await createDialog('Simple', res.message)
          window.KloudEvent?.showDialog(JSON.stringify(dialogInfo))
        }
      } else if (type.value == 'passPlan') {
        const res = await createPassAction({paymentId: paymentId, passPlanId: id, status: 'Active'});
        const pushRoute = 'id' in res ? KloudScreen.PassPaymentComplete(res.id ?? 0) : null
        const bottomMenuList = await getBottomMenuList();
        const bootInfo = JSON.stringify({
          bottomMenuList: bottomMenuList,
          route: pushRoute,
        });
        window.KloudEvent?.navigateMain(bootInfo);
      }
    } catch
      (e) {
      console.log(e)
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handlePayment = useCallback(async () => {
    const user = await getUserAction()
    if (!user || !('id' in user)) {
      return;
    }

    if (!user.phone && user.emailVerified == false) {
      if (appVersion == '') {
        router.push(KloudScreen.Certification)
      } else {
        window.KloudEvent?.fullSheet(KloudScreen.Certification)
      }
      return;
    }

    const paymentId = generatePaymentId({type: type, id: id})

    if (price == 0) {
      await onPaymentSuccess({paymentId: paymentId})
      return
    }

    try {
      setIsSubmitting(true);
      if (method === 'credit') {
        if (appVersion == '') {
          const mobileWebPaymentRequest: PaymentRequest = {
            storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID ?? '',
            channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY ?? '',
            paymentId: paymentId,
            orderName: title,
            payMethod: 'CARD',
            totalAmount: price,
            currency: "CURRENCY_KRW",
            customer: {
              fullName: `${userId}`
            },
            redirectUrl: (process.env.NEXT_PUBLIC_PORTONE_REDIRECT_URL ?? '') + `?type=${type.value}&id=${id}`,
          }
          await requestPayment(mobileWebPaymentRequest)
        } else {
          const paymentInfo: PaymentInfo = os == 'Android' ? {
            storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID ?? '',
            channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY ?? '',
            paymentId: paymentId,
            orderName: title,
            method: 'credit',
            type: type,
            price: price,
            userId: `${userId}`,
          } : {
            paymentId: paymentId,
            pg: process.env.NEXT_PUBLIC_IOS_PORTONE_PG,
            scheme: 'iamport',
            orderName: title,
            type: type,
            amount: `${price}`,
            method: 'credit',
            userId: `${userId}`,
            userCode: process.env.NEXT_PUBLIC_USER_CODE,
          }
          window.KloudEvent?.requestPayment(JSON.stringify(paymentInfo));
        }
      } else if (method === 'account_transfer') {
        if (depositor.length === 0) {
          const dialog = await createDialog('EmptyDepositor')
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
        const dialogInfo = await createDialog('UsePass', `\n구매상품 : ${title}\n패스권 : ${selectedPass?.passPlan?.name}\n\n 위의 수강권을 구매하시겠습니까?`)
        window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [id, method, depositor, selectedPass]);

  const {t} = useLocale()
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    window.onPaymentSuccess = async (data: { paymentId: string, transactionId: string }) => {
      onPaymentSuccess({paymentId: data.paymentId})
    }
  }, [selectedPass])

  useEffect(() => {
    window.onErrorInvoked = async (data: { code: string }) => {
      const dialog = await createDialog('PaymentFail')
      window.KloudEvent?.showDialog(JSON.stringify(dialog));
    }
  }, [])

  const onConfirmDialog = async (data: DialogInfo) => {
    try {
      setIsSubmitting(true);
      const paymentId = generatePaymentId({type: type, id: id});
      if (data.id == 'AccountTransfer') {
        if (type.value == 'lesson') {

          const res = await createTicketAction({
            paymentId: paymentId,
            lessonId: id,
            status: 'Pending',
            depositor: depositor,
          });
          if ('id' in res) {
            const route = KloudScreen.TicketDetail(res.id, true)
            if (appVersion == '' && route) {
              router.replace(route)
            } else {
              const bottomMenuList = await getBottomMenuList();
              const bootInfo = JSON.stringify({
                bottomMenuList: bottomMenuList,
                route: route,
              });
              window.KloudEvent?.navigateMain(bootInfo);
            }
          } else {
            const dialogInfo = await createDialog('Simple', res.message)
            window.KloudEvent?.showDialog(JSON.stringify(dialogInfo))
          }

        } else if (type.value == 'passPlan') {
          const res = await createPassAction({
            passPlanId: id,
            paymentId: paymentId,
            status: 'Pending',
            depositor: depositor,
          })
          if ('id' in res) {
            const pushRoute = KloudScreen.MyPassDetail(res.id)
            if (appVersion == '') {
              router.replace(pushRoute)
            } else {
              const bottomMenuList = await getBottomMenuList();
              const bootInfo = JSON.stringify({
                bottomMenuList: bottomMenuList,
                route: pushRoute,
              });
              window.KloudEvent?.navigateMain(bootInfo);
            }
          } else {
            const dialog = await createDialog('PaymentFail', res.message)
            window.KloudEvent?.showDialog(JSON.stringify(dialog));
          }
        }
      } else if (data.id == 'UsePass') {
        const res = await createTicketAction({
          paymentId: paymentId,
          lessonId: id,
          passId: selectedPass?.id ?? 0,
          status: 'Paid',
        });
        if ('id' in res) {
          const pushRoute = 'id' in res ? KloudScreen.TicketDetail(res.id, true) : null
          const bottomMenuList = await getBottomMenuList();
          const bootInfo = JSON.stringify({
            bottomMenuList: bottomMenuList,
            route: pushRoute,
          });
          window.KloudEvent?.navigateMain(bootInfo);
        } else {
          const dialog = await createDialog('PaymentFail', res.message)
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
        {isSubmitting ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <p className="flex-grow-0 flex-shrink-0 text-base font-bold text-center text-white">
            {mounted
              ? method == 'pass'
                ? t('use_pass')
                : `${new Intl.NumberFormat("ko-KR").format(price)}${t('won')} ${t('payment')}`
              : ''}
          </p>
        )}
      </CommonSubmitButton>
      {webDialogInfo != null && <SimpleDialog
        dialogInfo={webDialogInfo}
        onClickConfirmAction={async (dialogInfo) => {
          await onConfirmDialog(dialogInfo);
          setWebDialogInfo(null);
        }}
        onClickCancelAction={() => setWebDialogInfo(null)}/>
      }
    </div>
  );
}

const generatePaymentId = ({type, id}: { type: PaymentType, id: number }): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // 10자리 랜덤 문자열 생성 (알파벳 대문자 + 숫자)
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomStr = Array.from(
    {length: 10},
    () => characters.charAt(Math.floor(Math.random() * characters.length))
  ).join('');

  // 학원번호-날짜-랜덤문자열
  return `${type.prefix}-${id}-${dateStr}-${randomStr}`;
}